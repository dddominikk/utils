import { SteamConfig } from '../config.js';
import fetch from 'node-fetch';
import { hash53 } from './hash53.mjs';
import fs from 'fs'
import { promisify } from 'util';
import path from 'path';

const { readFile, writeFile, mkdir } = fs.promises;
// Convert fs callbacks to promises
const exists = promisify(fs.exists);

const { appList: { remote, local, latestHash } } = SteamConfig;
const cacheExists = await exists(local);
const localPath = path.resolve(SteamConfig.appList.local);
const localDir = path.dirname(localPath); // Ensure we're getting an absolute directory path


console.trace({ SteamConfig, cacheExists, localDir, local, currentLocation: process.cwd().toString() });

async function createMissingNestedDir(dirPath: string) {
    try {
        if (!fs.existsSync(dirPath)) {
            await mkdir(dirPath, { recursive: true });
            console.trace(`Directory created: ${dirPath}`);
        } else {
            console.trace(`Directory already exists: ${dirPath}`);
        }
    } catch (error) {
        console.error('Error creating directory:', error);
        throw error; // Rethrow to handle upstream
    }
}

await createMissingNestedDir(localDir);


export async function syncSteamAppList() {

    try {
        const steamAppsUrl = SteamConfig.appList.remote;
        const steamAppsCachePath = localPath;

        // Fetch the app list from Steam
        const response = await fetch(steamAppsUrl, { method: 'GET' });
        const appList = await response.json();
        const stringified = JSON.stringify(appList, null, 0);

        // Hash the fetched JSON string
        const newHash = hash53(stringified);

        await createMissingNestedDir(path.dirname(steamAppsCachePath));

        const exists = fs.existsSync(steamAppsCachePath);
        console.log({ exists });

        if (!exists) {
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