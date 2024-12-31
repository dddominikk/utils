import { Octokit } from "@octokit/core";
import { octokitInstance } from "./initOctokit.ts";

const fetchGistsPage = async (config: fetchGistsPageConfig) => {
    const defaults = { page: 0, perPage: 100, octokit: octokitInstance };

    const params = { ...defaults, ...(config !== null && typeof config === 'object' ? config : {}) };
    let { page, perPage, octokit } = params;

    try {
        return (await octokit.request('GET /gists', { page, per_page: perPage })).data;
    } catch (err) {
        console.error(`Error fetching page ${page}:`, err);
        return [];
    }
};


const fetchAllGists = async (conf: Omit<fetchGistsPageConfig, 'page'>) => {

    const { perPage = 100, octokit = octokitInstance } = conf;

    const fetchPagesRecursively = async ({ page, accumulatedGists }) => {
        const currentPageGists = await fetchGistsPage({ page, perPage, octokit });
        if (currentPageGists.length === 0) return accumulatedGists;
        return fetchPagesRecursively({
            page: page + 1,
            accumulatedGists: accumulatedGists.concat(currentPageGists)
        });
    };

    return fetchPagesRecursively({ page: 1, accumulatedGists: [] });
};

const displayGists = gists => (console.log(gists), gists);


const isGistStarred = async (gistId) => {

    return await octokitInstance
        .request('GET /gists/{gist_id}/star', { gist_id: gistId })
        .then(() => true)
        .catch(e => {
            if (e.status === 404) return false;
            else throw (console.error(`Error checking if gist ${gistId} is starred:`, e), e);
        });
};


export default {
    fetchGistsPage,
    fetchAllGists,
    isGistStarred,
    displayGists
};




type fetchGistsPageConfig = {
    page: number;
    /** Max: 100 */
    perPage?: number;
    octokit?: Octokit
}

interface GistFile {
    filename?: string;
    type?: string;
    language?: string;
    raw_url?: string;
    size?: number;
}

interface GistOwner {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
}

interface Gist {
    id: string;
    node_id: string;
    description: string;
    public: boolean;
    files: { [key: string]: GistFile };
    html_url: string;
    git_pull_url: string;
    git_push_url: string;
    created_at: string;
    updated_at: string;
    comments: number;
    comments_url: string;
    owner: GistOwner;
    forks?: { [key: string]: boolean };
    history?: { [key: string]: boolean };
    truncated: boolean;
};