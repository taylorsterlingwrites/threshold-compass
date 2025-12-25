import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { detectPatterns } from '@/lib/algorithms/patterns';
import { calculateThresholdRange } from '@/lib/algorithms/threshold-range';
import type { DoseLog, CheckIn, User, PatternType } from '@/types';

// Pattern type icons
const PATTERN_ICONS: Record<PatternType, string> = {
  food_correlation: '🍽️',
  day_clustering: '📅',
  sleep_correlation: '😴',
  environment_correlation: '🏠',
  caffeine_timing: '☕',
  cycle_correlation: '🌙',
  body_cluster: '🧘',
  anti_pattern: '⚠️',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-green-400',
  medium: 'text-yellow-400',
  low: 'text-orange-400',
};

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // Fetch all doses
  const { data: doses } = await supabase
    .from('dose_logs')
    .select('*')
    .eq('user_id', authUser.id)
    .order('timestamp', { ascending: false });

  // Fetch all check-ins
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', authUser.id)
    .order('timestamp', { ascending: false });

  // Fetch active batch
  const { data: activeBatch } = await supabase
    .from('batches')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('is_active', true)
    .single();

  // Calculate stats
  const totalDoses = doses?.length || 0;
  const totalCheckIns = checkIns?.length || 0;
  const daysSinceStart = doses && doses.length > 0
    ? Math.ceil((Date.now() - new Date(doses[doses.length - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Detect patterns
  const defaultUser: User = {
    id: authUser.id,
    email: authUser.email || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    onboarding_complete: false,
    guidance_level: 'guided',
    default_logging_tier: 2,
    sensitivity: { caffeine: 3, cannabis: null, bodyAwareness: 3, emotionalReactivity: 3, medications: [] },
    primary_substance: 'psilocybin',
    notifications: { activationCheck: true, signalWindow: true, integration: true, endOfDay: true, followUp24h: false, followUp72h: false, method: 'push' },
    sharing_level: 'local',
    menstrual_tracking: false,
    cycle_day: null,
    emergency_contact: null,
    north_star: { type: 'clarity', custom: null },
  };

  const patterns = detectPatterns(
    (userProfile as User) || defaultUser,
    (doses as DoseLog[]) || [],
    (checkIns as CheckIn[]) || []
  );

  // Calculate threshold range if we have enough doses
  const thresholdRange = activeBatch && totalDoses >= 5
    ? calculateThresholdRange(
        (doses as DoseLog[]) || [],
        (checkIns as CheckIn[]) || [],
        activeBatch.id
      )
    : null;

  return (
    <main className="min-h-screen bg-black text-ivory p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <Link href="/compass" className="text-ivory/60 hover:text-ivory">
          ← Back
        </Link>
        <h1 className="font-mono text-xl uppercase tracking-wide">Insights</h1>
        <div className="w-10" />
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-3 text-center">
          <div className="text-2xl font-mono text-orange">{totalDoses}</div>
          <div className="text-xs text-ivory/50 uppercase">Doses</div>
        </div>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-3 text-center">
          <div className="text-2xl font-mono text-violet">{totalCheckIns}</div>
          <div className="text-xs text-ivory/50 uppercase">Check-ins</div>
        </div>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-3 text-center">
          <div className="text-2xl font-mono text-ivory">{daysSinceStart}</div>
          <div className="text-xs text-ivory/50 uppercase">Days</div>
        </div>
      </section>

      {/* Threshold Range */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Your Threshold Range
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4">
          {thresholdRange?.range ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-ivory/60 text-sm">Low</span>
                <span className="font-mono text-lg">{thresholdRange.range.low.dose}g</span>
                <span className={`text-xs ${CONFIDENCE_COLORS[getConfidenceLevel(thresholdRange.range.low.confidence)]}`}>
                  {thresholdRange.range.low.confidence}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ivory/60 text-sm">Sweet Spot</span>
                <span className="font-mono text-2xl text-orange">{thresholdRange.range.sweet.dose}g</span>
                <span className={`text-xs ${CONFIDENCE_COLORS[getConfidenceLevel(thresholdRange.range.sweet.confidence)]}`}>
                  {thresholdRange.range.sweet.confidence}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ivory/60 text-sm">High</span>
                <span className="font-mono text-lg">{thresholdRange.range.high.dose}g</span>
                <span className={`text-xs ${CONFIDENCE_COLORS[getConfidenceLevel(thresholdRange.range.high.confidence)]}`}>
                  {thresholdRange.range.high.confidence}%
                </span>
              </div>
              <p className="text-ivory/50 text-xs mt-2">{thresholdRange.message}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-ivory/50 text-sm">
                {totalDoses < 5
                  ? `Log ${5 - totalDoses} more doses to see your threshold range.`
                  : 'Complete more check-ins after dosing to calculate your range.'}
              </p>
              <div className="mt-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-3 h-3 rounded-full ${n <= totalDoses ? 'bg-orange' : 'bg-ivory/20'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detected Patterns */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Detected Patterns
        </h2>
        {patterns.length > 0 ? (
          <div className="space-y-3">
            {patterns.map((pattern, i) => (
              <div key={i} className="bg-charcoal border border-ivory/10 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{PATTERN_ICONS[pattern.type]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-mono text-sm">{pattern.title}</h3>
                      <span className={`text-xs font-mono ${CONFIDENCE_COLORS[getConfidenceLevel(pattern.confidence)]}`}>
                        {pattern.confidence}%
                      </span>
                    </div>
                    <p className="text-ivory/50 text-sm">{pattern.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-charcoal border border-ivory/10 rounded-sm p-4 text-center">
            <p className="text-ivory/50 text-sm">
              No patterns detected yet. Keep logging doses and check-ins to discover your unique patterns.
            </p>
            <p className="text-ivory/40 text-xs mt-2">
              Most patterns require 8-10 data points to emerge.
            </p>
          </div>
        )}
      </section>

      {/* Recent Doses Summary */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Dose Distribution
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4">
          {totalDoses > 0 ? (
            <div className="space-y-2">
              {/* Group by amount */}
              {(() => {
                const grouped: Record<string, number> = {};
                (doses as DoseLog[])?.forEach((d) => {
                  const key = `${d.amount}g`;
                  grouped[key] = (grouped[key] || 0) + 1;
                });
                const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
                const max = Math.max(...Object.values(grouped));
                return sorted.slice(0, 5).map(([amount, count]) => (
                  <div key={amount} className="flex items-center gap-2">
                    <span className="font-mono text-sm w-16">{amount}</span>
                    <div className="flex-1 h-2 bg-ivory/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet transition-all"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-ivory/50 text-xs w-8 text-right">{count}×</span>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <p className="text-ivory/50 text-sm text-center">No doses logged yet.</p>
          )}
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-ivory/10 p-4 flex justify-around">
        <Link href="/compass" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Compass
        </Link>
        <Link href="/log" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Log
        </Link>
        <Link href="/insights" className="text-orange font-mono text-xs uppercase">
          Insights
        </Link>
        <Link href="/settings" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Settings
        </Link>
      </nav>
    </main>
  );
}
