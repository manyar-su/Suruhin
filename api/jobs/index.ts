import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import {
  buildJobSelectQuery,
  countJobRelations,
  getJobWithRelations,
  mapApplicationRow,
  mapCommentRow,
  mapJobRow,
  normalizeJobCreatePayload,
  readJobMultipartPayload,
  slugify,
} from '../_lib/jobMarketplace';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin';

export const config = {
  api: {
    bodyParser: false,
  },
};

function hashSuffix(input: string) {
  return createHash('sha1').update(input).digest('hex').slice(0, 6);
}

function normalizeApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Gagal memproses pekerjaan.';
  if (message.includes('duplicate key')) return 'ID atau slug pekerjaan bentrok. Silakan submit ulang.';
  return message;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const client = getSupabaseAdminClient();
      const { id, slug, customerId, talentId, scope } = req.query;

      if (typeof id === 'string') {
        const detail = await getJobWithRelations(id);
        const counts = await countJobRelations(id);
        return res.status(200).json({
          ok: true,
          data: {
            job: mapJobRow(detail.job, counts),
            comments: detail.comments.map(mapCommentRow),
            applications: detail.applications.map(mapApplicationRow),
          },
        });
      }

      if (typeof slug === 'string') {
        const rowResult = await client
          .from('job_posts')
          .select(buildJobSelectQuery())
          .eq('slug', slug)
          .single();
        if (rowResult.error) throw new Error(rowResult.error.message);
        const row = rowResult.data as { id: string } | null;
        if (!row?.id) throw new Error('Pekerjaan tidak ditemukan.');

        const detail = await getJobWithRelations(String(row.id));
        const counts = await countJobRelations(String(row.id));
        return res.status(200).json({
          ok: true,
          data: {
            job: mapJobRow(detail.job, counts),
            comments: detail.comments.map(mapCommentRow),
            applications: detail.applications.map(mapApplicationRow),
          },
        });
      }

      let query = client.from('job_posts').select(buildJobSelectQuery()).order('created_at', { ascending: false });

      if (scope === 'customer' && typeof customerId === 'string') {
        query = query.eq('customer_id', customerId);
      } else if (scope === 'talent-applications' && typeof talentId === 'string') {
        const { data: applications, error } = await client
          .from('job_applications')
          .select('id, job_id, talent_id, talent_name, talent_avatar, offer_price, estimated_duration, message, status, created_at')
          .eq('talent_id', talentId)
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return res.status(200).json({
          ok: true,
          data: applications.map(mapApplicationRow),
        });
      } else {
        query = query.in('status', ['OPEN', 'IN_DISCUSSION', 'RECRUITED', 'IN_PROGRESS']);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const rows = data || [];
      const enriched = await Promise.all(
        rows.map(async (row) => {
          const counts = await countJobRelations(String(row.id));
          return mapJobRow(row, counts);
        })
      );

      return res.status(200).json({ ok: true, data: enriched });
    } catch (error) {
      return res.status(400).json({ ok: false, error: normalizeApiError(error) });
    }
  }

  if (req.method === 'POST') {
    try {
      const { fields, jobId, imagePath, filePath } = await readJobMultipartPayload(req);
      const payload = normalizeJobCreatePayload({
        customerId: fields.customerId,
        customerName: fields.customerName,
        title: fields.title,
        description: fields.description,
        categoryId: fields.categoryId,
        categoryName: fields.categoryName,
        budget: fields.budget,
        location: fields.location,
        latitude: fields.latitude,
        longitude: fields.longitude,
        serviceMode: fields.serviceMode,
        deadline: fields.deadline,
        status: fields.status,
        imagePath,
        filePath,
      });

      const client = getSupabaseAdminClient();
      const slugBase = slugify(payload.title);
      const slug = `${slugBase}-${hashSuffix(jobId)}`;
      const row = {
        id: jobId,
        customer_id: payload.customerId,
        customer_name: payload.customerName,
        title: payload.title,
        slug,
        description: payload.description,
        category_id: payload.categoryId,
        category_name: payload.categoryName,
        budget: payload.budget,
        location: payload.location,
        latitude: payload.latitude,
        longitude: payload.longitude,
        service_mode: payload.serviceMode,
        deadline: payload.deadline,
        status: payload.status,
        image_path: payload.imagePath,
        file_path: payload.filePath,
      };

      const { error } = await client.from('job_posts').insert(row as never);
      if (error) throw new Error(error.message);

      return res.status(200).json({
        ok: true,
        data: {
          id: jobId,
          slug,
        },
      });
    } catch (error) {
      return res.status(400).json({ ok: false, error: normalizeApiError(error) });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
