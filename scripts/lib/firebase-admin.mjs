import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ROOT } from './env.mjs';

const require = createRequire(import.meta.url);

/**
 * Initialize Firebase Admin + Firestore.
 * Must call loadProjectEnv() first.
 */
export function initAdminFirestore() {
  let admin;
  try {
    admin = require('firebase-admin');
  } catch {
    console.error('firebase-admin is not installed. Run: npm install -D firebase-admin');
    process.exit(1);
  }

  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    './secrets/firebase-service-account.json';
  const resolvedSa = path.isAbsolute(saPath) ? saPath : path.join(ROOT, saPath);

  if (!fs.existsSync(resolvedSa)) {
    console.error(`Service account JSON not found at: ${resolvedSa}`);
    console.error('Download from Firebase Console → Project settings → Service accounts');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedSa, 'utf8'));
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id;
  const databaseId =
    process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
  }

  const db = admin.firestore();
  db.settings({ databaseId });

  return { admin, db, databaseId };
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function writeGuestExcel(
  aoa,
  colWidths,
  sheetName = 'Guest Invites',
  filePrefix = 'guests-links'
) {
  const XLSX = require('xlsx');
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  worksheet['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const outPath = path.join(ROOT, 'data', `${filePrefix}-${Date.now()}.xlsx`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  XLSX.writeFile(workbook, outPath);
  return outPath;
}
