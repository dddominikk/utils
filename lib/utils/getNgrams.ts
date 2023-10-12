export function getNgrams(tokens: string[], config: Ngrams_Config): (string | Ngram)[] | FlatArray<Ngram | Ngram[], 0 | -1>[] | (string | Ngram)[][] {

    const
        keywords = tokens?.map(str => config?.ignoreCase ? str.toLowerCase() : str),
        MIN = config?.minCount ?? 1,
        //maxSize = (config?.maxSize ?? 5),
        MAX = ((config?.maxSize ?? 5) < keywords.length ? config?.maxSize ?? 5 : keywords.length) + 1,
        flattenResult = !!config?.flattenResult ? 1 : 0,
        sortBy = config?.sortBy ?? 'count',
        keys = [null],

        results: Ngram[][] = [],//@ts-ignore
        Sort = (arr: ArrayLike<Ngram | Ngram[] | 0 | -1>) => arr.sort((a: Ngram, b: Ngram) =>
            ((config?.sortOrder ?? 'descending') === 'descending')
                ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);

    // @ts-ignore; prepare the keys object
    for (let i = 1; i <= MAX; i++) keys.push({});

    // Create a hash for counting:
    const txtLen = keywords.length;

    for (let i = 0; i < txtLen; i++) {
        let s = keywords[i];
        // @ts-ignore
        keys[1][s] = (keys[1][s] || 0) + 1;

        for (let j = 2; j <= MAX; j++) {
            if (i + j <= txtLen) {
                s += ' ' + keywords[i + j - 1];// @ts-ignore
                keys[j][s] = (keys[j][s] || 0) + 1;
            } else break;
        }
    }

    // using a hash table for sorting guarantees optimal/linear time-complexity
    for (let k = 1; k < MAX; k++) {
        results[k] = [];

        const
            key = keys[k],//@ts-ignore
            words = Object.keys(keys[k]);

        for (let i = 0; i < words.length; i++) {

            const word = words[i];
            // @ts-ignore
            if (key[word] >= MIN) {

                const obj = {
                    nGram: word,
                    count: key?.[word],
                    size: k
                };
                //obj.weight = rateKWQuality({ ...obj, sampleSize: keywords.length });
                //@ts-ignore
                results[k]?.push(obj)
            }
        }
    };

    const ngrams = results.filter(Boolean).flat(flattenResult); //@ts-ignore
    const result = !sortBy ? ngrams : flattenResult ? Sort(ngrams) : ngrams.map((arr) => Sort(arr));
    return result;

};

type Ngram = {
    nGram: string;
    /** Keyword occurences. */
    count: number;
    size: number;
}

type Ngrams_Config = {
    ignoreCase?: boolean;
    minCount?: number;
    maxSize?: number;
    stopWords?: string[];
    flattenResult?: boolean;
    sortBy?: 'size' | 'count';
    sortOrder?: 'ascending' | 'descending'
};
