// src/hooks/useChatHistory.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'silentguard_chat_history';
const MAX_PER_FEATURE = 20;

function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveAll(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useChatHistory(feature) {
  const [history, setHistory] = useState(() => loadAll()[feature] || []);

  // Keep in sync if feature changes
  useEffect(() => {
    const all = loadAll();
    setHistory(all[feature] || []);
  }, [feature]);

  const addEntry = useCallback((input, output) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input.slice(0, 500), // preview only
      inputFull: input,
      output,
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_PER_FEATURE);
      const all = loadAll();
      all[feature] = updated;
      saveAll(all);
      return updated;
    });
  }, [feature]);

  const deleteEntry = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id);
      const all = loadAll();
      all[feature] = updated;
      saveAll(all);
      return updated;
    });
  }, [feature]);

  const clearAll = useCallback(() => {
    setHistory([]);
    const all = loadAll();
    all[feature] = [];
    saveAll(all);
  }, [feature]);

  return { history, addEntry, deleteEntry, clearAll };
}
