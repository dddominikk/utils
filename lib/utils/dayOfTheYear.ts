function dayOfTheYear(date:typeof Date|string):number {
    const thisDate = date instanceof Date ? date : ['string','number'].includes(typeof date) ? (new Date(date) || Date.parse(date)) : NaN;
    if(Number.isNaN(thisDate)) return thisDate;
    return Math.floor((thisDate - new Date(thisDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
};
