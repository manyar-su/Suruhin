const SERVICE_ASSET_BASE = '/assets/jasa';

export function getServiceImagePath(filename?: string) {
  if (!filename) return undefined;
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename;
  }
  return `${SERVICE_ASSET_BASE}/${filename}`;
}

export function getStaticAssetPath(path: string) {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `/assets/${path.replace(/^assets\//, '')}`;
}
