import 'server-only';
import { uploadHandler } from '@upstash/blob';

export const uploads = uploadHandler({
  constraints: {
    maxSize: '15mb',
    contentTypes: ['image/png', 'image/jpeg'],
  },
  onBeforeUpload: ({ file }) => ({
    path: `captures/capture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.type === 'image/jpeg' ? 'jpg' : 'png'}`,
  }),
});
