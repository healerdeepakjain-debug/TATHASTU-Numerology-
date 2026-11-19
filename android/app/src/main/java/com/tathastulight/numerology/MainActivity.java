package com.tathastulight.numerology;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * TATHASTU NUMEROLOGY — Native Android Container Activity
 * App Creator & Master Admin: Healer Ddeepak Jain (healer.ddeepak.jain@gmail.com)
 * Helpline / WhatsApp: +91 8899444444
 *
 * Serves the bundled React/Vite web build offline-first via WebViewAssetLoader
 * (https://appassets.androidplatform.net/assets/index.html) or falls back to
 * the live TATHASTU NUMEROLOGY cloud URL. Supports native WhatsApp, UPI,
 * Email, Phone, File Upload, PDF Share via FileProvider, and Android PrintManager.
 */
public class MainActivity extends AppCompatActivity {

    private static final String LIVE_CLOUD_URL =
            "https://tathastu-vedic-chaldean-numerology-harmony-108.ai.studio";
    private static final String BUNDLED_ENTRY_URL =
            "https://appassets.androidplatform.net/assets/index.html";

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    private final ActivityResultLauncher<Intent> fileChooserLauncher =
            registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (filePathCallback == null) return;
                        Uri[] results = null;
                        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                            Uri dataUri = result.getData().getData();
                            if (dataUri != null) {
                                results = new Uri[]{dataUri};
                            }
                        }
                        filePathCallback.onReceiveValue(results);
                        filePathCallback = null;
                    }
            );

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        if (window != null) {
            window.setStatusBarColor(0xFF020617);
            window.setNavigationBarColor(0xFF020617);
        }

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF020617);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setSupportMultipleWindows(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.addJavascriptInterface(new TathastuNativeBridge(), "TathastuAndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view,
                    WebResourceRequest request
            ) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost())) {
                    WebResourceResponse res = assetLoader.shouldInterceptRequest(uri);
                    if (res != null) return res;
                    // SPA fallback to index.html for client-side routes
                    return assetLoader.shouldInterceptRequest(Uri.parse(BUNDLED_ENTRY_URL));
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
                String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";

                if ("tel".equals(scheme)
                        || "mailto".equals(scheme)
                        || "upi".equals(scheme)
                        || "whatsapp".equals(scheme)
                        || "intent".equals(scheme)
                        || "wa.me".equals(host)
                        || "api.whatsapp.com".equals(host)) {
                    openExternalIntent(uri);
                    return true;
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams fileChooserParams
            ) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                try {
                    Intent intent = fileChooserParams.createIntent();
                    fileChooserLauncher.launch(intent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    filePathCallback = null;
                    return false;
                }
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        if (hasBundledWebAssets()) {
            webView.loadUrl(BUNDLED_ENTRY_URL);
        } else {
            webView.loadUrl(LIVE_CLOUD_URL);
        }
    }

    private boolean hasBundledWebAssets() {
        try (InputStream is = getAssets().open("index.html")) {
            return is != null;
        } catch (IOException e) {
            return false;
        }
    }

    private void openExternalIntent(@NonNull Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "No app available to open this link.", Toast.LENGTH_SHORT).show();
        }
    }

    private class TathastuNativeBridge {
        @JavascriptInterface
        public void printCurrentReport(String jobTitle) {
            runOnUiThread(() -> {
                PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                if (printManager == null || webView == null) return;
                String title = (jobTitle != null && !jobTitle.isEmpty())
                        ? jobTitle
                        : "TATHASTU NUMEROLOGY Report";
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(title);
                PrintAttributes attrs = new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                        .build();
                printManager.print(title, adapter, attrs);
            });
        }

        @JavascriptInterface
        public void sharePdfBase64(String base64Pdf, String fileName) {
            runOnUiThread(() -> {
                try {
                    String safeName = (fileName != null && fileName.endsWith(".pdf"))
                            ? fileName.replaceAll("[^a-zA-Z0-9._-]", "_")
                            : "Tathastu_Numerology_Report.pdf";
                    File reportsDir = new File(getCacheDir(), "reports");
                    if (!reportsDir.exists()) {
                        //noinspection ResultOfMethodCallIgnored
                        reportsDir.mkdirs();
                    }
                    File pdfFile = new File(reportsDir, safeName);
                    byte[] decoded = Base64.decode(base64Pdf, Base64.DEFAULT);
                    try (FileOutputStream fos = new FileOutputStream(pdfFile)) {
                        fos.write(decoded);
                    }
                    Uri contentUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getPackageName() + ".fileprovider",
                            pdfFile
                    );
                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType("application/pdf");
                    shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    shareIntent.putExtra(Intent.EXTRA_SUBJECT, "TATHASTU NUMEROLOGY Report");
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(shareIntent, "Share TATHASTU NUMEROLOGY PDF"));
                } catch (Exception e) {
                    Toast.makeText(
                            MainActivity.this,
                            "Unable to share PDF: " + e.getMessage(),
                            Toast.LENGTH_SHORT
                    ).show();
                }
            });
        }
    }
}
