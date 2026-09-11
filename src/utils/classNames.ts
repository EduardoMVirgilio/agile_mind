export const cx = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');
