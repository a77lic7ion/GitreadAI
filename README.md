# README Forge

README Forge is a powerful, client-side web application designed to audit, rewrite, and generate world-class documentation and community files for any public GitHub repository.

---

## Features

1. **GitHub Ingestion, Personal Repos & Popular Examples**:
   - Paste any public GitHub repo URL or shorthand (`owner/repo`).
   - **My Repos Connection**: Click **My Repos** to browse and select from your own GitHub repositories (authenticated via personal access token).
   - **Popular Example Pills**: Quick-load buttons for Facebook (`facebook/react`), GitHub (`github/docs`), Torvalds (`torvalds/linux`), Tailwind (`tailwindlabs/tailwindcss`), and OpenAI (`openai/openai-cookbook`).
   - Fetches repository metadata (description, stars, forks, language, license, topics) and root file listings.
   - Optional GitHub personal access token support to raise API rate limits from 60 req/hr to 5,000 req/hr.

2. **Deterministic Audit & Scoring**:
   - Instantly evaluates README against 10 best-practice criteria (Title, badges, table of contents, screenshots/demo, installation, usage code blocks, configuration, contributing, license, support).
   - Generates a 0–100 quality score and categorized pass/fail checklist.

3. **Multi-Provider LLM Settings, Free Models & Pre-filled Endpoints**:
   - Pre-filled presets for **OpenRouter (Free Models)**, **Nous Research** (`https://inference-api.nousresearch.com/v1`), **Mistral AI**, **OpenCode**, **Ollama** (`http://localhost:11434/v1`), OpenAI, Anthropic, and Google Gemini (OpenAI Proxy).
   - Automatic filtering for **free models only** when using OpenRouter.
   - Model selection dropdown after picking a provider or fetching models.
   - Test connection feature with latency measurement.
   - Securely persisted in `localStorage`.

4. **Deep AI Analysis**:
   - Sends README and metadata to the selected LLM to produce structured summaries, key strengths, identified gaps, priority fixes, and tone/clarity observations.

5. **AI Rewrite Studio, Targeted Analysis Assist & Export .md**:
   - **🧠 Targeted Analysis Assist**: In the AI Rewrite Studio, you can instantly target and fix low marks, warnings, and missing best-practice gaps identified in the Audit & AI Analysis.
   - **Fix Low Marks (0 Cost)**: Algorithmic instant fix for all audit warnings/failures.
   - **Fix Gaps with AI**: Sends specific audit gaps and priority fixes to your selected LLM to rewrite and expand the README.
   - **⚡ Instant Enhance (0 Cost)**: Algorithmic instant enhancement that injects GitHub metadata badges, auto-generates a Table of Contents, formats emojis, and scaffolds missing standard sections.
   - Expanded professional styles including composite modes: **Standard**, **Minimal**, **Detailed**, **Badge-rich**, **Beginner-friendly**, **Detailed + Badge-rich**, **Beginner-friendly + Detailed**, and **Comprehensive + Badge-rich**.
   - Side-by-side comparison with Raw Markdown, Rendered Preview, and Diff view (showing exact additions and removals).
   - Dedicated **Export .md** button to download the rewritten README instantly.
   - Copy to clipboard or edit in place.

6. **Community File Generator & ZIP Export**:
   - Detects missing repository standards (`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, issue/PR templates, `.gitignore`).
   - Live editor and preview for each file.
   - **Download all as ZIP** using JSZip.

---

## Design System & Aesthetic
- **GitRead / README Forge Warm Editorial Terminal**: Built with an organic academic research publication meets precision CLI terminal aesthetic. Features warm espresso surfaces (`#131312`), terracotta accents (`#d97757`), Newsreader editorial typography for headings, Geist for system discourse, and JetBrains Mono for operational CLI output.

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** for styling
- **Lucide React** for modern icons
- **marked** & **DOMPurify** for secure Markdown rendering and sanitization
- **diff** for semantic diff viewing
- **JSZip** for community file archive generation

