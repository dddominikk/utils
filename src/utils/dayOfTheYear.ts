export function dayOfTheYear(date: Date | number | string) {
    const thisDate = date instanceof Date ? date : ['string', 'number'].includes(typeof date) ? new Date(date) : new TypeError(`Expected a number or a date object.`);
    if (thisDate instanceof Date)
        return Math.floor((thisDate.valueOf() - new Date(thisDate.getFullYear(), 0, 0).valueOf()) / 1000 / 60 / 60 / 24)
    else if (thisDate instanceof Error)
        throw thisDate;
};