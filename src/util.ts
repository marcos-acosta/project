const mod = (n: number, x: number) => ((n % x) + x) % x;

const classnames = (...classes: any[]) => classes.filter(Boolean).join(" ");

export { mod, classnames };
