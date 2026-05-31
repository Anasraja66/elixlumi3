import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const publicHtmlDir = path.join(rootDir, 'public_html');

console.log('📦 Starting copy build process...');
console.log(`📂 Source: ${distDir}`);
console.log(`📂 Destination: ${publicHtmlDir}`);

if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ directory does not exist! Please run npm run build first.');
    process.exit(1);
}

// Function to copy directory recursively
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ Copied: ${entry.name}`);
        }
    }
}

// Clear old assets folder in public_html to prevent stale files accumulation
const oldAssetsDir = path.join(publicHtmlDir, 'assets');
if (fs.existsSync(oldAssetsDir)) {
    console.log('🗑️ Purging old public_html/assets directory...');
    fs.rmSync(oldAssetsDir, { recursive: true, force: true });
}

// Copy everything from dist to public_html
copyDirSync(distDir, publicHtmlDir);
console.log('✅ Build successfully copied to public_html!');
