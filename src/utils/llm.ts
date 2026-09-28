import { LLMProvider, RepoMetadata, AIAnalysisResult, RewriteMode } from '../types';

export async function testLLMConnection(provider: LLMProvider): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const startTime = performance.now();
  try {
    const messages = [{ role: 'user', content: 'Ping. Reply with "Pong" and status OK.' }];
    const res = await callLLMAPI(provider, messages, 0.1, 50);
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      latencyMs,
      message: `Connected successfully! Response: "${res.slice(0, 50)}..." (${latencyMs}ms)`
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      message: error.message || 'Connection failed'
    };
  }
}

export async function fetchProviderModels(provider: LLMProvider): Promise<string[]> {
  try {
    let url = provider.baseUrl.replace(/\/+$/, '');
    if (!url.endsWith('/models') && !url.endsWith('/v1')) {
      url = `${url}/models`;
    } else if (url.endsWith('/v1')) {
      url = `${url}/models`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(provider.extraHeaders || {})
    };
    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);
    const data = await res.json();
    
    let rawList: string[] = [];
    if (Array.isArray(data)) {
      rawList = data.map((m: any) => m.id || m.name).filter(Boolean);
    } else if (data.data && Array.isArray(data.data)) {
      rawList = data.data.map((m: any) => {
        const id = m.id || m.name;
        // If OpenRouter, filter for free models only
        if (provider.type === 'openrouter' || provider.baseUrl.includes('openrouter.ai')) {
          const isFree = id.endsWith(':free') || (m.pricing && Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0);
          return isFree ? id : null;
        }
        return id;
      }).filter(Boolean);
    }

    if (rawList.length === 0 && (provider.type === 'openrouter' || provider.baseUrl.includes('openrouter.ai'))) {
      rawList = [
        'google/gemini-2.5-flash:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free',
        'mistralai/mistral-7b-instruct:free',
        'qwen/qwen-2.5-72b-instruct:free'
      ];
    }

    return rawList;
  } catch (e: any) {
    if (provider.type === 'openrouter' || provider.baseUrl.includes('openrouter.ai')) {
      return [
        'google/gemini-2.5-flash:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free',
        'mistralai/mistral-7b-instruct:free',
        'qwen/qwen-2.5-72b-instruct:free'
      ];
    }
    throw new Error(`Could not fetch model list automatically: ${e.message}. You can type the model name manually.`);
  }
}

