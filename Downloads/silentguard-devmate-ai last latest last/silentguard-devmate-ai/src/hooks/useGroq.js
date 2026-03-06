// src/hooks/useGroq.js
import { useState, useCallback } from 'react';
import { streamGroq } from '../utils/groqClient';

export function useGroq() {
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState(null);

  const run = useCallback(async (systemPrompt, userMessage, apiKey) => {
    setLoading(true);
    setStreamedText('');
    setError(null);

    try {
      const result = await streamGroq(systemPrompt, userMessage, apiKey, (text) => {
        setStreamedText(text);
      });
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      let msg = err.message;
      if (msg === 'NO_API_KEY') msg = 'Please enter your Groq API key in Settings.';
      else if (msg === 'INVALID_API_KEY') msg = 'Invalid API key. Please check your Groq API key in Settings.';
      else if (msg === 'RATE_LIMIT') msg = 'Rate limit reached. Please wait a moment and try again.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const reset = useCallback(() => {
    setStreamedText('');
    setError(null);
  }, []);

  return { run, loading, streamedText, error, reset };
}
