import { useCallback, useEffect, useState } from 'react';
import { useUpload } from '@/lib/upload-hooks';

export default function Gallery() {
  const [captures, setCaptures] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState('');
  const { start, upload } = useUpload();

  const fetchCaptures = useCallback(async () => {
    try {
      setError('');
      const response = await fetch('/api/gallery', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de charger les captures');
      }

      setCaptures(data.captures || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const captureScreen = async () => {
    if (capturing) return;

    setError('');
    setStatus('🔓 Choisis l’écran, la fenêtre ou l’onglet à capturer...');

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setStatus('');
      setError(
        'La capture d’écran depuis ce navigateur n’est pas disponible. Essaie Chrome ou Edge sur ordinateur, ou un navigateur mobile compatible.'
      );
      return;
    }

    let stream;

    try {
      setCapturing(true);

      // IMPORTANT : cet appel doit être déclenché directement par le clic utilisateur.
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 5, max: 15 } },
        audio: false,
      });

      setStatus('📸 Capture de l’image...');

      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await video.play();

      // Laisse au navigateur le temps de recevoir une vraie frame.
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Le navigateur n’a pas fourni d’image à capturer.');
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Impossible de préparer la capture.');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png', 0.95)
      );

      if (!blob) throw new Error('Impossible de créer le fichier image.');

      const file = new File(
        [blob],
        `capture-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
        { type: 'image/png' }
      );

      setStatus('📤 Envoi vers la galerie...');
      start({ file });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Capture impossible';

      // L'utilisateur peut simplement avoir fermé la boîte de partage.
      if (err?.name === 'NotAllowedError') {
        setStatus('');
        setError('La capture a été annulée ou refusée par le navigateur.');
      } else {
        setStatus('');
        setError(message);
      }
    } finally {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCapturing(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, [fetchCaptures]);

  useEffect(() => {
    if (upload?.status === 'done') {
      setStatus('✅ Capture enregistrée dans la galerie !');
      fetchCaptures();
    }
  }, [upload?.status, fetchCaptures]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🗂 Mes captures</h1>
          <p style={styles.subtitle}>Tes captures d’écran sont enregistrées ici.</p>
        </div>
        <a href="/" style={styles.link}>Accueil</a>
      </div>

      <div style={styles.captureBox}>
        <h2 style={styles.captureTitle}>📸 Nouvelle capture</h2>
        <p style={styles.captureText}>
          Clique sur le bouton, puis choisis ce que tu veux partager avec le navigateur.
        </p>
        <button
          type="button"
          onClick={captureScreen}
          disabled={capturing || upload?.pending}
          style={{ ...styles.button, opacity: capturing || upload?.pending ? 0.6 : 1 }}
        >
          {capturing || upload?.pending ? '⏳ Capture en cours...' : '📸 Capturer mon écran'}
        </button>

        {upload?.pending && (
          <div style={styles.progressBox}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${upload.percent || 0}%` }} />
            </div>
            <p>📤 Envoi : {upload.percent || 0}%</p>
          </div>
        )}

        {status && <p style={styles.status}>{status}</p>}
        {upload?.status === 'error' && (
          <p style={styles.error}>⚠️ Envoi impossible : {upload.error?.message || 'Erreur inconnue'}</p>
        )}
        {error && <p style={styles.error}>⚠️ {error}</p>}
      </div>

      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Toutes les captures</h2>
        <button type="button" onClick={fetchCaptures} style={styles.refreshButton}>
          ↻ Actualiser
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      <div style={styles.grid}>
        {!loading && captures.length === 0 && !error && (
          <p style={styles.empty}>Aucune capture pour l’instant.</p>
        )}

        {captures.map((capture) => (
          <div key={capture.filename} style={styles.card}>
            <a href={capture.url} target="_blank" rel="noreferrer">
              <img src={capture.url} alt={capture.filename} style={styles.img} />
            </a>
            <div style={styles.date}>{new Date(capture.date).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    background: '#0f172a',
    color: 'white',
    padding: 20,
    minHeight: '100vh',
    maxWidth: 1100,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  title: { color: '#25D366', marginBottom: 4 },
  subtitle: { color: '#94a3b8', marginTop: 0 },
  link: { color: '#25D366' },
  captureBox: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
  },
  captureTitle: { marginTop: 0 },
  captureText: { color: '#cbd5e1' },
  button: {
    background: '#25D366',
    color: 'white',
    padding: '14px 20px',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  status: { color: '#cbd5e1', marginBottom: 0 },
  error: { background: '#7f1d1d', padding: 12, borderRadius: 8 },
  progressBox: { marginTop: 15 },
  progressTrack: { background: '#334155', height: 8, borderRadius: 10, overflow: 'hidden' },
  progressBar: { background: '#25D366', height: '100%', transition: 'width .2s' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  sectionTitle: { margin: 0 },
  refreshButton: {
    background: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '9px 12px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
    marginTop: 15,
  },
  card: { border: '1px solid #334155', borderRadius: 10, padding: 8, background: '#1e293b' },
  img: { width: '100%', borderRadius: 6, display: 'block' },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  empty: { color: '#94a3b8' },
};
