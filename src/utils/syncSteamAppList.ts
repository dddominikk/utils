import { SteamConfig } from '../config.js';
import fetch from 'node-fetch';
import { hash53 } from './hash53.mjs';
import fs from 'fs'
import { promisify } from 'util';

// Convert fs callbacks to promises
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

const { appList: { remote: steamAppsUrl, local: steamAppsCachePath, latestHash } } = SteamConfig;

//const cachedCopyExists = fs.existsSync(steamAppsCachePath)

export async function syncSteamAppList() {


    try {
        const { appList: { remote: steamAppsUrl, local: steamAppsCachePath, latestHash } } = SteamConfig;

        // Fetch the app list from Steam
        const response = await fetch(steamAppsUrl);
        const appList = await response.json();
        const stringified = JSON.stringify(appList, null, 0);

        // Hash the fetched JSON string
        const newHash = hash53(stringified);

        // Check if the cached copy exists
        const cacheExists = await exists(steamAppsCachePath);

        if (!cacheExists) {
            // If no cache exists, write the new file and save the new hash
            await writeFile(steamAppsCachePath, stringified);
            console.log('Cache file created.');
        } else {
            // If cache exists, compare hashes
            const cachedData = await readFile(steamAppsCachePath, 'utf8');
            const cachedHash = hash53(cachedData);

            if (newHash !== cachedHash) {
                // If hashes are different, overwrite the old file with new data
                await writeFile(steamAppsCachePath, stringified);
                console.log('Cache file updated.');
            } else {
                console.log('No changes detected. No update needed.');
            }
        }
    } catch (error) {
        console.error('Failed to sync Steam app list:', error);
    }
};