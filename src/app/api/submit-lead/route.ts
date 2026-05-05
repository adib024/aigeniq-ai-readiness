import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { buildQuestionSet } from '../../../lib/config/questions.config';
import { Sector } from '../../../types';

// Environment variables (User to provide in .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SMTP_EMAIL = process.env.SMTP_EMAIL || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aditya@aigeniq.ai';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      leadName, leadEmail, companyName, sector, 
      contextAnswers, assessmentAnswers, scores,
      finalScore, maturityStage, gatesTriggered 
    } = data;

    // Detect base URL from request (works on both localhost and Vercel)
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^/]*$/, '') || 'https://aigeniq.ai';

    // Check if Supabase keys exist
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('❌ Supabase keys missing. Result not saved.');
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

    const dbId = insertData[0].id;
    const reportUrl = `${origin}/results?id=${dbId}`;

    // --- FIRE EMAILS IN BACKGROUND (non-blocking) ---
    if (SMTP_EMAIL && SMTP_PASSWORD) {
      sendEmails(leadName, leadEmail, companyName, sector, contextAnswers, assessmentAnswers, finalScore, maturityStage, reportUrl)
        .catch(err => console.error('❌ Background email error:', err));
    }

    // Return immediately — don't wait for emails
    return NextResponse.json({ 
      success: true, 
      message: 'Assessment saved. Emails sending in background.', 
      id: dbId,
      saved: true
    });

  } catch (err: unknown) {
    console.error('❌ API Error in submit-lead:', (err as Error).message);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

// --- Background email function ---
async function sendEmails(
  leadName: string, leadEmail: string, companyName: string, sector: string,
  contextAnswers: Record<string, unknown>, assessmentAnswers: Record<string, string>,
  finalScore: number, maturityStage: string, reportUrl: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD }
  });

  console.log('📧 [Background] Creating Gmail transporter...');

  // 1. Email to the Lead
  console.log('📧 [Background] Sending Magic Link to:', leadEmail);
  const leadResult = await transporter.sendMail({
    from: `"AiGENiQ" <${SMTP_EMAIL}>`,
    to: leadEmail,
    subject: 'Your AiGENiQ Diagnostic Report is Ready',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #050505;">Hello ${leadName},</h2>
        <p>Thank you for completing the AiGENiQ Readiness Assessment for ${companyName}.</p>
        <p>Your custom diagnostic report and phased implementation roadmap is ready.</p>
        <div style="margin: 30px 0;">
          <a href="${reportUrl}" style="background-color: #A7F432; color: #050505; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px;">View Your Full Report</a>
        </div>
        <p style="color: #666; font-size: 13px;">This link is secure and unique to your assessment.</p>
      </div>
    `
  });
  console.log('✅ [Background] Lead email sent! ID:', leadResult.messageId);

  // 2. Email to Admin
  console.log('📧 [Background] Sending Admin notification to:', ADMIN_EMAIL);
  const adminResult = await transporter.sendMail({
    from: `"AiGENiQ System" <${SMTP_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New Lead: ${leadName} from ${companyName}`,
    html: `
      <div style="font-family: sans-serif;">
        <h2>New Assessment Completed</h2>
        <p><strong>Name:</strong> ${leadName}</p>
        <p><strong>Email:</strong> ${leadEmail}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Sector:</strong> ${sector}</p>
        <p><strong>Final Score:</strong> ${finalScore}/10 (${maturityStage})</p>
        <br/>
        <h3>Context Profiling:</h3>
        <ul style="background: #f4f4f4; padding: 15px 30px; border-radius: 5px; font-size: 14px;">
          ${Object.entries(contextAnswers).map(([k, v]) => `<li><strong>${k}:</strong> ${Array.isArray(v) ? v.join(', ') : v}</li>`).join('')}
        </ul>
        
        <h3>Assessment Answers:</h3>
        <table width="100%" cellpadding="10" style="font-size: 14px; text-align: left; border-collapse: collapse; background: #f9f9f9; border-radius: 5px; margin-bottom: 30px;">
          ${buildQuestionSet(sector as Sector).filter(q => assessmentAnswers[q.id]).map(q => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="width: 60px; color: #888; vertical-align: top;">${q.id}</td>
              <td style="vertical-align: top;">
                <div style="font-weight: bold; margin-bottom: 4px; color: #333;">${q.text}</div>
                <div style="color: #4A90E2; font-weight: 500;">→ ${q.options[assessmentAnswers[q.id] as keyof typeof q.options] || assessmentAnswers[q.id]}</div>
              </td>
            </tr>
          `).join('')}
        </table>
        <br/>
        <a href="${reportUrl}" style="background-color: #A7F432; color: #050505; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">View Full Interactive Report</a>
      </div>
    `
  });
  console.log('✅ [Background] Admin email sent! ID:', adminResult.messageId);
}
