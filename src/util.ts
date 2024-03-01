import { EpochMillis } from "./interfaces/Task";

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

const formatMillisToLocaleDate = (m: EpochMillis) =>
  new Date(m)
    .toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .toLocaleLowerCase();

const formatMillisToMonthYear = (m: EpochMillis) =>
  new Date(m)
    .toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    })
    .toLocaleLowerCase();

const previousMonth = (monthYear: number[]): number[] => [
  mod(monthYear[0] - 1, 12),
  monthYear[0] === 0 ? monthYear[1] - 1 : monthYear[1],
];

const nextMonth = (monthYear: number[]): number[] => [
  mod(monthYear[0] + 1, 12),
  monthYear[0] === 11 ? monthYear[1] + 1 : monthYear[1],
];

const isMillisInMonth = (m: EpochMillis | null, monthYear: number[]) =>
  m &&
  new Date(m).getMonth() === monthYear[0] &&
  new Date(m).getFullYear() === monthYear[1];

const formatMonthYear = (monthYear: number[]) =>
  `${MONTH_NAMES[monthYear[0]]} ${monthYear[1]}`;

export {
  mod,
  classnames,
  clip,
  formatMillisToLocaleDate,
  formatMillisToMonthYear,
  previousMonth,
  nextMonth,
  isMillisInMonth,
  formatMonthYear,
};
