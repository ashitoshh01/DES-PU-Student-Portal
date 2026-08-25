---
name: s3_object_storage
description: "Cloudflare R2 file storage for DES PU — upload, presigned downloads, thumbnail generation via Sharp"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Cloudflare R2 File Storage

Use this skill when implementing file upload, download, or management features using Cloudflare R2 (S3-compatible).

## 🎯 When to Use
- Working on `src/services/storage.service.ts`
- Implementing resource upload/download endpoints
- Generating presigned URLs for secure downloads
- Processing uploaded images (thumbnails via Sharp)

## 🧠 Architecture
- **Provider:** Cloudflare R2 (S3-compatible API)
- **SDK:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- **Processing:** Image thumbnails via `sharp` in BullMQ worker
- **Key Format:** `{type}/{userId}/{timestamp}-{filename}` (e.g., `resources/usr-123/1234567890-notes.pdf`)

## 🛠️ Best Practices

### 1. R2 Client Setup
```typescript
// src/services/storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

### 2. Upload File
```typescript
export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return key;
}
```

### 3. Presigned Download URL (Expires in 1 hour)
```typescript
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 hour
}
```

### 4. Delete File
```typescript
export async function deleteFile(key: string) {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }));
}
```

### 5. Image Thumbnail (BullMQ Worker)
```typescript
// In file processing worker
import sharp from 'sharp';

async function generateThumbnail(originalKey: string, buffer: Buffer) {
  const thumbnail = await sharp(buffer)
    .resize(300, 300, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const thumbKey = originalKey.replace(/\.[^.]+$/, '_thumb.webp');
  await uploadFile(thumbKey, thumbnail, 'image/webp');
  return thumbKey;
}
```

## ❌ Anti-Patterns
- **Never store files on disk** — always stream directly to R2
- **Never expose R2 credentials** — use presigned URLs for downloads
- **Never skip content-type** — always set `ContentType` on upload
- **Never process images in request handler** — use BullMQ worker
- **Never allow unbounded file sizes** — enforce limits in Express middleware (`express.json({ limit: '10mb' })`)

## 📊 Quality Gates
- Max upload size: 10MB (enforced in Express middleware)
- Presigned URLs expire in 1 hour
- Thumbnails generated async via BullMQ
- R2 keys include userId for access control auditing