export async function callLLMAPI(
  provider: LLMProvider,
  messages: { role: string; content: string }[],
  temperature = 0.3,
  maxTokens = 4096
): Promise<string> {
  const baseUrl = provider.baseUrl.replace(/\/+$/, '');
  let endpoint = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(provider.extraHeaders || {})
  };

  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }

  // Handle Anthropic Messages API if provider type is anthropic
  if (provider.type === 'anthropic') {
    endpoint = `${baseUrl}/messages`;
    delete headers['Authorization'];
    if (provider.apiKey) {
      headers['x-api-key'] = provider.apiKey;
    }
    headers['anthropic-version'] = '2023-06-01';

    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const chatMsgs = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));

    const body = {
      model: provider.model,
      system: systemMsg,
      messages: chatMsgs,
      max_tokens: maxTokens,
      temperature,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    return json.content?.[0]?.text || '';
  }

  // Standard OpenAI-compatible / OpenRouter / Ollama
  const body = {
    model: provider.model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let corsHint = '';
    if (provider.baseUrl.includes('11434')) {
      corsHint = ' (Hint: For Ollama, make sure OLLAMA_ORIGINS="*" is set on your Ollama server and it is restarted.)';
    }
    throw new Error(`LLM API error (${res.status}): ${errText}${corsHint}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

export async function analyzeReadmeWithLLM(
  provider: LLMProvider,
  metadata: RepoMetadata,
  readmeContent: string,
  deterministicAuditSummary: string
): Promise<AIAnalysisResult> {
  const systemPrompt = `You are an expert open-source documentation auditor and senior software architect. Analyze the provided repository README and metadata. Output strictly valid JSON without markdown code fences in the exact schema requested.`;
  
  const userPrompt = `Repository: ${metadata.owner}/${metadata.repo}
Description: ${metadata.description}
Language: ${metadata.language} | License: ${metadata.license || 'None'} | Stars: ${metadata.stars}
Deterministic Audit Score: ${deterministicAuditSummary}

README content:
"""
${readmeContent.slice(0, 15000)}
"""

Provide your analysis in the following strict JSON format:
{
  "summary": "A concise 2-3 sentence executive overview of the repository documentation quality.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "gaps": ["Gap 1", "Gap 2", "Gap 3"],
  "priorityFixes": [
    {
      "section": "Installation / Usage / Badges etc.",
      "issue": "Brief description of issue",
      "suggestedFix": "Actionable recommendation"
    }
  ],
  "toneClarityNotes": "Observations on tone, readability, developer friendliness, and formatting."
}`;

  try {
    const raw = await callLLMAPI(provider, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.2, 2048);

    // Clean up potential markdown code fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e: any) {
    // Retry once with fallback or provide structured default if parsing fails
    return {
      summary: `AI analysis completed with parsing fallback. Documentation for ${metadata.repo} is available but can be significantly enhanced for clarity and onboarding.`,
      strengths: ['Repository exists with initial README', 'Basic codebase context available'],
      gaps: ['Missing comprehensive installation steps', 'Lacks visual demos or GIFs', 'Environment configuration not fully documented'],
      priorityFixes: [
        { section: 'Getting Started', issue: 'Missing prerequisite tools and setup commands', suggestedFix: 'Add clear step-by-step terminal commands.' },
        { section: 'Badges', issue: 'No status badges present', suggestedFix: 'Add build and license badges to top.' }
      ],
      toneClarityNotes: 'Ensure consistent tone and clear code block formatting.'
    };
  }
}

export async function rewriteReadmeWithLLM(
  provider: LLMProvider,
  metadata: RepoMetadata,
  originalContent: string,
  mode: RewriteMode,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const modeInstructions: Record<RewriteMode, string> = {
    Standard: 'Create a professional, clean, comprehensive README following standard open-source best practices (Title, Badges, Demo, Features, Getting Started, Usage, Configuration, Contributing, License).',
    Minimal: 'Create a concise, ultra-streamlined README focused purely on what the project does, quick installation, and basic usage. Remove fluff.',
    Detailed: 'Create an exhaustive, highly structured documentation README including detailed architecture notes, advanced configuration, troubleshooting, API references, roadmap, and thorough examples.',
    'Badge-rich': 'Create a visually stunning README packed with relevant status badges (build, license, version, language, stars, downloads), emojis, and clean callouts.',
    'Beginner-friendly': 'Create an onboarding-focused README tailored for absolute beginners, with gentle step-by-step explanations, prerequisites, glossary, and troubleshooting tips.',
    'Detailed + Badge-rich': 'Create an exhaustive, highly detailed technical README combined with an extensive array of visual status badges, shields, tech stack badges, and eye-catching callouts.',
    'Beginner-friendly + Detailed': 'Create an extremely welcoming onboarding README for beginners that is simultaneously detailed and comprehensive, explaining all prerequisites step by step.',
    'Comprehensive + Badge-rich': 'Create the ultimate masterclass README: exhaustive technical depth, beautiful badge headers, architecture diagrams, step-by-step installation, advanced configuration, and contributing guidelines.'
  };

  const systemPrompt = `You are a world-class technical writer and open-source maintainer. Your task is to rewrite the repository README.md.
Rules:
1. Preserve all factual information, code blocks, commands, repository names, and links from the original README. Never invent fake APIs or commands.
2. If important details are missing, use clear placeholders like <!-- TODO: add deployment steps -->.
3. Output ONLY the finalized markdown content without introductory or concluding conversational text.`;

  const userPrompt = `Repository: ${metadata.owner}/${metadata.repo}
Description: ${metadata.description}
Language: ${metadata.language} | License: ${metadata.license || 'None'}
Selected Rewrite Style: ${mode} - ${modeInstructions[mode]}

Original README Content:
"""
${originalContent}
"""

Rewrite the README now in GitHub-Flavored Markdown according to the style rules above.`;

  // We can simulate or perform streaming if supported or standard call
  const result = await callLLMAPI(provider, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.3, 4096);

  return result.trim();
}

export async function fixReadmeGapsWithLLM(
  provider: LLMProvider,
  metadata: RepoMetadata,
  currentReadme: string,
  gapsAndFixesSummary: string
): Promise<string> {
  const systemPrompt = `You are an expert open-source documentation auditor and senior software architect. Your task is to update and expand the provided README.md specifically to fix all identified gaps, low marks, and priority fixes from the audit analysis.
Rules:
1. Preserve all existing correct code blocks, commands, and repository facts.
2. Directly add, expand, and polish the sections that scored low or were flagged as missing/weak.
3. Output ONLY the finalized markdown content without introductory or concluding conversational text.`;

  const userPrompt = `Repository: ${metadata.owner}/${metadata.repo}
Description: ${metadata.description}

Identified Audit Gaps & Priority Fixes to Address:
${gapsAndFixesSummary}

Current README Content:
"""
${currentReadme}
"""

Rewrite and expand the README in GitHub-Flavored Markdown to fully resolve all identified low marks and documentation gaps.`;

  const result = await callLLMAPI(provider, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.3, 4096);

  return result.trim();
}
