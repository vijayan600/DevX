import React from 'react';
import ProgressCircle from './ProgressCircle';
import '../styles/DayCard.css';

export default function DayCard({ day, dayName, habits, completedCount, totalHabits, isToday }) {
  const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  // Show only first 5 habits
  const visibleHabits = habits.slice(0, 5);
  const hasMoreHabits = habits.length > 5;

  return (
    <div className={`day-card ${isToday ? 'today' : ''}`}>
      <div className="day-card-header">
        <h3>{dayName}</h3>
        <p className="day-date">{day}</p>
        {isToday && <span className="today-badge">Today</span>}
      </div>

      <div className="day-card-progress">
        <ProgressCircle percentage={percentage} size={100} />
      </div>

      <div className="day-card-stats">
        <p className="stats-text">
          {completedCount} of {totalHabits} completed
        </p>
      </div>

      <div className="day-card-tasks">
        <h4>Habits</h4>
        <ul>
          {visibleHabits.length > 0 ? (
            visibleHabits.map((habit, index) => (
              <li key={index}>
                {habit.completed && <span className="task-check">✓</span>}
                <span className="task-emoji">{habit.emoji}</span>
                <span className="task-name">{habit.name}</span>
              </li>
            ))
          ) : (
            <li className="no-tasks">No habits for this day</li>
          )}
          {hasMoreHabits && (
            <li className="more-tasks">
              +{habits.length - 5} more
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}