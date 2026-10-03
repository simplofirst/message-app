'use client';

import { uploadHooks } from '@upstash/blob/react';

// Unbound hook : il utilise /api/upload par défaut.
export const { useUpload } = uploadHooks();
