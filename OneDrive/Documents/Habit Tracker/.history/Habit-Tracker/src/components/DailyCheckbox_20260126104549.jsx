import React from 'react';

export default function DailyCheckbox({ isChecked, isFuture, onToggle }) {
  return (
    <div 
      className={`checkbox-cell ${isFuture ? 'future' : ''}`}
      onClick={!isFuture ? onToggle : undefined}
      style={{ cursor: isFuture ? 'not-allowed' : 'pointer' }}
    >
      <div className={`checkbox ${isChecked ? 'checked' : ''}`}>
        {isChecked && <span className="checkmark">✓</span>}
      </div>
    </div>
  );
}