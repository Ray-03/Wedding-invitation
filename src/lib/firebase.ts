import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

function assertFirebaseConfig() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`[firebase] Missing env: ${missing.join(', ')}`);
  }
}

assertFirebaseConfig();

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let appCheck: AppCheck | null = null;

function initAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheck) return appCheck;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY?.trim();
  if (!siteKey) return null;

  if (process.env.NODE_ENV !== 'production') {
    const debug = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN?.trim();
    (
      globalThis as typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = debug || true;
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return appCheck;
}

export async function getAppCheckHeaders(): Promise<Record<string, string>> {
  const instance = initAppCheck();
  if (!instance) return {};
  try {
    const { token } = await getToken(instance, false);
    return token ? { 'X-Firebase-AppCheck': token } : {};
  } catch {
    return {};
  }
}

initAppCheck();

export { app };
