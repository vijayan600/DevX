// src/components/MarkdownRenderer.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#0a0a14',
    border: '1px solid #1e1e35',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '13px',
  }
};

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={copyBtnStyle}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

const copyBtnStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  padding: '4px 10px',
  background: 'rgba(124,58,237,0.2)',
  border: '1px solid rgba(124,58,237,0.4)',
  borderRadius: 6,
  color: '#c4b5fd',
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'JetBrains Mono, monospace',
  letterSpacing: '0.05em',
  transition: 'all 0.2s',
};

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="markdown-content" style={{ lineHeight: 1.7 }}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeStr = String(children).replace(/\n$/, '');
            
            if (!inline && match) {
              return (
                <div style={{ position: 'relative', margin: '16px 0' }}>
                  <div style={langBadgeStyle}>{match[1]}</div>
                  <CopyButton text={codeStr} />
                  <SyntaxHighlighter
                    style={customTheme}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {codeStr}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            if (!inline) {
              return (
                <div style={{ position: 'relative', margin: '16px 0' }}>
                  <CopyButton text={codeStr} />
                  <SyntaxHighlighter
                    style={customTheme}
                    language="text"
                    PreTag="div"
                    {...props}
                  >
                    {codeStr}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            return <code style={inlineCodeStyle}>{children}</code>;
          },
          h1: ({ children }) => <h1 style={h1Style}>{children}</h1>,
          h2: ({ children }) => <h2 style={h2Style}>{children}</h2>,
          h3: ({ children }) => <h3 style={h3Style}>{children}</h3>,
          p: ({ children }) => <p style={pStyle}>{children}</p>,
          ul: ({ children }) => <ul style={ulStyle}>{children}</ul>,
          ol: ({ children }) => <ol style={olStyle}>{children}</ol>,
          li: ({ children }) => <li style={liStyle}>{children}</li>,
          strong: ({ children }) => <strong style={strongStyle}>{children}</strong>,
          blockquote: ({ children }) => <blockquote style={blockquoteStyle}>{children}</blockquote>,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={tableStyle}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th style={thStyle}>{children}</th>,
          td: ({ children }) => <td style={tdStyle}>{children}</td>,
          hr: () => <hr style={hrStyle} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

const langBadgeStyle = {
  position: 'absolute',
  top: 8,
  left: 12,
  fontSize: 10,
  color: '#55556a',
  fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  zIndex: 1,
};
const inlineCodeStyle = {
  fontFamily: 'JetBrains Mono, monospace',
  background: 'rgba(124,58,237,0.15)',
  color: '#00e5ff',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: '0.87em',
};
const h1Style = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 22,
  fontWeight: 700,
  color: '#f0f0ff',
  margin: '24px 0 12px',
  borderBottom: '1px solid #1e1e35',
  paddingBottom: 8,
};
const h2Style = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 18,
  fontWeight: 700,
  color: '#c4b5fd',
  margin: '20px 0 10px',
};
const h3Style = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 15,
  fontWeight: 600,
  color: '#00e5ff',
  margin: '16px 0 8px',
};
const pStyle = {
  color: '#b0b0cc',
  marginBottom: 12,
  lineHeight: 1.7,
};
const ulStyle = {
  paddingLeft: 20,
  marginBottom: 12,
};
const olStyle = {
  paddingLeft: 20,
  marginBottom: 12,
};
const liStyle = {
  color: '#b0b0cc',
  marginBottom: 6,
  lineHeight: 1.6,
};
const strongStyle = {
  color: '#f0f0ff',
  fontWeight: 600,
};
const blockquoteStyle = {
  borderLeft: '3px solid #7c3aed',
  paddingLeft: 16,
  margin: '12px 0',
  color: '#8888aa',
  fontStyle: 'italic',
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  fontFamily: 'JetBrains Mono, monospace',
};
const thStyle = {
  background: 'rgba(124,58,237,0.15)',
  color: '#c4b5fd',
  padding: '8px 12px',
  borderBottom: '1px solid #2d2d55',
  textAlign: 'left',
  fontWeight: 600,
};
const tdStyle = {
  color: '#b0b0cc',
  padding: '8px 12px',
  borderBottom: '1px solid #1e1e35',
};
const hrStyle = {
  border: 'none',
  borderTop: '1px solid #1e1e35',
  margin: '20px 0',
};
