export const getDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthName = (year, month) => {
  const date = new Date(year, month, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const getWeekDay = (year, month, day) => {
  const date = new Date(year, month, day);
  return date.toLocaleString('en-US', { weekday: 'short' });
};

export const isFutureDate = (year, month, day) => {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date > today;
};

export const isToday = (year, month, day) => {
  const date = new Date(year, month, day);
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Get the start of the week (Sunday) for a given date
export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day; // Distance from Sunday
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Get all 7 days of the week starting from a given date
export const getWeekDays = (startDate) => {
  const days = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      date: date
    });
  }
  
  return days;
};

// Get the current week's start date
export const getCurrentWeekStart = () => {
  return getWeekStart(new Date());
};

// Navigate to previous/next week
export const navigateWeek = (currentWeekStart, direction) => {
  const newDate = new Date(currentWeekStart);
  newDate.setDate(newDate.getDate() + (direction * 7));
  return newDate;
};