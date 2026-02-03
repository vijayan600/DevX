import React from 'react';
import HabitRow from './HabitRow';
import '../styles/HabitList.css';

export default function HabitList({ habits, currentYear, currentMonth, daysInMonth, toggleDay, deleteHabit }) {
  return (
    <div className="habit-list">
      {habits.map(habit => (
        <HabitRow
          key={habit.id}
          habit={habit}
          currentYear={currentYear}
          currentMonth={currentMonth}
          daysInMonth={daysInMonth}
          toggleDay={toggleDay}
          deleteHabit={deleteHabit}
        />
      ))}
    </div>
  );
}