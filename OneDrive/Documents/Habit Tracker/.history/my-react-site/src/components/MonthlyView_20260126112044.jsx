import React, { useState } from 'react';
import HabitList from './HabitList';
import ProgressCircle from './ProgressCircle';
import { getDaysInMonth, getMonthName, getWeekDay, getDateKey } from '../utils/dateHelpers';
import { calculateProgress, calculateTotalProgress } from '../utils/progressCalculator';
import '../styles/MonthlyView.css';

export default function MonthlyView({ habits, currentYear, currentMonth, toggleDay, addHabit, deleteHabit }) {
  const [newHabitName, setNewHabitName] = useState('');

  const monthName = getMonthName(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName, '✨');
      setNewHabitName('');
    }
  };

  const totalProgress = calculateTotalProgress(habits, currentYear, currentMonth);

  return (
    <div className="monthly-view">
      {/* Progress Chart at Top */}
      <div className="progress-chart-section">
        <h2>Monthly Progress</h2>
        <div className="progress-info-wrapper">
          <ProgressCircle percentage={totalProgress} size={100} />
          <p className="progress-message">
            {totalProgress === 100
              ? '🎉 Perfect month! Keep it up!'
              : `Keep going! You're at ${totalProgress}%`}
          </p>
        </div>
      </div>

      {/* Add Habit Section */}
      <div className="add-habit-section">
        <input
          type="text"
          placeholder="Add new habit..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
          className="habit-input"
        />
        <button onClick={handleAddHabit} className="add-button">
          ➕ Add Habit
        </button>
      </div>

      {/* Habit Table */}
      <div className="table-container">
        <div className="table-scroll">
          {/* Header Row */}
          <div className="table-header">
            <div className="header-cell habit-name-header">{monthName}</div>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <div key={i} className="header-cell day-header">
                <div className="day-number">{i + 1}</div>
                <div className="day-name">{getWeekDay(currentYear, currentMonth, i + 1)}</div>
              </div>
            ))}
            <div className="header-cell progress-header">Progress</div>
          </div>

          {/* Habit Rows */}
          <HabitList
            habits={habits}
            currentYear={currentYear}
            currentMonth={currentMonth}
            daysInMonth={daysInMonth}
            toggleDay={toggleDay}
            deleteHabit={deleteHabit}
          />

          {/* Total Progress Row */}
          <div className="total-row">
            <div className="total-cell habit-name-cell">
              <strong>Total Progress</strong>
            </div>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <div key={i} className="total-cell empty-cell"></div>
            ))}
            <div className="total-cell progress-cell">
              <strong style={{ color: '#10b981', fontSize: '18px' }}>{totalProgress}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}