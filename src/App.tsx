import React, { useState } from 'react';
import {
  Smartphone,
  FolderTree,
  BookOpen,
  Terminal,
  Download,
  ExternalLink,
  HardDrive,
  Database,
  Radio,
  Wifi,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DeviceSimulator } from './components/DeviceSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { CachingRulesDoc } from './components/CachingRulesDoc';
import { BuildGuide } from './components/BuildGuide';
import { generateAndDownloadProjectZip } from './utils/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'rules' | 'guide'>('simulator');
  const [selectedFileId, setSelectedFileId] = useState<string>('main-activity');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectCodeFromSimulator = (fileId: string) => {
    setSelectedFileId(fileId);
    setActiveTab('code');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Single text element brand wordmark
        Zone 2: 4 single-line nav tabs
        Zone 3: 1 primary action button
      */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="text-left cursor-pointer focus:outline-hidden"
            >
              <span className="text-base font-bold tracking-tight text-white font-ethiopic whitespace-nowrap block">
                ባ.ሞ.ማ መተግበሪያ
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight block">
                Android WebView Kotlin Wrapper
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-Line) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Device Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project Source Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Caching Architecture</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              <span>Build APK Guide</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Exporting...' : 'Download Project (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Tab Strip (<md screens) */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-around text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'simulator' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
          }`}
        >
          Simulator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'code' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Kotlin Code
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'rules' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
          }`}
        >
          Rules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'guide' ? 'bg-slate-800 text-violet-400' : 'text-slate-400'
          }`}
        >
          Build Guide
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Editorial Subheader with Target URL & Key Metadata */}
        <section className="p-6 rounded-3xl bg-radial from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="text-sky-400 font-mono font-medium">Android 14 & 15 Ready</span>
                <span aria-hidden="true">·</span>
                <span>Kotlin 2.0</span>
                <span aria-hidden="true">·</span>
                <span className="font-ethiopic text-slate-300">ባ.ሞ.ማ መተግበሪያ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Offline-First Android Web Wrapper
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Native Kotlin application with advanced WebView caching rules, dynamic network-based cache mode, dedicated AppCache path, and graceful offline error fallbacks.
              </p>
            </div>

            {/* Quick target URL card */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800/50 flex items-center justify-center text-sky-400 shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  Configured Target Website
                </div>
                <a
                  href="https://bmarail-production.up.railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors flex items-center gap-1 font-mono"
                >
                  <span>bmarail-production.up.railway.app</span>
                </a>
              </div>
            </div>
          </div>

          {/* 4 Rule Chips Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">DOM Storage & DB</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Dedicated AppCache Path</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Network Cache Mode</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate">Modern Connectivity Helper</span>
            </div>
          </div>
        </section>

        {/* View Switcher Container */}
        {activeTab === 'simulator' && (
          <DeviceSimulator onSelectCodeTab={handleSelectCodeFromSimulator} />
        )}

        {activeTab === 'code' && (
          <CodeExplorer
            selectedFileId={selectedFileId}
            onSelectFile={(id) => setSelectedFileId(id)}
          />
        )}

        {activeTab === 'rules' && <CachingRulesDoc />}

        {activeTab === 'guide' && <BuildGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 font-ethiopic">ባ.ሞ.ማ መተግበሪያ</span>
            <span>·</span>
            <span>bmarail-production.up.railway.app</span>
          </div>
          <div>
            Built with modern Android Kotlin, AndroidX, and WebSettings Cache Mode standards.
          </div>
        </div>
      </footer>
    </div>
  );
}
