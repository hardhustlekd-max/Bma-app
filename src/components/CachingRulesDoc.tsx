import React, { useState } from 'react';
import {
  Database,
  HardDrive,
  Radio,
  AlertTriangle,
  Wifi,
  Copy,
  Check,
  CheckCircle2,
  Code2
} from 'lucide-react';

interface RuleCardProps {
  number: string;
  title: string;
  titleAmharic?: string;
  badge: string;
  description: string;
  codeSnippet: string;
  icon: React.ReactNode;
  benefits: string[];
}

const RuleCard: React.FC<RuleCardProps> = ({
  number,
  title,
  titleAmharic,
  badge,
  description,
  codeSnippet,
  icon,
  benefits
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sky-400 shrink-0">
              {icon}
            </div>
            <div>
              <div className="text-[11px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                {number} · {badge}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              {titleAmharic && (
                <div className="text-xs text-slate-400 font-ethiopic mt-0.5">
                  {titleAmharic}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {description}
        </p>

        {/* Benefits list */}
        <div className="space-y-1.5 mb-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden mt-2">
        <div className="px-3.5 py-1.5 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-slate-300">Kotlin Implementation</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-3 text-[11px] font-mono-code text-slate-200 overflow-x-auto leading-relaxed">
          {codeSnippet}
        </pre>
      </div>
    </div>
  );
};

export const CachingRulesDoc: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Overview intro */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-ethiopic">
          <span>የባ.ሞ.ማ መተግበሪያ የኦፍላይን ኬሺንግ አሰራር</span>
          <span className="text-sm font-sans font-normal text-slate-400">
            (Offline Caching Architecture Specifications)
          </span>
        </h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
          To ensure seamless user experience on modern Android devices, the application implements the four core WebView caching rules along with a modern <code className="text-sky-300 font-mono">ConnectivityManager</code> + <code className="text-sky-300 font-mono">NetworkCapabilities</code> connectivity observer.
        </p>
      </div>

      {/* Grid of 4 requested rules + 1 helper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 1 */}
        <RuleCard
          number="Rule 1"
          badge="Storage APIs"
          title="Enable DOM Storage and Database"
          titleAmharic="የDOM ማከማቻ እና ዳታቤዝ ማንቃት"
          icon={<Database className="w-5 h-5 text-emerald-400" />}
          description="Enables modern HTML5 web client storage systems including localStorage, sessionStorage, and IndexedDB so the website can persist user state and data offline."
          benefits={[
            'Permits client-side state caching in localStorage and sessionStorage',
            'Enables IndexedDB for offline transactions & structured data',
            'Ensures single-page apps (SPAs) maintain session tokens without network roundtrips'
          ]}
          codeSnippet={`// Rule 1: Enable DOM Storage and Database
webView.settings.apply {
    domStorageEnabled = true
    databaseEnabled = true
    javaScriptEnabled = true
}`}
        />

        {/* Rule 2 */}
        <RuleCard
          number="Rule 2"
          badge="Cache Directory"
          title="Configure Dedicated AppCache / Cache Path"
          titleAmharic="የመተግበሪያ ኬሽ ማውጫን ማዘጋጀት"
          icon={<HardDrive className="w-5 h-5 text-sky-400" />}
          description="Sets a dedicated application cache path using cacheDir.path, ensuring web assets, stylesheets, scripts, and media are safely stored in the app's private internal storage."
          benefits={[
            'Keeps offline cached files isolated in internal private storage',
            'Prevents Android OS from clearing active cache during minor memory pressure',
            'Guarantees instant local file retrieval even after app restart'
          ]}
          codeSnippet={`// Rule 2: Configure AppCache Path using cacheDir.path
val appCacheDir = File(cacheDir, "bmarail_appcache")
if (!appCacheDir.exists()) {
    appCacheDir.mkdirs()
}

@Suppress("DEPRECATION")
webView.settings.apply {
    setAppCachePath(cacheDir.path)
    setAppCacheEnabled(true)
}`}
        />

        {/* Rule 3 */}
        <RuleCard
          number="Rule 3"
          badge="Network Cache Policy"
          title="Network-Based Cache Mode Switching"
          titleAmharic="በኔትወርክ ሁኔታ ላይ የተመሰረተ የኬሽ ሁነታ"
          icon={<Radio className="w-5 h-5 text-amber-400" />}
          description="Dynamically checks whether the device has an active internet connection. If online, uses LOAD_DEFAULT to fetch updates; if offline, sets LOAD_CACHE_ELSE_NETWORK to load cached assets."
          benefits={[
            'Online -> WebSettings.LOAD_DEFAULT (updates assets, uses standard HTTP caching)',
            'Offline -> WebSettings.LOAD_CACHE_ELSE_NETWORK (loads cached copy without failing)',
            'Eliminates blank screens when traveling or in low-signal railway corridors'
          ]}
          codeSnippet={`// Rule 3: Network-Based Cache Mode
val isOnline = NetworkUtils.isNetworkAvailable(context)

webView.settings.cacheMode = if (isOnline) {
    WebSettings.LOAD_DEFAULT
} else {
    WebSettings.LOAD_CACHE_ELSE_NETWORK
}`}
        />

        {/* Rule 4 */}
        <RuleCard
          number="Rule 4"
          badge="Error Handling"
          title="Graceful onReceivedError Override"
          titleAmharic="ስህተት ሲያጋጥም የሚቀርብ ተስማሚ መልዕክት"
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          description="Standard WebViewClient override for onReceivedError to gracefully handle cases where a page has never been cached and the user is currently offline."
          benefits={[
            'Catches ERR_INTERNET_DISCONNECTED and uncached page navigation',
            'Displays bilingual Amharic & English prompt with working retry button',
            'Prevents ugly Chromium "Web page not available" default error screens'
          ]}
          codeSnippet={`// Rule 4: Error Handling with onReceivedError override
webView.webViewClient = object : WebViewClient() {
    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            // Show custom Amharic/English retry layout
            showOfflineFallbackView()
        }
    }
}`}
        />
      </div>

      {/* Network Helper Feature Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950/30 border border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
              Modern Helper Utility
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              ConnectivityManager & NetworkCapabilities Helper
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4 max-w-3xl">
          Replaces deprecated <code className="text-slate-400 font-mono">NetworkInfo.isConnected</code> with modern Android 14+ <code className="text-sky-300 font-mono">NetworkCapabilities.NET_CAPABILITY_INTERNET</code> checking across Wi-Fi, Cellular, Ethernet, and VPN transports.
        </p>

        <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
          <pre className="p-4 text-xs font-mono-code text-slate-200 overflow-x-auto leading-relaxed">
{`fun isNetworkAvailable(context: Context): Boolean {
    val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
        ?: return false

    val activeNetwork = connectivityManager.activeNetwork ?: return false
    val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return false

    return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
            (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
             capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
             capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ||
             capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN))
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
