// src/utils/geminiClient.js
// Google Gemini API client for SilentGuard DevMate AI

const MODEL = process.env.REACT_APP_MODEL || 'gemini-2.0-flash';
const MAX_TOKENS = parseInt(process.env.REACT_APP_MAX_TOKENS) || 8192; // ← FIXED: was 4096, too low for 7 reports

function getModelBase() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;
}

export async function callGemini(systemPrompt, userMessage, apiKey) {
  const key = apiKey || process.env.REACT_APP_GEMINI_API_KEY;

  if (!key || key === 'your_gemini_api_key_here') {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(`${getModelBase()}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(err?.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function streamGemini(systemPrompt, userMessage, apiKey, onChunk) {
  const key = apiKey || process.env.REACT_APP_GEMINI_API_KEY;

  if (!key || key === 'your_gemini_api_key_here') {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(`${getModelBase()}:streamGenerateContent?alt=sse&key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(err?.error?.message || `API Error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const token = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (token) {
            fullText += token;
            onChunk(fullText);
          }
        } catch {}
      }
    }
  }

  return fullText;
}