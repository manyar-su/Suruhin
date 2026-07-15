import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mapApplicationRow, optionalNumber, required } from '../_lib/jobMarketplace';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin';

const VALID_STATUSES = new Set(['SUBMITTED', 'VIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = getSupabaseAdminClient();

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const row = {
        job_id: required(body?.jobId, 'Pekerjaan'),
        talent_id: required(body?.talentId, 'Talent'),
        talent_name: required(body?.talentName, 'Nama talent'),
        talent_avatar: typeof body?.talentAvatar === 'string' ? body.talentAvatar.trim() : null,
        offer_price: optionalNumber(body?.offerPrice) ?? 0,
        estimated_duration: required(body?.estimatedDuration, 'Estimasi durasi'),
        message: required(body?.message, 'Pesan lamaran'),
        status: 'SUBMITTED',
      };

      const duplicateResult = await client
        .from('job_applications')
        .select('id')
        .eq('job_id', row.job_id)
        .eq('talent_id', row.talent_id)
        .in('status', ['SUBMITTED', 'VIEWED', 'SHORTLISTED', 'ACCEPTED'])
        .maybeSingle();

      if (duplicateResult.error) throw new Error(duplicateResult.error.message);
      const duplicate = duplicateResult.data as { id: string } | null;
      if (duplicate?.id) {
        throw new Error('Talent ini sudah mengajukan penawaran aktif pada pekerjaan tersebut.');
      }

      const { data, error } = await client
        .from('job_applications')
        .insert(row as never)
        .select('id, job_id, talent_id, talent_name, talent_avatar, offer_price, estimated_duration, message, status, created_at')
        .single();
      if (error) throw new Error(error.message);

      return res.status(200).json({
        ok: true,
        data: mapApplicationRow(data),
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Gagal mengirim lamaran.',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const id = required(body?.id, 'Lamaran');
      const status = required(body?.status, 'Status').toUpperCase();

      if (!VALID_STATUSES.has(status)) {
        throw new Error('Status lamaran tidak valid.');
      }

      const { data, error } = await client
        .from('job_applications')
        .update({ status } as never)
        .eq('id', id)
        .select('id, job_id, talent_id, talent_name, talent_avatar, offer_price, estimated_duration, message, status, created_at')
        .single();
      if (error) throw new Error(error.message);

      return res.status(200).json({
        ok: true,
        data: mapApplicationRow(data),
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Gagal memperbarui lamaran.',
      });
    }
  }

  res.setHeader('Allow', 'POST, PATCH');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
