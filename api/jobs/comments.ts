import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mapCommentRow, optionalString, required } from '../_lib/jobMarketplace';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const client = getSupabaseAdminClient();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const row = {
      job_id: required(body?.jobId, 'Pekerjaan'),
      user_id: required(body?.userId, 'Pengguna'),
      actor_role: required(body?.actorRole, 'Peran pengirim').toLowerCase(),
      actor_name: required(body?.actorName, 'Nama pengirim'),
      message: required(body?.message, 'Pesan diskusi'),
    };

    const { data, error } = await client
      .from('job_comments')
      .insert(row as never)
      .select('id, job_id, user_id, actor_role, actor_name, message, created_at')
      .single();
    if (error) throw new Error(error.message);

    await client
      .from('job_posts')
      .update({ status: optionalString(body?.jobStatus) || 'IN_DISCUSSION' } as never)
      .eq('id', row.job_id)
      .in('status', ['OPEN', 'IN_DISCUSSION']);

    return res.status(200).json({
      ok: true,
      data: mapCommentRow(data),
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal mengirim komentar.',
    });
  }
}
