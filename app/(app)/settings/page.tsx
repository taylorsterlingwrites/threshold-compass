import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { User, GuidanceLevel, NorthStarType } from '@/types';

const NORTH_STAR_OPTIONS: { value: NorthStarType; label: string; description: string }[] = [
  { value: 'stability', label: 'Stability', description: 'Emotional regulation, grounding' },
  { value: 'clarity', label: 'Clarity', description: 'Mental sharpness, focus' },
  { value: 'creativity', label: 'Creativity', description: 'Divergent thinking, flow' },
  { value: 'presence', label: 'Presence', description: 'Awareness, mindfulness' },
  { value: 'recovery', label: 'Recovery', description: 'Healing, processing' },
  { value: 'exploration', label: 'Exploration', description: 'Discovery, openness' },
];

const GUIDANCE_OPTIONS: { value: GuidanceLevel; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Just the essentials' },
  { value: 'guided', label: 'Guided', description: 'Helpful prompts and tips' },
  { value: 'deep', label: 'Deep', description: 'Full explanations and context' },
];

export default async function SettingsPage() {
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

  const user = userProfile as User | null;

  return (
    <main className="min-h-screen bg-black text-ivory p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <Link href="/compass" className="text-ivory/60 hover:text-ivory">
          ← Back
        </Link>
        <h1 className="font-mono text-xl uppercase tracking-wide">Settings</h1>
        <div className="w-10" />
      </header>

      {/* Account Section */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Account
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-ivory/80">Email</span>
            <span className="text-ivory/50 text-sm">{authUser.email}</span>
          </div>
          <div className="border-t border-ivory/10 pt-4 flex justify-between items-center">
            <span className="text-ivory/80">Member since</span>
            <span className="text-ivory/50 text-sm">
              {new Date(authUser.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </section>

      {/* North Star Section */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Your North Star
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4">
          <p className="text-ivory/50 text-sm mb-4">
            What direction guides your practice?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {NORTH_STAR_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`p-3 rounded-sm border text-left transition-colors ${
                  user?.north_star?.type === option.value
                    ? 'border-orange bg-orange/10 text-orange'
                    : 'border-ivory/10 hover:border-ivory/30'
                }`}
              >
                <div className="font-mono text-sm">{option.label}</div>
                <div className="text-xs text-ivory/40 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
          <p className="text-ivory/40 text-xs mt-3 text-center">
            Settings editing coming soon
          </p>
        </div>
      </section>

      {/* Guidance Level Section */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Guidance Level
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4">
          <div className="space-y-2">
            {GUIDANCE_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-sm border transition-colors ${
                  user?.guidance_level === option.value
                    ? 'border-violet bg-violet/10'
                    : 'border-ivory/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{option.label}</span>
                  {user?.guidance_level === option.value && (
                    <span className="text-violet text-xs">Active</span>
                  )}
                </div>
                <div className="text-xs text-ivory/40 mt-1">{option.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Notifications
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4 space-y-3">
          {[
            { key: 'activationCheck', label: 'Activation check (+45 min)', description: 'Prompt to notice early effects' },
            { key: 'signalWindow', label: 'Signal window (+90 min)', description: 'Prime time for check-in' },
            { key: 'integration', label: 'Integration (+3-4 hours)', description: 'End of active window' },
            { key: 'endOfDay', label: 'End of day reflection', description: 'Daily practice review' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm">{item.label}</div>
                <div className="text-xs text-ivory/40">{item.description}</div>
              </div>
              <div
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  user?.notifications?.[item.key as keyof typeof user.notifications]
                    ? 'bg-orange'
                    : 'bg-ivory/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    user?.notifications?.[item.key as keyof typeof user.notifications]
                      ? 'translate-x-4'
                      : ''
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sensitivity Section */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-ivory/60 mb-3">
          Sensitivity Profile
        </h2>
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-4 space-y-4">
          {[
            { key: 'caffeine', label: 'Caffeine sensitivity', value: user?.sensitivity?.caffeine },
            { key: 'bodyAwareness', label: 'Body awareness', value: user?.sensitivity?.bodyAwareness },
            { key: 'emotionalReactivity', label: 'Emotional reactivity', value: user?.sensitivity?.emotionalReactivity },
          ].map((item) => (
            <div key={item.key}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{item.label}</span>
                <span className="text-ivory/50 text-sm">{item.value || 3}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`flex-1 h-2 rounded-sm ${
                      n <= (item.value || 3) ? 'bg-violet' : 'bg-ivory/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-red-400/60 mb-3">
          Danger Zone
        </h2>
        <div className="bg-charcoal border border-red-400/20 rounded-sm p-4 space-y-3">
          <button className="w-full py-2 text-sm border border-ivory/20 rounded-sm text-ivory/60 hover:bg-ivory/5">
            Export My Data
          </button>
          <button className="w-full py-2 text-sm border border-red-400/30 rounded-sm text-red-400/80 hover:bg-red-400/5">
            Delete Account
          </button>
        </div>
      </section>

      {/* Version Info */}
      <div className="text-center text-ivory/30 text-xs mb-8">
        <p>Threshold Compass v0.1.0</p>
        <p className="mt-1">Built with intention</p>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-ivory/10 p-4 flex justify-around">
        <Link href="/compass" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Compass
        </Link>
        <Link href="/log" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Log
        </Link>
        <Link href="/insights" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Insights
        </Link>
        <Link href="/settings" className="text-orange font-mono text-xs uppercase">
          Settings
        </Link>
      </nav>
    </main>
  );
}
