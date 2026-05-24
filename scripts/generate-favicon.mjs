#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const src = path.join(publicDir, 'favicon-source.png');

if (!fs.existsSync(src)) {
  console.error('Source icon not found at public/favicon-source.png');
  process.exit(1);
}

const outPng = async (size, filename) => {
  const outPath = path.join(publicDir, filename);
  await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(outPath);
  console.log('Wrote', outPath);
};

const run = async () => {
  try {
    // Common web icon sizes
    await outPng(16, 'favicon-16x16.png');
    await outPng(32, 'favicon-32x32.png');
    await outPng(48, 'favicon-48x48.png');
    await outPng(180, 'apple-touch-icon.png');
    await outPng(192, 'android-chrome-192x192.png');
    await outPng(512, 'android-chrome-512x512.png');

    // Generate ICO from 16/32/48 PNGs
    const icoPngs = [
      path.join(publicDir, 'favicon-16x16.png'),
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon-48x48.png'),
    ];

    const buf = await pngToIco(icoPngs);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);
    console.log('Wrote', path.join(publicDir, 'favicon.ico'));
    console.log('All icons generated successfully.');
  } catch (err) {
    console.error('Failed to generate icons:', err);
    process.exit(1);
  }
};

run();
