// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import HomePage from './pages/HomePage';
import DevAssistantPage from './pages/DevAssistantPage';
import LogAnalysisPage from './pages/LogAnalysisPage';
import { useApiKey } from './hooks/useApiKey';

const DEV_FEATURES = [
  'errorDebugger','docGenerator','codeReviewer','boilerplateGenerator',
  'prSummarizer','meetingToTasks','complexityAnalyzer','onboardingAssistant',
];

const FEATURE_LABELS = {
  home: 'Dashboard', errorDebugger: 'Error Debugger', docGenerator: 'Doc Generator',
  codeReviewer: 'Code Reviewer', boilerplateGenerator: 'Boilerplate Gen',
  prSummarizer: 'PR Summarizer', meetingToTasks: 'Meeting → Tasks',
  complexityAnalyzer: 'Complexity Analyzer', onboardingAssistant: 'Onboarding Guide',
  logAnalysis: 'Log Analysis',
};

// Bottom nav items for mobile
const BOTTOM_NAV = [
  { id: 'home',           icon: '🏠', label: 'Home' },
  { id: 'errorDebugger',  icon: '🔍', label: 'Debug' },
  { id: 'codeReviewer',   icon: '✅', label: 'Review' },
  { id: 'logAnalysis',    icon: '🔬', label: 'Logs' },
  { id: '__menu__',       icon: '☰',  label: 'More' },
];

export default function App() {
  const [activeFeature, setActiveFeature] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isSet } = useApiKey();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleFeatureSelect = (feature) => {
    if (feature === '__menu__') { setSidebarOpen(true); return; }
    setActiveFeature(feature);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (activeFeature === 'home') return <HomePage onGetStarted={() => setActiveFeature('errorDebugger')} />;
    if (activeFeature === 'logAnalysis') return <LogAnalysisPage />;
    if (DEV_FEATURES.includes(activeFeature)) return <DevAssistantPage key={activeFeature} feature={activeFeature} />;
    return <HomePage onGetStarted={() => setActiveFeature('errorDebugger')} />;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810' }}>

      {/* ── SIDEBAR (desktop always visible, mobile slide-in) ── */}
      {isMobile ? (
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 199,
            }} />
          )}
          {/* Slide-in sidebar */}
          <div style={{
            position: 'fixed', top: 0, left: 0, height: '100vh', width: 260,
            background: '#0e0e1a', borderRight: '1px solid #1e1e35',
            zIndex: 200, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column',
          }}>
            {/* Mobile sidebar header with close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderBottom: '1px solid #1e1e35' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 12, color: '#fff' }}>SG</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#f0f0ff' }}>SilentGuard</div>
                <div style={{ fontSize: 9, color: '#00e5ff', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono,monospace' }}>DevMate AI</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
            </div>
            <Sidebar
              activeFeature={activeFeature}
              onFeatureSelect={handleFeatureSelect}
              onSettingsOpen={() => { setShowSettings(true); setSidebarOpen(false); }}
              isMobileInner={true}
            />
          </div>
        </>
      ) : (
        <Sidebar
          activeFeature={activeFeature}
          onFeatureSelect={handleFeatureSelect}
          onSettingsOpen={() => setShowSettings(true)}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '12px 16px' : '12px 32px',
          borderBottom: '1px solid #1e1e35', background: '#0a0a14',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 8, color: '#c4b5fd', fontSize: 18, cursor: 'pointer',
                padding: '6px 10px', lineHeight: 1,
              }}>☰</button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
              <button onClick={() => setActiveFeature('home')} style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', padding: 0 }}>Home</button>
              <span style={{ color: '#2d2d55' }}>/</span>
              <span style={{ color: '#c4b5fd' }}>{FEATURE_LABELS[activeFeature] || activeFeature}</span>
            </div>
          </div>
          <div>
            {!isSet ? (
              <button onClick={() => setShowSettings(true)} style={{
                padding: '6px 12px', background: 'rgba(255,170,0,0.1)',
                border: '1px solid rgba(255,170,0,0.3)', borderRadius: 20,
                color: '#ffaa00', fontSize: 11, cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
              }}>⚠ Set Groq API Key</button>
            ) : (
              <div style={{
                padding: '6px 12px', background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20,
                color: '#00ff88', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
              }}>✓ API Ready</div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{
          flex: 1,
          padding: isMobile ? '20px 16px 90px' : '32px',
          overflowY: 'auto',
        }}>
          {renderContent()}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#0e0e1a', borderTop: '1px solid #1e1e35',
          display: 'flex', zIndex: 150,
        }}>
          {BOTTOM_NAV.map(item => {
            const isActive = activeFeature === item.id;
            return (
              <button key={item.id} onClick={() => handleFeatureSelect(item.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, padding: '10px 4px',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'none',
                border: 'none', cursor: 'pointer',
                borderTop: isActive ? '2px solid #7c3aed' : '2px solid transparent',
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: isActive ? '#c4b5fd' : '#55556a', fontFamily: 'JetBrains Mono, monospace' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
