/**
 * @example `await importFirstMjsFileFromPublicGist({ url: 'https://gist.github.com/dddominikk/b5fccf3ac10007d1c6b3ec4e695f56da', fetchMethod: remoteFetchAsync })`
 */
export async function importFirstMjsFileFromPublicGist({ url, fetchMethod }) {
    return await fetchMethod(url)
        .then(re => re.text()
            .then(
                str => str.match(new RegExp(String.raw`(?:href\=")(?<link>[^"]+?\/raw\/[^"]+)(?:")`))?.groups?.link
            )
            .then(l =>
                l && fetchMethod(`https://gist.githubusercontent.com${l}`)
                    .then(r => r.text())
                    .then(content => import(`data:application/javascript;base64,${btoa(unescape(encodeURIComponent(content)))}`))
            )
        )
};
