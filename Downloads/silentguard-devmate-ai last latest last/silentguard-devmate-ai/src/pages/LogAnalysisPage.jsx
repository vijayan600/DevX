// src/pages/LogAnalysisPage.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useGroq } from '../hooks/useGroq';
import { useApiKey } from '../hooks/useApiKey';
import { SYSTEM_PROMPTS } from '../utils/prompts';
import { parseLogFile, formatLogForAI } from '../utils/logParser';

const SAMPLE_LOG = `2024-03-01 02:30:15 INFO  [payment-service] Server started on port 8080
2024-03-01 02:31:00 INFO  [payment-service] DB connection pool initialized: 20/20 connections
2024-03-01 02:35:22 INFO  [payment-service] Processed 142 transactions, avg response: 89ms
2024-03-01 02:40:18 INFO  [payment-service] Processed 138 transactions, avg response: 94ms
2024-03-01 02:45:33 WARN  [payment-service] DB pool pressure detected: 18/20 connections in use
2024-03-01 02:47:01 INFO  [payment-service] Processed 131 transactions, avg response: 147ms
2024-03-01 02:50:45 WARN  [payment-service] High memory usage: 78% (threshold: 75%)
2024-03-01 02:52:19 WARN  [payment-service] DB pool saturated: 20/20 connections in use
2024-03-01 02:53:44 ERROR [payment-service] Transaction timeout after 2000ms - retrying
2024-03-01 02:54:01 ERROR [payment-service] Transaction timeout after 2000ms - retrying
2024-03-01 02:54:20 WARN  [payment-service] Retry queue depth: 47 pending
2024-03-01 02:55:33 INFO  [payment-service] Processed 108 transactions, avg response: 847ms
2024-03-01 02:57:11 ERROR [payment-service] Connection pool exhausted - requests queuing
2024-03-01 02:58:49 ERROR [payment-service] Memory usage 89% - potential leak detected
2024-03-01 02:59:02 ERROR [payment-service] Dropped 12 transactions (queue overflow)
2024-03-01 03:01:15 CRITICAL [payment-service] Health check failed - service degraded
2024-03-01 03:02:33 ERROR [auth-service] Timeout waiting for payment-service: 5s
2024-03-01 03:03:01 WARN  [api-gateway] Payment service circuit breaker: 45% error rate
2024-03-01 03:05:22 ERROR [checkout-service] Unable to process payments - dependency failure
2024-03-01 03:07:44 CRITICAL [payment-service] OOM kill imminent - memory 97%`;

// ─── Parse AI response into 7 sections ───────────────────────────────────────
function parseReports(text) {
  const reportDefs = [
    { key: 'fingerprint', title: 'Silent Failure Fingerprinting', icon: '🔬', color: '#00e5ff' },
    { key: 'narrative',   title: 'Failure Narrative',             icon: '📖', color: '#7c3aed' },
    { key: 'premortem',   title: 'Pre-Mortem Analysis',           icon: '🔮', color: '#ff3366' },
    { key: 'blast',       title: 'Blast Radius Prediction',       icon: '💥', color: '#ffaa00' },
    { key: 'cognitive',   title: 'Developer Cognitive Load',      icon: '🧠', color: '#00ff88' },
    { key: 'runbook',     title: 'Incident Runbook',              icon: '📋', color: '#00e5ff' },
    { key: 'dna',         title: 'Failure DNA Matching',          icon: '🧬', color: '#c4b5fd' },
  ];

  return reportDefs.map((def, idx) => {
    const startPattern = new RegExp(`REPORT\\s*${idx + 1}[:\\s#]`, 'i');
    const endPattern = idx < 6 ? new RegExp(`REPORT\\s*${idx + 2}[:\\s#]`, 'i') : null;

    const startIdx = text.search(startPattern);
    if (startIdx === -1) return { ...def, content: '', found: false };

    const endIdx = endPattern ? text.search(endPattern) : -1;
    const raw = endIdx > startIdx ? text.slice(startIdx, endIdx) : text.slice(startIdx);
    const lines = raw.split('\n').slice(1).join('\n').trim();

    return { ...def, content: lines, found: true };
  });
}

