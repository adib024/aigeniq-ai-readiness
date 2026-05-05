import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildQuestionSet } from '@/lib/config/questions.config';
import { Sector } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { sector, companySize, aiToolsUsed, priorityAreas, finalScore, maturityStage, highestDimension, lowestDimension, assessmentAnswers } = data;

    let detailedAnswersText = '';
    if (assessmentAnswers && Object.keys(assessmentAnswers).length > 0) {
      const questions = buildQuestionSet(sector as Sector);
      detailedAnswersText = "Here are the exact questions they were asked and the specific answers they chose:\n";
      for (const [qId, answerLetter] of Object.entries(assessmentAnswers)) {
        const question = questions.find(q => q.id === qId);
        if (question) {
          const optionText = (question.options as Record<string, string>)[answerLetter as string] || answerLetter;
          detailedAnswersText += `- Question: "${question.text}"\n  Answer Chosen: "${optionText}"\n`;
        }
      }
    }

    const prompt = `
You are an elite, highly-paid executive AI consultant.
Your client is a business in the ${sector} sector with ${companySize} employees.
They currently use these AI tools: ${aiToolsUsed?.join(', ') || 'None'}.
Their priority areas for AI are: ${priorityAreas?.join(', ') || 'Unknown'}.

They took a comprehensive AI Readiness Audit.
Their overall maturity stage is: ${maturityStage} (Score: ${finalScore}/10).
Their strongest area is ${highestDimension}. Their weakest area is ${lowestDimension}.

${detailedAnswersText}

Based on this specific data, generate a completely personalized, highly actionable executive report. Do not use generic filler. Be direct, authoritative, and strategic.

You MUST return your response in the following JSON format exactly, with no markdown formatting around it (do not wrap in \`\`\`json):
{
  "executiveSummary": "A single string containing a 3-paragraph executive summary analyzing their specific situation, calling out their weakest and strongest areas. Separate paragraphs with \\n\\n. DO NOT create multiple keys for paragraphs.",
  "nowStep": {
    "title": "Immediate Action (0-30 days)",
    "description": "One highly specific, tactical action they must take immediately based on their lowest scoring dimension."
  },
  "nextStep": {
    "title": "Short-Term Action (1-3 months)",
    "description": "One strategic step focused on integrating their priority areas."
  },
  "laterStep": {
    "title": "Long-Term Action (3-12 months)",
    "description": "A visionary step outlining how they can reach the next tier of maturity based on their strongest dimension."
  }
}
`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.7,
      system: "You are a professional AI consultant who outputs only raw, valid JSON.",
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    let textContent = 'text' in response.content[0] ? response.content[0].text : '';
    
    // Safety clean: strip markdown formatting if Claude still includes it
    textContent = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Safety check: parse the JSON to ensure it's valid
    const reportData = JSON.parse(textContent);

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error('Claude API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI report' },
      { status: 500 }
    );
  }
}
