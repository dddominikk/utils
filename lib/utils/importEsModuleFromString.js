export function importEsModuleFromString(/**@type string*/sourceCode) {
    return import(`data:application/javascript;base64,${btoa(unescape(encodeURIComponent(sourceCode)))}`);
};
