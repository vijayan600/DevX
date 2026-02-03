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
      percentage: Math.round(percentage),
      completedCount,
      totalHabits: habits.length
    });
  }

  // Calculate habit-wise statistics
  const habitStats = habits.map(habit => ({
    name: habit.name,
    emoji: habit.emoji,
    progress: calculateProgress(habit, currentYear, currentMonth)
  }));

  // Calculate monthly overview stats
  const totalDaysTracked = dailyData.filter(d => d.completedCount > 0).length;
  const averageCompletion = dailyData.reduce((acc, d) => acc + d.percentage, 0) / daysInMonth;
  const bestDay = dailyData.reduce((max, d) => d.percentage > max.percentage ? d : max, dailyData[0]);

  return (
    <div className="stats-chart">
      <h2>Monthly Statistics</h2>

      {/* Monthly Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <div className="overview-label">Average Completion</div>
          <div className="overview-value">{Math.round(averageCompletion)}%</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Days Tracked</div>
          <div className="overview-value">{totalDaysTracked}/{daysInMonth}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Best Day</div>
          <div className="overview-value">Day {bestDay.day}</div>
          <div className="overview-subtext">{bestDay.percentage}% completed</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Total Habits</div>
          <div className="overview-value">{habits.length}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        <h3>Daily Completion Rate</h3>
        <div className="bar-chart">
          <div className="chart-y-axis">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          <div className="chart-content">
            <div className="chart-grid">
              {[100, 75, 50, 25, 0].map(value => (
                <div key={value} className="grid-line" />
              ))}
            </div>
            <div className="chart-bars">
              {dailyData.map((data) => (
                <div key={data.day} className="bar-wrapper">
                  <div className="bar-container">
                    <div 
                      className="bar"
                      style={{ height: `${data.percentage}%` }}
                    >
                      {data.percentage > 0 && (
                        <div className="bar-tooltip">
                          <div>Day {data.day}</div>
                          <div>{data.percentage}%</div>
                          <div className="tooltip-detail">
                            {data.completedCount}/{data.totalHabits} habits
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="bar-label">{data.day}</span>
                </div>
              ))}
            </div>
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
              <div className="stat-percentage">{stat.progress}% completed</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}