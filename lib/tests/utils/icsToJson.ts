import {icsToJson} from './utils/icsToJson';
import {sortCalendar} from '../../lib/utils/sortCalendar.mjs'

/** Parse a huge ICS file that is OpenCritic's Calendar. */
const occP = await fetchFile(
    'https://img.opencritic.com/calendar/OpenCritic.ics',
    {
        init: { headers: { "Accept": "text/calendar", "Content-Type": "text/calendar" } },
        callback: (res, ct = res.headers.get('content-type')) =>
            ct === 'text/calendar'
                ? res.text().then(text => icsToJson(text, ICAL))
                : (() => { throw TypeError(`Expected text/calendar, not ${ct}`) })(),
    });


/** 
* @example
import 
console.log(sortCalendar({ events: ff, sort: 'end', order: 'asc' }))
console.log(sortCalendar({ events: ff, sort: 'start', order: 'asc' }))
console.log(sortCalendar({ events: ff, sort: 'start', order: 'desc' }))
console.log(sortCalendar({ events: ff, sort: 'end', order: 'desc' }))
*/


export default {
  occpTest: { success: Array.isArray(occP) }
}
