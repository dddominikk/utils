import * as io from './src/octokit/initOctokit.ts'
import fetch from 'node-fetch';
import { syncSteamAppList } from './src/utils/syncSteamAppList.ts';

console.log(syncSteamAppList)


export function UtilsTest(config: UtilsTestConfig) {
    const result = `Ok, Mr. ${config.ratio}!`;
    console.log(result);
    return result;
}


type UtilsTestConfig = {
    ratio: number;
};

type SteamAppListSchema = { appList: { apps: { app: { appid: number, name: string }[] } } };