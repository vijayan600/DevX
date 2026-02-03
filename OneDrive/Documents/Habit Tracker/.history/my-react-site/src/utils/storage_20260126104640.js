export const saveHabits = (habits) => {
  try {
    localStorage.setItem('habitTracker_habits', JSON.stringify(habits));
  } catch (error) {
    console.error('Error saving habits:', error);
  }
};

export const loadHabits = () => {
  try {
    const saved = localStorage.getItem('habitTracker_habits');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading habits:', error);
    return null;
  }
};

export const clearHabits = () => {
  try {
    localStorage.removeItem('habitTracker_habits');
  } catch (error) {
    console.error('Error clearing habits:', error);
  }
};