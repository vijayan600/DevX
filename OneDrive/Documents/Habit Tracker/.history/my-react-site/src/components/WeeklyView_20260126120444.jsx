import React from 'react';
import DayCard from './DayCard';
import { getDaysInMonth, getWeekDay, getDateKey } from '../utils/dateHelpers';
import '../styles/WeeklyView.css';

export default function WeeklyView({ habits, currentYear, currentMonth }) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const today = new Date().getDate();
  
  // Get last 7 days or current week
  const startDay = Math.max(1, today - 6);
  const endDay = Math.min(today, daysInMonth);
  
  const days = [];
  for (let day = startDay; day <= endDay; day++) {
    const dateKey = getDateKey(currentYear, currentMonth, day);
    const dayName = getWeekDay(currentYear, currentMonth, day);
    
    const dayHabits = habits.map(habit => ({
      name: habit.name,
      completed: habit.completed[dateKey] || false
    }));
    
    const completedCount = dayHabits.filter(h => h.completed).length;
    
    days.push({
      day,
      dayName,
      habits: dayHabits,
      completedCount,
      totalHabits: habits.length
    });
  }

  return (
    <div className="weekly-view">
      <h2>Daily Progress</h2>
      <div className="days-grid">
        {days.map((dayData) => (
          <DayCard
            key={dayData.day}
            day={dayData.day}
            dayName={dayData.dayName}
            habits={dayData.habits}
            completedCount={dayData.completedCount}
            totalHabits={dayData.totalHabits}
          />
        ))}
      </div>
    </div>
  );
}