import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderTree,
  Terminal,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { ANDROID_FILES, ProjectFile } from '../data/androidProjectFiles';
import { generateAndDownloadProjectZip } from '../utils/zipExporter';

interface CodeExplorerProps {
  selectedFileId?: string;
  onSelectFile?: (fileId: string) => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({
  selectedFileId = 'main-activity',
  onSelectFile
}) => {
  const [currentFileId, setCurrentFileId] = useState<string>(selectedFileId);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const activeFile = ANDROID_FILES.find((f) => f.id === currentFileId) || ANDROID_FILES[0];

  const handleSelect = (fileId: string) => {
    setCurrentFileId(fileId);
    if (onSelectFile) {
      onSelectFile(fileId);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadProjectZip();
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredFiles = ANDROID_FILES.filter((file) => {
    if (filterCategory === 'all') return true;
    return file.category === filterCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-sky-400" />
            Complete Android Studio Kotlin Project
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full production codebase structured for immediate import into Android Studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Generating ZIP...' : 'Download Project (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Code View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: File Tree & Category Selector */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                filterCategory === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({ANDROID_FILES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('core')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                filterCategory === 'core'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kotlin
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('res')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                filterCategory === 'res'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              XML
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('config')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                filterCategory === 'config'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gradle
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('ci')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                filterCategory === 'ci'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CI/CD
            </button>
          </div>

          {/* File List */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2 space-y-1 overflow-hidden">
            {filteredFiles.map((file) => {
              const isActive = file.id === currentFileId;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleSelect(file.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-sky-950/70 text-white border border-sky-800/60 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg mt-0.5 ${
                      file.language === 'kotlin'
                        ? 'bg-violet-950/80 text-violet-400'
                        : file.language === 'xml'
                        ? 'bg-amber-950/80 text-amber-400'
                        : file.language === 'gradle'
                        ? 'bg-emerald-950/80 text-emerald-400'
                        : file.language === 'yaml'
                        ? 'bg-rose-950/80 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold font-mono truncate text-slate-200">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {file.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Architecture Callout */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Key Implementation Anchors</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span><code className="text-slate-300">domStorageEnabled = true</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span><code className="text-slate-300">databaseEnabled = true</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span><code className="text-slate-300">setAppCachePath(cacheDir.path)</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><code className="text-slate-300">LOAD_DEFAULT</code> vs <code className="text-slate-300">LOAD_CACHE_ELSE_NETWORK</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span><code className="text-slate-300">onReceivedError</code> with Amharic fallback</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Code Editor & Viewer with Line Numbers */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          {/* File Tab Header */}
          <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-slate-200 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                {activeFile.path}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                {activeFile.language}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* File description banner */}
          <div className="px-5 py-2.5 bg-slate-900/50 border-b border-slate-800/60 text-xs text-slate-400">
            {activeFile.description}
          </div>

          {/* Syntax Highlighted Code Viewer with Line Numbers */}
          <div className="overflow-x-auto max-h-[620px] p-4 text-xs font-mono-code leading-relaxed bg-slate-950/90 select-text">
            <pre className="table w-full">
              {activeFile.code.split('\n').map((line, idx) => {
                const lineNum = idx + 1;
                // Highlight critical rule lines
                const isHighlight =
                  line.includes('domStorageEnabled = true') ||
                  line.includes('databaseEnabled = true') ||
                  line.includes('setAppCachePath(cacheDir.path)') ||
                  line.includes('LOAD_CACHE_ELSE_NETWORK') ||
                  line.includes('LOAD_DEFAULT') ||
                  line.includes('onReceivedError') ||
                  line.includes('NET_CAPABILITY_INTERNET');

                return (
                  <div
                    key={lineNum}
                    className={`table-row transition-colors ${
                      isHighlight ? 'bg-sky-950/50 text-sky-100 font-semibold' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="table-cell pr-4 text-right text-slate-600 select-none text-[11px] tabular-nums w-12">
                      {lineNum}
                    </span>
                    <span className="table-cell whitespace-pre text-slate-300">
                      {line}
                    </span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
