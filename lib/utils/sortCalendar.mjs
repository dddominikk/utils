/** 
 * Sorts calendar events by start or end date.
 * @param {Object} options 
 * @param {PvCal[2]} options.events - Array of events to sort.
 * @param {'start'|'end'} options.sort - Whether to sort by start or end date.
 * @param {'asc'|'desc'|'ascend'|'descend'} options.order - Sorting order.
 * @returns {PvCal[2]} - Sorted events array.
 */
export const sortCalendar = ({ events, sort = 'start', order }) => {
    return events.sort((a, b) => {
        const [dateA, dateB] = [a, b].map(d => new Date(d[sort]));
        return order.startsWith('asc')
            ? dateA - dateB
            : dateB - dateA;
    });
};
