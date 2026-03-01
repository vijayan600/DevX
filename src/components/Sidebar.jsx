// src/components/Sidebar.jsx
import React from 'react';

const NAV_ITEMS = {
  devAssistant: {
    label: 'Developer Assistant', icon: '⚡', color: '#00e5ff',
    children: [
      { id: 'errorDebugger',        label: 'Error Debugger',      icon: '🔍' },
      { id: 'docGenerator',         label: 'Doc Generator',       icon: '📋' },
      { id: 'codeReviewer',         label: 'Code Reviewer',       icon: '✅' },
      { id: 'boilerplateGenerator', label: 'Boilerplate Gen',     icon: '🏗️' },
      { id: 'prSummarizer',         label: 'PR Summarizer',       icon: '🔄' },
      { id: 'meetingToTasks',       label: 'Meeting → Tasks',     icon: '📝' },
      { id: 'complexityAnalyzer',   label: 'Complexity Analyzer', icon: '📊' },
      { id: 'onboardingAssistant',  label: 'Onboarding Guide',    icon: '🗺️' },
    ]
  },
  silentFailure: {
    label: 'Silent Failure Detection', icon: '🛡️', color: '#7c3aed',
    children: [
      { id: 'logAnalysis', label: 'Upload & Analyze Logs', icon: '🔬' },
    ]
  }
};

export default function Sidebar({ activeFeature, onFeatureSelect, onSettingsOpen, isMobileInner }) {
  const [collapsed, setCollapsed] = React.useState({});
  const toggle = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  return (
    <aside style={{ ...styles.sidebar, ...(isMobileInner ? styles.sidebarInner : {}) }}>
      {/* Logo — only show in desktop mode */}
      {!isMobileInner && (
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <span style={styles.logoIconInner}>SG</span>
          </div>
          <div>
            <div style={styles.logoTitle}>SilentGuard</div>
            <div style={styles.logoSubtitle}>DevMate AI</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={styles.nav}>
        {Object.entries(NAV_ITEMS).map(([key, section]) => (
          <div key={key} style={styles.section}>
            <button onClick={() => toggle(key)} style={{ ...styles.sectionHeader, color: section.color }}>
              <span>{section.icon}</span>
              <span style={styles.sectionLabel}>{section.label}</span>
              <span style={{ ...styles.chevron, transform: collapsed[key] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▾</span>
            </button>
            {!collapsed[key] && (
              <div>
                {section.children.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onFeatureSelect(item.id)}
                    style={{ ...styles.navItem, ...(activeFeature === item.id ? styles.navItemActive : {}) }}
                  >
                    <span style={styles.navItemIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                    {activeFeature === item.id && (
                      <span style={{ ...styles.activeDot, background: section.color }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <button onClick={onSettingsOpen} style={styles.settingsBtn}>
          <span>⚙️</span><span>API Settings</span>
        </button>
        <div style={styles.version}>v1.0.0 · Powered by Groq + LLaMA 3.3</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 260, minWidth: 260, height: '100vh',
    background: '#0e0e1a', borderRight: '1px solid #1e1e35',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, overflow: 'hidden',
  },
  sidebarInner: {
    width: '100%', minWidth: 'unset', height: 'calc(100vh - 70px)',
    position: 'static', borderRight: 'none',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '20px 16px', borderBottom: '1px solid #1e1e35',
  },
  logoIcon: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg,#7c3aed,#00e5ff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoIconInner: { fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13, color: '#fff' },
  logoTitle: { fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#f0f0ff', lineHeight: 1.2 },
  logoSubtitle: { fontSize: 10, color: '#00e5ff', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono,monospace' },
  nav: { flex: 1, overflowY: 'auto', padding: '12px 0' },
  section: { marginBottom: 4 },
  sectionHeader: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 11,
    textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left',
  },
  sectionLabel: { flex: 1 },
  chevron: { fontSize: 12, transition: 'transform 0.2s', color: '#55556a' },
  navItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 16px 11px 28px', background: 'none', border: 'none',
    cursor: 'pointer', color: '#8888aa', fontSize: 14,
    fontFamily: 'Instrument Sans,sans-serif', textAlign: 'left',
    transition: 'all 0.15s', position: 'relative',
  },
  navItemActive: { color: '#f0f0ff', background: 'rgba(124,58,237,0.12)' },
  navItemIcon: { fontSize: 16 },
  activeDot: { position: 'absolute', right: 16, width: 6, height: 6, borderRadius: '50%' },
  bottom: { padding: '16px', borderTop: '1px solid #1e1e35' },
  settingsBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 14px', background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8,
    color: '#c4b5fd', cursor: 'pointer', fontSize: 14,
    fontFamily: 'Instrument Sans,sans-serif', marginBottom: 10,
  },
  version: { fontSize: 10, color: '#55556a', fontFamily: 'JetBrains Mono,monospace', textAlign: 'center' },
};
