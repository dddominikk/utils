export const levenshteinDistance = (a: string, b: string) => {
    if (a === b)
        return 0;
    const min: (...ns: number[]) => number = (d0, d1, d2, bx, ay) =>
        d0 < d1 || d2 < d1
            ? d0 > d2
                ? d2 + 1
                : d0 + 1
            : bx === ay
                ? d1
                : d1 + 1;

    if (a.length > b.length)
        // swaps a/b values
        b = [a, a = b][0];
    let la = a.length;
    let lb = b.length;
    while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
        la--;
        lb--;
    }

    let offset = 0;
    while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
        offset++;
    }

    la -= offset;
    lb -= offset;

    if (la === 0 || lb < 3) return lb;

    let x = 0, y, d0, d1, d2, d3, ld, dy, ay, bx0, bx1, bx2, bx3
    let vector: number[] = [];

    for (y = 0; y < la; y++) {
        vector.push(y + 1);
        vector.push(a.charCodeAt(offset + y));
    }

    const len = vector.length - 1;

    for (; x < lb - 3;) {
        bx0 = b.charCodeAt(offset + (d0 = x));
        bx1 = b.charCodeAt(offset + (d1 = x + 1));
        bx2 = b.charCodeAt(offset + (d2 = x + 2));
        bx3 = b.charCodeAt(offset + (d3 = x + 3));
        ld = (x += 4);
        for (y = 0; y < len; y += 2) {
            dy = vector[y];
            ay = vector[y + 1];
            d0 = min(dy, d0, d1, bx0, ay);
            d1 = min(d0, d1, d2, bx1, ay);
            d2 = min(d1, d2, d3, bx2, ay);
            ld = min(d2, d3, ld, bx3, ay);
            vector[y] = ld;
            d3 = d2;
            d2 = d1;
            d1 = d0;
            d0 = dy;
        }
    }

    for (; x < lb;) {
        bx0 = b.charCodeAt(offset + (d0 = x));
        ld = ++x;
        for (y = 0; y < len; y += 2) {
            dy = vector[y];
            vector[y] = ld = min(dy, d0, ld, bx0, vector[y + 1]);
            d0 = dy;
        }
    }

    return ld;
};
