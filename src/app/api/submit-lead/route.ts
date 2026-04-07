import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Environment variables (User to provide in .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      leadName, leadEmail, companyName, sector, 
      contextAnswers, assessmentAnswers, scores,
      finalScore, maturityStage, gatesTriggered 
    } = data;

    // Check if Supabase keys exist
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('❌ Supabase keys missing. Result not saved.');
      // Return success anyway to not block user UX if not configured yet
      return NextResponse.json({ success: true, message: 'Lead captured locally (Supabase not configured)', saved: false });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: insertData, error } = await supabase
      .from('assessments')
      .insert({
        lead_name: leadName,
        lead_email: leadEmail,
        company_name: companyName,
        sector: sector,
        context_answers: contextAnswers,
        assessment_answers: assessmentAnswers,
        scores: scores,
        final_score: finalScore,
        maturity_stage: maturityStage,
        gates_triggered: gatesTriggered
      })
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment saved to Supabase', 
      id: insertData[0].id,
      saved: true
    });

  } catch (err: unknown) {
    console.error('❌ API Error in submit-lead:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
