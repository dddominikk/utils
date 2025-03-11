export const textToCodeblock =/**
 * @template {string|''?} S
 * @typedef { S extends string ? S extends '' ? '' : `\`\`\`\n${S}\n\`\`\`` : ''} ToCodeblock — A Markdown codeblock.
 * @type {(s?:string|''?)=> ToCodeblock<s>}
 **/ (s) => `\`\`\`\n${s}\n\`\`\``;
