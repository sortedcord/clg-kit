// Pre-instantiated Intl formatters hoisted to module scope (per js-hoist-intl best practice)
const dayHeadingFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const monthDayFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' });
const sessionDateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const weekdayNarrowFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
const weekdayLongFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const monthYearFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const monthShortDayFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const yearFormatter = new Intl.DateTimeFormat(undefined, { year: 'numeric' });
const timeShortFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const headerDateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

const weekdayShortFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

export const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const mondayOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

export const dateFromKey = (value: string) => new Date(`${value}T12:00:00`);

export const formatDayHeading = (date: Date) => dayHeadingFormatter.format(date);

export const formatMonthDay = (date: Date) => monthDayFormatter.format(date);

export const formatSessionDate = (value: string) => sessionDateFormatter.format(dateFromKey(value));

export const formatWeekdayNarrow = (date: Date) => weekdayNarrowFormatter.format(date);

export const formatWeekdayShort = (date: Date) => weekdayShortFormatter.format(date);

export const formatWeekdayLong = (date: Date) => weekdayLongFormatter.format(date);

export const formatMonthYear = (date: Date) => monthYearFormatter.format(date);

export const formatMonthShortDay = (date: Date) => monthShortDayFormatter.format(date);

export const formatYear = (date: Date) => yearFormatter.format(date);

export const formatCurrentTime = (date = new Date()) => timeShortFormatter.format(date);

export const formatHeaderDate = (date: Date) => headerDateFormatter.format(date);

export const currentMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : -1;
};

export const greetingFor = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
