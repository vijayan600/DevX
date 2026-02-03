import React, { useState } from 'react';
import { getDaysInMonth, getDateKey } from '../utils/dateHelpers';
import { calculateProgress } from '../utils/progressCalculator';
import ProgressCircle from './ProgressCircle';
import '../styles/StatsChart.css';

export default function StatsChart({ habits, currentYear, currentMonth }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
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
  const chartWidth = 1200;
  const chartHeight = 450;
  const padding = { top: 30, right: 40, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Generate points for the line
  const points = dailyData.map((data, index) => {
    const x = padding.left + (index / (daysInMonth - 1)) * innerWidth;
    const y = padding.top + innerHeight - (data.percentage / 100) * innerHeight;
    return { x, y, ...data };
  });

  // Create SVG path string for smooth curve (using quadratic bezier)
  const linePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    
    const prevPoint = points[index - 1];
    const midX = (prevPoint.x + point.x) / 2;
    
    return `Q ${prevPoint.x} ${prevPoint.y}, ${midX} ${(prevPoint.y + point.y) / 2} Q ${point.x} ${point.y}, ${point.x} ${point.y}`;
  }).join(' ');

  // Simple line path for better rendering
  const simpleLinePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  // Create SVG path string for area fill
  const areaPath = `${simpleLinePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

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
          <svg className="line-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
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
                    strokeWidth="1.5"
                    strokeDasharray={percent === 0 ? "0" : "5,5"}
                  />
                  <text
                    x={padding.left - 15}
                    y={y + 5}
                    textAnchor="end"
                    fill="#888"
                    fontSize="14"
                    fontWeight="500"
                  >
                    {percent}%
                  </text>
                </g>
              );
            })}

            {/* X-axis labels - show every 2 days for better readability */}
            {dailyData.map((data, index) => {
              if (index % 2 !== 0 && index !== daysInMonth - 1) return null;
              const x = padding.left + (index / (daysInMonth - 1)) * innerWidth;
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - padding.bottom + 25}
                  textAnchor="middle"
                  fill="#666"
                  fontSize="13"
                  fontWeight="500"
                >
                  {data.day}
                </text>
              );
            })}

            {/* X-axis label */}
            <text
              x={chartWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fill="#888"
              fontSize="14"
              fontWeight="600"
            >
              Day of Month
            </text>

            {/* Area fill (gradient) */}
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d={areaPath}
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <path
              d={simpleLinePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === index ? "8" : "6"}
                  fill={point.percentage > 0 ? "#10b981" : "#333"}
                  stroke="#000"
                  strokeWidth="2.5"
                  className="chart-point"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {hoveredPoint === index && (
                  <g>
                    <rect
                      x={point.x - 60}
                      y={point.y - 70}
                      width="120"
                      height="55"
                      fill="#1a1a1a"
                      stroke="#10b981"
                      strokeWidth="2"
                      rx="6"
                    />
                    <text
                      x={point.x}
                      y={point.y - 48}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="13"
                      fontWeight="bold"
                    >
                      Day {point.day}
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 30}
                      textAnchor="middle"
                      fill="#e5e5e5"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {point.percentage}%
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 15}
                      textAnchor="middle"
                      fill="#888"
                      fontSize="11"
                    >
                      {point.completedCount}/{point.totalHabits} habits
                    </text>
                  </g>
                )}
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