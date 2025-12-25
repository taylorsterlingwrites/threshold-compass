import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CheckIn, CheckInFormInput } from '@/types';

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
    const body: CheckInFormInput = await request.json();

    // Validate required fields
    if (!body.phase || !body.conditions || !body.signals) {
      return NextResponse.json(
        { error: 'Missing required fields: phase, conditions, signals' },
        { status: 400 }
      );
    }

    // Validate signals are within range 1-5
    const { energy, clarity, stability } = body.signals;
    if (
      energy < 1 ||
      energy > 5 ||
      clarity < 1 ||
      clarity > 5 ||
      stability < 1 ||
      stability > 5
    ) {
      return NextResponse.json(
        { error: 'Signals must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Build check-in object
    const now = new Date().toISOString();
    const checkIn: Omit<CheckIn, 'id' | 'created_at'> = {
      user_id: user.id,
      dose_id: body.dose_id || null,
      timestamp: now,
      phase: body.phase,
      conditions: body.conditions,
      signals: body.signals,
      body_map: body.body_map || [],
      notes: body.notes || null,
    };

    // Insert into database
    const { data: createdCheckIn, error: insertError } = await supabase
      .from('check_ins')
      .insert(checkIn)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting check-in:', insertError);
      return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
    }

    // Return success
    return NextResponse.json(
      {
        success: true,
        checkIn: createdCheckIn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/check-ins:', error);
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
    const doseId = searchParams.get('dose_id');

    // Build query
    let query = supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id);

    // Filter by dose_id if provided
    if (doseId) {
      query = query.eq('dose_id', doseId);
    }

    // Execute query
    const { data: checkIns, error: fetchError } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching check-ins:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }

    return NextResponse.json({ checkIns }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/check-ins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
