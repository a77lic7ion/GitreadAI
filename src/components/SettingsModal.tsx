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
      alert('You must keep at least one LLM provider.');
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
      name = 'OpenCode';
      baseUrl = 'https://api.opencode.ai/v1';
      model = 'opencode-coder';
      type = 'openai';
    } else if (presetType === 'ollama') {
      name = 'Ollama (Local)';
      baseUrl = 'http://localhost:11434/v1';
      model = 'llama3:8b';
      type = 'ollama';
    } else if (presetType === 'openai') {
      name = 'OpenAI';
      baseUrl = 'https://api.openai.com/v1';
      model = 'gpt-4o';
      type = 'openai';
    } else if (presetType === 'anthropic') {
      name = 'Anthropic Direct';
      baseUrl = 'https://api.anthropic.com/v1';
      model = 'claude-3-5-sonnet-20241022';
      type = 'anthropic';
    } else if (presetType === 'gemini') {
      name = 'Google Gemini (OpenAI Proxy)';
      baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/';
      model = 'gemini-2.5-flash';
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
      setTestResult({ success: res.success, message: res.message });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFetchModelsAction = async () => {
    if (!currentProvider) return;
    setIsFetchingModels(true);
    try {
      const models = await fetchProviderModels(currentProvider);
      if (models.length > 0) {
        setFetchedModels(models);
        alert(`Successfully fetched ${models.length} models! Select one from the model dropdown.`);
        handleUpdateProvider({ model: models[0] });
      } else {
        alert('No models returned from provider endpoint.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleExportSettings = () => {
    const exportData = {
      ...activeSettings,
      providers: activeSettings.providers.map(p => ({
        ...p,
        apiKey: includeKeysInExport ? p.apiKey : (p.apiKey ? '***REDACTED***' : '')
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'readme-forge-settings.json';
    a.click();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">LLM Provider & Settings Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Security Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-amber-200 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Client-Side Storage Notice</span>
              API keys are stored exclusively in your browser's <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">localStorage</code> and sent directly to your configured LLM endpoints. They never pass through any backend server.
            </div>
          </div>

          {/* GitHub Token & Global Prefs */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>GitHub API Token (Optional)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Increases rate limits from 60 req/hr to 5,000 req/hr when fetching repository details and raw content.
            </p>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={activeSettings.githubToken}
              onChange={(e) => setActiveSettings({ ...activeSettings, githubToken: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Providers List & Editor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Providers List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Providers</span>
                <button
                  onClick={handleAddProvider}
                  className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-colors"
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
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-semibold truncate">{prov.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{prov.model}</div>
                      </div>
                      {activeSettings.providers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProvider(prov.id);
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Role Assignment */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role Routing</span>
                
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Analysis Provider</label>
                  <select
                    value={activeSettings.activeAnalysisProviderId}
                    onChange={(e) => setActiveSettings({ ...activeSettings, activeAnalysisProviderId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    {activeSettings.providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.model})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rewrite Provider</label>
                  <select
                    value={activeSettings.activeRewriteProviderId}
                    onChange={(e) => setActiveSettings({ ...activeSettings, activeRewriteProviderId: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
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
              <div className="md:col-span-2 space-y-4 bg-slate-950/50 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Configure: {currentProvider.name}</span>
                  </h3>

                  {/* Presets dropdown */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Presets:</span>
                    <select
                      onChange={(e) => applyPreset(e.target.value as any)}
                      defaultValue=""
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-indigo-300 focus:outline-none"
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">Provider Label</label>
                    <input
                      type="text"
                      value={currentProvider.name}
                      onChange={(e) => handleUpdateProvider({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">API Type</label>
                    <select
                      value={currentProvider.type}
                      onChange={(e) => handleUpdateProvider({ type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="openai">OpenAI Compatible (/chat/completions)</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="anthropic">Anthropic (/messages)</option>
                      <option value="ollama">Ollama Local</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Base URL Endpoint</label>
                  <input
                    type="text"
                    value={currentProvider.baseUrl}
                    onChange={(e) => handleUpdateProvider({ baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">API Key / Secret</label>
                  <input
                    type="password"
                    value={currentProvider.apiKey}
                    onChange={(e) => handleUpdateProvider({ apiKey: e.target.value })}
                    placeholder="sk-... (leave blank for local Ollama)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">Model Selection</label>
                    <button
                      onClick={handleFetchModelsAction}
                      disabled={isFetchingModels}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? 'Fetching...' : 'Fetch Models'}</span>
                    </button>
                  </div>

                  {fetchedModels.length > 0 ? (
                    <select
                      value={currentProvider.model}
                      onChange={(e) => handleUpdateProvider({ model: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-indigo-300 focus:outline-none"
                    >
                      {fetchedModels.map(m => (
                        <option key={m} value={m}>{m} {m.endsWith(':free') ? '✨ [FREE]' : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentProvider.model}
                      onChange={(e) => handleUpdateProvider({ model: e.target.value })}
                      placeholder="e.g. google/gemini-2.5-flash:free or NousResearch/Hermes-3-Llama-3.1-70B"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  <p className="text-[10px] text-slate-400">
                    {currentProvider.type === 'openrouter' || currentProvider.baseUrl.includes('openrouter.ai')
                      ? 'Showing free OpenRouter models.'
                      : 'Type model name or click "Fetch Models" to load available models from endpoint.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Temperature ({currentProvider.temperature})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={currentProvider.temperature}
                      onChange={(e) => handleUpdateProvider({ temperature: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Max Tokens</label>
                    <input
                      type="number"
                      value={currentProvider.maxTokens}
                      onChange={(e) => handleUpdateProvider({ maxTokens: parseInt(e.target.value) || 4096 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Test Connection Button & Result */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>

                  {testResult && (
                    <div className={`text-xs p-2.5 rounded-xl border ${
                      testResult.success 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                    } flex-1 truncate`}>
                      {testResult.message}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Export / Import Settings */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportSettings}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Settings</span>
              </button>
              
              <label className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import Settings</span>
                <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeKeysInExport}
                  onChange={(e) => setIncludeKeysInExport(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>Include API keys in export</span>
              </label>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
