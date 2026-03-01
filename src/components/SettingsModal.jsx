// src/components/SettingsModal.jsx
import React, { useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';

export default function SettingsModal({ onClose }) {
  const { apiKey, setApiKey, clearApiKey, isSet } = useApiKey();
  const [inputVal, setInputVal] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(inputVal);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleClear = () => {
    clearApiKey();
    setInputVal('');
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>⚙️ API Configuration</div>
            <div style={styles.subtitle}>Configure your Groq API key to enable AI features</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Status */}
        <div style={{ ...styles.statusBadge, ...(isSet ? styles.statusGreen : styles.statusAmber) }}>
          {isSet ? '✓ API Key is configured' : '⚠ No API key set — AI features disabled'}
        </div>

        {/* Form */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Groq API Key</label>
          <input
            type="password"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="gsk_..."
            style={styles.input}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <div style={styles.hint}>
            Get your free API key at{' '}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={styles.link}>
              console.groq.com
            </a>
          </div>
        </div>

        {/* Info box */}
        <div style={styles.infoBox}>
          <div style={styles.infoTitle}>ℹ️ Privacy Note</div>
          <div style={styles.infoText}>
            Your API key is stored only in your browser's local storage. It is never sent to any server other than Groq's API directly.
          </div>
        </div>

        {/* Config info */}
        <div style={styles.configGrid}>
          <div style={styles.configItem}>
            <div style={styles.configLabel}>Model</div>
            <div style={styles.configValue}>llama-3.3-70b-versatile</div>
          </div>
          <div style={styles.configItem}>
            <div style={styles.configLabel}>Max Tokens</div>
            <div style={styles.configValue}>4,096</div>
          </div>
          <div style={styles.configItem}>
            <div style={styles.configLabel}>Streaming</div>
            <div style={styles.configValue}>Enabled</div>
          </div>
          <div style={styles.configItem}>
            <div style={styles.configLabel}>Provider</div>
            <div style={styles.configValue}>Groq Cloud</div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {isSet && (
            <button onClick={handleClear} style={styles.clearBtn}>
              Clear Key
            </button>
          )}
          <button onClick={handleSave} style={styles.saveBtn} disabled={!inputVal.trim()}>
            {saved ? '✓ Saved!' : 'Save API Key'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 520,
    background: '#0e0e1a',
    border: '1px solid #2d2d55',
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: '#f0f0ff',
  },
  subtitle: {
    fontSize: 13,
    color: '#8888aa',
    marginTop: 4,
  },
  closeBtn: {
    background: 'none',
    border: '1px solid #2d2d55',
    borderRadius: 8,
    color: '#8888aa',
    cursor: 'pointer',
    width: 32,
    height: 32,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'JetBrains Mono, monospace',
  },
  statusGreen: {
    background: 'rgba(0,255,136,0.1)',
    border: '1px solid rgba(0,255,136,0.3)',
    color: '#00ff88',
  },
  statusAmber: {
    background: 'rgba(255,170,0,0.1)',
    border: '1px solid rgba(255,170,0,0.3)',
    color: '#ffaa00',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#c4b5fd',
    fontFamily: 'Syne, sans-serif',
  },
  input: {
    padding: '12px 16px',
    background: '#080810',
    border: '1px solid #2d2d55',
    borderRadius: 8,
    color: '#f0f0ff',
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    letterSpacing: '0.05em',
  },
  hint: {
    fontSize: 12,
    color: '#55556a',
  },
  link: {
    color: '#00e5ff',
    textDecoration: 'none',
  },
  infoBox: {
    background: 'rgba(0,229,255,0.05)',
    border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: 8,
    padding: '12px 14px',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#00e5ff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8888aa',
    lineHeight: 1.5,
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  configItem: {
    background: '#12121f',
    borderRadius: 8,
    padding: '10px 12px',
    border: '1px solid #1e1e35',
  },
  configLabel: {
    fontSize: 10,
    color: '#55556a',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'JetBrains Mono, monospace',
    marginBottom: 4,
  },
  configValue: {
    fontSize: 13,
    color: '#c4b5fd',
    fontFamily: 'JetBrains Mono, monospace',
  },
  actions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
  },
  clearBtn: {
    padding: '10px 18px',
    background: 'rgba(255,51,102,0.1)',
    border: '1px solid rgba(255,51,102,0.3)',
    borderRadius: 8,
    color: '#ff3366',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'Instrument Sans, sans-serif',
  },
  saveBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    letterSpacing: '0.03em',
  },
};
