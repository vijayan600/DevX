// src/pages/HomePage.jsx
import React from 'react';

const STATS = [
  { value: '23%', label: 'Debugging Time Saved', icon: '⚡', color: '#00e5ff' },
  { value: '60s', label: 'Mean Time To Detection', icon: '🔬', color: '#00ff88' },
  { value: '30min', label: 'Mean Time To Resolution', icon: '🛠️', color: '#ffaa00' },
  { value: '$0', label: 'Cost (vs $2000/mo)', icon: '💰', color: '#7c3aed' },
];

const FEATURES = [
  {
    mode: 'Dev Assistant',
    icon: '⚡',
    color: '#00e5ff',
    items: [
      '🔍 Error Debugger — root cause + step-by-step fix',
      '📋 Documentation Generator',
      '✅ Code Reviewer with quality score',
      '🏗️ Boilerplate Code Generator',
      '🔄 PR Summarizer + risk assessment',
      '📝 Meeting Notes → Action Tasks',
      '📊 Complexity Analyzer',
      '🗺️ Codebase Onboarding Guide',
    ]
  },
  {
    mode: 'Silent Failure Detection',
    icon: '🛡️',
    color: '#7c3aed',
    items: [
      '🔬 Silent Failure Fingerprinting',
      '📖 Failure Narrative Generation',
      '🔮 Pre-Mortem Analysis & Prediction',
      '💥 Blast Radius Prediction',
      '🧠 Developer Cognitive Load Score',
      '📋 One-Click Incident Runbook',
      '🧬 Failure DNA Matching',
    ]
  }
];

const VS_TABLE = [
  { label: 'Error debugging', sg: true, copilot: 'partial', datadog: false, gpt: 'partial' },
  { label: 'Code review', sg: true, copilot: 'partial', datadog: false, gpt: 'partial' },
  { label: 'Silent failure detection', sg: true, copilot: false, datadog: 'partial', gpt: false },
  { label: 'Failure narrative', sg: true, copilot: false, datadog: false, gpt: false },
  { label: 'Pre-mortem prediction', sg: true, copilot: false, datadog: false, gpt: false },
  { label: 'Runbook generation', sg: true, copilot: false, datadog: false, gpt: false },
  { label: 'DNA matching', sg: true, copilot: false, datadog: false, gpt: false },
  { label: 'Price', sg: '🟢 Free', copilot: '$19/mo', datadog: '$2000/mo', gpt: '$20/mo' },
];

