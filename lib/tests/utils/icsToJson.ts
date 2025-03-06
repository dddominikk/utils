import {icsToJson} from './utils/icsToJson';

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

export default {
  occpTest: { success: Array.isArray(occP) }
}
