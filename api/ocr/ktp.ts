import type { VercelRequest, VercelResponse } from '@vercel/node';
import { countFilledKtpFields, parseKtpText } from '../../src/lib/ocr/ktp';
import { readMultipartPayload } from '../_lib/multipart';
import { assertUploadableFile, getSafeExtension, uploadPrivateBuffer } from '../_lib/mvpUpload';

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
    const { fields: requestFields, files } = await readMultipartPayload(req);
    const file = files.file;
    assertUploadableFile(file, 'File KTP');

    const entityId = (requestFields.entityId || '').trim();
    const entityType = (requestFields.entityType || '').trim();

    if (entityId && (entityType === 'customer' || entityType === 'talent')) {
      const bucket = entityType === 'customer' ? 'customer-files' : 'talent-files';
      const extension = getSafeExtension(file, 'jpg');
      const path = `${entityType}/ktp/${entityId}/ktp.${extension}`;
      await uploadPrivateBuffer(bucket, path, file, { upsert: true });
    }

    const rawText = await extractOcrText(file);
    const parsedFields = parseKtpText(rawText);

    if (!parsedFields.nik || countFilledKtpFields(parsedFields) < 5) {
      return res.status(422).json({
        ok: false,
        error: 'Data KTP belum terbaca jelas. Silakan upload ulang foto yang lebih terang atau isi manual.',
      });
    }

    return res.status(200).json({
      ok: true,
      data: parsedFields,
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
