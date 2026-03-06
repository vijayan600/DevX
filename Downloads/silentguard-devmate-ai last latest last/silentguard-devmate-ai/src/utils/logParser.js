// src/utils/logParser.js
// Parses uploaded log files for Silent Failure Detection

export function parseLogFile(content, filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  
  if (ext === 'json') {
    return parseJsonLogs(content);
  }
  
  return parsePlainLogs(content);
}

function parseJsonLogs(content) {
  try {
    const parsed = JSON.parse(content);
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    
    return {
      type: 'json',
      entries: entries.slice(0, 500),
      summary: buildSummary(entries),
      rawSample: content.slice(0, 3000),
    };
  } catch {
    return parsePlainLogs(content);
  }
}

function parsePlainLogs(content) {
  const lines = content.split('\n').filter(l => l.trim());
  
  const entries = lines.map(line => {
    const timestamp = extractTimestamp(line);
    const level = extractLevel(line);
    const message = line;
    return { timestamp, level, message };
  });

  const summary = buildSummary(entries);

  return {
    type: 'plain',
    entries: entries.slice(0, 500),
    summary,
    rawSample: content.slice(0, 5000),
    totalLines: lines.length,
  };
}

function extractTimestamp(line) {
  // ISO 8601
  const iso = line.match(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/);
  if (iso) return iso[0];
  
  // Unix timestamp
  const unix = line.match(/\b\d{10,13}\b/);
  if (unix) return new Date(parseInt(unix[0])).toISOString();
  
  return null;
}

function extractLevel(line) {
  const upper = line.toUpperCase();
  if (upper.includes('CRITICAL') || upper.includes('FATAL')) return 'CRITICAL';
  if (upper.includes('ERROR')) return 'ERROR';
  if (upper.includes('WARN')) return 'WARN';
  if (upper.includes('DEBUG')) return 'DEBUG';
  if (upper.includes('INFO')) return 'INFO';
  return 'UNKNOWN';
}

function buildSummary(entries) {
  const levels = { CRITICAL: 0, ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, UNKNOWN: 0 };
  const timestamps = [];
  const errorMessages = [];

  entries.forEach(e => {
    const lvl = e.level || 'UNKNOWN';
    levels[lvl] = (levels[lvl] || 0) + 1;
    if (e.timestamp) timestamps.push(e.timestamp);
    if (lvl === 'ERROR' || lvl === 'CRITICAL') {
      errorMessages.push(e.message?.slice(0, 200));
    }
  });

  const timeRange = timestamps.length > 1 ? {
    start: timestamps[0],
    end: timestamps[timestamps.length - 1],
  } : null;

  return {
    totalEntries: entries.length,
    levels,
    timeRange,
    topErrors: errorMessages.slice(0, 10),
    errorRate: ((levels.ERROR + levels.CRITICAL) / entries.length * 100).toFixed(2),
  };
}

export function formatLogForAI(parsedLog) {
  const { summary, rawSample, entries } = parsedLog;
  
  return `
## LOG FILE ANALYSIS REQUEST

### Summary Statistics
- Total log entries: ${summary.totalEntries}
- Error rate: ${summary.errorRate}%
- Log levels: ${JSON.stringify(summary.levels)}
- Time range: ${summary.timeRange ? `${summary.timeRange.start} to ${summary.timeRange.end}` : 'Unknown'}

### Top Error Messages
${summary.topErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

### Raw Log Sample (first 5000 chars)
\`\`\`
${rawSample}
\`\`\`

### Recent Entries (last 50)
\`\`\`
${entries.slice(-50).map(e => e.message).join('\n')}
\`\`\`

Please analyze this log data and generate all 7 Silent Failure Intelligence Reports.
`;
}
