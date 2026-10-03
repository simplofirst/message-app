import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CaptureRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) router.replace('/gallery');
  }, [router.isReady]);

  return (
    <main style={{ fontFamily: 'system-ui', padding: 30, textAlign: 'center' }}>
      Redirection vers la galerie...
    </main>
  );
}
