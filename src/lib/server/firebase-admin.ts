import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function loadServiceAccount(): ServiceAccount {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (json) {
    return JSON.parse(json) as ServiceAccount;
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    './secrets/firebase-service-account.json';
  const resolved = path.isAbsolute(saPath)
    ? saPath
    : path.join(process.cwd(), saPath);

  if (!existsSync(resolved)) {
    throw new Error(
      `Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH.`
    );
  }

  return JSON.parse(readFileSync(resolved, 'utf8')) as ServiceAccount;
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = loadServiceAccount();
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id;

  return initializeApp({
    credential: cert(serviceAccount as never),
    projectId,
  });
}

export function getAdminDb(): Firestore {
  const app = getAdminApp();
  const databaseId =
    process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';
  if (databaseId && databaseId !== '(default)') {
    return getFirestore(app, databaseId);
  }
  return getFirestore(app);
}

export async function verifyAppCheckToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    await getAppCheck(getAdminApp()).verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
