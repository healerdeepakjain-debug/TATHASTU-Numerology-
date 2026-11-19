import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const androidAssetsDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets');
const publicDir = path.join(rootDir, 'public');
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('Syncing TATHASTU NUMEROLOGY web build & launcher icons into Android project...');

if (fs.existsSync(distDir)) {
  if (fs.existsSync(androidAssetsDir)) {
    fs.rmSync(androidAssetsDir, { recursive: true, force: true });
  }
  copyRecursive(distDir, androidAssetsDir);
  console.log('✓ Copied dist/ -> android/app/src/main/assets/');
} else {
  console.warn('! dist/ not found yet. Run `npm run build` first before syncing assets.');
}

const icon192 = path.join(publicDir, 'pwa-192x192.png');
const icon512 = path.join(publicDir, 'pwa-512x512.png');
const mipmapTargets = [
  { folder: 'mipmap-mdpi', src: icon192 },
  { folder: 'mipmap-hdpi', src: icon192 },
  { folder: 'mipmap-xhdpi', src: icon192 },
  { folder: 'mipmap-xxhdpi', src: icon512 },
  { folder: 'mipmap-xxxhdpi', src: icon512 },
];

for (const target of mipmapTargets) {
  if (fs.existsSync(target.src)) {
    const folderPath = path.join(resDir, target.folder);
    fs.mkdirSync(folderPath, { recursive: true });
    fs.copyFileSync(target.src, path.join(folderPath, 'ic_launcher.png'));
    fs.copyFileSync(target.src, path.join(folderPath, 'ic_launcher_round.png'));
  }
}

console.log('✓ Synced launcher icons into android/app/src/main/res/mipmap-*');
console.log('✓ Ready to open ./android in Android Studio and build APK / AAB!');
