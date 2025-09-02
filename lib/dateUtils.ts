// DATE FNS WAS BREAKING THE APP SO I HAD TO REWRITE THESE FUNCTIONS
// TODO: figure out what was wrong with date-fns and replace with it
// all of this was vibe coded

// Custom date formatting utilities to replace date-fns

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Parse ISO date string to Date object
 */
export function parseISO(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Parse ISO date string to Date object, treating it as UTC
 */
export function parseISOUTC(dateString: string): Date {
  // Remove the timezone indicator and parse as UTC
  const utcString = dateString.replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(utcString + "Z");
}

/**
 * Format date to "EEEE, MMMM d" format (e.g., "Monday, January 15")
 */
export function formatDay(date: Date): string {
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();

  return `${dayOfWeek}, ${month} ${day}`;
}

/**
 * Format date to "EEEE, MMMM d" format using UTC (e.g., "Monday, January 15")
 */
export function formatDayUTC(date: Date): string {
  const dayOfWeek = DAYS_OF_WEEK[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();

  return `${dayOfWeek}, ${month} ${day}`;
}

/**
 * Format date to "h:mm a" format (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  // Pad minutes with leading zero if needed
  const paddedMinutes = minutes.toString().padStart(2, "0");

  return `${hours}:${paddedMinutes} ${ampm}`;
}

/**
 * Format date to "h:mm a" format using UTC (e.g., "2:30 PM")
 */
export function formatTimeUTC(date: Date): string {
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  // Pad minutes with leading zero if needed
  const paddedMinutes = minutes.toString().padStart(2, "0");

  return `${hours}:${paddedMinutes} ${ampm}`;
}

/**
 * Format date to "EEEE, MMMM do" format (e.g., "Monday, January 15th")
 */
export function formatDayWithOrdinal(date: Date): string {
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const ordinal = getOrdinalSuffix(day);

  return `${dayOfWeek}, ${month} ${day}${ordinal}`;
}

/**
 * Format date to "MMMM do" format (e.g., "January 15th")
 */
export function formatMonthDay(date: Date): string {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const ordinal = getOrdinalSuffix(day);

  return `${month} ${day}${ordinal}`;
}

/**
 * Format date to "do" format (e.g., "15th")
 */
export function formatDayOnly(date: Date): string {
  const day = date.getDate();
  const ordinal = getOrdinalSuffix(day);

  return `${day}${ordinal}`;
}

/**
 * Format date to "EEEE" format (e.g., "Monday")
 */
export function formatDayName(date: Date): string {
  return DAYS_OF_WEEK[date.getDay()];
}

/**
 * Format date to "MMM d" format (e.g., "Jan 15")
 */
export function formatShortMonthDay(date: Date): string {
  const month = MONTHS[date.getMonth()].substring(0, 3);
  const day = date.getDate();

  return `${month} ${day}`;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if a date is this week
 */
export function isThisWeek(
  date: Date,
  options: { weekStartsOn: number } = { weekStartsOn: 0 },
): boolean {
  const today = new Date();
  const startOfWeek = startOfWeekDate(today, options.weekStartsOn);
  const endOfWeek = endOfWeekDate(today, options.weekStartsOn);

  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Get start of week
 */
export function startOfWeek(
  date: Date,
  options: { weekStartsOn: number } = { weekStartsOn: 0 },
): Date {
  return startOfWeekDate(date, options.weekStartsOn);
}

/**
 * Get end of week
 */
export function endOfWeek(
  date: Date,
  options: { weekStartsOn: number } = { weekStartsOn: 0 },
): Date {
  return endOfWeekDate(date, options.weekStartsOn);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Check if a date is within an interval
 */
export function isWithinInterval(
  date: Date,
  interval: { start: Date; end: Date },
): boolean {
  return date >= interval.start && date <= interval.end;
}

// Helper functions
function startOfWeekDate(date: Date, weekStartsOn: number): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : weekStartsOn);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeekDate(date: Date, weekStartsOn: number): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7 - weekStartsOn);
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Main format function that supports all format strings
 */
export function format(date: Date, formatString: string): string {
  switch (formatString) {
    case "EEEE, MMMM d":
      return formatDay(date);
    case "EEEE, MMMM do":
      return formatDayWithOrdinal(date);
    case "h:mm a":
      return formatTime(date);
    case "MMMM do":
      return formatMonthDay(date);
    case "do":
      return formatDayOnly(date);
    case "EEEE":
      return formatDayName(date);
    case "MMM d":
      return formatShortMonthDay(date);
    default:
      throw new Error(`Unsupported format: ${formatString}`);
  }
}

/**
 * Main format function that supports all format strings with UTC option
 */
export function formatUTC(date: Date, formatString: string): string {
  switch (formatString) {
    case "EEEE, MMMM d":
      return formatDayUTC(date);
    case "EEEE, MMMM do":
      const dayOfWeek = DAYS_OF_WEEK[date.getUTCDay()];
      const month = MONTHS[date.getUTCMonth()];
      const day = date.getUTCDate();
      const ordinal = getOrdinalSuffix(day);
      return `${dayOfWeek}, ${month} ${day}${ordinal}`;
    case "h:mm a":
      return formatTimeUTC(date);
    case "EEEE":
      return DAYS_OF_WEEK[date.getUTCDay()];
    case "MMM d":
      const monthShort = MONTHS[date.getUTCMonth()].substring(0, 3);
      const dayShort = date.getUTCDate();
      return `${monthShort} ${dayShort}`;
    default:
      throw new Error(`Unsupported UTC format: ${formatString}`);
  }
}
