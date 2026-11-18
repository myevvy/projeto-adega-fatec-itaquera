import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = serviceAccountJson
  ? JSON.parse(serviceAccountJson)
  : JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) });

export default getAuth(app);