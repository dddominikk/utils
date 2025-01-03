
/**
 * @typedef {{id:`fld${string}`,name?:string}} fieldConfigObj
 * @typedef checkXboxWireUrlsFromTableConfig
 * @prop root {string}
 * @prop urlField {fieldConfigObj}
 * @prop logField {fieldConfigObj}
 */


/**
 * @external [GitHub repo](https://github.com/dddominikk/utils/blob/main/lib/airtable/scrapXboxGamePassWaveAnnouncement.mjs)
 * @example
 * `await scrapXboxGamePassWaveAnnouncement({url: 'https://news.xbox.com/en-us/2024/11/19/xbox-game-pass-november-2024-wave-2/'})`
 * @example
 * `await scrapXboxGamePassWaveAnnouncement({url: 'https://news.xbox.com/en-us/2024/12/03/xbox-game-pass-december-2024-wave-1/'})`
 * 
 * @arg config {scrapXgpWaveAnnouncementConfig} 
 */
export async function scrapXboxGamePassWaveAnnouncement(config) {
    const { url, fetchMethod = typeof remoteFetchAsync === 'function' ? remoteFetchAsync : fetch } = config;
    /** @ts-ignore @type {Record<'day'|'month'|'year',number> & {object:Date, url:string, format: 'old'|'new'}} */
    const articleData = Object.fromEntries(Object.entries(`${url}`.match(/https:\/\/news\.xbox\.com\/[^\/]+\/(?<year>20\d{2})\/(?<month>\d+)\/(?<day>\d+)\//)?.groups).map(([key, val]) => [key, parseInt(val)]));
    articleData.object = new Date(Date.UTC(articleData.year, articleData.month - 1, articleData.day));
    articleData.url = url;
    articleData.format = articleData.object < new Date('2024-09-12') ? 'old' : 'new'


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
        `^<p><strong><em>(?<${groups.releases.GAME}>[^<]+)\\s*<\\/em><\\/strong><strong>\\((?<${groups.releases.PLATFORMS}>.+?)\\).+?(?:&#8211;|[–])\\s*(?<${groups.releases.DATE}>${pattern.monthDay})<\\/strong><br>(?<${groups.releases.TIERS}>[^<]+)<\\/p>$`,
        'i');

    const RemovalsReplacePattern = new RegExp(
        `^.+?\\x0a(?<${groups.removals.replaceWith}>((<[^>]+>)+leaving\\s+(${pattern.monthDay}):?.+?<\\/ul>\\x0a*){1,}).+$`,
        'is'
    );

    const res = await fetchMethod(url).then(r => r.text());

    const mappedErrors = [];

    const mentionedReleases = (() => {
        const opt1 = res.match(new RegExp(ReleasesPattern, 'gim'));
        if (opt1)
            return opt1?.map(string => parseUpcomingReleasesString(string)).filter(Boolean) ?? []
        const opt2 = parseUpcomingReleasesStringBeforeXgpStandard(res);
        if (opt2) return opt2;
    })();

    const mentionedRemovals = (() => {
        const opt1 = res.replace(RemovalsReplacePattern, `$<${groups.removals.replaceWith}>`);

        if (opt1 !== res)
            return opt1.match(
                new RegExp(
                    `leaving\\x20+(?<dateLeaving>${pattern.monthDay}):?.+?<ul>\\x0a*(?<listLeaving>.+?)<\\/ul>`,
                    'igs'
                )
            )?.map(string => parseUpcomingRemovalsString(string)).filter(Boolean) ?? [];

        if (opt1 === res) {
            const opt2 = res.replace(/^.+?>(leaving\s+(?:soon|\\w+\\s+\\d+).+?)<\/div>.+$/isg, '$1');
            const opt3 = opt2.match(new RegExp(`((${pattern.monthDay})\\:?.+?<\\/ul>)`, 'isg'));

            if (opt3) {
                return opt3.map(str => {
                    const result = {};
                    const thisDate = str.match(new RegExp(`\\b(?<date>${pattern.monthDay})\\b`, 'i'))?.groups?.date;
                    if (thisDate) result.date = parseDateString({ dateString: thisDate, articleData });
                    const GamePattern = `^<li>(?:<[^>]+>)*(?<gameName>[^<]+)\\s*(?:<[^>]+>)+\\((?<platforms>[^)]+)\\)`;
                    const removals2 = str?.match(new RegExp(GamePattern, 'mig'))
                        ?.map(s => {
                            const thisRes = { date: result.date }
                            const MM = new RegExp(GamePattern, 'i').exec(s)?.groups;
                            thisRes.gameName = parseGameNameString(MM?.gameName);
                            thisRes.platforms = parsePlatformsString(MM?.platforms);
                            return thisRes;
                        })
                    return removals2;
                });
            };
        }

    })();

    const upcomingRemovalsMap = mentionedRemovals//?.map(string => parseUpcomingRemovalsString(string)).filter(Boolean) ?? [];
    const upcomingReleasesMap = mentionedReleases//?.map(string => parseUpcomingReleasesString(string)).filter(Boolean) ?? [];
    const RELEASES = upcomingReleasesMap?.flat(1);
    const REMOVALS = upcomingRemovalsMap?.flat(1);

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

    /** Used for parsing Xbox Wire XGP lineup articles before the introduction of the XGP Standard tier. */
    function parseUpcomingReleasesStringBeforeXgpStandard(string) {
        const availableTodayPattern = new RegExp(`^.+?>Available Today<(?<availableTodayBlock>.+?)>Coming Soon<.+$`, 'si')
        const availableToday = string.replace(availableTodayPattern, '$<availableTodayBlock>');
        const UpcomingPattern2 = new RegExp(`^(?:<[^>]+>)*(?<gameName>[^<]+)\\s*(?:<[^>]+>)*\\s*\\((?<platforms>[^\\)]+)\\).+?(?:&#8211;|[–])\\s*(?<date>${pattern.monthDay}).*$`, 'gim');
        const AvailableTodayPattern = new RegExp(`^(?:<[^>]+>)*(?<gameName>[^<]+)\\s*(?:<[^>]+>)*\\s*\\((?<platforms>[^\\)]+)\\).+?`, 'gim');

        const upcoming = string.replace(new RegExp(`^.+?>Coming Soon<(?<comingSoon>.+?)>Leaving Soon<.+$`, 'si'), '$<comingSoon>')
            .match(UpcomingPattern2)
            .map(str => {
                const m = new RegExp(UpcomingPattern2.source, 'i').exec(str)?.groups;
                const result = {
                    gameName: parseGameNameString(m?.gameName),
                    platforms: parsePlatformsString(m?.platforms),
                    date: parseDateString({ dateString: m?.date, articleData }),
                };
                result.tiers = [];
                if (str.match(/\bEA Play\b/i)) {
                    result.tiers.push('Game Pass Ultimate');
                    if (result.platforms.includes('PC')) result.tiers.push('PC Game Pass')
                }
                else if (result.platforms.some(P => ['Console', 'Xbox One', 'Xbox Series X|S'].includes(P)))
                    result.tiers.push('Standard');
                if (result.platforms.includes('PC')) result.tiers.push('PC');
                return result;
            });

        if (availableToday) {
            const TODAY = availableToday.match(AvailableTodayPattern)
                ?.map(str => {
                    const match = AvailableTodayPattern.exec(str)?.groups;
                    const { url, month: m, day: d, year: y, object } = articleData;
                    const result = {
                        gameName: parseGameNameString(match?.gameName),
                        platforms: parsePlatformsString(match?.platforms),
                        date: { m, d, y, object }
                    }
                    result.tiers = [];
                    if (str.match(/\bEA Play\b/i)) {
                        result.tiers.push('Game Pass Ultimate');
                        if (result.platforms.includes('PC')) result.tiers.push('PC Game Pass')
                    }
                    else if (result.platforms.some(P => ['Console', 'Xbox One', 'Xbox Series X|S'].includes(P)))
                        result.tiers.push('Standard');
                    if (result.platforms.includes('PC')) result.tiers.push('PC');
                    return result;
                })?.filter(Boolean);

            if (TODAY.length) upcoming.push(TODAY);
        };
        const RESULT = upcoming.flat(1);
        return RESULT;
    }


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
            const match = new RegExp(BulletinRemovalPattern, 'i').exec(string)?.groups;
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
 * @typedef {Record<'day'|'month'|'year',number> & {object?: Date, format?:'old'|'new'}} DateObj
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
