package com.bmarail.app

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
            // Handled automatically on modern Chromium WebView
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

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)

                if (request?.isForMainFrame == true) {
                    hasPageLoadError = true
                    handlePageError(error?.errorCode ?: WebViewClient.ERROR_UNKNOWN)
                }
            }

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

    private fun handlePageError(errorCode: Int) {
        progressBar.visibility = View.GONE
        swipeRefreshLayout.isRefreshing = false

        val isOnline = NetworkUtils.isNetworkAvailable(this)
        if (!isOnline) {
            errorTitleText.text = getString(R.string.error_offline_title)
            errorDescText.text = getString(R.string.error_offline_desc)
        } else {
            errorTitleText.text = getString(R.string.error_server_title)
            errorDescText.text = getString(R.string.error_server_desc)
        }

        webView.visibility = View.GONE
        offlineErrorContainer.visibility = View.VISIBLE
    }

    private fun attemptReload() {
        offlineErrorContainer.visibility = View.GONE
        progressBar.visibility = View.VISIBLE

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

    private fun registerNetworkMonitoring() {
        val request = NetworkRequest.Builder().build()
        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                runOnUiThread {
                    updateCacheMode()
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
        } catch (_: Exception) {}
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
