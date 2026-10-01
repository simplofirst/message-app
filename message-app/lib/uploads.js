import { uploadHandler } from '@upstash/blob';

export const uploads = uploadHandler({
  constraints: {
    maxSize: '15mb',
    contentTypes: ['image/png', 'image/jpeg'],
  },
  onBeforeUpload: () => ({
    path: `captures/capture-${Date.now()}.png`,
  }),
});
