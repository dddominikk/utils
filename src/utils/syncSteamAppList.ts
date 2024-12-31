import { SteamConfig } from './src/config';
import fetch from 'node-fetch';
import { hash53 } from './hash53.mjs';
import fs from 'fs'


const response: Promise<SteamAppListSchema> = await fetch(reqUrl)
    .then(res => res.json())
    .then(x => (console.log(x), x));




const { appList: { remote: steamAppsUrl, local: steamAppsCachePath } } = SteamConfig;

