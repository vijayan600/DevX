// src/pages/DevAssistantPage.jsx
import React, { useState } from 'react';
import { useGroq } from '../hooks/useGroq';
import { useApiKey } from '../hooks/useApiKey';
import { useChatHistory } from '../hooks/useChatHistory';
import { SYSTEM_PROMPTS, detectFeature } from '../utils/prompts';
import StreamingOutput from '../components/StreamingOutput';

const FEATURE_CONFIG = {
  errorDebugger: {
    title: 'Error Debugger', icon: '🔍', color: '#ff3366',
    placeholder: `Paste your error or stack trace here...\n\nExample:\nTypeError: Cannot read properties of undefined (reading 'map')\n    at App.jsx:42:18`,
    hint: 'Paste any error, stack trace, exception, or describe a bug',
    autoDetect: true,
  },
  docGenerator: {
    title: 'Documentation Generator', icon: '📋', color: '#00e5ff',
    placeholder: `Paste your code here to generate documentation...`,
    hint: 'Paste any function, class, module, or entire file',
    autoDetect: false,
  },
  codeReviewer: {
    title: 'Code Reviewer', icon: '✅', color: '#00ff88',
    placeholder: `Paste code for review...\n\nSupports: JavaScript, TypeScript, Python, Java, Go, Rust, and more`,
    hint: 'Get a quality score, security analysis, and refactored version',
    autoDetect: false,
  },
  boilerplateGenerator: {
    title: 'Boilerplate Generator', icon: '🏗️', color: '#ffaa00',
    placeholder: `Describe what you want to build in plain English...\n\nExamples:\n- "Create a React custom hook for debounced API search"\n- "Write a Python FastAPI endpoint for JWT authentication"`,
    hint: 'Describe any feature in plain English — get production-ready code',
    autoDetect: false,
  },
  prSummarizer: {
    title: 'PR Summarizer', icon: '🔄', color: '#7c3aed',
    placeholder: `Paste your git diff or describe your PR changes...\n\ndiff --git a/src/auth.js b/src/auth.js\n+  const token = jwt.sign(...)`,
    hint: 'Paste git diff or describe changes — get a professional PR description',
    autoDetect: false,
  },
  meetingToTasks: {
    title: 'Meeting → Tasks', icon: '📝', color: '#ff6644',
    placeholder: `Paste raw meeting notes here...\n\nExample:\nJohn said we need to fix the login bug by Friday\nSarah will handle the API integration\nDeadline for v2 release is next sprint`,
    hint: 'Paste raw meeting notes — get structured action items with owners',
    autoDetect: false,
  },
  complexityAnalyzer: {
    title: 'Complexity Analyzer', icon: '📊', color: '#c4b5fd',
    placeholder: `Paste code to analyze complexity and performance...\n\nWorks best with business logic, algorithms, and nested structures`,
    hint: 'Detect bottlenecks, Big-O complexity, and get refactored code',
    autoDetect: false,
  },
  onboardingAssistant: {
    title: 'Onboarding Guide', icon: '🗺️', color: '#00ff88',
    placeholder: `Paste your project's README, file structure, or codebase overview...\n\nExample:\nproject/\n├── src/\n│   ├── api/\n│   ├── components/`,
    hint: 'Help new developers understand your codebase quickly',
    autoDetect: false,
  },
};

