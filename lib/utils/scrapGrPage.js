export const parseGameRantArticle =/** * @typedef {Record<'Title'|'PostPaymentCategory'|'Description'|'Body'|'Author'|'FeaturedImage', string>} Txts
 * @typedef {Record<'PostId'|'PublishedTime'|'ModifiedTime', number>} Nums
 * @typedef {Record<'Tags'|'GlobalCategory', string[]>} Sets
 * @arg link {string} GameRant.com link.
 * @returns {Promise<Partial<Txts & Nums & Sets>>} */ async (link) => {

        /** Adds support for the Airtable Scripting Extension-specific fetch method that side-steps CORS issues.
          * The optional remoteFetchAsync dependency must be manually resolved if the module is dynamically imported into a script.
          * Alternatively, just copy-paste the function into the Scripting block editor.
          */
        const fetchMethod = typeof remoteFetchAsync === 'function' ? remoteFetchAsync : fetch;

        const text = await fetchMethod(link)
            .then(response => response.ok ? response.text() : null);
        if (!text)
            return Object.create(null);
        /** 
     * Matches Game Rant article tags and body. Base64 equivalent of the following expression:
     * ```js
     * \/VALNET_GLOBAL_(TAGS\s*=\s*"\|?(?<tags>.[^"]+)\|?"|POSTID\s*=\s*"(?<post_id>[^"\n]+)"|CATEGORY\s*=\s*"\|?(?<global_category>[^"\n]+)\|?")|POSTPAYMENTCATEGORY\s*=\s*"\|?(?<post_payment_category>[^"\n]+)\|?"|<title>(?<title>[^\n"]+)<\/title>|meta property="article:author"\s*content="(?<author>[^"\n]+)"|meta name="description"\s*content="(?<description>[^\n"]+)"|"datePublished":\s*"(?<published_time>[^\n"]+)"|"dateModified":\s*"(?<modified_time>[^\n"]+)"|"image"\s*:\s*\{.*?"url"\s*:\s*"(?<featured_image>[^\n"]+)"|class="article-body\s*".+?(?<body><p>.+MORE:.+?<\/p>)\/s;
     * ```
     **/
        const ReGR = new RegExp(
            atob(
                'VkFMTkVUX0dMT0JBTF8oVEFHU1xzKj1ccyoiXHw/KD88dGFncz4uW14iXSspXHw/InxQT1NUSURccyo9XHMqIig/PHBvc3RfaWQ+W14iXG5dKykifENBVEVHT1JZXHMqPVxzKiJcfD8oPzxnbG9iYWxfY2F0ZWdvcnk+W14iXG5dKylcfD8iKXxQT1NUUEFZTUVOVENBVEVHT1JZXHMqPVxzKiJcfD8oPzxwb3N0X3BheW1lbnRfY2F0ZWdvcnk+W14iXG5dKylcfD8ifDx0aXRsZT4oPzx0aXRsZT5bXlxuIl0rKTxcL3RpdGxlPnxtZXRhIHByb3BlcnR5PSJhcnRpY2xlOmF1dGhvciJccypjb250ZW50PSIoPzxhdXRob3I+W14iXG5dKykifG1ldGEgbmFtZT0iZGVzY3JpcHRpb24iXHMqY29udGVudD0iKD88ZGVzY3JpcHRpb24+W15cbiJdKykifCJkYXRlUHVibGlzaGVkIjpccyoiKD88cHVibGlzaGVkX3RpbWU+W15cbiJdKykifCJkYXRlTW9kaWZpZWQiOlxzKiIoPzxtb2RpZmllZF90aW1lPlteXG4iXSspInwiaW1hZ2UiXHMqOlxzKlx7Lio/InVybCJccyo6XHMqIig/PGZlYXR1cmVkX2ltYWdlPlteXG4iXSspInxjbGFzcz0iYXJ0aWNsZS1ib2R5XHMqIi4rPyg/PGJvZHk+PHA+LitNT1JFOi4rPzxcL3A+KQ=='
            ),
            'sug'
        );
        const matches = text.match(ReGR) || [];
        /** @type {Partial<Record<keyof Sets,string[]> & Record<keyof Txts,string> & Record<keyof Nums,number>>}*/
        const result = Object.fromEntries(
            Object.values(
                matches.map(
                    str => Object.entries(new RegExp(ReGR.source, 's')?.exec(str)?.groups || {}).filter(([k, v]) => v)
                ).flat(1).map(([k, v]) => [
                    k.split('_').map((w, i) => [w[0].toUpperCase(), w.slice(1)].join('')).join(''),
                    ['published_time', 'modified_time', 'post_id'].includes(k) ? (k === 'post_id' ? parseInt(v) : new Date(v).getTime() / 1e3)
                        : ['tags', 'global_category'].includes(k) ? v?.split('|').filter(Boolean)
                            : k === 'body' ? `${v}`?.replace(/<!--.+?-->\s?/sg, '')
                                ?.replace(new RegExp('(<p>)', 'g'), '\n$1')
                                ?.replace(new RegExp('&#(\\d+);', 'g'), (match, dec) => String.fromCharCode(dec))
                                ?.replace(new RegExp('&mdash;', 'g'), '—')
                                ?.trim()
                                : v
                ])
            ));
        return result;
    };
