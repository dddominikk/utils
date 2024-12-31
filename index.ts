import * as io from './lib/octokit/initOctokit.ts'
import fetch from 'node-fetch';
import { hash53 } from './lib/utils/hash53.mjs';

const reqUrl = 'https://api.steampowered.com/ISteamApps/GetAppList/v0001/';

const response = await fetch(reqUrl)
    .then(res => res.json())
    .then(x => (console.log(x), x));

    




//console.log(io);

export function UtilsTest(config: UtilsTestConfig) {
    const result = `Ok, Mr. ${config.ratio}!`;
    console.log(result);
    return result;
}


type UtilsTestConfig = {
    ratio: number;
};