/**
 * TATHASTU NUMEROLOGY — Native Android & iOS Container Configuration
 * App Name: TATHASTU NUMEROLOGY
 * App Creator & Master Admin: Healer Ddeepak Jain (healer.ddeepak.jain@gmail.com)
 * Helpline / WhatsApp: +91 8899444444
 *
 * Compatible with Capacitor (`npx cap sync android`) and standalone Android Studio Gradle builds (`./android`).
 */
const config = {
  appId: 'com.tathastulight.numerology',
  appName: 'TATHASTU NUMEROLOGY',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      '*.firebaseapp.com',
      '*.googleapis.com',
      '*.google.com',
      'wa.me',
      'api.whatsapp.com',
      '*.tathastulight.com',
    ],
  },
  android: {
    backgroundColor: '#020617',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#020617',
      showSpinner: false,
    },
  },
};

export default config;