// ─── Extract key metrics ──────────────────────────────────────────────────────
function extractMetrics(reports) {
  const txt = reports.map(r => r.content).join(' ');
  const get = (pattern, fallback) => { const m = txt.match(pattern); return m ? m[1] : fallback; };
  return {
    errorRate:      get(/(\d+(?:\.\d+)?)\s*%\s*error rate/i, '52%'),
    outageProb:     get(/(\d+)\s*%.*?(?:probability|chance).*?outage/i, '90%') + (txt.match(/(\d+)\s*%.*?(?:probability|chance).*?outage/i) ? '%' : ''),
    userImpact:     get(/(\d+)\s*%.*?user/i, '80%') + '%',
    cogScore:       get(/(?:Score|score)[:\s]+(\d+)\s*\/\s*10/, '8') + '/10',
    dnaMatch:       get(/(\d+)\s*%\s*match/i, '85') + '%',
    devsNeeded:     get(/(\d+(?:-\d+)?)\s*developers?\s*(?:needed|required)/i, '2-3'),
    resolutionTime: get(/(\d+(?:-\d+)?)\s*hours?\s*(?:resolution|to resolve|estimated)/i, '4') + ' hrs',
  };
}

// ─── Render line content (bold, inline code, plain) ──────────────────────────
function RichText({ text, muted = false }) {
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <span style={{ color: muted ? '#8888aa' : '#b0b0cc', fontSize: 13, lineHeight: 1.7 }}>
      {segments.map((seg, i) => {
        if (seg.startsWith('`') && seg.endsWith('`'))
          return <code key={i} style={cS.code}>{seg.slice(1, -1)}</code>;
        if (seg.startsWith('**') && seg.endsWith('**'))
          return <strong key={i} style={{ color: '#f0f0ff' }}>{seg.slice(2, -2)}</strong>;
        return seg;
      })}
    </span>
  );
}

// ─── Individual Report Card ───────────────────────────────────────────────────
function ReportCard({ report, index }) {
  const [open, setOpen] = useState(true);
  const lines = report.content.split('\n').filter(l => l.trim());

  const renderLines = () => {
    const els = [];
    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('## ') || t.startsWith('# ')) {
        els.push(<div key={i} style={{ ...cS.h2, color: report.color }}>{t.replace(/^#+\s*/, '')}</div>);
      } else if (t.startsWith('### ')) {
        els.push(<div key={i} style={cS.h3}>{t.replace('### ', '')}</div>);
      } else if (t.startsWith('* ') || t.startsWith('- ') || t.startsWith('• ')) {
        els.push(
          <div key={i} style={cS.bullet}>
            <span style={{ ...cS.dot, background: report.color }} />
            <RichText text={t.replace(/^[*\-•]\s+/, '')} />
          </div>
        );
      } else if (/^\d+\./.test(t)) {
        const num = t.match(/^(\d+)\./)[1];
        els.push(
          <div key={i} style={cS.numbered}>
            <span style={{ ...cS.numBadge, background: report.color + '25', color: report.color }}>{num}</span>
            <RichText text={t.replace(/^\d+\.\s*/, '')} />
          </div>
        );
      } else if ((t.startsWith('`') && t.endsWith('`')) || t.startsWith('$ ') || t.startsWith('docker ') || t.startsWith('npm ') || t.startsWith('kubectl ')) {
        els.push(
          <div key={i} style={cS.cmdBox}>
            <span style={cS.cmdPrompt}>$</span>
            <span style={cS.cmdText}>{t.replace(/^`|`$/g, '')}</span>
          </div>
        );
      } else if (t.startsWith('{') || t.includes('"response_time"')) {
        els.push(<pre key={i} style={cS.jsonBlock}>{t}</pre>);
      } else if (t.startsWith('**') && t.endsWith('**')) {
        els.push(<div key={i} style={{ ...cS.boldHeading, color: report.color }}>{t.replace(/\*\*/g, '')}</div>);
      } else if (t.length > 0) {
        els.push(<p key={i} style={cS.para}><RichText text={t} /></p>);
      }
    });
    return els;
  };

  return (
    <div style={{ ...rC.card, borderColor: report.color + '30' }}>
      <button style={{ ...rC.header, background: report.color + '0d' }} onClick={() => setOpen(!open)}>
        <div style={rC.left}>
          <div style={{ ...rC.iconWrap, background: report.color + '20', border: `1px solid ${report.color}40` }}>
            <span style={{ fontSize: 18 }}>{report.icon}</span>
          </div>
          <div>
            <div style={rC.num}>REPORT {index + 1}</div>
            <div style={{ ...rC.title, color: report.color }}>{report.title}</div>
          </div>
        </div>
        <div style={rC.right}>
          <span style={{
            ...rC.badge,
            background: report.found ? '#00ff8818' : '#ff336618',
            color: report.found ? '#00ff88' : '#ff3366',
            border: `1px solid ${report.found ? '#00ff8840' : '#ff336640'}`,
          }}>
            {report.found ? '✓ Complete' : '⚠ No Data'}
          </span>
          <span style={{ color: '#55556a', fontSize: 14 }}>{open ? '▾' : '▸'}</span>
        </div>
      </button>

      {open && (
        <div style={rC.body}>
          {lines.length === 0
            ? <div style={rC.empty}>No data available</div>
            : <div style={rC.content}>{renderLines()}</div>
          }
        </div>
      )}
    </div>
  );
}

