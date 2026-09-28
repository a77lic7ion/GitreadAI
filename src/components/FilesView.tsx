import React, { useState } from 'react';
import { 
  FolderPlus, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  Package 
} from 'lucide-react';
import { RepoMetadata, CommunityFileDraft } from '../types';
import JSZip from 'jszip';

interface FilesViewProps {
  metadata: RepoMetadata;
  fileDrafts: CommunityFileDraft[];
  setFileDrafts: React.Dispatch<React.SetStateAction<CommunityFileDraft[]>>;
}

export const FilesView: React.FC<FilesViewProps> = ({
  metadata,
  fileDrafts,
  setFileDrafts,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(fileDrafts[0]?.path || '');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  const currentDraft = fileDrafts.find(f => f.path === selectedPath) || fileDrafts[0];

  React.useEffect(() => {
    if (currentDraft) {
      setEditingContent(currentDraft.content);
    }
  }, [selectedPath, currentDraft]);

  const handleCopy = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownloadFile = (draft: CommunityFileDraft) => {
    const blob = new Blob([draft.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Handle path slashes for download name
    const filename = draft.path.split('/').pop() || draft.path;
    a.download = filename;
    a.click();
  };

  const handleSaveDraftContent = () => {
    const updated = fileDrafts.map(f => 
      f.path === selectedPath ? { ...f, content: editingContent } : f
    );
    setFileDrafts(updated);
    alert(`Saved changes to ${selectedPath}`);
  };

  const handleDownloadAllZip = async () => {
    const zip = new JSZip();
    for (const draft of fileDrafts) {
      zip.file(draft.path, draft.content);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.repo}-community-files.zip`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FolderPlus className="w-4 h-4" />
            <span>Community Files & Templates</span>
          </div>
          <h2 className="text-xl font-bold text-white">Generate Essential Repository Standards</h2>
          <p className="text-slate-400 text-xs mt-1">
            Detect missing files in <code className="text-indigo-300">{metadata.owner}/{metadata.repo}</code> and instantly download professional licenses, contributing guidelines, and issue templates.
          </p>
        </div>

        <button
          onClick={handleDownloadAllZip}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>Download All as ZIP</span>
        </button>
      </div>

      {/* Files Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Files List */}
        <div className="space-y-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl h-fit">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-2 mb-2">
            Repository Files
          </span>

          <div className="space-y-1.5">
            {fileDrafts.map(draft => {
              const isSelected = draft.path === selectedPath;
              return (
                <div
                  key={draft.path}
                  onClick={() => setSelectedPath(draft.path)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-semibold truncate">{draft.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{draft.path}</div>
                  </div>

                  {draft.existsInRepo ? (
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Exists</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      <span>Missing</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: File Preview & Editor */}
        {currentDraft && (
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">{currentDraft.path}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentDraft.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(currentDraft.content, currentDraft.path)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
                >
                  {copiedPath === currentDraft.path ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedPath === currentDraft.path ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownloadFile(currentDraft)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Editable Content */}
            <div className="space-y-3">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={18}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveDraftContent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/25"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
