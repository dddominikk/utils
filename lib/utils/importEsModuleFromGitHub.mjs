/// <reference lib="webworker"/>
/// <reference lib="esnext"/>


class GhEsModule {

  static Octokit = import('https://esm.run/@octokit/core').then(o => o?.Octokit || o?.default || o);
  static octokit;
  static repo;
  static owner;
  static branch;
  static #pathGroups = String.raw`(?:^.*?github\.com\/)?(?<owner>[^\/]+)\/(?<repo>[^\/]+)(?:\/tree\/(?<branch>[^\/]+))?`;
  static #importCallback = response => atob(response.data.content);
  static s = {};

  /**
   * @arg {{auth: `ghp_${string}`, repoPath: `${string}/${string}`, branch?: string }} config
   */
  static async configure(config) {
    const { auth, repoPath, branch = 'main' } = config;

    /** @type {object} */
    const confGroups = new RegExp(GhEsModule.#pathGroups).exec(repoPath)?.groups;
    const { owner, repo } = confGroups;
    GhEsModule.owner = owner;
    GhEsModule.repo = repo;
    GhEsModule.branch = branch;

    GhEsModule.octokit = await GhEsModule.Octokit.then(O => new O({ auth }));
    return { configured: true };
  };

  static async load(path) {

    if (!GhEsModule.octokit) throw `Run GhEsModule.configure() first.`

    try {
      const response = await GhEsModule.octokit.request('GET /repos/{owner}/{repo}/contents/{path}',
        { owner: GhEsModule.owner, repo: GhEsModule.repo, path, ref: GhEsModule.branch }
      );
      if (response.status === 200 && response.data.encoding === 'base64') {
        return import(`data:application/javascript;base64,${response.data.content}`)
      } else { throw new Error('Failed to decode file content or invalid response format'); }
    } catch (error) { console.error('Error retrieving file content:', error); throw error; };
  };

  static #exportSym(mod = {}) {
    const ks = Object.keys(mod);
    if (ks.length === 1) return mod[ks[0]];
    else return mod;
  };

  static async new(path) {
    if (!!GhEsModule.s[path]) return GhEsModule.s[path];
    GhEsModule.s[path] = await GhEsModule.load(path).then(GhEsModule.#exportSym);
    return GhEsModule.s[path];
  }
}


/**
 * @typedef GhLoadInit
 * @prop {`ghp_${string}`} GhLoadInitConfig.auth - GitHub Auth token.
 * @prop {`${string}/${string}`} GhLoadInitConfig.repoPath - Relative GitHub repository path.
 * @prop {string} [GhLoadInitConfig.branch='main'] - GitHub repository branch name (defaults to 'main').
* @arg config {GhLoadInit}
*/
const GhLoadInit = async function GhLoadInit(config) {
  
  this.GhEsModule = GhEsModule;
  await this.GhEsModule.configure(config);
  return this.GhEsModule.new;
};


export default GhLoadInit;
export {GhLoadInit as importEsModuleFromGitHub};

/**
* # Import Example
* let { default: gg } = await fetch("https://raw.githubusercontent.com/dddominikk/utils/refs/heads/main/lib/utils/importEsModuleFromGitHub.mjs").then(r => r.text().then(utf8 => import(`data:application/javascript;base64,${btoa(utf8)}`)));
*/
