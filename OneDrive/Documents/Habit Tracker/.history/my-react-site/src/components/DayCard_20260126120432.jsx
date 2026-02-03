import React from 'react';
import ProgressCircle from './ProgressCircle';
import '../styles/DayCard.css';

export default function DayCard({ day, dayName, habits, completedCount, totalHabits }) {
  const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <div className="day-card">
      <div className="day-card-header">
        <h3>{dayName}</h3>
        <p className="day-date">{day}</p>
      </div>
      <div className="day-card-progress">
        <ProgressCircle percentage={percentage} size={100} />
      </div>
      <div className="day-card-tasks">
        <h4>Tasks</h4>
        <ul>
          {habits.filter(h => h.completed).slice(0, 5).map((habit, idx) => (
            <li key={idx}>
              <span className="task-check">✓</span>
              <span>{habit.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}