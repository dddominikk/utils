

/**@type {(url:string, fn: Function)=>Promise<Reddit_Api_Embed_Response>} */
export const requestRedditEmbed = (fromUrl, remoteFetchAsync) => {
    const endpoint = `https://www.reddit.com/oembed?url=${fromUrl}`;
    const request = typeof remoteFetchAsync === 'function' ? remoteFetchAsync : fetch;
    return request(endpoint).then(data => data.json());
};

/**
 * @typedef Reddit_Api_Embed_Response
 * @prop author_name {string}
 * @prop html {string}
 * @prop provider_name {'reddit'|string}
 * @prop provider_url {'https://www.reddit.com'|string}
 * @prop title {string}
 * @prop type {'rich'|string}
 * @prop height {number}
 */
