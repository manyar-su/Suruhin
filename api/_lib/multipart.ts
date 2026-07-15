import type { VercelRequest } from '@vercel/node';

export interface MultipartFile {
  fieldName: string;
  name: string;
  type: string;
  buffer: Buffer;
}

export interface MultipartPayload {
  fields: Record<string, string>;
  files: Record<string, MultipartFile>;
}

function getBoundary(contentType: string) {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] || match?.[2] || '';
}

function splitMultipartBuffer(buffer: Buffer, boundary: string) {
  const marker = Buffer.from(`--${boundary}`);
  const segments: Buffer[] = [];
  let start = buffer.indexOf(marker);

  while (start !== -1) {
    const next = buffer.indexOf(marker, start + marker.length);
    if (next === -1) break;
    segments.push(buffer.subarray(start + marker.length + 2, next - 2));
    start = next;
  }

  return segments.filter((segment) => segment.length > 0);
}

export async function readMultipartPayload(req: VercelRequest): Promise<MultipartPayload> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  const contentType = req.headers['content-type'] || '';
  const boundary = getBoundary(contentType);

  if (!boundary) {
    throw new Error('Boundary multipart tidak ditemukan.');
  }

  const fields: Record<string, string> = {};
  const files: Record<string, MultipartFile> = {};
  const parts = splitMultipartBuffer(buffer, boundary);

  for (const part of parts) {
    const separatorIndex = part.indexOf(Buffer.from('\r\n\r\n'));
    if (separatorIndex === -1) continue;

    const headerText = part.subarray(0, separatorIndex).toString('utf8');
    const body = part.subarray(separatorIndex + 4);
    const fieldNameMatch = headerText.match(/name="([^"]+)"/i);
    const fieldName = fieldNameMatch?.[1]?.trim();

    if (!fieldName) continue;

    const nameMatch = headerText.match(/filename="([^"]*)"/i);
    if (nameMatch) {
      const mimeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);
      files[fieldName] = {
        fieldName,
        name: nameMatch[1] || fieldName,
        type: (mimeMatch?.[1] || '').trim(),
        buffer: body,
      };
      continue;
    }

    fields[fieldName] = body.toString('utf8');
  }

  return { fields, files };
}
