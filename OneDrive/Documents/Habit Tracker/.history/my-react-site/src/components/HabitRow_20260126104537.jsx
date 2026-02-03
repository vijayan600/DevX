import React from 'react';
import DailyCheckbox from './DailyCheckbox';
import { getDateKey } from '../utils/dateHelpers';
import { calculateProgress } from '../utils/progressCalculator';

export default function HabitRow({ habit, currentYear, currentMonth, daysInMonth, toggleDay, deleteHabit }) {
  const progress = calculateProgress(habit, currentYear, currentMonth);

  return (
    <div className="habit-row">
      <div className="habit-name-cell">
        <span className="habit-emoji">{habit.emoji}</span>
        <span className="habit-name">{habit.name}</span>
        <button 
          className="delete-btn" 
          onClick={() => deleteHabit(habit.id)}
          title="Delete habit"
        >
          ×
        </button>
      </div>

      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateKey = getDateKey(currentYear, currentMonth, day);
        const isChecked = habit.completed[dateKey] || false;
        const isFuture = new Date(currentYear, currentMonth, day) > new Date();

        return (
          <DailyCheckbox
            key={day}
            isChecked={isChecked}
            isFuture={isFuture}
            onToggle={() => toggleDay(habit.id, dateKey)}
          />
        );
      })}

      <div className="progress-cell">
        <strong style={{ color: progress === 100 ? '#fbbf24' : '#10b981' }}>
          {progress}%
        </strong>
      </div>
    </div>
  );
}