import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import sharp from 'sharp';

const DIST = 'dist';
const WEBP_QUALITY = 72;
const JPEG_QUALITY = 78;
const PNG_EFFORT = 4;
const MIN_SIZE_KB = 10;

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const info = await stat(filePath);
  if (info.size < MIN_SIZE_KB * 1024) return null;

  const buffer = await readFile(filePath);
  let optimized;

  try {
    if (ext === '.webp') {
      optimized = await sharp(buffer).webp({ quality: WEBP_QUALITY, effort: 6 }).toBuffer();
    } else if (ext === '.jpg' || ext === '.jpeg') {
      optimized = await sharp(buffer).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    } else if (ext === '.png') {
      optimized = await sharp(buffer).png({ compressionLevel: 9, effort: PNG_EFFORT }).toBuffer();
    } else {
      return null;
    }
  } catch {
    return null;
  }

  if (optimized.length < buffer.length) {
    const saved = buffer.length - optimized.length;
    await writeFile(filePath, optimized);
    return saved;
  }
  return 0;
}

async function main() {
  const files = await getFiles(DIST);
  const images = files.filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));

  console.log(`Optimizing ${images.length} images...`);
  let totalSaved = 0;
  let count = 0;

  for (const img of images) {
    const saved = await optimizeImage(img);
    if (saved && saved > 0) {
      const kb = (saved / 1024).toFixed(1);
      console.log(`  ${img}: -${kb} KiB`);
      totalSaved += saved;
      count++;
    }
  }

  console.log(`\nDone: ${count} images optimized, ${(totalSaved / 1024).toFixed(1)} KiB saved total.`);
}

main().catch(e => { console.error(e); process.exit(1); });
