import React, { useState } from 'react';
import {
  Smartphone,
  Terminal,
  CheckCircle2,
  FolderOpen,
  Play,
  PackageCheck,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { generateAndDownloadProjectZip } from '../utils/zipExporter';

export const BuildGuide: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-sky-400 font-semibold uppercase tracking-wider mb-1">
            Build & Deployment
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-ethiopic">
            <span>የአንድሮይድ ስቱዲዮ ዝግጅት እና የAPK ግንባታ</span>
            <span className="text-sm font-sans font-normal text-slate-400">
              (Android Studio & APK Guide)
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Quick 4-step workflow to compile and install <strong className="text-white">ባ.ሞ.ማ መተግበሪያ</strong> on your Android phone or publish to Google Play.
          </p>
        </div>

        <button
          type="button"
          onClick={() => generateAndDownloadProjectZip()}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Download Ready-To-Build Project (.ZIP)</span>
        </button>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Extract & Open in Android Studio</h3>
                <div className="text-xs text-slate-400">Supports Android Studio Ladybug, Koala, Jellyfish</div>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>Click the <strong>Download Project (.ZIP)</strong> button to obtain the complete Gradle archive.</li>
              <li>Extract the ZIP file to your preferred workspace directory (e.g. <code className="text-sky-300">~/AndroidStudioProjects/bmarail-wrapper</code>).</li>
              <li>Launch <strong>Android Studio</strong> and click <strong>File &gt; Open</strong>.</li>
              <li>Select the extracted folder and click <strong>OK</strong>.</li>
            </ol>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Android Studio will automatically detect the Gradle 8.7 wrapper and sync dependencies.</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Run on Physical Phone or Emulator</h3>
                <div className="text-xs text-slate-400">Direct testing with instant hot reload</div>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>Enable <strong>Developer Options</strong> and <strong>USB Debugging</strong> on your Android phone.</li>
              <li>Connect your device via USB cable (or start a Virtual Device in Device Manager).</li>
              <li>In Android Studio's top toolbar, choose your device in the dropdown menu.</li>
              <li>Click the green <strong>Run 'app' (Shift + F10)</strong> button.</li>
            </ol>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>The app installs and immediately loads https://bmarail-production.up.railway.app.</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CLI Build Command (Terminal)</h3>
                <div className="text-xs text-slate-400">Build without opening the Android Studio GUI</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              You can assemble Debug or Release APKs directly from your terminal using Gradle wrapper:
            </p>

            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-2">
              <div className="px-3 py-1 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                <span>Terminal (macOS/Linux)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('./gradlew assembleDebug', 'cmd-debug')}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {copiedCmd === 'cmd-debug' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-debug' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 text-xs font-mono text-emerald-300 overflow-x-auto">
                ./gradlew assembleDebug
              </pre>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="px-3 py-1 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                <span>Windows PowerShell</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('.\\gradlew.bat assembleDebug', 'cmd-win')}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {copiedCmd === 'cmd-win' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-win' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 text-xs font-mono text-emerald-300 overflow-x-auto">
                .\gradlew.bat assembleDebug
              </pre>
            </div>
          </div>

          <div className="mt-4 text-[11px] font-mono text-slate-400">
            Output APK: <code className="text-sky-300">app/build/outputs/apk/debug/app-debug.apk</code>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-950 border border-violet-800/60 flex items-center justify-center text-violet-400 font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Verify Offline Caching on Device</h3>
                <div className="text-xs text-slate-400">Testing real-world offline reliability</div>
              </div>
            </div>

            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>Launch the installed <strong>ባ.ሞ.ማ መተግበሪያ</strong> while connected to Wi-Fi.</li>
              <li>Browse around the website so all key pages and assets are saved to <code className="text-sky-300">cacheDir.path</code>.</li>
              <li>Swipe down phone quick settings and enable <strong>Airplane Mode</strong> (Turn Wi-Fi & Cellular OFF).</li>
              <li>Close and relaunch the application: notice how it instantly loads using <code className="text-amber-300">LOAD_CACHE_ELSE_NETWORK</code>!</li>
            </ol>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>If you navigate to a page that was never loaded, the graceful Amharic offline screen displays.</span>
          </div>
        </div>
      </div>

      {/* GitHub Actions CI/CD Automatic Build Section */}
      <div className="p-6 rounded-3xl bg-radial from-slate-900 to-sky-950/40 border border-sky-800/60 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-950 border border-sky-700/80 flex items-center justify-center text-sky-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                Preconfigured CI/CD Pipeline
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-ethiopic">
                <span>በGitHub Actions አማካኝነት APK በራስ-ሰር መገንባት</span>
                <span className="text-xs font-sans font-normal text-slate-400">
                  (Push to GitHub & Auto-Build APK)
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>.github/workflows/build-apk.yml Active</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          The project is already preconfigured with a GitHub Action. Every time you push to <code className="text-sky-300 font-mono">main</code> or <code className="text-sky-300 font-mono">master</code>, GitHub's Ubuntu runners will automatically launch JDK 17, make <code className="text-sky-300 font-mono">gradlew</code> executable, compile <strong className="text-white">ባ.ሞ.ማ መተግበሪያ</strong>, and publish the compiled <code className="text-emerald-400 font-mono">bmarail-app-debug-apk</code> as a downloadable artifact!
        </p>

        {/* 3 Step Push Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-sky-900/80 text-sky-300 text-[10px] flex items-center justify-center font-mono">
                  1
                </span>
                Create GitHub Repo
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">github.com/new</a> and create a new public or private repository (e.g. <code className="text-slate-300">bmarail-android-app</code>). Do not initialize with README.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-sky-900/80 text-sky-300 text-[10px] flex items-center justify-center font-mono">
                  2
                </span>
                Push Code to GitHub
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Link your repository and push. The initial commit with the Android project and GitHub Action is already created for you in this workspace!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-sky-900/80 text-sky-300 text-[10px] flex items-center justify-center font-mono">
                  3
                </span>
                Download Compiled APK
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Open the <strong>Actions</strong> tab on GitHub, click on the running or completed workflow, and download the <code className="text-emerald-400 font-mono">bmarail-app-debug-apk</code> ZIP containing your APK.
              </p>
            </div>
          </div>
        </div>

        {/* Copy-Paste Terminal Command Box */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 font-medium">Remote Configured: origin → https://github.com/hardhustlekd2/Bma-app.git</span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  `# Option A: Push using personal access token (replace YOUR_GITHUB_TOKEN)\ngit push https://YOUR_GITHUB_TOKEN@github.com/hardhustlekd2/Bma-app.git main\n\n# Option B: If SSH key is configured\ngit remote set-url origin git@github.com:hardhustlekd2/Bma-app.git\ngit push -u origin main\n\n# Or push via AI Studio UI: Click the GitHub Sync/Export button in the top bar!`,
                  'cmd-git-push'
                )
              }
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCmd === 'cmd-git-push' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono-code text-slate-200 overflow-x-auto leading-relaxed">
{`# 1. Origin is already configured to: https://github.com/hardhustlekd2/Bma-app.git
# To push via terminal with your GitHub Personal Access Token (PAT):
git push https://YOUR_GITHUB_TOKEN@github.com/hardhustlekd2/Bma-app.git main

# 2. Or using SSH:
git remote set-url origin git@github.com:hardhustlekd2/Bma-app.git
git push -u origin main

# 3. Or in Google AI Studio UI:
# Simply click the "Export to GitHub" / "Sync" icon in the top header to push automatically!`}
          </pre>
        </div>
      </div>
    </div>
  );
};

