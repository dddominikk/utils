export const textToCodeblock =/**
 * @template {!string|''|`${S}`?} S
 * @typedef {(S?:S!, lang?:LangTag?) => S extends string ? s extends '' ? '' : `\`\`\`${lang}\n${s}\n\`\`\`` : ''} ToCodeblock — A Markdown codeblock.
 * @type {(s:string|''?,langTag?:LangTag?) => ToCodeblock<s>}
 *//**@typedef {`${'js'|'ts'|'py'|'md'}`} LangTag — The [fence info string](https://hackmd.io/@Markdown-It/H1ieJ_yiX) used for sytax highlighting in Markdown code blocks. */
    (s, langtag = '') => (!!s && s !== '') ? (`\`\`\`${langtag}\n${s}\n\`\`\``) : '';
