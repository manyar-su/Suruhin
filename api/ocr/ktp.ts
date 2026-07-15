import type { VercelRequest, VercelResponse } from '@vercel/node';
import { countFilledKtpFields, parseKtpText } from '../../src/lib/ocr/ktp';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

const DEFAULT_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

export const config = {
  api: {
    bodyParser: false,
  },
};

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

async function readMultipartFile(req: VercelRequest) {
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

  const parts = splitMultipartBuffer(buffer, boundary);

  for (const part of parts) {
    const separatorIndex = part.indexOf(Buffer.from('\r\n\r\n'));
    if (separatorIndex === -1) continue;

    const headerText = part.subarray(0, separatorIndex).toString('utf8');
    if (!/name="file"/i.test(headerText)) continue;

    const mimeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);
    const nameMatch = headerText.match(/filename="([^"]+)"/i);
    const fileBuffer = part.subarray(separatorIndex + 4);

    return {
      name: nameMatch?.[1] || 'ktp-upload',
      type: (mimeMatch?.[1] || '').trim(),
      buffer: fileBuffer,
    };
  }

  throw new Error('File KTP tidak ditemukan di request.');
}

async function callVisionOcr(baseUrl: string, apiKey: string, model: string, dataUrl: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You are an OCR engine for Indonesian KTP cards. Return only the transcribed text exactly as seen, preserving line breaks. Do not explain anything.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Transkripkan seluruh teks pada foto KTP ini apa adanya. Hanya keluarkan teks hasil OCR, tanpa markdown dan tanpa penjelasan.',
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OCR provider ${model} gagal: ${response.status} ${detail}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content as string | undefined;
}

async function extractOcrText(file: { type: string; buffer: Buffer }) {
  if (file.type === 'application/pdf') {
    throw new Error('Auto OCR KTP saat ini hanya mendukung foto JPG, JPEG, atau PNG.');
  }

  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) {
    throw new Error('SUMOPOD_API_KEY belum dikonfigurasi di server.');
  }

  const baseUrl = process.env.SUMOPOD_BASE_URL || 'https://ai.sumopod.com';
  const requestedModels = (process.env.SUMOPOD_GEMINI_MODELS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const models = requestedModels.length > 0 ? requestedModels : DEFAULT_MODELS;
  const dataUrl = `data:${file.type};base64,${file.buffer.toString('base64')}`;

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const text = await callVisionOcr(baseUrl, apiKey, model, dataUrl);
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('OCR provider gagal.');
    }
  }

  throw lastError || new Error('OCR provider tidak mengembalikan teks.');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const file = await readMultipartFile(req);

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return res.status(400).json({
        ok: false,
        error: 'File harus berformat JPG, JPEG, PNG, atau PDF.',
      });
    }

    if (file.buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        ok: false,
        error: 'Ukuran file maksimal 5MB.',
      });
    }

    const rawText = await extractOcrText(file);
    const fields = parseKtpText(rawText);

    if (!fields.nik || countFilledKtpFields(fields) < 5) {
      return res.status(422).json({
        ok: false,
        error: 'Data KTP belum terbaca jelas. Silakan upload ulang foto yang lebih terang atau isi manual.',
      });
    }

    return res.status(200).json({
      ok: true,
      data: fields,
      message: 'Data berhasil dibaca dari KTP. Mohon cek kembali sebelum disimpan.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memproses OCR KTP.';
    return res.status(500).json({
      ok: false,
      error: message.includes('Data KTP belum terbaca jelas')
        ? message
        : 'Data KTP belum terbaca jelas. Silakan upload ulang foto yang lebih terang atau isi manual.',
      debug: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
}