export default function HomePage({ onGetStarted }) {
  return (
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroTag}>WORLD'S FIRST UNIFIED AI DEVELOPER PLATFORM</div>
        <h1 style={styles.heroTitle}>
          Ship Faster.
          <br />
          <span style={styles.heroAccent}>Fail Silently Never.</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Developers lose productivity twice — while writing code, and after deployment when silent failures destroy production without a single error. SilentGuard DevMate AI solves <em>both</em> in one unified platform.
        </p>
        <div style={styles.heroActions}>
          <button onClick={onGetStarted} style={styles.ctaBtn}>
            ⚡ Start Using DevMate AI
          </button>
          <div style={styles.ctaNote}>No signup required · Bring your Groq API key</div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {STATS.map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={styles.featuresGrid}>
        {FEATURES.map(f => (
          <div key={f.mode} style={{ ...styles.featureCard, borderColor: `${f.color}33` }}>
            <div style={styles.featureHeader}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={{ ...styles.featureMode, color: f.color }}>Mode {f.items.length > 0 ? '' : ''}</span>
              <div style={{ ...styles.featureTitle, color: f.color }}>{f.mode}</div>
            </div>
            <div style={styles.featureList}>
              {f.items.map((item, i) => (
                <div key={i} style={styles.featureItem}>{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* VS Table */}
      <div style={styles.vsCard}>
        <div style={styles.vsTitleRow}>
          <div style={styles.vsTitle}>Competitive Advantage</div>
          <div style={styles.vsSubtitle}>No tool in the market combines both capabilities</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Capability</th>
                <th style={{ ...styles.th, ...styles.thHighlight }}>SilentGuard ✦</th>
                <th style={styles.th}>GitHub Copilot</th>
                <th style={styles.th}>Datadog</th>
                <th style={styles.th}>ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {VS_TABLE.map((row, i) => (
                <tr key={i}>
                  <td style={styles.td}>{row.label}</td>
                  <td style={{ ...styles.td, ...styles.tdHighlight }}>
                    <Check value={row.sg} />
                  </td>
                  <td style={styles.td}><Check value={row.copilot} /></td>
                  <td style={styles.td}><Check value={row.datadog} /></td>
                  <td style={styles.td}><Check value={row.gpt} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA bottom */}
      <div style={styles.bottomCta}>
        <div style={styles.bottomCtaTitle}>Ready to eliminate both productivity killers?</div>
        <button onClick={onGetStarted} style={styles.ctaBtn}>
          ⚡ Get Started — It's Free
        </button>
      </div>
    </div>
  );
}

function Check({ value }) {
  if (value === true) return <span style={{ color: '#00ff88', fontSize: 16 }}>✓</span>;
  if (value === false) return <span style={{ color: '#ff3366', fontSize: 16 }}>✗</span>;
  if (value === 'partial') return <span style={{ color: '#ffaa00', fontSize: 13 }}>Partial</span>;
  return <span style={{ color: '#c4b5fd', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>;
}

const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    paddingBottom: 40,
  },
  hero: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  heroTag: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(0,229,255,0.1)',
    border: '1px solid rgba(0,229,255,0.25)',
    borderRadius: 20,
    fontSize: 10,
    letterSpacing: '0.15em',
    color: '#00e5ff',
    fontFamily: 'JetBrains Mono, monospace',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 48,
    fontWeight: 800,
    color: '#f0f0ff',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: 16,
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #7c3aed, #00e5ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8888aa',
    maxWidth: 580,
    lineHeight: 1.7,
    marginBottom: 28,
  },
  heroActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-start',
  },
  ctaBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #7c3aed, #00e5ff)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },
  ctaNote: {
    fontSize: 11,
    color: '#55556a',
    fontFamily: 'JetBrains Mono, monospace',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
  },
  statCard: {
    background: '#0e0e1a',
    border: '1px solid #1e1e35',
    borderRadius: 12,
    padding: '20px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  statIcon: { fontSize: 24 },
  statValue: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: 11,
    color: '#55556a',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.05em',
    lineHeight: 1.4,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  featureCard: {
    background: '#0e0e1a',
    border: '1px solid',
    borderRadius: 12,
    padding: '20px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  featureHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  featureIcon: { fontSize: 24, marginBottom: 4 },
  featureMode: {
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: 'JetBrains Mono, monospace',
  },
  featureTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 16,
    fontWeight: 700,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  featureItem: {
    fontSize: 12,
    color: '#8888aa',
    lineHeight: 1.5,
  },
  vsCard: {
    background: '#0e0e1a',
    border: '1px solid #1e1e35',
    borderRadius: 12,
    overflow: 'hidden',
  },
  vsTitleRow: {
    padding: '18px 20px 14px',
    borderBottom: '1px solid #1e1e35',
  },
  vsTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f0ff',
  },
  vsSubtitle: {
    fontSize: 12,
    color: '#55556a',
    marginTop: 2,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: 11,
    color: '#55556a',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'JetBrains Mono, monospace',
    borderBottom: '1px solid #1e1e35',
    background: '#080810',
  },
  thHighlight: {
    color: '#7c3aed',
    background: 'rgba(124,58,237,0.05)',
  },
  td: {
    padding: '10px 16px',
    color: '#8888aa',
    borderBottom: '1px solid #0e0e1a',
    fontSize: 13,
  },
  tdHighlight: {
    background: 'rgba(124,58,237,0.04)',
  },
  bottomCta: {
    textAlign: 'center',
    padding: '28px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  bottomCtaTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: '#f0f0ff',
  },
};
