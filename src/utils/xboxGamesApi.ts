
const GamePassCatalog = {

    hostname: 'https://catalog.gamepass.com/sigls/v2',

    ids: {
        consoleGames: 'f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e',
        pcGames: 'fdd9e2a7-0fee-49f6-ad69-4354098401ff',
        eaPlay: 'fdd9e2a7-0fee-49f6-ad69-4354098401ff',
        noController: '7d8e8d56-c02f-4711-afec-73a80d8e9261',
        allGames: '29a81209-df6f-41fd-a528-2ae6b91f719c'
    },

    params: [
        { name: 'id', required: true, get default() { return GamePassCatalog.ids.allGames } },
        { name: 'language', required: false, default: 'en-us' },
        { name: 'market', required: true, default: 'us' }
    ],

};

/** @example `jsonData = await remoteFetchAsync(makeGpCatalogUrl({ id: GamePassCatalog.ids.allGames })).then(r => r.json().then(console.log));`*/
const makeGpCatalogUrl = (params: { id: string, market?: string, language: string }) => {
    const GP = GamePassCatalog;

    const args = new URLSearchParams({ ...params });

    for (const p of GP.params) {
        let value = params[p.name];
        if (!value && p.required) value = p.default;
        if (value) args.append(p.name, value);
    };

    return [GP.hostname, args].join('?')

};

const getXboxStorePageUrlFromGameId = (id: string) => `https://www.xbox.com/en-us/games/store/\$/${id}`;

const MsDisplayCatalog = {
    hostname: 'https://displaycatalog.mp.microsoft.com/v7.0/products',
    params: [
        { name: 'bigIds', required: true },
        { name: 'MS-CV', required: false, default: 'DGU1mcuYo0WMMp+ F.1' },
        { name: 'market', required: true, default: 'us' },
        { name: 'languages', required: true, default: 'en-us' }
    ]
}

export default { GamePassCatalog, makeGpCatalogUrl, getXboxStorePageUrlFromGameId };