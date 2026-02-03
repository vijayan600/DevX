import React from 'react';
import { getDaysInMonth, getDateKey } from '../utils/dateHelpers';
import { calculateProgress } from '../utils/progressCalculator';
import ProgressCircle from './ProgressCircle';
import '../styles/StatsChart.css';

export default function StatsChart({ habits, currentYear, currentMonth }) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  
  // Calculate daily completion rates
  const dailyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = getDateKey(currentYear, currentMonth, day);
    const completedCount = habits.filter(h => h.completed[dateKey]).length;
    const percentage = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
    
    dailyData.push({
      day,
      percentage: Math.round(percentage)
    });
  }

  // Calculate habit-wise statistics
  const habitStats = habits.map(habit => ({
    name: habit.name,
    emoji: habit.emoji,
    progress: calculateProgress(habit, currentYear, currentMonth)
  }));

  // Find max percentage for graph scaling
  const maxPercentage = Math.max(...dailyData.map(d => d.percentage), 1);

  return (
    <div className="stats-chart">
      <h2>Monthly Statistics</h2>

      {/* Line Graph */}
      <div className="chart-container">
        <h3>Daily Completion Rate</h3>
        <div className="line-chart">
          <div className="chart-y-axis">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          <div className="chart-bars">
            {dailyData.map((data) => (
              <div key={data.day} className="bar-container">
                <div 
                  className="bar"
                  style={{ height: `${data.percentage}%` }}
                  title={`Day ${data.day}: ${data.percentage}%`}
                >
                  <span className="bar-value">{data.percentage > 10 ? `${data.percentage}%` : ''}</span>
                </div>
                <span className="bar-label">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Habit Progress Cards */}
      <div className="habit-stats-grid">
        <h3>Habit Progress</h3>
        <div className="stats-cards">
          {habitStats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-emoji">{stat.emoji}</span>
                <span className="stat-name">{stat.name}</span>
              </div>
              <ProgressCircle percentage={stat.progress} size={80} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}