import {
  EpochSeconds,
  HabitDefinition,
  MaybeMonthPeriod,
  TrackerValue,
} from "./interfaces/Interfaces";

const MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const mod = (n: number, x: number) => ((n % x) + x) % x;

const classnames = (...classes: any[]) => classes.filter(Boolean).join(" ");

const clip = (n: number, lower: number, upper: number) =>
  Math.min(Math.max(n, lower), upper);

const formatMillisToLocaleDate = (s: EpochSeconds) =>
  formatDateToLocaleDate(new Date(s * 1000), true);

const formatDateToLocaleDate = (date: Date, includeYear: boolean) =>
  date
    .toLocaleDateString("en-US", {
      weekday: "short",
      year: includeYear ? "numeric" : undefined,
      month: "short",
      day: "2-digit",
    })
    .toLocaleLowerCase();

const formatMillisToMonthYear = (s: EpochSeconds) =>
  new Date(s * 1000)
    .toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    })
    .toLocaleLowerCase();

const currentMonthPeriod = (): MaybeMonthPeriod => {
  return {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  };
};

const addMonths = (
  maybeMonthPeriod: MaybeMonthPeriod,
  n_months: number
): MaybeMonthPeriod => {
  if (!maybeMonthPeriod) {
    return null;
  } else {
    return {
      month: mod(maybeMonthPeriod.month + n_months, 12),
      year: Math.floor(
        (maybeMonthPeriod.year * 12 + maybeMonthPeriod.month + n_months) / 12
      ),
    };
  }
};

const isSecondsInMonth = (
  s: EpochSeconds | null,
  monthYear: MaybeMonthPeriod
) =>
  s &&
  monthYear &&
  new Date(s * 1000).getMonth() === monthYear.month &&
  new Date(s * 1000).getFullYear() === monthYear.year;

const formatMonthYear = (monthYear: MaybeMonthPeriod) =>
  monthYear ? `${MONTH_NAMES[monthYear.month]} ${monthYear.year}` : "";

const getNowInSeconds = (): number => Math.floor(Date.now() / 1000);

const formatDateToIso = (date: Date) => date.toLocaleDateString("en-CA");

const addDays = (date: Date, days: number) => {
  let tempDate = new Date(date);
  tempDate.setDate(tempDate.getDate() + days);
  return tempDate;
};

const arrayRange = (start: number, stop: number, step: number) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
  );

const getDateRange = (selectedDate: Date, maxNumDays: number) => {
  const daysBeforeSelectedDate = -Math.floor(maxNumDays / 2);
  return arrayRange(
    daysBeforeSelectedDate,
    daysBeforeSelectedDate + maxNumDays - 1,
    1
  )
    .map((offset) => addDays(selectedDate, offset))
    .filter((date) => date <= new Date());
};

const getNDaysUpToSelectedDate = (selectedDate: Date, numDays: number) => {
  return arrayRange(-numDays + 1, 0, 1).map((offset) =>
    addDays(selectedDate, offset)
  );
};

const stringToTrackerValue = (v: string) => {
  switch (v) {
    case "Y":
      return TrackerValue.YES;
    case "K":
      return TrackerValue.KINDA;
    case "N":
      return TrackerValue.NO;
    case "N/A":
      return TrackerValue.NOT_APPLICABLE;
    default:
      return TrackerValue.UNKNOWN;
  }
};

const DAYS_OF_WEEK = "umtwrfs";

const habitScheduleIncludesDateIso = (schedule: string, dateIso: string) => {
  const dayOfWeek = DAYS_OF_WEEK[new Date(dateIso).getUTCDay()];
  return schedule.includes(dayOfWeek);
};

const trackerValueIsNoKindaYes = (value: string) =>
  value === TrackerValue.NO ||
  value === TrackerValue.KINDA ||
  value === TrackerValue.YES;

export {
  mod,
  classnames,
  clip,
  formatMillisToLocaleDate,
  formatMillisToMonthYear,
  isSecondsInMonth,
  formatMonthYear,
  getNowInSeconds,
  formatDateToIso,
  addDays,
  getDateRange,
  formatDateToLocaleDate,
  addMonths,
  currentMonthPeriod,
  stringToTrackerValue,
  habitScheduleIncludesDateIso,
  getNDaysUpToSelectedDate,
  trackerValueIsNoKindaYes,
};
