import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!getApps().length) {
  // Produção (Azure): vem da variável de ambiente / secret
  // Local: vem do arquivo ignorado pelo Git
  const credencial = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : JSON.parse(
        readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8"),
      );

  initializeApp({ credential: cert(credencial) });
}

// Mantém o formato admin.auth() que o usuarios.js já usa
const admin = { auth: () => getAuth() };

export default admin;