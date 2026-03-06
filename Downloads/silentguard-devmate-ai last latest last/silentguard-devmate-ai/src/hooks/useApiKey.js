// src/hooks/useApiKey.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sg_groq_api_key';

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState('');
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKeyState(stored);
      setIsSet(true);
    }
  }, []);

  const setApiKey = (key) => {
    const trimmed = key.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKeyState(trimmed);
    setIsSet(!!trimmed);
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState('');
    setIsSet(false);
  };

  return { apiKey, setApiKey, clearApiKey, isSet };
}
