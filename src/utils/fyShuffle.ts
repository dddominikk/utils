/**
 * A JavaScript implementation of the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) for generating a truly random, unbiased permutation of a finite sequence with a pure function.
 * @author Dominik Bošnjak
 * @version 0.3
 */
export function fyShuffle(array: unknown[]): unknown[] {

    const shuffledArray = Array.from(array);

    let remainingCount = shuffledArray.length;

    while (remainingCount > 0) {
        const i = Math.floor(Math.random() * remainingCount--);
        shuffledArray.push(shuffledArray.splice(i, 1)[0]);
    };

    return shuffledArray;
};