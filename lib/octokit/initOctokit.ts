import pathModule from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);
const path = pathModule.join(__dirname, '../../.env');
const Env = config({ path });
const { GH_AUTH_TOKEN: auth } = Env.parsed;
export const octokitInstance = new Octokit({ auth: process.env.GH_AUTH_TOKEN });


export default (() => {
    const object = { cc: Env, path, k: process.env.GH_AUTH_TOKEN };
    return (console.log(object), object);
})();