import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readMultipartPayload } from '../_lib/multipart';
import { assertUploadableFile, getSafeExtension, uploadPrivateBuffer } from '../_lib/mvpUpload';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin';

export const config = {
  api: {
    bodyParser: false,
  },
};

function required(value: string | undefined, label: string) {
  if (!value?.trim()) {
    throw new Error(`${label} wajib diisi.`);
  }
  return value.trim();
}

function normalizeApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Gagal menyimpan data customer.';
  if (message.includes('duplicate key')) return 'Data customer sudah terdaftar atau ID bentrok. Silakan coba lagi.';
  if (message.includes('violates foreign key')) return 'Relasi data customer belum siap di database.';
  return message;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await readMultipartPayload(req);
    const id = required(fields.id, 'ID customer');
    const profilePhoto = files.profilePhoto;
    const ktpPhoto = files.ktpPhoto;

    assertUploadableFile(profilePhoto, 'Foto profil');
    assertUploadableFile(ktpPhoto, 'KTP');

    const profileExt = getSafeExtension(profilePhoto, 'jpg');
    const ktpExt = getSafeExtension(ktpPhoto, 'jpg');

    const profilePath = await uploadPrivateBuffer('customer-files', `customer/profile/${id}/foto.${profileExt}`, profilePhoto, { upsert: true });
    const ktpPath = await uploadPrivateBuffer('customer-files', `customer/ktp/${id}/ktp.${ktpExt}`, ktpPhoto, { upsert: true });

    const client = getSupabaseAdminClient();
    const customerRow = {
      id,
      full_name: required(fields.fullName, 'Nama lengkap'),
      email: required(fields.email, 'Email'),
      phone: required(fields.phone, 'Nomor WhatsApp'),
      nik: required(fields.nik, 'NIK'),
      birth_place: required(fields.birthPlace, 'Tempat lahir'),
      birth_date: required(fields.birthDate, 'Tanggal lahir'),
      gender: required(fields.gender, 'Jenis kelamin'),
      address: required(fields.address, 'Alamat lengkap'),
      rt_rw: required(fields.rtRw, 'RT/RW'),
      village: required(fields.village, 'Kelurahan/desa'),
      district: required(fields.district, 'Kecamatan'),
      city: required(fields.city, 'Kota'),
      religion: required(fields.religion, 'Agama'),
      marital_status: required(fields.maritalStatus, 'Status perkawinan'),
      occupation: required(fields.occupation, 'Pekerjaan'),
      nationality: (fields.nationality || 'WNI').trim(),
      profile_photo_path: profilePath,
      ktp_path: ktpPath,
    };
    const { error } = await client.from('customers').insert(customerRow as never);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      ok: true,
      data: { id },
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: normalizeApiError(error),
    });
  }
}
