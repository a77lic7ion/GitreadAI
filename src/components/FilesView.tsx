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
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1 font-label-sm">
            <FolderPlus className="w-4 h-4" />
            <span>Community Files & Templates</span>
          </div>
          <h2 className="text-xl font-normal text-on-surface font-headline-lg">Generate Essential Repository Standards</h2>
          <p className="text-on-surface-variant text-xs mt-1 font-body-md">
            Detect missing files in <code className="text-tertiary font-code-sm">{metadata.owner}/{metadata.repo}</code> and instantly download professional licenses, contributing guidelines, and issue templates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadAllZip}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>Download All as ZIP</span>
        </button>
      </div>

      {/* Grid: File Sidebar & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar file list */}
        <div className="lg:col-span-4 bg-surface-container-low border border-surface-container-highest rounded-lg p-4 space-y-2 shadow-sm">
          <span className="text-xs uppercase font-semibold text-outline tracking-wider px-2 font-label-sm">Generated Standards ({fileDrafts.length})</span>
          <div className="space-y-1 pt-1">
            {fileDrafts.map(draft => (
              <button
                key={draft.path}
                type="button"
                onClick={() => setSelectedPath(draft.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-left text-xs transition-all font-code-sm ${
                  selectedPath === draft.path
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-surface-container-highest'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{draft.path}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-outline shrink-0">
                  {draft.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor / Preview Area */}
        <div className="lg:col-span-8 bg-surface-container-low border border-surface-container-highest rounded-lg shadow-sm overflow-hidden flex flex-col">
          
          <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between border-b border-surface-container-highest">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary-container" />
              <span className="font-code-sm text-code-sm font-bold text-on-surface">{currentDraft?.path}</span>
              <span className="text-[10px] text-outline font-label-sm">({currentDraft?.description})</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSaveDraftContent}
                className="px-3 py-1.5 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(editingContent, currentDraft.path)}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                {copiedPath === currentDraft.path ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-outline" />}
                <span>{copiedPath === currentDraft.path ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFile(currentDraft)}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest">
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full h-[450px] bg-surface-container-low border border-surface-container-highest rounded p-4 font-code-md text-code-md text-on-surface focus:outline-none focus:border-primary-container leading-relaxed resize-none"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
