'use client';
import { uploadHooks } from '@upstash/blob/react';
import type { uploads } from './uploads';

export const { useUpload } = uploadHooks<typeof uploads>();