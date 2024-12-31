export const randomId = (n: number) => Math.random().toString(36).substr(2, Math.abs(n) || 5);
