const mod = (n: number, x: number) => ((n % x) + x) % x;

const classnames = (...classes: any[]) => classes.filter(Boolean).join(" ");

const clip = (n: number, lower: number, upper: number) =>
  Math.min(Math.max(n, lower), upper);

export { mod, classnames, clip };
