import React, { useState } from 'react';
import DayCard from './DayCard';
import { getDateKey, getWeekDay, getCurrentWeekStart, getWeekDays, navigateWeek, isToday } from '../utils/dateHelpers';
import '../styles/WeeklyView.css';

export default function WeeklyView({ habits }) {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  
  const weekDays = getWeekDays(weekStart);
  
  const handlePrevWeek = () => {
    setWeekStart(navigateWeek(weekStart, -1));
  };
  
  const handleNextWeek = () => {
    setWeekStart(navigateWeek(weekStart, 1));
  };
  
  const handleToday = () => {
    setWeekStart(getCurrentWeekStart());
  };

  // Check if we're viewing the current week
  const isCurrentWeek = () => {
    const currentWeekStart = getCurrentWeekStart();
    return weekStart.toDateString() === currentWeekStart.toDateString();
  };

  // Format week range for display
  const getWeekRange = () => {
    const start = weekDays[0].date;
    const end = weekDays[6].date;
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
    }
  };

  const days = weekDays.map(({ year, month, day, date }) => {
    const dateKey = getDateKey(year, month, day);
    const dayName = getWeekDay(year, month, day);
    
    const dayHabits = habits.map(habit => ({
      name: habit.name,
      emoji: habit.emoji,
      completed: habit.completed[dateKey] || false
    }));
    
    const completedCount = dayHabits.filter(h => h.completed).length;
    const isTodayCard = isToday(year, month, day);
    
    return {
      day,
      dayName,
      habits: dayHabits,
      completedCount,
      totalHabits: habits.length,
      isToday: isTodayCard,
      date: date
    };
  });

  // Safe calculation helper
  const getPercentage = (completed, total) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  // Calculate average completion safely
  const getAverageCompletion = () => {
    if (habits.length === 0) return 0;
    const totalPercentage = days.reduce((acc, day) => {
      return acc + getPercentage(day.completedCount, day.totalHabits);
    }, 0);
    return Math.round(totalPercentage / 7);
  };

  // Get best day safely
  const getBestDay = () => {
    if (habits.length === 0 || days.length === 0) return 'N/A';
    
    let bestDay = days[0];
    let bestPercentage = getPercentage(bestDay.completedCount, bestDay.totalHabits);
    
    for (let i = 1; i < days.length; i++) {
      const currentPercentage = getPercentage(days[i].completedCount, days[i].totalHabits);
      if (currentPercentage > bestPercentage) {
        bestPercentage = currentPercentage;
        bestDay = days[i];
      }
    }
    
    return bestDay.dayName;
  };

  // Get total completed safely
  const getTotalCompleted = () => {
    return days.reduce((acc, day) => acc + day.completedCount, 0);
  };

  return (
    <div className="weekly-view">
      <div className="weekly-header">
        <h2>Daily Progress</h2>
        <div className="week-navigation">
          <button className="week-nav-btn" onClick={handlePrevWeek}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div className="week-range-container">
            <span className="week-range">{getWeekRange()}</span>
            {!isCurrentWeek() && (
              <button className="today-btn" onClick={handleToday}>
                Today
              </button>
            )}
          </div>
          <button className="week-nav-btn" onClick={handleNextWeek}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="days-grid">
        {days.map((dayData, index) => (
          <DayCard
            key={index}
            day={dayData.day}
            dayName={dayData.dayName}
            habits={dayData.habits}
            completedCount={dayData.completedCount}
            totalHabits={dayData.totalHabits}
            isToday={dayData.isToday}
          />
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="weekly-summary">
        <h3>Week Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Average Completion</div>
            <div className="summary-value">
              {getAverageCompletion()}%
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Best Day</div>
            <div className="summary-value">
              {getBestDay()}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Completed</div>
            <div className="summary-value">
              {getTotalCompleted()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}