import type { VercelRequest, VercelResponse } from '@vercel/node';
import { optionalNumber, required } from '../_lib/jobMarketplace';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin';

function parseDurationHours(value: string) {
  const matched = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!matched) return 2;
  const parsed = Number(matched[1].replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const jobId = required(body?.jobId, 'Pekerjaan');
    const applicationId = required(body?.applicationId, 'Lamaran');

    const client = getSupabaseAdminClient();
    const jobResult = await client
      .from('job_posts')
      .select('id, customer_id, customer_name, title, category_name, location, latitude, longitude, deadline, status')
      .eq('id', jobId)
      .single();
    if (jobResult.error) throw new Error(jobResult.error.message);
    const job = jobResult.data as {
      id: string;
      customer_id: string;
      customer_name: string;
      title: string;
      category_name: string;
      location: string;
      latitude: number | null;
      longitude: number | null;
      deadline: string | null;
      status: string;
    } | null;
    if (!job) throw new Error('Data pekerjaan tidak ditemukan.');

    const applicationResult = await client
      .from('job_applications')
      .select('id, talent_id, talent_name, offer_price, estimated_duration, message')
      .eq('id', applicationId)
      .eq('job_id', jobId)
      .single();
    if (applicationResult.error) throw new Error(applicationResult.error.message);
    const application = applicationResult.data as {
      id: string;
      talent_id: string;
      talent_name: string;
      offer_price: number | string;
      estimated_duration: string;
      message: string;
    } | null;
    if (!application) throw new Error('Lamaran pekerjaan tidak ditemukan.');

    const durationHours = parseDurationHours(String(application.estimated_duration || '2 jam'));
    const totalPrice = optionalNumber(application.offer_price) ?? 0;
    const pricePerHour = Math.max(0, Math.round(totalPrice / Math.max(durationHours, 1)));
    const orderDate = typeof job.deadline === 'string' && job.deadline ? job.deadline : new Date().toISOString().slice(0, 10);
    const startTime = '09:00';

    const orderResult = await client
      .from('orders')
      .insert({
        customer_id: job.customer_id,
        talent_id: application.talent_id,
        category: `${job.category_name || 'Job'} - ${job.title}`,
        order_date: orderDate,
        start_time: startTime,
        duration_hours: durationHours,
        address: job.location,
        latitude: job.latitude,
        longitude: job.longitude,
        notes: `Booking otomatis dari job marketplace: ${job.title}. ${application.message || ''}`.trim(),
        price_per_hour: pricePerHour,
        total_price: totalPrice,
        status: 'accepted',
      } as never)
      .select('id')
      .single();
    if (orderResult.error) throw new Error(orderResult.error.message);
    const order = orderResult.data as { id: string } | null;
    if (!order?.id) throw new Error('Order otomatis gagal dibuat.');

    const acceptedOrderId = String(order.id);

    const { error: jobUpdateError } = await client
      .from('job_posts')
      .update({
        status: 'RECRUITED',
        selected_talent_id: application.talent_id,
        selected_application_id: application.id,
        accepted_order_id: acceptedOrderId,
      } as never)
      .eq('id', jobId);
    if (jobUpdateError) throw new Error(jobUpdateError.message);

    const { error: acceptedError } = await client
      .from('job_applications')
      .update({ status: 'ACCEPTED' } as never)
      .eq('id', application.id);
    if (acceptedError) throw new Error(acceptedError.message);

    const { error: rejectedError } = await client
      .from('job_applications')
      .update({ status: 'REJECTED' } as never)
      .eq('job_id', jobId)
      .neq('id', application.id)
      .in('status', ['SUBMITTED', 'VIEWED', 'SHORTLISTED']);
    if (rejectedError) throw new Error(rejectedError.message);

    return res.status(200).json({
      ok: true,
      data: {
        orderId: acceptedOrderId,
        jobId,
        applicationId,
        customerName: String(job.customer_name || 'Customer Suruhin'),
        talentId: String(application.talent_id),
        talentName: String(application.talent_name),
        title: String(job.title),
        location: String(job.location),
        date: orderDate,
        time: startTime,
        durationHours,
        totalPrice,
      },
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menerima lamaran.',
    });
  }
}
