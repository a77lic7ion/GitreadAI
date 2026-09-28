import { RepoMetadata } from '../types';

export function enhanceReadmeDeterministically(
  markdown: string,
  metadata: RepoMetadata,
  mode: string
): string {
  let content = markdown.trim();

  // 1. Ensure Title & Tagline exist
  if (!content.startsWith('# ')) {
    content = `# ${metadata.repo}\n\n> ${metadata.description || 'A high-performance repository powered by open-source collaboration.'}\n\n${content}`;
  }

  // 2. Auto-inject Badges if missing or requested
  const hasBadges = content.includes('shields.io') || content.includes('github/actions') || content.includes('[![');
  if (!hasBadges || mode.includes('Badge-rich') || mode === 'Standard') {
    const badges = [
      `[![GitHub stars](https://img.shields.io/github/stars/${metadata.owner}/${metadata.repo}?style=flat-square&logo=github)](https://github.com/${metadata.owner}/${metadata.repo}/stargazers)`,
      `[![GitHub forks](https://img.shields.io/github/forks/${metadata.owner}/${metadata.repo}?style=flat-square&logo=github)](https://github.com/${metadata.owner}/${metadata.repo}/network)`,
      `[![GitHub issues](https://img.shields.io/github/issues/${metadata.owner}/${metadata.repo}?style=flat-square&logo=github)](https://github.com/${metadata.owner}/${metadata.repo}/issues)`,
      metadata.license ? `[![License](https://img.shields.io/github/license/${metadata.owner}/${metadata.repo}?style=flat-square)](https://github.com/${metadata.owner}/${metadata.repo}/blob/main/LICENSE)` : '',
      `[![Language](https://img.shields.io/github/languages/top/${metadata.owner}/${metadata.repo}?style=flat-square)](https://github.com/${metadata.owner}/${metadata.repo})`
    ].filter(Boolean).join(' ');

    // Insert badges right after title/tagline
    const lines = content.split('\n');
    let insertIdx = 1;
    if (lines[1]?.startsWith('>')) {
      insertIdx = 2;
    }
    lines.splice(insertIdx, 0, `\n${badges}\n`);
    content = lines.join('\n');
  }

  // 3. Generate Table of Contents if requested or detailed
  if (mode.includes('Detailed') || mode.includes('Comprehensive') || mode === 'Standard') {
    const headingLines = content.split('\n').filter(l => l.trim().match(/^#{2,3}\s+/));
    if (headingLines.length >= 3) {
      let toc = '\n## 📋 Table of Contents\n\n';
      for (const hl of headingLines) {
        const level = hl.startsWith('###') ? 2 : 1;
        const text = hl.replace(/^#+\s+/, '').trim();
        const anchor = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        const indent = level === 2 ? '  - ' : '- ';
        toc += `${indent}[${text}](#${anchor})\n`;
      }
      toc += '\n---';

      // Insert TOC after badges/intro
      const lines = content.split('\n');
      lines.splice(6, 0, toc);
      content = lines.join('\n');
    }
  }

  // 4. Add Missing Standard Sections if absent
  const lower = content.toLowerCase();
  
  if (!lower.includes('getting started') && !lower.includes('installation')) {
    content += `\n\n## 🚀 Getting Started\n\n### Prerequisites\n- Node.js / Git installed\n\n### Installation\n\`\`\`bash\ngit clone https://github.com/${metadata.owner}/${metadata.repo}.git\ncd ${metadata.repo}\nnpm install\n\`\`\``;
  }

  if (!lower.includes('usage') && !lower.includes('how to use')) {
    content += `\n\n## 💡 Usage\n\n\`\`\`bash\n# Run the project\nnpm run dev\n\`\`\``;
  }

  if (!lower.includes('contributing')) {
    content += `\n\n## 🤝 Contributing\n\nContributions are welcome! Please feel free to open an issue or submit a Pull Request.`;
  }

  if (!lower.includes('license')) {
    content += `\n\n## 📄 License\n\nDistributed under the ${metadata.license || 'MIT'} License. See \`LICENSE\` for more information.`;
  }

  return content;
}

export function fixGapsDeterministically(
  markdown: string,
  metadata: RepoMetadata,
  auditResult: any,
  aiAnalysis: any
): string {
  let content = markdown;
  content = enhanceReadmeDeterministically(content, metadata, 'Detailed + Badge-rich');

  if (aiAnalysis && aiAnalysis.priorityFixes && aiAnalysis.priorityFixes.length > 0) {
    let fixesMarkdown = '\n\n## 🛠️ Targeted Analysis Fixes & Improvements\n\n';
    for (const fix of aiAnalysis.priorityFixes) {
      fixesMarkdown += `### 💡 ${fix.section}\n- **Identified Gap:** ${fix.issue}\n- **Applied Fix:** ${fix.suggestedFix}\n\n`;
    }
    content += fixesMarkdown;
  }

  return content;
}
