package com.blueseamobile.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

public class CustomWebViewClient extends BridgeWebViewClient {

    private final SharedPreferences prefs;

    public static final String KEY_LAST_URL = "LAST_SUCCESSFUL_URL";
    public static final String OFFLINE_ASSET_URL = "file:///android_asset/offline.html";
    public static final String DEFAULT_FALLBACK_URL = "https://blueseamobile.com.ng/dashboard";

    public CustomWebViewClient(Bridge bridge) {
        super(bridge);
        Context context = bridge.getContext();
        this.prefs = context.getSharedPreferences("BlueSeaAppPrefs", Context.MODE_PRIVATE);
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        if (url != null && isEligibleUrl(url)) {
            prefs.edit().putString(KEY_LAST_URL, url).apply();
        }
    }

    @Override
    public void onReceivedError(final WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);

        // Intercept network failures for the main frame request
        if (request != null && request.isForMainFrame()) {
            String failingUrl = request.getUrl().toString();

            if (!failingUrl.startsWith("file:///")) {
                // Post loadUrl asynchronously to prevent WebView cancellation race condition
                view.post(new Runnable() {
                    @Override
                    public void run() {
                        view.loadUrl(OFFLINE_ASSET_URL);
                    }
                });
            }
        }
    }

    private boolean isEligibleUrl(String url) {
        return (url.startsWith("http://") || url.startsWith("https://")) &&
                !url.contains("offline.html");
    }
}
