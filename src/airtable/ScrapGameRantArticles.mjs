/// <reference lib="WebWorker"/>
/// <reference lib="esnext"/>
const { default: Cheerio } = await import('https://cdn.jsdelivr.net/npm/cheerio/+esm')
const { default: html2md } = await import('https://cdn.jsdelivr.net/npm/html-to-md/+esm');

/**
 * @arg link {string} GameRant.com link.
 * @arg [fetchFn] {fetch|remoteFetchAsync} Specify which fetch function to use.
 * @returns {Promise<ScrapedGameRantArticle>}
 */
export async function scrapGameRantArticle(link, fetchFn) {

    /** remoteFetchAsync side-steps some CORS issue, making the function work in both the Airtable Scripting Extension and server-side automations. */
    const fetchMethod = typeof fetchFn === 'function' ? fetchFn : typeof remoteFetchAsync === 'function' ? remoteFetchAsync : fetch;
    const text = await fetchMethod(link).then(response => response.ok ? response.text() : null);
    if (!text) return Object.create(null);
    const vvNames = /var\s+VALNET_GLOBAL_(?<varName>\w+)\s*=/;
    const vvKeyValuePairs = `VALNET_GLOBAL_(${
        // Extract all VALNET_GLOBAL var names;
        `${text}`?.match(new RegExp(vvNames, 'sug'))?.map(match => vvNames.exec(match)?.groups?.varName)
            // turn allVars into a regular expression source.
            ?.map(varName => `(?:${varName}\\s*=\\s*"(?<${varName?.toLowerCase()}>[^"]*))`).join('|')})`;

    const Result = {
        article: {
            title: '', description: '', url: '',
            body: { plaintext: '', markdown: '', html: '' },
            featuredImage: {},
            /** @type {any[]} */
            otherElements: [],
            /** @type {any[]} */
            paragraphs: []
        },
        meta: {}
    };

    const allValnetGlobalVars = (`${text}`.match(new RegExp(vvKeyValuePairs, 'gu')) || [])
        ?.map(string => {
            const groups = Object.entries((new RegExp(vvKeyValuePairs, 's').exec(string)?.groups || {}))
            const kvPair = []
            if (!groups.length) return [];
            for (let i = 0; i < groups.length; i++) {
                const [K, V] = groups[i];
                if (V === undefined || ['undefined', 'datepublished', 'daterepublished'].includes(`${K}`.toLowerCase())) continue;
                else {
                    kvPair.push(`${K}`.toLowerCase());
                    if (V.match(/\|/)) { kvPair.push(V.split('|').filter(Boolean)); break; }
                    if (`${V}`.match(/(^(true|false)$)/)) { kvPair.push(Boolean(V)); break; }
                    else if (`${K}`.match(/^postid$/)) { kvPair.push(parseInt(V)); break; }
                    else { kvPair.push(!Array.isArray(V) ? V : V.length >= 2 ? V : V?.[0] ?? V); break; }
                }
            };
            const [K, V] = kvPair;

            switch (true) {
                case [undefined, 'undefined', 'author'].includes(K):
                case kvPair.length === 0:
                    return [];

                case ['tags', 'category'].includes(K):
                    Result.meta[K === 'category' ? 'categories' : K] = V === '' ? [] : Array.isArray(V) ? V : [V].filter(Boolean)
                    break;

                case ['postid', 'networkcategory', 'ideator',
                    'channel', 'ispremium', 'sreditor', 'jreditor', 'editor', 'postpaymentcategory', 'networkcategory', 'intent', 'contenttype', 'type']
                    .includes(K):
                    Result.meta[K] = V;
                    break;
            }
            return kvPair;
        }
        ).filter(Boolean)

    /** @type {Function&Record<'length'|'name'|'prototype'|'html'|'xml'|'text'|'parseHTML'|'root'|'contains'|'merge'|'load'|'_root'|'_options'|'fn',unknown>} */
    const C = Cheerio.load(text);
    const selection = C('meta[property^="og:"],meta[property^="article"],article');

    for (const i of selection) {
        if (i.name !== 'meta') continue;
        const { property: oldKey, content } = i.attribs;
        const key = oldKey.replace(/^og:(?:(image)(?:\:(\w+)))?|^article:/, '$1$2');
        if (['site_name', 'locale', 'publisher'].includes(key)) continue
        if (key.startsWith('image')) {
            if (key === 'image') Result.article.featuredImage.url = content;
            else Result.article.featuredImage[key.replace('image', '')] = parseInt(content);
        }
        else if (['description', 'title', 'url'].includes(key)) Result.article[key] = content;
        else if (['published_time', 'modified_time'].includes(key)) Result.meta[key] = new Date(content).getTime() / 1e3;
        else Result.meta[key] = content;
    };

    const fullArticle = []
    const allParagraphs = selection.find('div:not(.bio-desc)>p:not(.bio-desc):not(:has(.display-card-description)):not(.display-card-description):not(.f-errors):not([class="content-note bottom-note"])');
    allParagraphs.each((i, e) => (e.plaintext = C(e).text(), (allParagraphs.length - 1 !== i || !text.match(/source/i)) && Result.article.paragraphs.push(`${e.plaintext}`)));
    const pageSlice = allParagraphs.first().parent().children().slice(allParagraphs.first().index(), allParagraphs.last().index() + 1);


    const scriptTagLinkPattern = /(?:(?:href|srcset|sizes|\w+)=(\x5c&quot;))(?<link>https:[\x5c\x2f]+.+?)(?:\?.+?)?\1/;
    const httpsPattern = /["'](?<link>https:\/\/[^"']+)["']/;
    const HandleMiscElements =/**@type {(c:{log:object,scrapWithHtml?:unknown})=>void}*/({ log, scrapWithHtml }) => void (
        Result.article.otherElements.push({ ...log, position: fullArticle.length }),
        scrapWithHtml && fullArticle.push(scrapWithHtml)
    );

    pageSlice.each((i, e) => {
        const elClass = `${e.attribs.class}`;
        if (elClass.match(/^((ad(?:sninja|-odd))|display-card.tag.(large|small).no-badge|ad-even)/)) return;

        if (elClass.match(/gallery/i)) {
            const sNode = e.children.find(c => c?.name === 'script');
            const data = sNode?.data ?? sNode?.children?.[0]?.data;
            const allHrefs = Array.from(new Set(data?.match(new RegExp(scriptTagLinkPattern, 'g'))?.map(s => scriptTagLinkPattern.exec(s)?.groups?.link.replace(/\x5c(\x2f)/g, '$1')).sort((a, b) => a.length + b.length) || []));
            if (allHrefs.length)
                HandleMiscElements({ log: { links: allHrefs }, scrapWithHtml: `<!-- ${allHrefs.length}-image Gallery -->` });
            return
        }

        if (elClass.match(/table-container/i))
            return fullArticle.push({ htmlOnly: C(e).html() });


        if (e.name === 'p' && e?.children?.[0]?.attribs?.class?.match(/affiliate/i)) {
            const c0 = e.children[0];
            const affiliateLink = c0?.attribs?.href ?? c0?.children?.[0]?.attribs?.href ?? c0?.children?.[0]?.children?.[0]?.attribs?.href;
            if (affiliateLink) {
                const clean = affiliateLink.replace(/^(https[^?]+).+$/, '$1');
                HandleMiscElements({ log: { links: [clean] }, scrapWithHtml: clean });
            }
            return;
        };

        if (elClass.match(/^(display-card article|dc-img-link)/)) {
            const relatedLink = C(e).find('h5 > a <')?.children()?.[0]
            if (relatedLink) {
                Result.article.otherElements.push({ title: relatedLink?.children?.[0]?.data, href: relatedLink?.attribs.href, position: fullArticle.length });
                return fullArticle.push(relatedLink.attribs.href.replace(/^https:\x5c{2}(www\.)?|\//, 'https://gamerant.com'));
            }
            return
        }

        if (elClass.match(/^(?:\w+\-img)\s*/)) {
            const hrefPattern = /(?:href=)?(\x5c&quot;|"|')(?<link>(?:https:\x2f{2}|\x2f).+?)\1/;
            const data = `${(e.children?.[0]?.data || JSON.stringify(e.children?.[0]?.attribs || {}))}`
                .match(new RegExp(httpsPattern, 'g'))?.map(s => httpsPattern.exec(s)?.groups?.link.replace(/\x5c(\x2f)/g, '$1'))
                .sort((a, b) => a.length + b.length) || [];
            const uniqueHrefs = Array.from(new Set([...data]));

            if (uniqueHrefs.length)
                HandleMiscElements({ log: { links: uniqueHrefs }, scrapWithHtml: uniqueHrefs[0] });

            return
        }

        else if (e.type === 'script') {
            const allHrefs = e.children?.[0].data.match(new RegExp(scriptTagLinkPattern, 'g'))?.map(s => scriptTagLinkPattern.exec(s)?.groups?.link.replace(/\x5c(\x2f)/g, '$1')).sort((a, b) => a.length + b.length);
            if (allHrefs.length)
                HandleMiscElements({ log: { links: allHrefs }, scrapWithHtml: allHrefs?.[0] })
            return;
        }

        const htmlVersion = C(e).html().trim();
        if (!htmlVersion) return;

        else fullArticle.push(`<${e.name}>${htmlVersion}</${e.name}>`)
    });

    Result.article.body.plaintext = Result.article.paragraphs.join('\n\n');
    Result.article.body.html = fullArticle.map(s => typeof s === 'string' ? s : s.htmlOnly).join('\n\n');
    Result.article.body.markdown = html2md(fullArticle.filter(s => typeof s === 'string').join('\n\n').replace(/(\x20)((?:<\/\w+>)+)(\S)/g, '$2$1$3'));
    Result.globalVars = Object.fromEntries(allValnetGlobalVars);

    return Result;
};



/**
 * @typedef ValnetGlobalVars
 * @type {Record<'fbappid'|'googleanalyticspropertyid'|'undefined'|'channel'|'view'|'exactview'|'ispremium'|'environment'|'posttype'|'jreditor'|'sreditor'|'numberperpage'|'isengagementtest'|'detecteddevice'|'ipaddress'|'browseruseragent'|'length'|'editor'|'postpaymentcategory'|'isfacebookbrowser'|'ads'|'amptraffic'|'template'|'tldrpermalink'|'tldrpage'|'tldrtotalnumpage'|'tldrviewtype'|'networkcategory'|'contenttype'|'intent'|'classification'|'subscriptionplan'|'segment'|'videoplacement'|'lang'|'ideator'|'socialtagline',string>&{postid:number}&Record<'category'|'tags',string[]>}
 *
 * @typedef {{url?:string,width?:number, height?:number}} ParsedFeaturedImage
 * @typedef {{title:string,url:string,description:string,body:{html:string,markdown:string,plaintext:string},paragraphs?:string[],featuredImage:ParsedFeaturedImage,otherElements?:unknown[]}} ParsedArticleObject
 * @typedef {{article: ParsedArticleObject, meta: any, globalVars?: ValnetGlobalVars}} ScrapedGameRantArticle
 */
/** 
 * @typedef {'link'|'plaintextBody'|'description'} RequiredPurpFlds
 * @typedef {'htmlBody'|'markdownBody'|'tags'|'categories'|'metadata'} OptionalPurpFlds
 */
/**
 * @template {typeof base['tables'][number]} T
 * @arg {{table: T, fields: Record<RequiredPurpFlds,T['fields'][number]['id'|'name']> & Partial<Record<OptionalPurpFlds,T['fields'][number]['id'|'name']>>, view: T['views'][number]['id'|'name'], recordIds?: `rec${string}`[],loggerFunction?: Function,fetchMethod?:Function}} config
 */
export async function ScrapGameRantArticlesToAirtable(config) {
    const { table, fields, view, recordIds, fetchMethod = fetch } = config;
    const Log = typeof config.loggerFunction !== 'function' ? console.log : config.loggerFunction;
    const fieldRefs = {};
    const errors = [];
    const Fields = Object.entries(fields).map(([k, v]) => fieldRefs[k] = table.getField(v).name)
    const LoadFields = (/**@type AirtableRecord*/R, /**@type Field['name'|'id'][]*/fields) => Object.assign(R, { fields: Object.fromEntries(fields.map(f => [f, R?.getCellValue(f)])) });
    const loadedRecs = await table.getView(view).selectRecordsAsync({ recordIds, fields: Fields }).then(_ => _.records.map(r => LoadFields(r, Fields)));
    const FieldsToUpdate = [];
    const RecordsToFetch = [];
    const _ = (prop) => fieldRefs[prop];
    const prepFieldOptionsUpdate = (optionsToCreate, targetFieldName) => {
        const F = fieldRefs[targetFieldName];
        const overlappingRequest = FieldsToUpdate.find(o => o.fieldToUpdate === F);
        if (overlappingRequest) overlappingRequest.optionsToCreate.push(...optionsToCreate);
        else FieldsToUpdate.push(({ fieldToUpdate: F, optionsToCreate }));
    }

    while (loadedRecs.length > 0) RecordsToFetch.push(loadedRecs.splice(-50));
    /**
     * @arg response {ScrapedGameRantArticle}
     * @arg r {AirtableRecord & {fields:{}}}
     * @returns (r & {response:data})
     */
    const addScrapedDataToRecordModel = (response, r) => {

        const { article } = response;

        for (const key in fieldRefs) {
            const Ref = fieldRefs[key];

            switch (key) {

                case 'link': break;

                case 'plaintextBody':
                    r.fields[Ref] = article.body.plaintext;
                    break;

                case 'htmlBody':
                    if (fieldRefs.htmlBody) {
                        if (response.article.body.html.length > 100000) {
                            errors.push({ message: `Parsed HTML is ${response.article.body.html.length} characters long! Cutting it off!`, response });
                            Log(errors[errors.length - 1].message);
                            r.fields[Ref] = response.article.body.html.slice(0, 1e5);
                        }
                        else r.fields[Ref] = response.article.body.html;
                    };
                    break;

                case 'markdownBody':
                    r.fields[Ref] = article.body.markdown;
                    break;

                case 'description':
                    r.fields[Ref] = article.description;
                    break;

                case 'metadata':
                    const metaString = JSON.stringify({ title: response.article.title, meta: response.meta, globalVars: response.globalVars, scraperTimestamps: Date.now() }, null, '\t');
                    r.fields[Ref] = table.getField(Ref).type === 'richText' ? ['```', metaString, '```'].join('\n') : metaString;
                    break;

                case 'tags':
                case 'categories':
                    r.fields[Ref] = response.meta[key];
                    const currentElements = table.getField(Ref)?.options?.choices || []
                    response.meta[key] = response.meta[key].map(tagName => `${tagName}`.trim())
                    const itemsToCreate = response.meta?.[key]?.filter((tagName => !currentElements.find(t => t.name === `${tagName}`.trim())));
                    if (itemsToCreate.length) prepFieldOptionsUpdate(itemsToCreate, Ref)
                    break;

                default:
                    Log(`No implementation for field ${key} field "${Ref}" exists.`);
            }
        }

        return Object.assign(r, { response })
    };

    while (RecordsToFetch.length) {
        const next = RecordsToFetch.pop();
        const promises = next?.flatMap(
            r => !r.fields[fieldRefs.link] ? (errors.push(Error(`${r.id} has no link.`)) && [])
                : Object.assign(r, {
                    request: async () => {
                        let tempRes;
                        return await scrapGameRantArticle(r.fields[fieldRefs.link], remoteFetchAsync)
                            .then(res => (tempRes = res, addScrapedDataToRecordModel(res, r)))
                            .catch((e) => errors.push({
                                name: e.name, type: e.type, message: e.message, stack: e.stack,
                                record: { name: r.name, id: r.id },
                                response: tempRes,
                                requestedUrl: r.fields[fieldRefs.link]
                            }))
                    }
                })
        ) || [];

        if (!promises.length) throw `${errors[errors.length - 1] || 'Nothing to request!'}`;

        const scrapedGameRantPages = await Promise.all(promises.map(r => r.request()))

        while (FieldsToUpdate.length) {
            const { fieldToUpdate: fname, optionsToCreate: options } = FieldsToUpdate.pop();
            const F = table.getField(fname);
            const newOptionsModel = [F?.options?.choices, Array.from([...new Set(options.flat(1))]).map(name => ({ name: `${name}`.trim() }))].flat(1).filter(Boolean);
            await F.updateOptionsAsync({ choices: newOptionsModel });
            Log(`Updated ${fname} field with ${options.length} new options.`);
        };

        const updateBatch = scrapedGameRantPages
            .flatMap(r =>
                (!r?.id || !r?.fields) ? [] : ({
                    id: r.id,
                    fields: {
                        ...r.fields,
                        tags: r.fields?.[_`tags`].map(t => table.getField(_`tags`)?.options?.choices.find(o => o.name === t)).filter(Boolean),
                        categories: r.fields?.[_`categories`].map(t => table.getField(_`categories`)?.options?.choices.find(o => o.name === t)).filter(Boolean),
                    }
                })
            );

        await table.updateRecordsAsync(updateBatch);

        Log(`Scraped ${updateBatch.length} records.`);
        Log(updateBatch);

    }

    return { errors };
};
