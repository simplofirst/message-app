import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUpload } from '@/lib/upload-hooks';

export default function Capture() {
  const router = useRouter();
  const [status, setStatus] = useState('Initialisation...');
  const { start, upload } = useUpload();

  useEffect(() => {
    if (upload?.status === 'done') {
      setStatus('✅ Capture sauvegardée !');
      setTimeout(() => router.push('/gallery'), 1200);
    }
    if (upload?.status === 'error') {
      setStatus('❌ Erreur : ' + upload.error.message);
    }
    if (upload?.pending) {
      setStatus(`📤 Envoi en cours... ${upload.percent}%`);
    }
  }, [upload, router]);

  useEffect(() => {
    if (!router.isReady) return;

    const { token } = router.query;
    if (!token) return setStatus('❌ Token manquant');

    const run = async () => {
      try {
        setStatus('🔓 Demande d’accès à l’écran...');

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        await new Promise(r => setTimeout(r, 400));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        stream.getTracks().forEach(t => t.stop());

        setStatus('📤 Préparation de l’envoi...');
        canvas.toBlob((blob) => {
          if (!blob) return setStatus('❌ Erreur de capture');
          const file = new File([blob], 'capture.png', { type: 'image/png' });
          start({ file });
        }, 'image/png');
      } catch (err) {
        setStatus('❌ ' + err.message);
      }
    };

    run();
  }, [router.isReady]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Message-App</h1>
      <div style={styles.status}>{status}</div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'system-ui', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, textAlign: 'center' },
  title: { fontSize: 22, color: '#25D366' },
  status: { fontSize: 16, marginTop: 20, padding: 20 },
};