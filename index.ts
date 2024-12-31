import * as io from './src/octokit/initOctokit.ts'
import fetch from 'node-fetch';
import { syncSteamAppList } from './src/utils/syncSteamAppList.ts';
import fs from 'fs';
import { SteamConfig } from './src/config.ts';
const { appList: { latestHash, local: steamAppsCachePath, remote } } = SteamConfig;




//let ae = await syncSteamAppList();

const cachedCopyExists = fs.existsSync(steamAppsCachePath)
console.log(cachedCopyExists)


export function UtilsTest(config: UtilsTestConfig) {
    const result = `Ok, Mr. ${config.ratio}!`;
    console.log(result);
    return result;
}


type UtilsTestConfig = {
    ratio: number;
};

type SteamAppListSchema = { appList: { apps: { app: { appid: number, name: string }[] } } };