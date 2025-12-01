/**
 * Formats a Date into YYYY-MM-DD (ISO-like) without timezone issues.
 * Always pads month/day to 2 digits.
 */
export const getDateKey = (date: Date): string => {
  const [year, month, day] = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ];

  return [
    year,
    month.toString().padStart(2, '0'),
    day.toString().padStart(2, '0'),
  ].join('-');
};