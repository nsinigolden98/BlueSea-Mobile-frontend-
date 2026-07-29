package com.blueseamobile.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Attach Custom WebView Client to Capacitor Bridge
        this.bridge.getWebView().setWebViewClient(new CustomWebViewClient(this.bridge));

        // Inject Native JS Bridge for offline page interactions
        this.bridge.getWebView().addJavascriptInterface(
            new WebAppInterface(this),
            "AndroidBridge"
        );
    }

    public String getLastSavedUrl() {
        SharedPreferences prefs = getSharedPreferences("BlueSeaAppPrefs", Context.MODE_PRIVATE);
        return prefs.getString(
            CustomWebViewClient.KEY_LAST_URL,
            CustomWebViewClient.DEFAULT_FALLBACK_URL
        );
    }

    public void reloadTargetUrl() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String targetUrl = getLastSavedUrl();
                bridge.getWebView().loadUrl(targetUrl);
            }
        });
    }

    @Override
    public void onBackPressed() {
        WebView webView = this.bridge.getWebView();
        String currentUrl = webView.getUrl() != null ? webView.getUrl() : "";

        if (currentUrl.contains("offline.html")) {
            // Restore last valid saved page
            reloadTargetUrl();
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    public static class WebAppInterface {
        private final MainActivity activity;

        public WebAppInterface(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public String getLastVisitedUrl() {
            return activity.getLastSavedUrl();
        }

        @JavascriptInterface
        public void retryConnection() {
            activity.reloadTargetUrl();
        }
    }
}