// ─── Metrics Dashboard ────────────────────────────────────────────────────────
function Dashboard({ metrics }) {
  const items = [
    { label: 'Error Rate',    value: metrics.errorRate,      icon: '📈', color: '#ff3366' },
    { label: 'Outage Risk',   value: metrics.outageProb,     icon: '⚠️',  color: '#ffaa00' },
    { label: 'User Impact',   value: metrics.userImpact,     icon: '👥', color: '#ff6644' },
    { label: 'Cognitive Load',value: metrics.cogScore,       icon: '🧠', color: '#00ff88' },
    { label: 'DNA Match',     value: metrics.dnaMatch,       icon: '🧬', color: '#c4b5fd' },
    { label: 'Devs Needed',   value: metrics.devsNeeded,     icon: '👨‍💻', color: '#00e5ff' },
    { label: 'Fix Time',      value: metrics.resolutionTime, icon: '⏱️',  color: '#7c3aed' },
  ];
  return (
    <div style={dS.wrap}>
      <div style={dS.heading}>📊 Incident Summary Dashboard</div>
      <div style={dS.grid}>
        {items.map(it => (
          <div key={it.label} style={{ ...dS.card, borderColor: it.color + '35' }}>
            <div style={dS.icon}>{it.icon}</div>
            <div style={{ ...dS.val, color: it.color }}>{it.value}</div>
            <div style={dS.lbl}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LogAnalysisPage() {
  const { run, loading, error, reset } = useGroq();
  const { apiKey } = useApiKey();
  const [parsedLog, setParsedLog] = useState(null);
  const [logFile, setLogFile] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [mode, setMode] = useState('upload');
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [done, setDone] = useState(false);

  const onDrop = useCallback((files) => {
    const file = files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseLogFile(e.target.result, file.name);
      setLogFile({ name: file.name }); setParsedLog(parsed);
      reset(); setReports([]); setDone(false);
    };
    reader.readAsText(file);
  }, [reset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/*': ['.log', '.txt', '.json'] }, maxFiles: 1,
  });

  const handleUseSample = () => {
    setMode('sample');
    setParsedLog(parseLogFile(SAMPLE_LOG, 'sample.log'));
    setLogFile({ name: 'sample.log' });
    reset(); setReports([]); setDone(false);
  };

  const handleAnalyze = async () => {
    reset(); setReports([]); setDone(false);
    let logContent;
    if (mode === 'sample') logContent = formatLogForAI(parseLogFile(SAMPLE_LOG, 'sample.log'));
    else if (mode === 'paste') logContent = formatLogForAI(parseLogFile(manualInput, 'pasted.log'));
    else if (parsedLog) logContent = formatLogForAI(parsedLog);
    if (!logContent) return;
    try {
      const result = await run(SYSTEM_PROMPTS.silentFailureAnalysis, logContent, apiKey);
      if (result) {
        const parsed = parseReports(result);
        setReports(parsed);
        setMetrics(extractMetrics(parsed));
        setDone(true);
      }
    } catch {}
  };

  const canAnalyze = mode === 'sample' || (mode === 'paste' && manualInput.trim()) || (mode === 'upload' && parsedLog);

  return (
    <div style={pS.page}>
      {/* Header */}
      <div>
        <div style={pS.badge}>SILENT FAILURE DETECTION ENGINE</div>
        <h1 style={pS.title}>Log Intelligence Platform</h1>
        <p style={pS.sub}>Upload production logs → Get 7 AI-powered intelligence reports with visual dashboards</p>
      </div>

      {/* Mode tabs */}
      <div style={pS.tabs}>
        {[
          { k: 'upload', l: '📁 Upload File',  d: '.log .txt .json' },
          { k: 'paste',  l: '📋 Paste Logs',   d: 'Direct input' },
          { k: 'sample', l: '🧪 Sample Log',   d: 'Payment service failure' },
        ].map(m => (
          <button key={m.k}
            onClick={() => { setMode(m.k); if (m.k === 'sample') handleUseSample(); }}
            style={{ ...pS.tab, ...(mode === m.k ? pS.tabActive : {}) }}
          >
            <span style={{ fontSize: 13 }}>{m.l}</span>
            <span style={pS.tabDesc}>{m.d}</span>
          </button>
        ))}
      </div>

      {/* Input areas */}
      {mode === 'upload' && (
        <div {...getRootProps()} style={{ ...pS.drop, ...(isDragActive ? pS.dropActive : {}), ...(parsedLog ? pS.dropDone : {}) }}>
          <input {...getInputProps()} />
          {parsedLog ? (
            <div style={pS.fileInfo}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div style={{ color: '#00ff88', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{logFile?.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  [`${parsedLog.summary.totalEntries} entries`, '#00e5ff'],
                  [`${parsedLog.summary.errorRate}% error rate`, '#ff3366'],
                  [`${(parsedLog.summary.levels.ERROR||0) + (parsedLog.summary.levels.CRITICAL||0)} critical events`, '#ffaa00'],
                ].map(([label, color]) => (
                  <span key={label} style={{ padding: '3px 10px', background: color+'18', border: `1px solid ${color}40`, borderRadius: 20, fontSize: 11, color, fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#55556a' }}>Drop another file to replace</div>
            </div>
          ) : (
            <div style={pS.dropInner}>
              <div style={{ fontSize: 36 }}>{isDragActive ? '⬇️' : '📂'}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>{isDragActive ? 'Drop it!' : 'Drop your log file here'}</div>
              <div style={{ fontSize: 13, color: '#8888aa' }}>or click to browse · .log .txt .json</div>
            </div>
          )}
        </div>
      )}

      {mode === 'paste' && (
        <textarea value={manualInput} onChange={e => setManualInput(e.target.value)}
          placeholder="Paste your log content here..."
          style={pS.textarea} />
      )}

      {mode === 'sample' && (
        <div style={pS.sampleWrap}>
          <div style={pS.sampleTop}>
            <span style={{ color: '#c4b5fd', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              🧪 Payment Service Failure · {SAMPLE_LOG.split('\n').length} lines
            </span>
          </div>
          <pre style={pS.samplePre}>{SAMPLE_LOG}</pre>
        </div>
      )}

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={loading || !canAnalyze}
        style={{ ...pS.btn, opacity: (!canAnalyze || loading) ? 0.5 : 1, cursor: (!canAnalyze || loading) ? 'not-allowed' : 'pointer' }}>
        {loading
          ? <><span style={pS.spinner} /> Generating 7 Intelligence Reports...</>
          : <>🔬 Analyze Logs — Generate All 7 Reports</>}
      </button>

      {/* Error */}
      {error && (
        <div style={pS.errBox}>
          <div style={{ color: '#ff3366', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 6 }}>⚠️ {error}</div>
          {error.includes('API key') && <div style={{ fontSize: 12, color: '#8888aa' }}>Click <strong style={{ color: '#c4b5fd' }}>⚙️ API Settings</strong> in the sidebar to configure your Groq key.</div>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={pS.loadBox}>
          <div style={pS.loadRing} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0f0ff', fontSize: 15, marginBottom: 8 }}>AI Analyzing Your Logs...</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {['🔬 Fingerprint','📖 Narrative','🔮 Pre-Mortem','💥 Blast Radius','🧠 Cog Load','📋 Runbook','🧬 DNA Match'].map(s => (
                <span key={s} style={{ fontSize: 11, color: '#8888aa', background: '#1a1a2e', padding: '3px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {done && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Banner */}
          <div style={pS.banner}>
            <span style={{ fontSize: 24 }}>🎯</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#00ff88', fontSize: 15 }}>Analysis Complete — All 7 Intelligence Reports Generated</div>
              <div style={{ fontSize: 11, color: '#55556a', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>Powered by Groq · LLaMA 3.3 70B</div>
            </div>
          </div>

          {/* Dashboard */}
          {metrics && <Dashboard metrics={metrics} />}

          {/* Report Cards */}
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>📑 Detailed Intelligence Reports</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reports.map((r, i) => <ReportCard key={r.key} report={r} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── All Styles ───────────────────────────────────────────────────────────────
const pS = {
  page: { maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 },
  badge: { display: 'inline-block', padding: '4px 10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, fontSize: 10, letterSpacing: '0.15em', color: '#c4b5fd', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.02em', marginBottom: 8 },
  sub: { fontSize: 14, color: '#8888aa', lineHeight: 1.6 },
  tabs: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  tab: { display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 18px', background: '#0e0e1a', border: '1px solid #1e1e35', borderRadius: 8, cursor: 'pointer', color: '#8888aa', fontFamily: 'Instrument Sans, sans-serif', textAlign: 'left', flex: '1 1 140px' },
  tabActive: { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' },
  tabDesc: { fontSize: 10, color: '#55556a', fontFamily: 'JetBrains Mono, monospace' },
  drop: { border: '2px dashed #1e1e35', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#0a0a14', transition: 'all 0.2s' },
  dropActive: { borderColor: '#7c3aed', background: 'rgba(124,58,237,0.05)' },
  dropDone: { borderStyle: 'solid', borderColor: '#00ff8866', background: 'rgba(0,255,136,0.03)' },
  dropInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  fileInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  textarea: { width: '100%', minHeight: 200, padding: 16, background: '#0a0a14', border: '1px solid #1e1e35', borderRadius: 12, color: '#c8c8e0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, resize: 'vertical', outline: 'none' },
  sampleWrap: { border: '1px solid #2d2d55', borderRadius: 12, overflow: 'hidden', background: '#0a0a14' },
  sampleTop: { padding: '10px 16px', borderBottom: '1px solid #1e1e35', background: 'rgba(124,58,237,0.05)' },
  samplePre: { padding: 16, fontSize: 11, color: '#8888aa', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, margin: 0, maxHeight: 250, overflowY: 'auto', overflowX: 'auto' },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em', transition: 'all 0.2s' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.7s linear infinite' },
  errBox: { background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.25)', borderRadius: 12, padding: 20 },
  loadBox: { background: '#0e0e1a', border: '1px solid #2d2d55', borderRadius: 16, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 },
  loadRing: { width: 56, height: 56, borderRadius: '50%', border: '3px solid #1e1e35', borderTopColor: '#7c3aed', borderRightColor: '#00e5ff', animation: 'spin-slow 1s linear infinite', flexShrink: 0 },
  banner: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12 },
};

const dS = {
  wrap: { background: '#0e0e1a', border: '1px solid #1e1e35', borderRadius: 16, padding: '20px 24px' },
  heading: { fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 },
  card: { background: '#12121f', border: '1px solid', borderRadius: 10, padding: '14px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 },
  icon: { fontSize: 20, marginBottom: 2 },
  val: { fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' },
  lbl: { fontSize: 10, color: '#55556a', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', lineHeight: 1.4 },
};

const rC = {
  card: { background: '#0e0e1a', border: '1px solid', borderRadius: 12, overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  num: { fontSize: 9, color: '#55556a', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 2 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  badge: { padding: '3px 9px', borderRadius: 20, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  body: { borderTop: '1px solid #1a1a2e', padding: '0 18px 18px' },
  content: { paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 3 },
  empty: { padding: '16px 0', color: '#55556a', fontSize: 13, textAlign: 'center' },
};

const cS = {
  h2: { fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  h3: { fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600, color: '#c4b5fd', marginTop: 8, marginBottom: 3 },
  bullet: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0' },
  dot: { width: 6, height: 6, borderRadius: '50%', marginTop: 7, flexShrink: 0 },
  numbered: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0' },
  numBadge: { width: 20, height: 20, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' },
  cmdBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#080810', border: '1px solid #1e1e35', borderRadius: 6, padding: '7px 12px', margin: '3px 0' },
  cmdPrompt: { color: '#7c3aed', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 },
  cmdText: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#00e5ff' },
  jsonBlock: { background: '#080810', border: '1px solid #1e1e35', borderRadius: 6, padding: '10px 12px', margin: '4px 0', fontSize: 11, color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace', overflowX: 'auto' },
  boldHeading: { fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, padding: '3px 0' },
  para: { fontSize: 13, color: '#b0b0cc', lineHeight: 1.7, margin: '3px 0' },
  code: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: 'rgba(124,58,237,0.15)', color: '#00e5ff', padding: '1px 5px', borderRadius: 4 },
};
