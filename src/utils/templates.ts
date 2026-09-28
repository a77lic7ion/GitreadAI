import { RepoMetadata, CommunityFileDraft } from '../types';

export function generateCommunityFileDrafts(metadata: RepoMetadata): CommunityFileDraft[] {
  const rootFilesLower = metadata.rootFiles.map(f => f.toLowerCase());
  const year = new Date().getFullYear();
  const author = metadata.owner;
  const repoName = metadata.repo;

  const drafts: CommunityFileDraft[] = [
    {
      path: 'LICENSE',
      name: 'LICENSE (MIT)',
      description: 'Standard MIT Open Source License',
      existsInRepo: rootFilesLower.includes('license'),
      content: `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
    },
    {
      path: 'CONTRIBUTING.md',
      name: 'CONTRIBUTING.md',
      description: 'Guidelines for bug reports, feature requests, and pull requests',
      existsInRepo: rootFilesLower.includes('contributing.md'),
      content: `# Contributing to ${repoName}

First off, thank you for taking the time to contribute! 🎉 All contributions are welcome.

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check existing issues to avoid duplicates. When reporting a bug, include:
- Clear description of the issue.
- Steps to reproduce.
- Expected vs actual behavior.
- Environment details (OS, browser, version).

### Suggesting Enhancements
Feature requests are always welcome! Open an issue describing the feature, why it is needed, and potential implementation ideas.

### Pull Requests
1. Fork the repo (\`https://github.com/${author}/${repoName}/fork\`).
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`).
3. Commit your changes (\`git commit -m 'Add amazing feature'\`).
4. Push to the branch (\`git push origin feature/amazing-feature\`).
5. Open a Pull Request.`
    },
    {
      path: 'CODE_OF_CONDUCT.md',
      name: 'CODE_OF_CONDUCT.md',
      description: 'Contributor Covenant Code of Conduct',
      existsInRepo: rootFilesLower.includes('code_of_conduct.md'),
      content: `# Contributor Covenant Code of Conduct

## Our Pledge
We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone.

## Our Standards
Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language.
- Being respectful of differing viewpoints and experiences.
- Gracefully accepting constructive criticism.
- Focusing on what is best for the community.

## Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project maintainers.`
    },
    {
      path: 'SECURITY.md',
      name: 'SECURITY.md',
      description: 'Security vulnerability reporting policy',
      existsInRepo: rootFilesLower.includes('security.md'),
      content: `# Security Policy

## Reporting a Vulnerability
If you discover a security vulnerability within ${repoName}, please send an email to the maintainer rather than opening a public issue. All security vulnerabilities will be promptly addressed.

Please include:
- Details of the vulnerability.
- Steps to reproduce.
- Potential impact.`
    },
    {
      path: 'CHANGELOG.md',
      name: 'CHANGELOG.md',
      description: 'Keep a Changelog format tracking project releases',
      existsInRepo: rootFilesLower.includes('changelog.md'),
      content: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release and core setup.`
    },
    {
      path: '.github/ISSUE_TEMPLATE/bug_report.md',
      name: 'Bug Report Template',
      description: 'Standard GitHub issue template for bug reports',
      existsInRepo: rootFilesLower.includes('.github') && metadata.rootFiles.includes('ISSUE_TEMPLATE'),
      content: `---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.
`
    },
    {
      path: '.github/ISSUE_TEMPLATE/feature_request.md',
      name: 'Feature Request Template',
      description: 'Standard GitHub issue template for feature proposals',
      existsInRepo: rootFilesLower.includes('.github'),
      content: `---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''

---

**Is your problem related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Additional context**
Add any other context or screenshots about the feature request here.
`
    },
    {
      path: '.gitignore',
      name: '.gitignore',
      description: 'Suggested ignore patterns based on language/stack',
      existsInRepo: rootFilesLower.includes('.gitignore'),
      content: `# Dependencies
node_modules/
vendor/

# Logs & Output
logs
*.log
npm-debug.log*
dist/
build/
.output/

# Environment variables
.env
.env.local

# OS Metadata
.DS_Store
Thumbs.db`
    }
  ];

  return drafts;
}
