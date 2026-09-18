import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesRootDir = path.join(process.cwd(), 'public/images');

async function convertDirectoryRecursively(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      await convertDirectoryRecursively(itemPath);
    } else if (stats.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Keep PNG favicons / app icons as PNG (Apple touch icon prefers PNG)
        if (ext === '.png' && /icon|favicon/i.test(item)) {
          console.log(`Skipping icon PNG: ${item}`);
          continue;
        }
        const fileNameWithoutExt = path.basename(item, ext);
        const outputFilePath = path.join(dir, `${fileNameWithoutExt}.webp`);

        if (stats.size === 0) {
          console.log(`Skipping empty file: ${item}`);
          continue;
        }

        // Skip only small, already-resized WebPs (under 300KB AND max edge ≤ 1200)
        if (ext === '.webp' && stats.size < 300000) {
          const meta = await sharp(itemPath).metadata();
          const maxEdge = Math.max(meta.width || 0, meta.height || 0);
          if (maxEdge <= 1200) {
            console.log(`Skipping already optimized WebP: ${item} (${Math.round(stats.size / 1024)} KB, ${maxEdge}px)`);
            continue;
          }
          console.log(`Recompressing oversized WebP: ${item} (${Math.round(stats.size / 1024)} KB, ${maxEdge}px)`);
        }

        try {
          console.log(`Processing and compressing ${itemPath} (${Math.round(stats.size / 1024)} KB) to WebP...`);
          
          // Read the file into a buffer so we can safely overwrite it if outputFilePath is equal to itemPath
          const buffer = fs.readFileSync(itemPath);
          const tempOutPath = path.join(dir, `${fileNameWithoutExt}_temp_${Date.now()}.webp`);
          
          // Portraits / gallery: cap long edge at 1200; keep quality reasonable for mobile decode
          const maxWidth = item.includes('portrait') ? 800 : 1200;
          await sharp(buffer)
            .resize(maxWidth, null, { withoutEnlargement: true })
            .webp({ quality: 72, effort: 4 })
            .toFile(tempOutPath);
            
          if (fs.existsSync(tempOutPath) && fs.statSync(tempOutPath).size > 0) {
            // Overwrite the destination
            if (fs.existsSync(outputFilePath) && outputFilePath !== itemPath) {
              fs.unlinkSync(outputFilePath);
            }
            fs.renameSync(tempOutPath, outputFilePath);
            
            // If the original was a different format (e.g., .jpg), delete it
            if (itemPath !== outputFilePath) {
              fs.unlinkSync(itemPath);
              console.log(`Successfully converted ${item} to WebP and deleted original.`);
            } else {
              console.log(`Successfully compressed WebP file ${item}. New size: ${Math.round(fs.statSync(outputFilePath).size / 1024)} KB`);
            }
          } else {
            console.error(`Failed to generate compressed file for ${item}`);
          }
        } catch (err) {
          console.error(`Error processing ${item}:`, err.message);
        }
      }
    }
  }
}

async function startConversion() {
  console.log('Starting recursive image conversion to WebP...');
  await convertDirectoryRecursively(imagesRootDir);
  console.log('Image conversion completed!');
}

startConversion();
