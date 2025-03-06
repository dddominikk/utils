export const dedupe = (arr: unknown[]) => 
     [
        ...new Set(
            arr.map(obj => {
                if (['object', 'function'].includes(typeof obj) && obj !== null) {
                    const sortedEntries = Object.entries(obj).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
                    return JSON.stringify(Object.fromEntries(sortedEntries));
                }
                else return JSON.stringify(obj);
            }))
    ].map(str => JSON.parse(str));
