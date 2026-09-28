import { RepoMetadata } from '../types';

export function parseGitHubUrl(inputUrl: string): { owner: string; repo: string; branch?: string } | null {
  let cleaned = inputUrl.trim();
  if (!cleaned) return null;

  // Handle shorthand like owner/repo
  const shorthandMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2].replace(/\.git$/, '') };
  }

  // Handle full URLs
  try {
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    const url = new URL(cleaned);
    if (url.hostname !== 'github.com') return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    
    let branch: string | undefined = undefined;
    // check for /tree/branch or /blob/branch
    const treeIdx = parts.indexOf('tree');
    const blobIdx = parts.indexOf('blob');
    const idx = treeIdx !== -1 ? treeIdx : blobIdx;
    if (idx !== -1 && parts.length > idx + 1) {
      branch = parts[idx + 1];
    }

    return { owner, repo, branch };
  } catch {
    return null;
  }
}

export async function fetchGitHubRepoData(
  inputUrl: string,
  githubToken?: string
): Promise<{ metadata: RepoMetadata; readmeContent: string; readmePath: string }> {
  const parsed = parseGitHubUrl(inputUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL or shorthand (expected owner/repo or https://github.com/owner/repo)');
  }

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (githubToken && githubToken.trim() !== '') {
    headers['Authorization'] = `token ${githubToken.trim()}`;
  }

  // 1. Fetch repo metadata
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' not found or is private. Check URL or provide a GitHub token in Settings.`);
    }
    if (repoRes.status === 403 || repoRes.status === 429) {
      throw new Error(`GitHub API rate limit exceeded. Add a personal access token in Settings to increase limits (5000 req/hr).`);
    }
    throw new Error(`GitHub API error: ${repoRes.status} ${repoRes.statusText}`);
  }

  const repoJson = await repoRes.json();
  const defaultBranch = repoJson.default_branch || 'main';
  const branch = parsed.branch || defaultBranch;

  // 2. Fetch root contents to get list of files
  let rootFiles: string[] = [];
  try {
    const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`, { headers });
    if (contentsRes.ok) {
      const contentsJson = await contentsRes.json();
      if (Array.isArray(contentsJson)) {
        rootFiles = contentsJson.map((item: any) => item.name);
      }
    }
  } catch (e) {
    console.warn('Failed to fetch root contents:', e);
  }

  const metadata: RepoMetadata = {
    owner,
    repo,
    branch,
    description: repoJson.description || '',
    stars: repoJson.stargazers_count || 0,
    forks: repoJson.forks_count || 0,
    openIssues: repoJson.open_issues_count || 0,
    language: repoJson.language || 'Unknown',
    license: repoJson.license ? repoJson.license.spdx_id || repoJson.license.name : null,
    topics: repoJson.topics || [],
    defaultBranch,
    isPrivate: repoJson.private || false,
    rootFiles,
  };

  // 3. Fetch README via GitHub API
  let readmeContent = '';
  let readmePath = 'README.md';

  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme?ref=${branch}`, { headers });
    if (readmeRes.ok) {
      const readmeJson = await readmeRes.json();
      readmePath = readmeJson.name || 'README.md';
      if (readmeJson.content && readmeJson.encoding === 'base64') {
        // Decode base64 properly supporting UTF-8
        const binString = atob(readmeJson.content.replace(/\s/g, ''));
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
        readmeContent = new TextDecoder().decode(bytes);
      }
    }
  } catch (e) {
    console.warn('GitHub API readme fetch failed, attempting raw fallback:', e);
  }

  // Fallback to raw.githubusercontent if API readme failed or was empty
  if (!readmeContent) {
    const possibleNames = ['README.md', 'Readme.md', 'readme.md', 'README.rst', 'README.txt'];
    for (const name of possibleNames) {
      try {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${name}`);
        if (rawRes.ok) {
          readmeContent = await rawRes.text();
          readmePath = name;
          break;
        }
      } catch {
        // continue
      }
    }
  }

  if (!readmeContent) {
    readmeContent = `# ${repo}\n\nNo README was found in this repository or branch (${branch}). You can generate one with README Forge!`;
  }

  return { metadata, readmeContent, readmePath };
}
