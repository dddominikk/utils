/**
 * @example
 * `await scrapXboxGamePassWaveAnnouncement({url: 'https://news.xbox.com/en-us/2024/11/19/xbox-game-pass-november-2024-wave-2/'})`
 * @example
 * `await scrapXboxGamePassWaveAnnouncement({url: 'https://news.xbox.com/en-us/2024/12/03/xbox-game-pass-december-2024-wave-1/'})`
 * 
 * @arg config {scrapXgpWaveAnnouncementConfig} 
 */
export async function scrapXboxGamePassWaveAnnouncement(config) {
    const { url, fetchMethod = typeof remoteFetchAsync === 'function' ? remoteFetchAsync : fetch } = config;
    /** @ts-ignore @type */
    const articleData = Object.fromEntries(Object.entries(`${url}`.match(/https:\/\/news\.xbox\.com\/[^\/]+\/(?<year>20\d{2})\/(?<month>\d+)\/(?<day>\d+)\//)?.groups).map(([key, val]) => [key, parseInt(val)]));
    articleData.object = new Date(Date.UTC(articleData.year, articleData.month - 1, articleData.day));
    articleData.url = url;


    /** Capture group names for new releases. */
    const groups = {
        releases: {
            GAME: 'gameName',
            PLATFORMS: 'platforms',
            TIERS: 'tiers',
            DATE: 'date',
        },
        removals: {
            replaceWith: 'ALL',
            GAME: 'gameName',
            PLATFORMS: 'platforms'
        }
    };

    const pattern = {
        monthDay: `(january|february|march|april|may|june|july|august|september|october|november|december)\\x20\\d+`
    };

    const ReleasesPattern = new RegExp(
        `^<p><strong><em>(?<${groups.releases.GAME}>[^<]+)\\s*<\\/em><\\/strong><strong>\\((?<${groups.releases.PLATFORMS}>.+?)\\)\\s*&#8211;\\s*(?<${groups.releases.DATE}>${pattern.monthDay})<\\/strong><br>(?<${groups.releases.TIERS}>[^<]+)<\\/p>$`,
        'i');

    const RemovalsReplacePattern = new RegExp(
        `^.+?\\x0a(?<${groups.removals.replaceWith}>((<[^>]+>)+leaving\\s+(${pattern.monthDay}):?.+?<\\/ul>\\x0a*){1,}).+$`,
        'is'
    );

    const res = await fetchMethod(url).then(r => r.text());

    const mappedErrors = [];

    const mentionedReleases = res.match(new RegExp(ReleasesPattern, 'gim'));

    const mentionedRemovals = res.replace(RemovalsReplacePattern, `$<${groups.removals.replaceWith}>`)
        .match(
            new RegExp(
                `leaving\\x20+(?<dateLeaving>${pattern.monthDay}):?.+?<ul>\\x0a*(?<listLeaving>.+?)<\\/ul>`,
                'igs'
            )
        );

    const upcomingRemovalsMap = mentionedRemovals?.map(string => parseUpcomingRemovalsString(string)).filter(Boolean) ?? [];

    const upcomingReleasesMap = mentionedReleases?.map(string => parseUpcomingReleasesString(string)).filter(Boolean) ?? [];


    const RELEASES = upcomingReleasesMap?.length > 0 ? upcomingReleasesMap : null;
    const REMOVALS = upcomingRemovalsMap?.length > 0 ? upcomingRemovalsMap : null;



    function parseGameNameString(str) { return `${str}`.trim(); };
    function parsePlatformsString(str) { return `${str}`.trim().split(/,\s+and\s+|,\s*/); };
    function parseTiersString(str) { return `${str}`?.trim().split(/Now\s+with\s+|,\s*/).filter(Boolean); };
    function parseDateString({ dateString, articleData }) {
        const D = parseMonthDayToNumberObj(dateString);
        if (D.m === articleData.month) D.y = articleData.year;
        else if (D.m === 1) D.y = articleData.year + 1;
        D.object = new Date(Date.UTC(D.y, D.m - 1, D.d))
        return D;
    };


    function parseUpcomingReleasesString(string) {

        const match = ReleasesPattern.exec(string)?.groups;
        const result = {
            [groups.releases.GAME]: '',
            [groups.releases.PLATFORMS]: [],
            [groups.releases.DATE]: '',
            [groups.releases.TIERS]: []
        };

        if (!match) { mappedErrors.push(string); return null; };

        const Result = Object.assign(
            result, {
            [groups.releases.GAME]: parseGameNameString(match[groups.releases.GAME]),
            [groups.releases.PLATFORMS]: parsePlatformsString(match[groups.releases.PLATFORMS]),
            [groups.releases.TIERS]: parseTiersString(match[groups.releases.TIERS]),
            [groups.releases.DATE]: parseDateString({ dateString: match[groups.releases.DATE], articleData })
        });

        return Result;

    }

    function parseUpcomingRemovalsString(str) {
        const dateStr = str.match(new RegExp(`\\bleaving\\b\\x20+(?<leavingDate>${pattern.monthDay})\\:?`, 'i'))?.groups?.leavingDate;
        const d = parseDateString({ dateString: dateStr, articleData });

        const BulletinRemovalPattern = `<li>(?:<[^>]+>)*(?<${groups.removals.GAME}>.+?)(<\\/[^>]+>)*\\((?<${groups.removals.PLATFORMS}>[^)]+)\\)\s*<\\/li>`;
        const allBulletins = str.match(new RegExp(BulletinRemovalPattern, 'gim'));
        const mapBulletins = allBulletins.map(string => {
            const match = new RegExp(BulletinRemovalPattern, 'i').exec(str)?.groups;
            const result = {
                [groups.removals.GAME]: parseGameNameString(match[groups.removals.GAME]),
                [groups.removals.PLATFORMS]: parsePlatformsString(match[groups.removals.PLATFORMS]),
                date: d
            };
            return result;
        });

        return mapBulletins;
    };

    function parseMonthDayToNumberObj(monthDateString) {
        const [monthName, day] = monthDateString.toLowerCase().split(' ');
        return {
            m: ["january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december"]
                .indexOf(monthName) + 1,
            d: parseInt(day)
        };
    };


    /** @ts-ignore @type {{articleData: DateObj, url:string, releases: XgpReleaseObj[]|null, removals: XgpRemovalObj[]|null }} */
    const RES = { articleData, releases: RELEASES, removals: REMOVALS };

    return RES;
};

/** 
 * @typedef scrapXgpWaveAnnouncementConfig
 * @prop url {string}
 * @prop [fetchMethod] {(...args) => Promise<Response>}
 */

/** 
 * @typedef {Record<'day'|'month'|'year',number> & {object?: Date}} DateObj
 */

/**
 * @typedef XgpReleaseObj
 * @prop gameName {string}
 * @prop platforms {string[]}
 * @prop tiers {string[]}
 * @prop date {DateObj}
 * 
 * @typedef {Omit<XgpReleaseObj,'tiers'>} XgpRemovalObj
 */
