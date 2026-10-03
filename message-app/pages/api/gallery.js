import { bucket } from '@/lib/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const list = await bucket.list({ prefix: 'captures/', limit: 100 });
    const captures = list.blobs
      .map((blob) => ({
        filename: blob.path,
        date: blob.uploadedAt,
        url: blob.url,
      }))
      .filter((capture) => Boolean(capture.url));

    return res.status(200).json({ captures });
  } catch (error) {
    console.error('[gallery]', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to list captures',
    });
  }
}
