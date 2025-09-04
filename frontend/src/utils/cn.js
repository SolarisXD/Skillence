// Simple utility for concatenating class names
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
