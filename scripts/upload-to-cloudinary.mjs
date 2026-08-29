#!/usr/bin/env node
/**
 * Bulk-upload portfolio images to Cloudinary.
 *
 * Prerequisites:
 *   1. Copy scripts/.env.example → scripts/.env and fill in credentials
 *   2. npm install (in this scripts/ folder)
 *   3. Set cloudName in ../media-config.js to match CLOUDINARY_CLOUD_NAME
 *
 * Usage:
 *   npm run upload
 *   npm run upload -- --dry-run
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSET_DIRS = [
  path.join(ROOT, "assets", "images"),
  path.join(ROOT, "assets", "design"),
];
const BASE_FOLDER = "portfolio";
const MANIFEST_PATH = path.join(__dirname, ".upload-manifest.json");
const MEDIA_CONFIG_PATH = path.join(ROOT, "media-config.js");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);
const dryRun = process.argv.includes("--dry-run");

dotenv.config({ path: path.join(__dirname, ".env") });

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error(`
Missing Cloudinary credentials.

1. Sign up: https://cloudinary.com/users/register/free
2. Dashboard → API Keys → copy Cloud name, API Key, API Secret
3. cp scripts/.env.example scripts/.env
4. Fill in the three values in scripts/.env
5. Run again: cd scripts && npm install && npm run upload
`);
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

async function walkImages(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "LMKS3_files") continue;
      out.push(...(await walkImages(full)));
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    out.push(full);
  }
  return out;
}

function toPublicId(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join("/");
  const withoutExt = rel.replace(/\.(jpe?g|png|gif|webp|avif)$/i, "");
  return `${BASE_FOLDER}/${withoutExt}`
    .split("/")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .join("/");
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return { uploaded: {} };
  }
}

async function saveManifest(manifest) {
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function patchMediaConfigCloudName(cloudName) {
  let src = await readFile(MEDIA_CONFIG_PATH, "utf8");
  const re = /cloudName:\s*["'][^"']*["']/;
  if (!re.test(src)) {
    console.warn("Could not auto-update media-config.js — set cloudName manually.");
    return;
  }
  const next = src.replace(re, `cloudName: "${cloudName}"`);
  if (next !== src) {
    await writeFile(MEDIA_CONFIG_PATH, next);
    console.log(`Updated media-config.js cloudName → ${cloudName}`);
  }
}

async function uploadOne(filePath, manifest) {
  const publicId = toPublicId(filePath);
  const statKey = publicId;
  if (manifest.uploaded[statKey]) {
    return { skipped: true, publicId };
  }

  if (dryRun) {
    console.log(`[dry-run] would upload: ${publicId}`);
    return { dryRun: true, publicId };
  }

  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    unique_filename: false,
    use_filename: false,
  });

  manifest.uploaded[statKey] = {
    bytes: result.bytes,
    uploadedAt: new Date().toISOString(),
  };

  return { uploaded: true, publicId, bytes: result.bytes };
}

async function main() {
  const files = [];
  for (const dir of ASSET_DIRS) {
    files.push(...(await walkImages(dir)));
  }

  files.sort();
  console.log(`Found ${files.length} images under assets/images and assets/design`);
  if (dryRun) console.log("Dry run — no uploads will be performed.\n");

  const manifest = await loadManifest();
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const label = path.relative(ROOT, file);
    process.stdout.write(`[${i + 1}/${files.length}] ${label} … `);
    try {
      const result = await uploadOne(file, manifest);
      if (result.skipped) {
        skipped += 1;
        console.log("skipped (already uploaded)");
      } else if (result.dryRun) {
        console.log("ok (dry-run)");
      } else {
        uploaded += 1;
        console.log(`ok (${Math.round(result.bytes / 1024)} KB on CDN)`);
      }
      if (!dryRun && (i + 1) % 25 === 0) {
        await saveManifest(manifest);
      }
    } catch (err) {
      failed += 1;
      console.log(`FAILED: ${err.message || err}`);
    }
  }

  if (!dryRun) {
    await saveManifest(manifest);
    await patchMediaConfigCloudName(CLOUDINARY_CLOUD_NAME);
  }

  console.log(`
Done.
  uploaded: ${uploaded}
  skipped:  ${skipped}
  failed:   ${failed}
${dryRun ? "Re-run without --dry-run to upload.\n" : "Deploy the site — images now load from Cloudinary.\n"}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
