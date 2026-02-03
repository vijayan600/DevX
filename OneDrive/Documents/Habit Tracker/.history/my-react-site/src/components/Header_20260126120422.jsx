import React from 'react';

export default function Header({ view, setView }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="title">📊 My Habit Tracker</h1>
        <div className="view-toggle">
          <button
            className={view === 'monthly' ? 'active' : ''}
            onClick={() => setView('monthly')}
          >
            📅 Monthly
          </button>
          <button
            className={view === 'daily' ? 'active' : ''}
            onClick={() => setView('daily')}
          >
            📊 Daily
          </button>
          <button
            className={view === 'stats' ? 'active' : ''}
            onClick={() => setView('stats')}
          >
            📈 Charts
          </button>
        </div>
      </div>
    </header>
  );
}