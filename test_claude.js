const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  try {
    const prompt = 'Return a JSON object with {"status": "ok"}';
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      temperature: 0.7,
      system: "You are a professional AI consultant who outputs only raw, valid JSON.",
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    console.log("Success:", response.content[0].text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
