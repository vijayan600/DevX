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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};