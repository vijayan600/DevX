import React, { useState, useRef } from 'react';
import { getDaysInMonth, getDateKey } from '../utils/dateHelpers';
import { calculateProgress } from '../utils/progressCalculator';
import ProgressCircle from './ProgressCircle';
import '../styles/StatsChart.css';

export default function StatsChart({ habits, currentYear, currentMonth }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);
  
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

  // Simple line path for better rendering
  const simpleLinePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  // Create SVG path string for area fill
  const areaPath = `${simpleLinePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

  // Handle mouse enter on point
  const handlePointEnter = (index, event) => {
    setHoveredPoint(index);
    updateTooltipPosition(event);
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };
  
  const handleTouchStart = (index, event) => {
    event.preventDefault();
    event.stopPropagation();
    setHoveredPoint(index);
    updateTooltipPosition(event);
  };
  
  const updateTooltipPosition = (event) => {
    if (!wrapperRef.current) return;
    
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches[0]) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // Position relative to wrapper
    const x = clientX - wrapperRect.left;
    const y = clientY - wrapperRect.top;
    
    setTooltipPos({ x, y });
  };
  
  const handlePointMove = (event) => {
    if (hoveredPoint !== null) {
      updateTooltipPosition(event);
    }
  };

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
        <div 
          className="line-chart-wrapper" 
          ref={wrapperRef} 
          style={{ 
            position: 'relative',
            touchAction: 'pan-y pinch-zoom'
          }}
        >
          <svg 
            className="line-chart-svg" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            style={{ touchAction: 'none' }}
          >
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
                {/* Larger invisible circle for better touch target */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="20"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handlePointEnter(index, e)}
                  onMouseMove={(e) => handlePointMove(e)}
                  onMouseLeave={handlePointLeave}
                  onTouchStart={(e) => handleTouchStart(index, e)}
                  onTouchMove={(e) => handlePointMove(e)}
                  onTouchEnd={handlePointLeave}
                />
                {/* Visible point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === index ? "8" : "6"}
                  fill={point.percentage > 0 ? "#10b981" : "#333"}
                  stroke="#000"
                  strokeWidth="2.5"
                  className="chart-point"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            ))}
          </svg>

          {/* HTML Tooltip - Outside SVG */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div 
              className="chart-tooltip visible"
              style={{
                position: 'absolute',
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y - 90}px`,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                zIndex: 999999,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f2419 100%)',
                border: '2px solid #10b981',
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 20px rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                Day {points[hoveredPoint].day}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px', color: '#e5e5e5', textAlign: 'center' }}>
                {points[hoveredPoint].percentage}%
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
                {points[hoveredPoint].completedCount}/{points[hoveredPoint].totalHabits} habits
              </div>
              {/* Tooltip arrow */}
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid #10b981'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-7px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #1a1a1a'
              }}></div>
            </div>
          )}
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