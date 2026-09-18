// One-off generator for PWA manifest icons — rasterizes src/app/icon.svg into the
// PNG sizes browsers require for "Add to Home Screen" (manifest icons can't be SVG-only
// on most Android/iOS install flows). Re-run after changing the source icon.
import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";

const root = process.cwd();
const svgPath = path.join(root, "src/app/icon.svg");
const outDir = path.join(root, "public/icons");
const appDir = path.join(root, "src/app");
const svg = readFileSync(svgPath);
const BRAND = "#3366ff"; // matches viewport.themeColor in src/app/layout.tsx and the icon.svg palette

async function transparentIcon(size, outFile) {
  const pad = Math.round(size * 0.14);
  const logoSize = size - pad * 2;
  await sharp(svg, { density: 384 })
    .resize(logoSize, logoSize, { fit: "contain" })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, outFile));
}

async function solidIcon(size, outPath, background) {
  const logoSize = Math.round(size * 0.6);
  const pad = Math.round((size - logoSize) / 2);
  const logo = await sharp(svg, { density: 384 }).resize(logoSize, logoSize, { fit: "contain" }).toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(outPath);
}

await transparentIcon(192, "icon-192.png");
await transparentIcon(512, "icon-512.png");
await solidIcon(512, path.join(outDir, "maskable-icon-512.png"), BRAND);
// Next.js special file convention — auto-detected, no manual <link> needed.
await solidIcon(180, path.join(appDir, "apple-icon.png"), "#ffffff");

console.log("PWA icons written to public/icons/ and src/app/apple-icon.png");
