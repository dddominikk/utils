export const vectorDistance = (x, y) =>
    Math.sqrt(x.reduce((acc, val, i) =>
        acc + Math.pow(val - y[i], 2), 0));
