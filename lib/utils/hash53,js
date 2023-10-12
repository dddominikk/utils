/**
 * Creates a 53-bit hash from a string. Based on [cyrb53](https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js) by bryc, itself inspired by [MurmurHash](https://github.com/garycourt/murmurhash-js).
 * @example https://stackoverflow.com/a/52171480
 * @arg text {string}
 * @arg [seed=0] {number}
 * @returns {number} A 16-digit hash.
 */

export function hash53(text, seed = 0) {

    let n1 = 0xdeadbeef ^ seed;
    let n2 = 0x41c6ce57 ^ seed;

    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        n1 = Math.imul(n1 ^ char, 2654435761);
        n2 = Math.imul(n2 ^ char, 1597334677);
    }

    /** @type {(x:number,y:number) => number} */
    const hash = (x, y) => Math.imul(x ^ (x >>> 16), 2246822507) ^ Math.imul(y ^ (y >>> 13), 3266489909);

    n1 = hash(n1, n2);
    n2 = hash(n2, n1);

    return 4294967296 * (2097151 & n2) + (n1 >>> 0);

};
