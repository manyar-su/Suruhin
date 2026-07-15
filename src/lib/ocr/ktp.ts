export interface KtpParsedFields {
  nik: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  rt_rw: string;
  village: string;
  district: string;
  city: string;
  religion: string;
  marital_status: string;
  occupation: string;
  nationality: string;
}

export const EMPTY_KTP_FIELDS: KtpParsedFields = {
  nik: '',
  full_name: '',
  birth_place: '',
  birth_date: '',
  gender: '',
  address: '',
  rt_rw: '',
  village: '',
  district: '',
  city: '',
  religion: '',
  marital_status: '',
  occupation: '',
  nationality: '',
};

function cleanValue(value: string) {
  return value
    .replace(/^[\s:.-]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeLine(line: string) {
  return line
    .replace(/\s+/g, ' ')
    .replace(/[|]/g, 'I')
    .trim();
}

function toIsoDate(raw: string) {
  const cleaned = raw.replace(/[^\d/-]/g, '').trim();
  const match = cleaned.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (!match) return '';

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function extractLineValue(lines: string[], labelPatterns: RegExp[]) {
  for (const line of lines) {
    for (const pattern of labelPatterns) {
      const match = line.match(pattern);
      if (match?.[1]) {
        return cleanValue(match[1]);
      }
    }
  }

  return '';
}

function extractAddress(lines: string[]) {
  const addressIndex = lines.findIndex((line) => /^ALAMAT\b/i.test(line));
  if (addressIndex === -1) return '';

  const inline = cleanValue(lines[addressIndex].replace(/^ALAMAT\b[:\s-]*/i, ''));
  if (inline) return inline;

  const nextLine = lines[addressIndex + 1] || '';
  if (/^(RT\/RW|KEL|DESA|KECAMATAN|AGAMA|STATUS)/i.test(nextLine)) return '';
  return cleanValue(nextLine);
}

function extractCity(lines: string[]) {
  for (const line of lines) {
    const normalized = normalizeLine(line).toUpperCase();
    if (normalized.startsWith('KOTA ') || normalized.startsWith('KABUPATEN ')) {
      return cleanValue(line);
    }
  }

  return '';
}

export function parseKtpText(text: string): KtpParsedFields {
  const lines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const nik = (text.match(/\b\d{16}\b/) || [''])[0];
  const full_name = extractLineValue(lines, [
    /^NAMA\b[:\s-]*(.+)$/i,
  ]);

  const ttlValue = extractLineValue(lines, [
    /^TEMPAT\/TGL LAHIR\b[:\s-]*(.+)$/i,
    /^TEMPAT,TGL LAHIR\b[:\s-]*(.+)$/i,
    /^TEMPAT TGL LAHIR\b[:\s-]*(.+)$/i,
  ]);

  let birth_place = '';
  let birth_date = '';
  if (ttlValue) {
    const dateMatch = ttlValue.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
    if (dateMatch) {
      birth_date = toIsoDate(dateMatch[1]);
      birth_place = cleanValue(ttlValue.replace(dateMatch[1], '').replace(/[,]/g, ' '));
    } else {
      birth_place = ttlValue;
    }
  }

  const genderRaw = extractLineValue(lines, [
    /^JENIS KELAMIN\b[:\s-]*(.+)$/i,
  ]).toUpperCase();
  const gender = genderRaw.includes('PEREMPUAN')
    ? 'PEREMPUAN'
    : genderRaw.includes('LAKI')
      ? 'LAKI-LAKI'
      : genderRaw;

  const rtRwRaw = extractLineValue(lines, [
    /^RT\/RW\b[:\s-]*(.+)$/i,
  ]);
  const rtRwMatch = rtRwRaw.match(/(\d{1,3}\s*\/\s*\d{1,3})/);

  const nationalityRaw = extractLineValue(lines, [
    /^KEWARGANEGARAAN\b[:\s-]*(.+)$/i,
  ]).toUpperCase();

  return {
    nik,
    full_name,
    birth_place,
    birth_date,
    gender,
    address: extractAddress(lines),
    rt_rw: rtRwMatch ? rtRwMatch[1].replace(/\s+/g, '') : rtRwRaw,
    village: extractLineValue(lines, [
      /^KEL\/DESA\b[:\s-]*(.+)$/i,
      /^KELURAHAN\/DESA\b[:\s-]*(.+)$/i,
      /^DESA\b[:\s-]*(.+)$/i,
      /^KELURAHAN\b[:\s-]*(.+)$/i,
    ]),
    district: extractLineValue(lines, [
      /^KECAMATAN\b[:\s-]*(.+)$/i,
    ]),
    city: extractCity(lines),
    religion: extractLineValue(lines, [
      /^AGAMA\b[:\s-]*(.+)$/i,
    ]),
    marital_status: extractLineValue(lines, [
      /^STATUS PERKAWINAN\b[:\s-]*(.+)$/i,
    ]),
    occupation: extractLineValue(lines, [
      /^PEKERJAAN\b[:\s-]*(.+)$/i,
    ]),
    nationality: nationalityRaw.includes('WNI')
      ? 'WNI'
      : nationalityRaw.includes('WNA')
        ? 'WNA'
        : nationalityRaw,
  };
}

export function countFilledKtpFields(fields: KtpParsedFields) {
  return Object.values(fields).filter((value) => value.trim().length > 0).length;
}
