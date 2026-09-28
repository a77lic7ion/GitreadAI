import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  Key, 
  Sliders, 
  ShieldAlert, 
  Download, 
  Upload, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AppSettings, LLMProvider } from '../types';
import { testLLMConnection, fetchProviderModels } from '../utils/llm';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeSettings, setActiveSettings] = useState<AppSettings>(settings);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    settings.providers[0]?.id || ''
  );
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [includeKeysInExport, setIncludeKeysInExport] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentProvider = activeSettings.providers.find(p => p.id === selectedProviderId) || activeSettings.providers[0];

  const handleUpdateProvider = (fields: Partial<LLMProvider>) => {
    if (!currentProvider) return;
    const updated = activeSettings.providers.map(p => 
      p.id === currentProvider.id ? { ...p, ...fields } : p
    );
    setActiveSettings({ ...activeSettings, providers: updated });
  };

  const handleAddProvider = () => {
    const newId = 'provider_' + Date.now();
    const newProv: LLMProvider = {
      id: newId,
      name: 'New Provider',
      type: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 4096,
    };
    setActiveSettings({
      ...activeSettings,
      providers: [...activeSettings.providers, newProv]
    });
    setSelectedProviderId(newId);
  };

  const handleDeleteProvider = (id: string) => {
    if (activeSettings.providers.length <= 1) {
      alert('You must keep at least one provider.');
      return;
    }
    const filtered = activeSettings.providers.filter(p => p.id !== id);
    setActiveSettings({
      ...activeSettings,
      providers: filtered,
      activeAnalysisProviderId: activeSettings.activeAnalysisProviderId === id ? filtered[0].id : activeSettings.activeAnalysisProviderId,
      activeRewriteProviderId: activeSettings.activeRewriteProviderId === id ? filtered[0].id : activeSettings.activeRewriteProviderId,
    });
    setSelectedProviderId(filtered[0].id);
  };

  const applyPreset = (presetType: 'openrouter' | 'ollama' | 'openai' | 'anthropic' | 'nvidia' | 'lmstudio' | 'gemini' | 'nous' | 'mistral' | 'opencode') => {
    if (!currentProvider) return;
    let name = currentProvider.name;
    let baseUrl = currentProvider.baseUrl;
    let model = currentProvider.model;
    let type = currentProvider.type;

    if (presetType === 'openrouter') {
      name = 'OpenRouter (Free Models)';
      baseUrl = 'https://openrouter.ai/api/v1';
      model = 'google/gemini-2.5-flash:free';
      type = 'openrouter';
      setFetchedModels([
        'google/gemini-2.5-flash:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free',
        'mistralai/mistral-7b-instruct:free',
        'qwen/qwen-2.5-72b-instruct:free'
      ]);
    } else if (presetType === 'nous') {
      name = 'Nous Research';
      baseUrl = 'https://inference-api.nousresearch.com/v1';
      model = 'NousResearch/Hermes-3-Llama-3.1-70B';
      type = 'openai';
    } else if (presetType === 'mistral') {
      name = 'Mistral AI';
      baseUrl = 'https://api.mistral.ai/v1';
      model = 'mistral-small-latest';
      type = 'openai';
    } else if (presetType === 'opencode') {
      name = 'OpenCode Interpreter';
      baseUrl = 'https://api.opencode.ai/v1';
      model = 'opencode-coder-v1';
      type = 'openai';
    } else if (presetType === 'ollama') {
      name = 'Ollama (Local)';
      baseUrl = 'http://localhost:11434/v1';
      model = 'llama3';
      type = 'openai';
    } else if (presetType === 'gemini') {
      name = 'Google Gemini (OpenAI Proxy)';
      baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/';
      model = 'gemini-2.5-flash';
      type = 'openai';
    } else if (presetType === 'openai') {
      name = 'OpenAI';
      baseUrl = 'https://api.openai.com/v1';
      model = 'gpt-4o';
      type = 'openai';
    } else if (presetType === 'anthropic') {
      name = 'Anthropic Proxy';
      baseUrl = 'https://api.anthropic.com/v1';
      model = 'claude-3-5-sonnet';
      type = 'openai';
    }

    handleUpdateProvider({ name, baseUrl, model, type });
  };

  const handleTestConnection = async () => {
    if (!currentProvider) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testLLMConnection(currentProvider);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFetchModels = async () => {
    if (!currentProvider) return;
    setIsFetchingModels(true);
    try {
      const models = await fetchProviderModels(currentProvider);
      setFetchedModels(models);
      if (models.length > 0) {
        alert(`Successfully fetched ${models.length} models!`);
      } else {
        alert('No models returned by provider endpoint.');
      }
    } catch (err: any) {
      alert(`Failed to fetch models: ${err.message}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleExportSettings = () => {
    const exportData = { ...activeSettings };
    if (!includeKeysInExport) {
      exportData.providers = exportData.providers.map(p => ({ ...p, apiKey: '' }));
      exportData.githubToken = '';
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `readme-forge-settings-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.providers && Array.isArray(parsed.providers)) {
          setActiveSettings(parsed);
          alert('Settings imported successfully!');
        } else {
          alert('Invalid settings file format.');
        }
      } catch {
        alert('Failed to parse JSON settings file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSaveSettings(activeSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-highest bg-surface-container-lowest">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-primary-container" />
            <h2 className="text-base font-normal text-on-surface font-headline-lg">LLM Provider & Settings Manager</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
          
          {/* Security Notice */}
          <div className="bg-tertiary/10 border border-tertiary/30 rounded p-4 flex items-start space-x-3 text-tertiary text-xs">
            <ShieldAlert className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Client-Side Storage Notice</span>
              API keys are stored exclusively in your browser&apos;s <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface font-code-sm">localStorage</code> and sent directly to your configured LLM endpoints. They never pass through any backend server.
            </div>
          </div>

          {/* GitHub Token & Global Prefs */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded p-4 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-on-surface flex items-center space-x-2 font-headline-sm">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>GitHub API Token (Optional)</span>
            </h3>
            <p className="text-xs text-outline">
              Increases rate limits from 60 req/hr to 5,000 req/hr when fetching repository details and raw content.
            </p>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={activeSettings.githubToken}
              onChange={(e) => setActiveSettings({ ...activeSettings, githubToken: e.target.value })}
              className="w-full px-3.5 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary-container font-code-md"
            />
          </div>

          {/* Providers List & Editor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Providers List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-sm">Providers</span>
                <button
                  type="button"
                  onClick={handleAddProvider}
                  className="flex items-center space-x-1 text-xs text-primary-container hover:text-tertiary bg-surface-container px-2.5 py-1 rounded border border-surface-container-highest transition-colors font-label-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Provider</span>
                </button>
              </div>

              <div className="space-y-2">
                {activeSettings.providers.map(prov => {
                  const isSelected = prov.id === currentProvider?.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => setSelectedProviderId(prov.id)}
                      className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary-container/20 border-primary-container text-on-surface shadow-sm'
                          : 'bg-surface-container-lowest border-surface-container-highest text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-semibold truncate font-code-md">{prov.name}</div>
                        <div className="text-[10px] text-outline truncate font-code-sm">{prov.model}</div>
                      </div>
                      {activeSettings.providers.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProvider(prov.id);
                          }}
                          className="text-outline hover:text-red-400 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Role Assignment */}
              <div className="pt-4 border-t border-surface-container-highest space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-sm">Role Routing</span>
                
                <div>
                  <label className="block text-[11px] text-outline mb-1 font-label-sm">Analysis Provider</label>
                  <select
                    value={activeSettings.activeAnalysisProviderId}
                    onChange={(e) => setActiveSettings({ ...activeSettings, activeAnalysisProviderId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface font-code-md"
                  >
                    {activeSettings.providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-outline mb-1 font-label-sm">Rewrite Provider</label>
                  <select
                    value={activeSettings.activeRewriteProviderId}
                    onChange={(e) => setActiveSettings({ ...activeSettings, activeRewriteProviderId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface font-code-md"
                  >
                    {activeSettings.providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Right Columns: Current Provider Config Editor */}
            {currentProvider && (
              <div className="md:col-span-2 space-y-4 bg-surface-container-low border border-surface-container-highest rounded p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
                  <h3 className="text-sm font-semibold text-on-surface flex items-center space-x-2 font-headline-sm">
                    <Sparkles className="w-4 h-4 text-primary-container" />
                    <span>Configure: {currentProvider.name}</span>
                  </h3>

                  {/* Presets dropdown */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-outline hidden sm:inline font-label-sm">Presets:</span>
                    <select
                      onChange={(e) => applyPreset(e.target.value as any)}
                      defaultValue=""
                      className="px-2.5 py-1 bg-surface-container-lowest border border-surface-container-highest rounded text-[11px] text-tertiary focus:outline-none font-code-sm"
                    >
                      <option value="" disabled>Select Preset...</option>
                      <option value="openrouter">OpenRouter (Free Models)</option>
                      <option value="nous">Nous Research</option>
                      <option value="mistral">Mistral AI</option>
                      <option value="opencode">OpenCode</option>
                      <option value="ollama">Ollama (Local)</option>
                      <option value="gemini">Google Gemini (OpenAI Proxy)</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-outline mb-1 font-label-sm">Provider Label</label>
                    <input
                      type="text"
                      value={currentProvider.name}
                      onChange={(e) => handleUpdateProvider({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-md"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-outline mb-1 font-label-sm">API Type</label>
                    <select
                      value={currentProvider.type}
                      onChange={(e) => handleUpdateProvider({ type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-md"
                    >
                      <option value="openai">OpenAI Compatible (/chat/completions)</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-outline font-label-sm">API Base URL</label>
                  <input
                    type="text"
                    value={currentProvider.baseUrl}
                    onChange={(e) => handleUpdateProvider({ baseUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-md"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-outline font-label-sm">API Key</label>
                    {currentProvider.type === 'openrouter' && (
                      <a 
                        href="https://openrouter.ai/keys" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-primary-container hover:underline flex items-center space-x-1"
                      >
                        <span>Get Free OpenRouter Key</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={currentProvider.apiKey}
                    onChange={(e) => handleUpdateProvider({ apiKey: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-outline font-label-sm">Model ID / Name</label>
                      <button
                        type="button"
                        onClick={handleFetchModels}
                        disabled={isFetchingModels}
                        className="text-[10px] text-tertiary hover:underline flex items-center space-x-1"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
                        <span>Fetch Models</span>
                      </button>
                    </div>
                    {fetchedModels.length > 0 ? (
                      <select
                        value={currentProvider.model}
                        onChange={(e) => handleUpdateProvider({ model: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface font-code-md"
                      >
                        {fetchedModels.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentProvider.model}
                        onChange={(e) => handleUpdateProvider({ model: e.target.value })}
                        placeholder="e.g. google/gemini-2.5-flash:free"
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-md"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-outline font-label-sm">Max Tokens</label>
                    <input
                      type="number"
                      value={currentProvider.maxTokens}
                      onChange={(e) => handleUpdateProvider({ maxTokens: parseInt(e.target.value) || 4096 })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-md"
                    />
                  </div>
                </div>

                {/* Test Connection Button & Result */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="w-full sm:w-auto px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-bold transition-all flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing connection...' : 'Test Connection'}</span>
                  </button>

                  {testResult && (
                    <div className={`text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 ${
                      testResult.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
                    }`}>
                      {testResult.success ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                      <span className="font-code-sm">{testResult.message}</span>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Import / Export Settings */}
          <div className="pt-6 border-t border-surface-container-highest flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleExportSettings}
                className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <label className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
              </label>

              <label className="flex items-center space-x-2 text-xs text-outline cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeKeysInExport} 
                  onChange={(e) => setIncludeKeysInExport(e.target.checked)}
                  className="rounded border-surface-container-highest bg-surface-container text-primary-container focus:ring-0"
                />
                <span>Include API keys in export</span>
              </label>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-bold shadow-sm transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
