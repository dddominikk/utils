export const AirtableConfigs = {
    Bases: [
        { id: 'appoVnjVJnQhsiIw8', 'purpose': "GH experiments" },
        { id: 'app55i8JFo878wOns', 'purpose': 'article table' }
    ]
};

export const SteamConfig = {
    appList: {
        remote: 'https://api.steampowered.com/ISteamApps/GetAppList/v0001/',
        local: './data/SteamAppList.json',
        latestHash: null
    }
}