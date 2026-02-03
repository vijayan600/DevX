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

  // Create SVG path for line chart
  const chartWidth = 900;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Generate points for the line
  const points = dailyData.map((data, index) => {
    const x = padding.left + (index / (daysInMonth - 1)) * innerWidth;
    const y = padding.top + innerHeight - (data.percentage / 100) * innerHeight;
    return { x, y, ...data };
  });

  // Create SVG path string for line
  const linePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  // Create SVG path string for area fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

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

      {/* Line Chart */}
      <div className="chart-container">
        <h3>Daily Completion Rate</h3>
        <div className="line-chart-wrapper">
          <svg className="line-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(percent => {
              const y = padding.top + innerHeight - (percent / 100) * innerHeight;
              return (
                <g key={percent}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#222"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#888"
                    fontSize="12"
                  >
                    {percent}%
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {dailyData.filter((_, i) => i % 5 === 0 || i === daysInMonth - 1).map((data, idx) => {
              const index = dailyData.indexOf(data);
              const x = padding.left + (index / (daysInMonth - 1)) * innerWidth;
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fill="#666"
                  fontSize="12"
                >
                  {data.day}
                </text>
              );
            })}

            {/* Area fill (gradient) */}
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={areaPath}
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#10b981"
                  stroke="#000"
                  strokeWidth="2"
                  className="chart-point"
                  style={{ cursor: 'pointer' }}
                >
                  <title>Day {point.day}: {point.percentage}% ({point.completedCount}/{point.totalHabits} habits)</title>
                </circle>
              </g>
            ))}
          </svg>
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