import { EpochMillis } from "./interfaces/Task";

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

export { mod, classnames, clip, formatMillisToLocaleDate };
