import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateCarryover } from '@/lib/algorithms/carryover';
import type { DoseLog, DoseFormInput, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: DoseFormInput = await request.json();

    // Validate required fields
    if (!body.batch_id || !body.amount || !body.food_state || !body.intention) {
      return NextResponse.json(
        { error: 'Missing required fields: batch_id, amount, food_state, intention' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Fetch user profile for carryover calculation
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch recent dose history for carryover calculation
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: recentDoses, error: dosesError } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', fourteenDaysAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (dosesError) {
      console.error('Error fetching dose history:', dosesError);
      return NextResponse.json({ error: 'Failed to fetch dose history' }, { status: 500 });
    }

    // Calculate carryover using existing algorithm
    const carryover = calculateCarryover(recentDoses || [], userProfile as User);

    // Calculate effective dose
    const effective_dose = body.amount * carryover.effective_dose_multiplier;

    // Build dose log object
    const now = new Date().toISOString();
    const doseLog: Omit<DoseLog, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      batch_id: body.batch_id,
      amount: body.amount,
      timestamp: now,
      carryover,
      effective_dose,
      food_state: body.food_state,
      intention: body.intention,
      sleep_hours: body.sleep_hours || null,
      sleep_quality: body.sleep_quality || null,
      stress_level: body.stress_level || null,
      caffeine_mg: body.caffeine_mg || null,
      caffeine_timing: body.caffeine_timing || null,
      environment: body.environment || null,
      cannabis: body.cannabis || null,
      cycle_day: body.cycle_day || null,
      exercise: body.exercise || null,
      notes: body.notes || null,
      tags: [],
    };

    // Insert into database
    const { data: createdDose, error: insertError } = await supabase
      .from('dose_logs')
      .insert(doseLog)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting dose log:', insertError);
      return NextResponse.json({ error: 'Failed to create dose log' }, { status: 500 });
    }

    // Update batch doses_logged count
    const { error: batchUpdateError } = await supabase.rpc('increment_batch_doses', {
      batch_id_param: body.batch_id,
    });

    if (batchUpdateError) {
      console.error('Error updating batch count:', batchUpdateError);
      // Don't fail the request if batch update fails
    }

    // Return success with created dose and carryover info
    return NextResponse.json(
      {
        success: true,
        dose: createdDose,
        carryover: {
          score: carryover.score,
          tier: carryover.tier,
          effective_dose_multiplier: carryover.effective_dose_multiplier,
          recommendation: carryover.recommendation,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch user's dose logs
    const { data: doses, error: fetchError } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching doses:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch doses' }, { status: 500 });
    }

    return NextResponse.json({ doses }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
