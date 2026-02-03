import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MonthlyView from './components/MonthlyView';
import WeeklyView from './components/WeeklyView';
import StatsChart from './components/StatsChart';
import { loadHabits, saveHabits } from './utils/storage';
import './App.css';

export default function App() {
  const [currentDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [view, setView] = useState('monthly'); // 'monthly', 'daily', 'stats'

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load habits on mount
  useEffect(() => {
    const savedHabits = loadHabits();
    if (savedHabits && savedHabits.length > 0) {
      setHabits(savedHabits);
    } else {
      // Default habits
      setHabits([
        { id: 1, name: 'Wake up at 05:00', emoji: '⏰', completed: {} },
        { id: 2, name: 'Gym', emoji: '💪', completed: {} },
        { id: 3, name: 'S', emoji: '🚫', completed: {} },
        { id: 4, name: 'Reading / Learning', emoji: '📚', completed: {} },
        { id: 5, name: 'Budget Tracking', emoji: '💰', completed: {} },
        { id: 6, name: 'Project Work', emoji: '🧠', completed: {} },
        { id: 7, name: 'No Alcohol', emoji: '🍺', completed: {} },
        { id: 8, name: 'Social Media Detox', emoji: '🌿', completed: {} },
        { id: 9, name: 'Goal Journaling', emoji: '📝', completed: {} },
        { id: 10, name: 'Cold Shower', emoji: '❄️', completed: {} },
      ]);
    }
  }, []);

  // Save habits when they change
  useEffect(() => {
    if (habits.length > 0) {
      saveHabits(habits);
    }
  }, [habits]);

  const addHabit = (name, emoji = '✨') => {
    const newHabit = {
      id: Date.now(),
      name,
      emoji,
      completed: {}
    };
    setHabits([...habits, newHabit]);
  };

  const toggleDay = (habitId, dateKey) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const completed = { ...habit.completed };
        completed[dateKey] = !completed[dateKey];
        return { ...habit, completed };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  return (
    <div className="app">
      <Header view={view} setView={setView} />
      
      {view === 'monthly' && (
        <MonthlyView
          habits={habits}
          currentYear={currentYear}
          currentMonth={currentMonth}
          toggleDay={toggleDay}
          addHabit={addHabit}
          deleteHabit={deleteHabit}
        />
      )}

      {view === 'daily' && (
        <WeeklyView
          habits={habits}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      )}

      {view === 'stats' && (
        <StatsChart
          habits={habits}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      )}
    </div>
  );
}