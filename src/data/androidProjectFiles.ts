export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'properties' | 'markdown' | 'yaml';
  category: 'core' | 'res' | 'manifest' | 'config' | 'docs' | 'ci';
  description: string;
  code: string;
}

export const ANDROID_FILES: ProjectFile[] = [
  {
    id: 'main-activity',
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/bmarail/app/MainActivity.kt',
    language: 'kotlin',
    category: 'core',
    description: 'Main Android Activity implementing WebView caching, network-based cache mode, swipe-to-refresh, back navigation, and offline fallback.',
    code: `package com.bmarail.app

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkRequest
import android.os.Bundle
import android.view.View
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import java.io.File

/**
 * ባ.ሞ.ማ መተግበሪያ (BMA Rail Web Wrapper)
 *
 * Implements robust offline caching rules for https://bmarail-production.up.railway.app:
 * 1. DOM Storage & Database enabled (domStorageEnabled = true, databaseEnabled = true)
 * 2. Dedicated application cache directory set via cacheDir.path
 * 3. Dynamic network-based cache mode (LOAD_DEFAULT when online, LOAD_CACHE_ELSE_NETWORK when offline)
 * 4. Graceful onReceivedError fallback screen with retry button & Amharic localization
 */
class MainActivity : AppCompatActivity() {

    companion object {
        const val TARGET_URL = "https://bmarail-production.up.railway.app"
        private const val CACHE_SUBDIR = "bmarail_appcache"
    }

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var offlineErrorContainer: LinearLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var retryButton: Button
    private lateinit var errorTitleText: TextView
    private lateinit var errorDescText: TextView

    private lateinit var connectivityManager: ConnectivityManager
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    // Track whether the current page load failed due to being offline without cached assets
    private var hasPageLoadError = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize UI components
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        offlineErrorContainer = findViewById(R.id.offlineErrorContainer)
        progressBar = findViewById(R.id.progressBar)
        retryButton = findViewById(R.id.btnRetry)
        errorTitleText = findViewById(R.id.tvErrorTitle)
        errorDescText = findViewById(R.id.tvErrorDesc)

        connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

        // Setup WebView settings and cache policies
        setupWebViewSettings()

        // Configure custom WebViewClient with onReceivedError handling
        setupWebViewClient()

        // Setup Swipe-To-Refresh
        setupSwipeRefresh()

        // Setup Modern Back Navigation
        setupBackNavigation()

        // Setup Retry Button click listener
        retryButton.setOnClickListener {
            attemptReload()
        }

        // Register dynamic network callback to automatically adjust cache mode and notify user
        registerNetworkMonitoring()

        // Initial page load
        loadTargetUrl()
    }

    /**
     * RULE 1: Enable DOM Storage and Database
     * RULE 2: Configure dedicated AppCache/Cache Path using cacheDir.path
     * RULE 3: Implement Network-Based Cache Mode
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebViewSettings() {
        val settings = webView.settings

        // 1. Enable JavaScript and modern web capabilities
        settings.javaScriptEnabled = true

        // 1. Enable DOM Storage and Database
        settings.domStorageEnabled = true
        settings.databaseEnabled = true

        // 2. Configure dedicated application cache directory using cacheDir.path
        val appCacheDir = File(cacheDir, CACHE_SUBDIR)
        if (!appCacheDir.exists()) {
            appCacheDir.mkdirs()
        }

        @Suppress("DEPRECATION")
        try {
            settings.setAppCachePath(cacheDir.path)
            settings.setAppCacheEnabled(true)
        } catch (_: Exception) {
            // Deprecated in newer Android API levels where Chromium handles disk cache automatically
        }

        // Additional optimal caching & rendering settings
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.loadsImagesAutomatically = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(true)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // 3. Apply initial network-based cache mode
        updateCacheMode()
    }

    /**
     * RULE 3: Network-Based Cache Mode
     * - If online  -> LOAD_DEFAULT (uses standard caching and fetches updated assets from network)
     * - If offline -> LOAD_CACHE_ELSE_NETWORK (forces WebView to use cached assets without failing)
     */
    private fun updateCacheMode() {
        val isOnline = NetworkUtils.isNetworkAvailable(this)
        webView.settings.cacheMode = if (isOnline) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }
    }

    /**
     * RULE 4: Error Handling & Graceful onReceivedError override
     */
    private fun setupWebViewClient() {
        webView.webViewClient = object : WebViewClient() {

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                hasPageLoadError = false
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false

                // If no critical error occurred, show the WebView content
                if (!hasPageLoadError) {
                    webView.visibility = View.VISIBLE
                    offlineErrorContainer.visibility = View.GONE
                }
            }

            /**
             * Modern onReceivedError (API 23+)
             * Handles cases where a page isn't in cache and device is offline
             */
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)

                // Only react to failures on the main page/frame (not sub-resources like third-party analytics)
                if (request?.isForMainFrame == true) {
                    hasPageLoadError = true
                    handlePageError(error?.errorCode ?: WebViewClient.ERROR_UNKNOWN)
                }
            }

            /**
             * Legacy onReceivedError fallback for older Android versions
             */
            @Suppress("DEPRECATION")
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                hasPageLoadError = true
                handlePageError(errorCode)
            }
        }
    }

    /**
     * Displays a native Amharic/English offline error view when WebView cannot load
     */
    private fun handlePageError(errorCode: Int) {
        progressBar.visibility = View.GONE
        swipeRefreshLayout.isRefreshing = false

        val isOnline = NetworkUtils.isNetworkAvailable(this)
        if (!isOnline) {
            // Offline and content not in cache
            errorTitleText.text = getString(R.string.error_offline_title)
            errorDescText.text = getString(R.string.error_offline_desc)
        } else {
            // Online but server or HTTP failure
            errorTitleText.text = getString(R.string.error_server_title)
            errorDescText.text = getString(R.string.error_server_desc)
        }

        webView.visibility = View.GONE
        offlineErrorContainer.visibility = View.VISIBLE
    }

    private fun attemptReload() {
        offlineErrorContainer.visibility = View.GONE
        progressBar.visibility = View.VISIBLE

        // Re-evaluate network & update cacheMode before reloading
        updateCacheMode()

        if (webView.url != null) {
            webView.reload()
        } else {
            loadTargetUrl()
        }
    }

    private fun loadTargetUrl() {
        updateCacheMode()
        webView.loadUrl(TARGET_URL)
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeResources(R.color.brand_primary, R.color.brand_accent)
        swipeRefreshLayout.setOnRefreshListener {
            updateCacheMode()
            webView.reload()
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    /**
     * Continuously monitors connectivity transitions (e.g. user toggles Airplane mode or Wi-Fi)
     */
    private fun registerNetworkMonitoring() {
        val request = NetworkRequest.Builder().build()
        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                runOnUiThread {
                    updateCacheMode()
                    // If currently displaying an offline error, automatically retry loading
                    if (offlineErrorContainer.visibility == View.VISIBLE) {
                        attemptReload()
                    }
                }
            }

            override fun onLost(network: Network) {
                runOnUiThread {
                    updateCacheMode()
                }
            }
        }

        try {
            connectivityManager.registerNetworkCallback(request, networkCallback!!)
        } catch (_: Exception) {
            // Safety guard for restricted environments
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        networkCallback?.let {
            try {
                connectivityManager.unregisterNetworkCallback(it)
            } catch (_: Exception) {}
        }
        webView.destroy()
    }
}
`
  },
  {
    id: 'network-utils',
    name: 'NetworkUtils.kt',
    path: 'app/src/main/java/com/bmarail/app/NetworkUtils.kt',
    language: 'kotlin',
    category: 'core',
    description: 'Modern network helper checking connectivity via ConnectivityManager and NetworkCapabilities with Wi-Fi, Cellular, and Ethernet transport validation.',
    code: `package com.bmarail.app

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build

/**
 * Modern network utility helper.
 *
 * Uses ConnectivityManager and NetworkCapabilities to verify active, working internet connection
 * across Wi-Fi, Cellular, and Ethernet interfaces without deprecated NetworkInfo APIs.
 */
object NetworkUtils {

    /**
     * Checks if the device has an active internet connection.
     *
     * Validates:
     * - Active default network
     * - NET_CAPABILITY_INTERNET (has routing to the internet)
     * - Valid physical/logical transport (Wi-Fi, Cellular, Ethernet, or VPN)
     *
     * @param context Application or Activity context
     * @return true if an active internet connection is available, false otherwise
     */
    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val activeNetwork = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return false

            val hasInternet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            val hasValidTransport = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN)

            return hasInternet && hasValidTransport
        } else {
            // Fallback for legacy devices (< Android 6.0 Marshmallow)
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo
            @Suppress("DEPRECATION")
            return networkInfo != null && networkInfo.isConnected
        }
    }

    /**
     * Returns a human-readable connectivity status label (e.g., "Wi-Fi", "Mobile Data", "Offline").
     */
    fun getConnectionType(context: Context): String {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return "Disconnected"

        val activeNetwork = connectivityManager.activeNetwork ?: return "Offline"
        val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return "Offline"

        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "Wi-Fi"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Mobile Data (LTE/5G)"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN) -> "VPN"
            else -> "Connected"
        }
    }
}
`
  },
  {
    id: 'offline-client',
    name: 'OfflineWebViewClient.kt',
    path: 'app/src/main/java/com/bmarail/app/OfflineWebViewClient.kt',
    language: 'kotlin',
    category: 'core',
    description: 'Extracted modular WebViewClient implementing onReceivedError, SSL error checks, and external URL routing for email, tel, and external links.',
    code: `package com.bmarail.app

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * Dedicated WebViewClient subclass for robust offline handling & external intent dispatching.
 */
class OfflineWebViewClient(
    private val onPageLoadingChanged: (isLoading: Boolean) -> Unit,
    private val onErrorReceived: (isOffline: Boolean, errorCode: Int) -> Unit
) : WebViewClient() {

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        onPageLoadingChanged(true)
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        onPageLoadingChanged(false)
    }

    /**
     * Modern onReceivedError implementation (API 23+)
     */
    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)

        // Only handle top-level navigational failures
        if (request?.isForMainFrame == true) {
            val context = view?.context ?: return
            val isOffline = !NetworkUtils.isNetworkAvailable(context)
            onErrorReceived(isOffline, error?.errorCode ?: WebViewClient.ERROR_UNKNOWN)
        }
    }

    /**
     * Handles external schemas like tel:, mailto:, and whatsapp: intents seamlessly
     */
    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: return false

        // Keep internal target domain in WebView
        if (url.startsWith("https://bmarail-production.up.railway.app") || url.startsWith("http://bmarail-production.up.railway.app")) {
            return false
        }

        // Handle external protocols (tel, mailto, etc.)
        return try {
            val context = view?.context ?: return false
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            false
        }
    }
}
`
  },
  {
    id: 'manifest',
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Configures permissions (INTERNET, ACCESS_NETWORK_STATE), app label "ባ.ሞ.ማ መተግበሪያ", hardware acceleration, and orientation handling.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.bmarail.app">

    <!-- Essential permissions for WebView internet access & cache management -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/Theme.BMARailApp">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    id: 'layout-main',
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    category: 'res',
    description: 'Material layout with SwipeRefreshLayout, full-viewport WebView, indeterminate ProgressBar, and native offline error view with retry action.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/surface_background"
    tools:context=".MainActivity">

    <!-- Top Loading Indicator -->
    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:indeterminate="true"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Swipe To Refresh Wrapper -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefreshLayout"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/progressBar"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <!-- Main WebView for bmarail-production.up.railway.app -->
        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <!-- Native Offline / Error Fallback Screen -->
    <LinearLayout
        android:id="@+id/offlineErrorContainer"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        android:gravity="center"
        android:padding="32dp"
        android:visibility="gone"
        android:background="@color/surface_background"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <ImageView
            android:id="@+id/ivErrorIcon"
            android:layout_width="88dp"
            android:layout_height="88dp"
            android:src="@drawable/ic_no_wifi"
            android:tint="@color/brand_primary"
            android:contentDescription="@string/error_offline_title" />

        <TextView
            android:id="@+id/tvErrorTitle"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/error_offline_title"
            android:textColor="@color/text_primary"
            android:textSize="20sp"
            android:textStyle="bold"
            android:layout_marginTop="20dp"
            android:textAlignment="center" />

        <TextView
            android:id="@+id/tvErrorDesc"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/error_offline_desc"
            android:textColor="@color/text_secondary"
            android:textSize="14sp"
            android:layout_marginTop="8dp"
            android:textAlignment="center"
            android:lineSpacingExtra="4dp" />

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnRetry"
            android:layout_width="wrap_content"
            android:layout_height="52dp"
            android:layout_marginTop="28dp"
            android:paddingStart="32dp"
            android:paddingEnd="32dp"
            android:text="@string/btn_retry"
            android:textColor="@android:color/white"
            android:textAllCaps="false"
            android:textSize="15sp"
            app:cornerRadius="12dp"
            app:backgroundTint="@color/brand_primary" />

    </LinearLayout>

</androidx.constraintlayout.widget.ConstraintLayout>
`
  },
  {
    id: 'strings-en',
    name: 'res/values/strings.xml',
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    category: 'res',
    description: 'String resources containing the official app name "ባ.ሞ.ማ መተግበሪያ" and bilingual fallback prompts.',
    code: `<resources>
    <!-- Official Application Name as requested by user -->
    <string name="app_name">ባ.ሞ.ማ መተግበሪያ</string>
    <string name="app_name_en">BMA Rail App</string>

    <!-- Offline and Error Messages -->
    <string name="error_offline_title">ግንኙነት አልተገኘም (No Connection)</string>
    <string name="error_offline_desc">ይህ ገጽ በስልክዎ ማህደረ-ትውስታ ውስጥ አልተቀመጠም። እባክዎ የኢንተርኔት ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።\n\n(This page is not yet cached. Please check your internet connection and try again.)</string>

    <string name="error_server_title">ሰርቨሩ ምላሽ አልሰጠም (Server Error)</string>
    <string name="error_server_desc">ከድህረ ገጹ ጋር መገናኘት አልተቻለም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።</string>

    <!-- Action Buttons -->
    <string name="btn_retry">እንደገና ይሞክሩ (Try Again)</string>
</resources>
`
  },
  {
    id: 'build-gradle-app',
    name: 'app/build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'gradle',
    category: 'config',
    description: 'Application Gradle build script targeting Android SDK 35 with AndroidX Core, Material Components, and SwipeRefreshLayout.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.bmarail.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bmarail.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
}
`
  },
  {
    id: 'colors-res',
    name: 'res/values/colors.xml',
    path: 'app/src/main/res/values/colors.xml',
    language: 'xml',
    category: 'res',
    description: 'Color palette definition matching the modern deep rail aesthetic.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="brand_primary">#0284C7</color>
    <color name="brand_primary_dark">#0369A1</color>
    <color name="brand_accent">#10B981</color>
    <color name="surface_background">#0F172A</color>
    <color name="surface_card">#1E293B</color>
    <color name="text_primary">#F8FAFC</color>
    <color name="text_secondary">#94A3B8</color>
</resources>
`
  },
  {
    id: 'settings-gradle',
    name: 'settings.gradle.kts',
    path: 'settings.gradle.kts',
    language: 'gradle',
    category: 'config',
    description: 'Gradle project settings defining repositories and subproject modules.',
    code: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "bmarail-wrapper"
include(":app")
`
  },
  {
    id: 'project-readme',
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    category: 'docs',
    description: 'Documentation for building the APK in Android Studio or via Gradle CLI.',
    code: `# ባ.ሞ.ማ መተግበሪያ (BMA Rail Android Web Wrapper)

A production-grade Android WebView wrapper for **https://bmarail-production.up.railway.app** written in Kotlin, featuring advanced offline caching and network-aware performance.

## Implemented WebView Caching Architecture

1. **DOM Storage and Database Support**:
   - \`domStorageEnabled = true\`
   - \`databaseEnabled = true\`
   - Enables LocalStorage, SessionStorage, and IndexedDB for Progressive Web App capabilities.

2. **Dedicated AppCache / Cache Path**:
   - Configured with dedicated application cache directory: \`cacheDir.path\`
   - Isolated and persistent storage that preserves cached assets across app restarts.

3. **Network-Based Cache Mode**:
   - **Online**: \`WebSettings.LOAD_DEFAULT\` (fetches fresh updates, caches new assets).
   - **Offline**: \`WebSettings.LOAD_CACHE_ELSE_NETWORK\` (forces instant offline loading from cache without network errors).

4. **Graceful onReceivedError Overrides**:
   - Modern API 23+ and legacy fallback \`onReceivedError\` handlers.
   - Clean native offline error state in Amharic & English with a working retry action.

5. **Modern ConnectivityManager & NetworkCapabilities Helper**:
   - Validates active network via \`NET_CAPABILITY_INTERNET\` across Wi-Fi, Cellular, Ethernet, and VPN without deprecated APIs.
   - Live \`NetworkCallback\` automatically refreshes when internet is restored.

## How to Build the APK in Android Studio

1. Download or extract the project files.
2. Open **Android Studio** (Hedgehog, Iguana, Koala, Ladybug or newer).
3. Select **File > Open** and choose this project root directory.
4. Let Gradle sync dependencies.
5. Click **Run (Shift + F10)** to launch on an emulator or physical device.
6. To generate a signed release APK: **Build > Generate Signed Bundle / APK**.
`
  },
  {
    id: 'github-workflow',
    name: 'build-apk.yml',
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    category: 'ci',
    description: 'Preconfigured GitHub Action CI/CD workflow that triggers on push to compile the Android APK and upload it as a downloadable artifact.',
    code: `name: Build Android APK (ባ.ሞ.ማ መተግበሪያ)

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Compile & Package APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.7'
          cache-disabled: false

      - name: Make Gradle Wrapper Executable
        run: |
          chmod +x ./gradlew 2>/dev/null || true
          chmod +x ./android/gradlew 2>/dev/null || true

      - name: Accept Android SDK Licenses
        run: |
          yes | sdkmanager --licenses 2>/dev/null || true

      - name: Build Android Debug APK
        run: |
          if [ -d "android/app" ] && [ -f "android/gradlew" ]; then
            echo "Building via android/ directory..."
            cd android && ./gradlew assembleDebug --no-daemon --stacktrace
          elif [ -f "./gradlew" ]; then
            echo "Building via root directory..."
            ./gradlew assembleDebug --no-daemon --stacktrace
          else
            echo "Running gradle assembleDebug directly..."
            gradle assembleDebug --no-daemon --stacktrace
          fi

      - name: Verify Generated APK
        run: |
          echo "=== Generated APK Files ==="
          find . -name "*.apk" -type f

      - name: Upload APK as Workflow Artifact
        uses: actions/upload-artifact@v4
        with:
          name: bmarail-app-debug-apk
          path: |
            **/build/outputs/apk/debug/*.apk
            **/build/outputs/apk/**/*.apk
          retention-days: 30
          if-no-files-found: warn

      - name: Create Release on Version Tag
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v2
        with:
          files: |
            **/build/outputs/apk/debug/*.apk
            **/build/outputs/apk/**/*.apk
          name: "ባ.ሞ.ማ መተግበሪያ Release \${{ github.ref_name }}"
          generate_release_notes: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
  }
];

