import pathModule from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);
const path = pathModule.join(__dirname, '../../.env');

const Env = config({ path });

export default (() => {
    const object = { cc: Env, path, k: process.env.GH_AUTH_TOKEN };
    return (console.log(object), object);
})();
