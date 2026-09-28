import { AuditItem, AuditResult } from '../types';

export function auditReadme(markdown: string): AuditResult {
  const lines = markdown.split('\n');
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  
  // Extract headings
  const headings = lines.filter(l => l.trim().startsWith('#'));
  const h1s = headings.filter(l => l.trim().match(/^#[^#]/));
  const h2s = headings.filter(l => l.trim().match(/^##[^#]/));
  const headingCount = headings.length;

  // Code blocks
  const codeBlockMatches = markdown.match(/```[\s\S]*?```/g) || [];
  const codeBlockCount = codeBlockMatches.length;

  // Images/GIFs
  const imageMatches = markdown.match(/!\[.*?\]\(.*?\)|<img[^>]+>/gi) || [];
  const imageCount = imageMatches.length;

  // Badges
  const badgeMatches = markdown.match(/\[!\[.*?\]\(.*?\)\]\(.*?\)|!\[.*?\]\(.*?badge.*?\)/gi) || [];
  const hasBadges = badgeMatches.length > 0 || markdown.toLowerCase().includes('shields.io') || markdown.toLowerCase().includes('github/actions');

  // Table of contents check
  const hasToc = markdown.toLowerCase().includes('table of contents') || 
                 markdown.toLowerCase().includes('contents') || 
                 (markdown.includes('[') && markdown.includes('](#'));

  // Section checks (case insensitive keyword matching)
  const lowerContent = markdown.toLowerCase();
  
  const hasTitle = h1s.length > 0;
  const hasDescription = hasTitle && wordCount > 15;
  const hasInstallation = /install|getting started|setup|quickstart|requirements/i.test(lowerContent);
  const hasUsage = /usage|example|how to use|quick start|api/i.test(lowerContent) && codeBlockCount > 0;
  const hasConfiguration = /config|env|environment|parameters|options|settings/i.test(lowerContent);
  const hasContributing = /contribut|pull request|issues|development/i.test(lowerContent);
  const hasLicense = /license|mit|apache|gpl/i.test(lowerContent);
  const hasSupport = /support|contact|community|help|discord|twitter/i.test(lowerContent);

  const items: AuditItem[] = [
    {
      id: 'title-tagline',
      title: 'Title & One-line Tagline',
      category: 'Structure',
      status: hasTitle ? 'pass' : 'fail',
      description: hasTitle ? 'Found a clear main heading (H1).' : 'Missing a clear H1 title heading at the top.',
      recommendation: 'Start your README with a prominent # Repository Title and a 1-sentence tagline describing what it does.'
    },
    {
      id: 'badges',
      title: 'Status & Build Badges',
      category: 'Visuals',
      status: hasBadges ? 'pass' : 'warning',
      description: hasBadges ? `Found ${badgeMatches.length} badge(s).` : 'No build, version, or license badges detected.',
      recommendation: 'Add standard badges right below the title (CI/CD build status, license, version, npm/docker downloads).'
    },
    {
      id: 'toc',
      title: 'Table of Contents',
      category: 'Structure',
      status: hasToc || headingCount <= 4 ? 'pass' : 'warning',
      description: hasToc ? 'Table of Contents or quick navigation links detected.' : 'No Table of Contents found for a longer document.',
      recommendation: 'Add a Table of Contents near the top if your README exceeds 4 sections to improve scannability.'
    },
    {
      id: 'visual-demo',
      title: 'Screenshot or Demo',
      category: 'Visuals',
      status: imageCount > 0 ? 'pass' : 'warning',
      description: imageCount > 0 ? `Found ${imageCount} image(s) or GIF(s).` : 'No screenshots or GIFs found.',
      recommendation: 'Include a GIF or screenshot right after the introduction to instantly showcase your project in action.'
    },
    {
      id: 'installation',
      title: 'Installation / Getting Started',
      category: 'Content',
      status: hasInstallation ? 'pass' : 'fail',
      description: hasInstallation ? 'Installation instructions found.' : 'No clear installation or setup instructions detected.',
      recommendation: 'Add a dedicated "Getting Started" or "Installation" section with step-by-step terminal commands.'
    },
    {
      id: 'usage-code',
      title: 'Usage with Code Blocks',
      category: 'Content',
      status: hasUsage ? 'pass' : (codeBlockCount > 0 ? 'warning' : 'fail'),
      description: hasUsage ? `Found usage references and ${codeBlockCount} code block(s).` : 'Insufficient code examples or usage instructions.',
      recommendation: 'Provide clear code snippets with language tags (e.g., ```typescript, ```bash) demonstrating how to use your project.'
    },
    {
      id: 'configuration',
      title: 'Configuration & Environment Variables',
      category: 'Content',
      status: hasConfiguration ? 'pass' : 'warning',
      description: hasConfiguration ? 'Configuration/environment details detected.' : 'No configuration or environment variable section found.',
      recommendation: 'Document all configuration options, environment variables (.env.example), or CLI flags.'
    },
    {
      id: 'contributing',
      title: 'Contributing Guidelines',
      category: 'Quality',
      status: hasContributing ? 'pass' : 'warning',
      description: hasContributing ? 'Contributing references found.' : 'No mention of how others can contribute.',
      recommendation: 'Add a Contributing section or link to CONTRIBUTING.md explaining how to submit PRs and report bugs.'
    },
    {
      id: 'license',
      title: 'License Information',
      category: 'Quality',
      status: hasLicense ? 'pass' : 'fail',
      description: hasLicense ? 'License section or badge detected.' : 'No license reference found.',
      recommendation: 'Clearly state your project license (e.g., MIT, Apache 2.0) and include a LICENSE file.'
    },
    {
      id: 'support-contact',
      title: 'Support / Contact Links',
      category: 'Quality',
      status: hasSupport ? 'pass' : 'warning',
      description: hasSupport ? 'Support or contact channels found.' : 'No support or contact information provided.',
      recommendation: 'Provide ways for users to get help, ask questions, or reach out (Issues, Discord, Email).'
    }
  ];

  // Calculate score (pass = 10 points, warning = 6 points, fail = 0 points)
  let totalPoints = 0;
  const maxPoints = items.length * 10;
  for (const item of items) {
    if (item.status === 'pass') totalPoints += 10;
    else if (item.status === 'warning') totalPoints += 6;
    else totalPoints += 0;
  }

  const score = Math.round((totalPoints / maxPoints) * 100);

  return {
    score,
    items,
    wordCount,
    headingCount,
    codeBlockCount,
    imageCount,
  };
}
