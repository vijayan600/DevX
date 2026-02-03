import { getDaysInMonth, getDateKey } from './dateHelpers';

export const calculateProgress = (habit, year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  let completedCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = getDateKey(year, month, day);
    if (habit.completed[dateKey]) {
      completedCount++;
    }
  }

  return Math.round((completedCount / daysInMonth) * 100);
};

export const calculateTotalProgress = (habits, year, month) => {
  if (habits.length === 0) return 0;

  const totalProgress = habits.reduce((sum, habit) => {
    return sum + calculateProgress(habit, year, month);
  }, 0);

  return Math.round(totalProgress / habits.length);
};

export const getCompletedCount = (habit, year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = getDateKey(year, month, day);
    if (habit.completed[dateKey]) {
      count++;
    }
  }

  return count;
};