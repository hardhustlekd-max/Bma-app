package com.bmarail.app

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

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)

        if (request?.isForMainFrame == true) {
            val context = view?.context ?: return
            val isOffline = !NetworkUtils.isNetworkAvailable(context)
            onErrorReceived(isOffline, error?.errorCode ?: WebViewClient.ERROR_UNKNOWN)
        }
    }

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: return false

        if (url.startsWith("https://bmarail-production.up.railway.app") || url.startsWith("http://bmarail-production.up.railway.app")) {
            return false
        }

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
