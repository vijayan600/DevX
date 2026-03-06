// src/utils/groqClient.js
// Groq API client for SilentGuard DevMate AI

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.REACT_APP_MODEL || 'llama-3.3-70b-versatile';
const MAX_TOKENS = parseInt(process.env.REACT_APP_MAX_TOKENS) || 4096;

export async function callGroq(systemPrompt, userMessage, apiKey) {
  const key = apiKey || process.env.REACT_APP_GROQ_API_KEY;
  
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(err?.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function streamGroq(systemPrompt, userMessage, apiKey, onChunk) {
  const key = apiKey || process.env.REACT_APP_GROQ_API_KEY;
  
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('INVALID_API_KEY');
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
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6));
          const token = json.choices?.[0]?.delta?.content || '';
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
