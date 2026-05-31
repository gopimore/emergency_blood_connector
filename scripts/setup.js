import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, 'backend', '.env');
const examplePath = path.join(root, 'backend', '.env.example');

if (existsSync(envPath)) {
  console.log('backend/.env already exists — skipping');
} else {
  copyFileSync(examplePath, envPath);
  console.log('Created backend/.env from .env.example');
  console.log('Edit JWT secrets and MONGO_URI before production use.');
}
