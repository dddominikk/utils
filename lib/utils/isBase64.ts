export const isBase64 =/**@type {(s: string) => boolean} */ (str) => {
    if (`${str}`.trim() === '')
        return false;
    try {
        return btoa(atob(str)) === str;
    } catch (e) {
        return false;
    };
};
