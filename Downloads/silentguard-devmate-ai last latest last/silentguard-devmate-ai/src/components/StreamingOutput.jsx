// src/components/StreamingOutput.jsx
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

export default function StreamingOutput({ loading, text, error, featureName }) {
  if (error) {
    return (
      <div style={styles.errorBox}>
        <div style={styles.errorIcon}>⚠️</div>
        <div style={styles.errorTitle}>Something went wrong</div>
        <div style={styles.errorText}>{error}</div>
        {error.includes('API key') && (
          <div style={styles.errorHint}>
            Click <strong style={{ color: '#c4b5fd' }}>⚙️ API Settings</strong> in the sidebar to configure your Groq key.
          </div>
        )}
      </div>
    );
  }

  if (loading && !text) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingInner}>
          <div style={styles.spinner}>
            <div style={styles.spinnerRing} />
            <div style={styles.spinnerCore} />
          </div>
          <div style={styles.loadingText}>
            {featureName || 'Analyzing'}
            <span style={styles.dots}>
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
          <div style={styles.loadingSubtext}>Powered by Groq · LLaMA 3.3 70B</div>
        </div>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div style={styles.outputContainer}>
      {loading && (
        <div style={styles.streamingBadge}>
          <span style={styles.streamingDot} />
          Generating...
        </div>
      )}
      <MarkdownRenderer content={text} />
      {!loading && text && (
        <div style={styles.completeBadge}>
          <span>✓</span>
          <span>Analysis complete</span>
          <CopyAllButton text={text} />
        </div>
      )}
    </div>
  );
}

function CopyAllButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={styles.copyAllBtn}>
      {copied ? '✓ Copied' : '📋 Copy All'}
    </button>
  );
}

const styles = {
  outputContainer: {
    position: 'relative',
  },
  streamingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    background: 'rgba(0,229,255,0.08)',
    border: '1px solid rgba(0,229,255,0.2)',
    borderRadius: 20,
    fontSize: 11,
    color: '#00e5ff',
    fontFamily: 'JetBrains Mono, monospace',
    marginBottom: 20,
    letterSpacing: '0.05em',
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#00e5ff',
    display: 'inline-block',
    animation: 'pulse-glow 1s ease-in-out infinite',
  },
  completeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid #1e1e35',
    fontSize: 12,
    color: '#00ff88',
    fontFamily: 'JetBrains Mono, monospace',
  },
  copyAllBtn: {
    marginLeft: 'auto',
    padding: '6px 14px',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 6,
    color: '#c4b5fd',
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
  },
  errorBox: {
    background: 'rgba(255,51,102,0.06)',
    border: '1px solid rgba(255,51,102,0.25)',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  errorTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: '#ff3366',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#aa7788',
    fontFamily: 'JetBrains Mono, monospace',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 13,
    color: '#8888aa',
    background: 'rgba(124,58,237,0.08)',
    padding: '8px 12px',
    borderRadius: 6,
    display: 'inline-block',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  loadingInner: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  spinner: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  spinnerRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid transparent',
    borderTopColor: '#7c3aed',
    borderRightColor: '#00e5ff',
    animation: 'spin-slow 1s linear infinite',
  },
  spinnerCore: {
    position: 'absolute',
    inset: 8,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent)',
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  loadingText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#f0f0ff',
  },
  dots: {
    '& span': {
      animation: 'blink 1.4s ease-in-out infinite',
    }
  },
  loadingSubtext: {
    fontSize: 11,
    color: '#55556a',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.08em',
  },
};
