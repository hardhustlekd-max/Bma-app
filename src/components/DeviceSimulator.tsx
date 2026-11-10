import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RotateCw,
  HardDrive,
  Database,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowLeft
} from 'lucide-react';

interface DeviceSimulatorProps {
  onSelectCodeTab?: (fileId: string) => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ onSelectCodeTab }) => {
  const [networkMode, setNetworkMode] = useState<'online' | 'offline_cached' | 'offline_uncached'>('online');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadTime, setLoadTime] = useState<number>(0.42);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const TARGET_URL = 'https://bmarail-production.up.railway.app';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const start = performance.now();
    setTimeout(() => {
      setIsLoading(false);
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      setLoadTime(parseFloat(elapsed));
      setRefreshCount((prev) => prev + 1);
      if (networkMode === 'online') {
        showToast('WebView reloaded using WebSettings.LOAD_DEFAULT');
      } else if (networkMode === 'offline_cached') {
        showToast('Loaded instantly from disk cache (LOAD_CACHE_ELSE_NETWORK)');
      } else {
        showToast('Triggered onReceivedError: Page not found in cache');
      }
    }, 600);
  };

  const handleNetworkChange = (mode: 'online' | 'offline_cached' | 'offline_uncached') => {
    setNetworkMode(mode);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'online') {
        showToast('Online: cacheMode set to LOAD_DEFAULT');
      } else if (mode === 'offline_cached') {
        showToast('Offline: cacheMode switched to LOAD_CACHE_ELSE_NETWORK');
      } else {
        showToast('Simulating onReceivedError: Network unreachable & uncached');
      }
    }, 450);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive Mobile Device Frame */}
      <div className="lg:col-span-6 flex flex-col items-center">
        {/* Device Container */}
        <div className="w-full max-w-[390px] rounded-[48px] bg-slate-900 p-3.5 shadow-2xl shadow-cyan-950/40 border-4 border-slate-700/70 relative">
          {/* Hardware Speaker Ear-piece & Front Camera Punch Hole */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center justify-center z-30 pointer-events-none">
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 mr-2" />
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>

          {/* Screen Bezel */}
          <div className="w-full h-[720px] bg-slate-950 rounded-[38px] overflow-hidden flex flex-col relative border border-slate-800/80">
            {/* Native Android Status Bar */}
            <div className="h-10 bg-slate-900/90 backdrop-blur px-5 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-300 z-20 shrink-0 select-none">
              <span>09:41</span>
              <div className="flex items-center gap-2">
                {networkMode === 'online' ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-[10px]">LTE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Offline</span>
                  </span>
                )}
                <div className="w-5 h-2.5 border border-slate-400 rounded-xs flex items-center p-0.5">
                  <div className="w-3.5 h-1.5 bg-emerald-400 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Native Android Action Bar / Top Toolbar */}
            <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-white z-20 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (canGoBack) setCanGoBack(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canGoBack ? 'text-white hover:bg-slate-800' : 'text-slate-600 cursor-default'
                  }`}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-sm font-semibold tracking-wide font-ethiopic text-slate-100 flex items-center gap-2">
                    <span>ባ.ሞ.ማ መተግበሪያ</span>
                    <span className="text-[10px] text-sky-400 font-mono font-normal">v1.0</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                    bmarail-production.up.railway.app
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-transform"
                  title="Reload WebView (Swipe-to-Refresh simulation)"
                  aria-label="Refresh"
                >
                  <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* WebView Loading Progress Bar (ConstraintLayout ProgressBar) */}
            <div className="h-1 bg-slate-800 w-full overflow-hidden z-20">
              {isLoading && (
                <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 w-full animate-pulse" />
              )}
            </div>

            {/* Active Cache Mode Pill Overlay inside Simulator */}
            <div className="absolute top-26 left-3 right-3 z-10 pointer-events-none flex items-center justify-between">
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium backdrop-blur-md shadow-md border flex items-center gap-1.5 ${
                  networkMode === 'online'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                    : networkMode === 'offline_cached'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                    : 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>
                  {networkMode === 'online'
                    ? 'LOAD_DEFAULT (Network Active)'
                    : networkMode === 'offline_cached'
                    ? 'LOAD_CACHE_ELSE_NETWORK (Offline Cached)'
                    : 'onReceivedError Fallback'}
                </span>
              </div>
            </div>

            {/* Simulated WebView Content Canvas */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
              {networkMode === 'offline_uncached' ? (
                /* Native Offline Fallback View (Exact Kotlin onReceivedError screen) */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950 z-10 animate-in fade-in duration-200">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-5 shadow-lg shadow-sky-950/40">
                    <WifiOff className="w-10 h-10" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 font-ethiopic mb-2">
                    ግንኙነት አልተገኘም
                  </h3>
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    (No Active Connection)
                  </p>

                  <p className="text-xs text-slate-400 font-ethiopic leading-relaxed max-w-xs mb-3">
                    ይህ ገጽ በስልክዎ ማህደረ-ትውስታ ውስጥ አልተቀመጠም። እባክዎ የኢንተርኔት ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal max-w-xs mb-6">
                    This page is not cached on disk. Please reconnect to Wi-Fi or Mobile Data to view and cache it.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      handleNetworkChange('online');
                      handleRefresh();
                    }}
                    className="h-11 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold font-ethiopic flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>እንደገና ይሞክሩ (Try Again)</span>
                  </button>

                  <div className="mt-8 text-[10px] font-mono text-slate-600">
                    WebViewClient.onReceivedError() • ERROR_CONNECT
                  </div>
                </div>
              ) : (
                /* Active WebView (Live iframe or cached rendering simulation) */
                <div className="w-full h-full relative flex flex-col">
                  {/* Real webview frame */}
                  <iframe
                    key={`${networkMode}-${refreshCount}`}
                    src={TARGET_URL}
                    title="BMA Rail WebView"
                    className="w-full h-full border-none bg-slate-950"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    loading="eager"
                  />

                  {/* Offline banner badge when in offline cached mode */}
                  {networkMode === 'offline_cached' && (
                    <div className="absolute bottom-2 left-3 right-3 bg-slate-900/95 backdrop-blur border border-amber-500/40 p-2.5 rounded-xl shadow-xl flex items-center justify-between text-xs text-amber-200 pointer-events-auto">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-[11px]">ከማህደረ-ትውስታ ተጭኗል (Offline Cache)</div>
                          <div className="text-[10px] text-slate-400">Serving assets from cacheDir.path</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                        OFFLINE
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* In-app Toast message simulation */}
            {toastMessage && (
              <div className="absolute bottom-14 left-4 right-4 z-40 bg-slate-900/95 border border-slate-700 text-slate-200 text-[11px] py-2 px-3 rounded-lg shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-150">
                <span>{toastMessage}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
            )}

            {/* Native Android Gesture Navigation Bar */}
            <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 z-20">
              <div className="w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Device Footer Note */}
        <p className="text-xs text-slate-400 text-center mt-4">
          Simulating Android 14+ WebView with Kotlin <code className="text-sky-300">LOAD_CACHE_ELSE_NETWORK</code> logic.
        </p>
      </div>

      {/* Right Column: Interactive Cache & Network Test Deck */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* Network State Controller */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                Network Connectivity Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Toggle network state to observe dynamic <code className="text-sky-300">WebSettings.cacheMode</code> switching.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                Latency: {loadTime}s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleNetworkChange('online')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                networkMode === 'online'
                  ? 'bg-sky-500/10 border-sky-500/60 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-emerald-400">
                <Wifi className="w-4 h-4" />
                Online
              </div>
              <div className="text-[11px] font-mono text-slate-300">LOAD_DEFAULT</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Updates assets from server & updates disk cache.
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNetworkChange('offline_cached')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                networkMode === 'offline_cached'
                  ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-amber-400">
                <HardDrive className="w-4 h-4" />
                Offline (Cached)
              </div>
              <div className="text-[11px] font-mono text-slate-300">LOAD_CACHE_ELSE_NETWORK</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Forces WebView to load stored cache without failing.
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNetworkChange('offline_uncached')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                networkMode === 'offline_uncached'
                  ? 'bg-rose-500/10 border-rose-500/60 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                Uncached Fallback
              </div>
              <div className="text-[11px] font-mono text-slate-300">onReceivedError</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Triggers native Amharic error screen with retry.
              </div>
            </button>
          </div>
        </div>

        {/* WebView Configuration Inspector */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Runtime WebView Settings Inspector
            </h3>
            {onSelectCodeTab && (
              <button
                type="button"
                onClick={() => onSelectCodeTab('main-activity')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>View MainActivity.kt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Setting 1: DOM Storage */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-200">settings.domStorageEnabled = true</div>
                  <div className="text-[11px] text-slate-400">LocalStorage & SessionStorage enabled</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                ACTIVE
              </span>
            </div>

            {/* Setting 2: Database Enabled */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-200">settings.databaseEnabled = true</div>
                  <div className="text-[11px] text-slate-400">Web SQL & IndexedDB persistence active</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                ACTIVE
              </span>
            </div>

            {/* Setting 3: Cache Path */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-200">settings.setAppCachePath(cacheDir.path)</div>
                  <div className="text-[11px] text-slate-400">
                    Dedicated folder: <code className="text-sky-300">/data/data/com.bmarail.app/cache/bmarail_appcache</code>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/50">
                CONFIGURED
              </span>
            </div>

            {/* Setting 4: Dynamic Cache Mode */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-200">
                    settings.cacheMode = {networkMode === 'online' ? 'LOAD_DEFAULT' : 'LOAD_CACHE_ELSE_NETWORK'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {networkMode === 'online'
                      ? 'Revalidates assets from network; updates cache'
                      : 'Forces local cache load; bypasses network error'}
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  networkMode === 'online'
                    ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50'
                    : 'text-amber-400 bg-amber-950/50 border-amber-800/50'
                }`}
              >
                {networkMode === 'online' ? 'ONLINE_MODE' : 'OFFLINE_MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Target URL verification box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Target Website Endpoint</div>
            <a
              href={TARGET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 mt-0.5"
            >
              <span>{TARGET_URL}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
              SSL / HTTPS Secured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
