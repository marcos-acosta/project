import { EpochSeconds } from "./interfaces/Task";

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
  new Date(s * 1000)
    .toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .toLocaleLowerCase();

const formatMillisToMonthYear = (s: EpochSeconds) =>
  new Date(s * 1000)
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

const isSecondsInMonth = (s: EpochSeconds | null, monthYear: number[]) =>
  s &&
  new Date(s * 1000).getMonth() === monthYear[0] &&
  new Date(s * 1000).getFullYear() === monthYear[1];

const formatMonthYear = (monthYear: number[]) =>
  `${MONTH_NAMES[monthYear[0]]} ${monthYear[1]}`;

const getNowInSeconds = (): number => Math.floor(Date.now() / 1000);

export {
  mod,
  classnames,
  clip,
  formatMillisToLocaleDate,
  formatMillisToMonthYear,
  previousMonth,
  nextMonth,
  isSecondsInMonth,
  formatMonthYear,
  getNowInSeconds,
};
