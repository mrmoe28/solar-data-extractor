import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'MISSING');

const prompt = `You are a helpful solar energy expert. Someone left this comment:

"My inverter shows error 028 and won't produce power"

Generate a helpful, friendly reply that:
1. Answers their problem
2. Provides 1-2 actionable tips
3. Offers a free consultation
4. Under 150 words

Contact: Moe from EKO SOLAR, 404-551-6532

Reply:`;

try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      })
    }
  );

  const data = await response.json();
  console.log('\nFull Response:', JSON.stringify(data, null, 2));

  if (data.candidates && data.candidates[0]) {
    const reply = data.candidates[0].content.parts[0].text;
    console.log('\n✅ AI Reply:\n', reply);
  } else {
    console.log('❌ No candidates in response');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