// ─── Format relative time ────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({ history, color, onLoad, onDelete, onClear, onClose }) {
  return (
    <div style={hS.overlay} onClick={onClose}>
      <div style={hS.panel} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={hS.header}>
          <div>
            <div style={hS.title}>Chat History</div>
            <div style={hS.sub}>{history.length} conversation{history.length !== 1 ? 's' : ''} saved</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {history.length > 0 && (
              <button onClick={onClear} style={hS.clearBtn}>🗑 Clear All</button>
            )}
            <button onClick={onClose} style={hS.closeBtn}>✕</button>
          </div>
        </div>

        {/* List */}
        <div style={hS.list}>
          {history.length === 0 ? (
            <div style={hS.empty}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ color: '#8888aa', fontSize: 14 }}>No history yet</div>
              <div style={{ color: '#55556a', fontSize: 12, marginTop: 4 }}>Your conversations will appear here</div>
            </div>
          ) : (
            history.map(entry => (
              <div key={entry.id} style={hS.entry}>
                <div style={hS.entryTop}>
                  <span style={hS.entryTime}>{timeAgo(entry.timestamp)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => onLoad(entry)} style={{ ...hS.entryBtn, color, borderColor: color + '44', background: color + '11' }}>
                      ↩ Load
                    </button>
                    <button onClick={() => onDelete(entry.id)} style={hS.entryDelete}>✕</button>
                  </div>
                </div>
                <div style={hS.entryInput}>
                  {entry.input.slice(0, 120)}{entry.input.length > 120 ? '...' : ''}
                </div>
                <div style={hS.entryOutput}>
                  {entry.output.slice(0, 80)}{entry.output.length > 80 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DevAssistantPage({ feature }) {
  const config = FEATURE_CONFIG[feature];
  const { run, loading, streamedText, error, reset } = useGroq();
  const { apiKey } = useApiKey();
  const { history, addEntry, deleteEntry, clearAll } = useChatHistory(feature);

  const [input, setInput] = useState('');
  const [autoDetectedFeature, setAutoDetectedFeature] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentOutput, setCurrentOutput] = useState('');

  const handleRun = async () => {
    if (!input.trim()) return;
    reset();
    setCurrentOutput('');

    let selectedFeature = feature;
    if (config.autoDetect) {
      selectedFeature = detectFeature(input);
      setAutoDetectedFeature(selectedFeature);
    }

    const systemPrompt = SYSTEM_PROMPTS[selectedFeature] || SYSTEM_PROMPTS.errorDebugger;
    const result = await run(systemPrompt, input, apiKey).catch(() => null);
    if (result) {
      addEntry(input, result);
      setCurrentOutput(result);
    }
  };

  const handleLoadHistory = (entry) => {
    setInput(entry.inputFull);
    setCurrentOutput(entry.output);
    reset();
    setShowHistory(false);
  };

  const handleClear = () => {
    setInput('');
    reset();
    setCurrentOutput('');
    setAutoDetectedFeature(null);
  };

  const hasOutput = streamedText || error || currentOutput;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ ...styles.headerIcon, background: config.color + '20', border: `1px solid ${config.color}44` }}>
          <span style={{ fontSize: 24 }}>{config.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...styles.title, color: config.color }}>{config.title}</h1>
          <p style={styles.subtitle}>{config.hint}</p>
        </div>
        {/* History Button */}
        <button onClick={() => setShowHistory(true)} style={{ ...styles.historyBtn, borderColor: config.color + '44', color: config.color, background: config.color + '11' }}>
          <span>🕐</span>
          <span>History</span>
          {history.length > 0 && (
            <span style={{ ...styles.historyCount, background: config.color }}>{history.length}</span>
          )}
        </button>
      </div>

      {/* Input */}
      <div style={styles.inputCard}>
        <div style={styles.inputHeader}>
          <span style={styles.inputLabel}>Input</span>
          <div style={styles.inputActions}>
            {input && (
              <span style={styles.charCount}>{input.length.toLocaleString()} chars · {input.split('\n').length} lines</span>
            )}
            {(input || hasOutput) && (
              <button onClick={handleClear} style={styles.clearBtn}>Clear</button>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={config.placeholder}
          style={styles.textarea}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRun(); }}
        />
        <div style={styles.inputFooter}>
          <span style={styles.shortcut}>⌘↵ to run</span>
          <button
            onClick={handleRun}
            disabled={loading || !input.trim()}
            style={{
              ...styles.runBtn,
              background: loading ? '#1a1a2e' : `linear-gradient(135deg, ${config.color}22, ${config.color}44)`,
              borderColor: loading ? '#2d2d55' : `${config.color}66`,
              color: loading ? '#55556a' : config.color,
              opacity: (!input.trim() && !loading) ? 0.5 : 1,
            }}
          >
            {loading ? (
              <><span style={styles.spinner} />Analyzing...</>
            ) : (
              <><span>{config.icon}</span>Run {config.title}</>
            )}
          </button>
        </div>
      </div>

      {/* Auto-detect badge */}
      {autoDetectedFeature && autoDetectedFeature !== feature && (
        <div style={styles.autoDetectBadge}>
          🤖 Auto-detected: <strong>{FEATURE_CONFIG[autoDetectedFeature]?.title}</strong>
        </div>
      )}

      {/* Output */}
      {hasOutput && (
        <div style={styles.outputCard}>
          <div style={styles.outputHeader}>
            <span style={styles.outputLabel}>
              {loading ? '⚡ Generating Response' : '✓ Analysis Complete'}
            </span>
            {!loading && (currentOutput || streamedText) && (
              <button
                onClick={() => navigator.clipboard.writeText(currentOutput || streamedText)}
                style={styles.copyOutputBtn}
              >
                📋 Copy
              </button>
            )}
          </div>
          <div style={styles.outputBody}>
            <StreamingOutput
              loading={loading}
              text={streamedText || currentOutput}
              error={error}
              featureName={config.title}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasOutput && !loading && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>{config.icon}</div>
          <div style={styles.emptyTitle}>Ready to analyze</div>
          <div style={styles.emptySubtitle}>{config.hint}</div>
          {history.length > 0 && (
            <button onClick={() => setShowHistory(true)} style={{ ...styles.recentBtn, borderColor: config.color + '44', color: config.color, background: config.color + '11' }}>
              🕐 View {history.length} recent conversation{history.length !== 1 ? 's' : ''}
            </button>
          )}
          <div style={styles.emptyTips}>
            <div style={styles.emptyTipsTitle}>TIPS</div>
            {getFeatureTips(feature).map((tip, i) => (
              <div key={i} style={styles.emptyTip}>
                <span style={{ color: config.color }}>→</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          color={config.color}
          onLoad={handleLoadHistory}
          onDelete={deleteEntry}
          onClear={clearAll}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

function getFeatureTips(feature) {
  const tips = {
    errorDebugger: ['Include the full stack trace for best results', 'Add the code snippet where the error occurs', 'Mention your runtime version (Node 18, Python 3.11, etc.)'],
    docGenerator: ['Paste complete functions or classes, not snippets', 'Include any type annotations already present', 'Multiple functions in one paste are supported'],
    codeReviewer: ['Paste 50-500 lines for best review quality', 'Include imports/context for security analysis', 'Works with any programming language'],
    boilerplateGenerator: ['Be specific about the framework (React 18, FastAPI, etc.)', 'Mention if you need TypeScript types', 'Describe edge cases you want handled'],
    prSummarizer: ['Include the git diff output for precise analysis', 'Or describe the PR changes in plain text', 'Add context about the codebase if relevant'],
    meetingToTasks: ['Include who was mentioned for each task', 'Raw unformatted notes work perfectly', 'Include date/sprint context if available'],
    complexityAnalyzer: ['Works best with 20+ lines of business logic', 'Nested loops and conditionals will be highlighted', 'Refactored versions use modern patterns'],
    onboardingAssistant: ['Paste file tree output from `tree` command', 'Include README content for context', 'Module descriptions help with mapping'],
  };
  return tips[feature] || ['Paste your input above and press Run'];
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: { maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  header: { display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 4, flexWrap: 'wrap' },
  headerIcon: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' },
  subtitle: { fontSize: 13, color: '#8888aa', marginTop: 2 },
  historyBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', border: '1px solid', borderRadius: 8,
    cursor: 'pointer', fontSize: 13, fontFamily: 'Instrument Sans, sans-serif',
    position: 'relative', flexShrink: 0,
  },
  historyCount: {
    width: 18, height: 18, borderRadius: '50%', color: '#fff',
    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'JetBrains Mono, monospace',
  },
  inputCard: { background: '#0e0e1a', border: '1px solid #1e1e35', borderRadius: 12, overflow: 'hidden' },
  inputHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1e1e35' },
  inputLabel: { fontSize: 11, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' },
  inputActions: { display: 'flex', alignItems: 'center', gap: 12 },
  charCount: { fontSize: 11, color: '#55556a', fontFamily: 'JetBrains Mono, monospace' },
  clearBtn: { background: 'none', border: '1px solid #2d2d55', borderRadius: 6, color: '#8888aa', cursor: 'pointer', padding: '3px 10px', fontSize: 11 },
  textarea: { width: '100%', minHeight: 200, padding: 16, background: 'transparent', border: 'none', color: '#c8c8e0', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.6, resize: 'vertical', outline: 'none' },
  inputFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #1e1e35' },
  shortcut: { fontSize: 11, color: '#55556a', fontFamily: 'JetBrains Mono, monospace' },
  runBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: '1px solid', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif', transition: 'all 0.2s' },
  spinner: { width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' },
  autoDetectBadge: { padding: '8px 14px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, fontSize: 12, color: '#8888aa', fontFamily: 'JetBrains Mono, monospace' },
  outputCard: { background: '#0e0e1a', border: '1px solid #1e1e35', borderRadius: 12, overflow: 'hidden' },
  outputHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1e1e35' },
  outputLabel: { fontSize: 11, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' },
  copyOutputBtn: { padding: '4px 12px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, color: '#c4b5fd', cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  outputBody: { padding: '20px 24px' },
  emptyState: { textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48, marginBottom: 8, opacity: 0.5 },
  emptyTitle: { fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#f0f0ff', opacity: 0.6 },
  emptySubtitle: { fontSize: 13, color: '#55556a', maxWidth: 400 },
  recentBtn: { padding: '8px 18px', border: '1px solid', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Instrument Sans, sans-serif', marginTop: 4, marginBottom: 16 },
  emptyTips: { background: '#0e0e1a', border: '1px solid #1e1e35', borderRadius: 10, padding: '16px 20px', textAlign: 'left', maxWidth: 380, width: '100%' },
  emptyTipsTitle: { fontSize: 10, color: '#55556a', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 },
  emptyTip: { fontSize: 12, color: '#8888aa', marginBottom: 6, lineHeight: 1.5 },
};

const hS = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', justifyContent: 'flex-end' },
  panel: {
    width: '100%', maxWidth: 420, height: '100vh',
    background: '#0e0e1a', borderLeft: '1px solid #1e1e35',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'slideInRight 0.25s ease',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px', borderBottom: '1px solid #1e1e35', flexShrink: 0 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#f0f0ff' },
  sub: { fontSize: 12, color: '#55556a', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' },
  clearBtn: { padding: '6px 12px', background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: 6, color: '#ff3366', cursor: 'pointer', fontSize: 12 },
  closeBtn: { padding: '6px 10px', background: '#1a1a2e', border: '1px solid #2d2d55', borderRadius: 6, color: '#8888aa', cursor: 'pointer', fontSize: 14 },
  list: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' },
  entry: { background: '#12121f', border: '1px solid #1e1e35', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  entryTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  entryTime: { fontSize: 10, color: '#55556a', fontFamily: 'JetBrains Mono, monospace' },
  entryBtn: { padding: '4px 10px', border: '1px solid', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  entryDelete: { padding: '4px 8px', background: 'none', border: '1px solid #2d2d55', borderRadius: 5, color: '#55556a', cursor: 'pointer', fontSize: 11 },
  entryInput: { fontSize: 12, color: '#b0b0cc', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.5, background: '#0a0a14', padding: '8px 10px', borderRadius: 6, borderLeft: '2px solid #7c3aed' },
  entryOutput: { fontSize: 11, color: '#55556a', lineHeight: 1.5 },
};
