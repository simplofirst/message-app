import { useEffect, useState } from 'react';
import { bucket } from '@/lib/blob';

export default function Gallery() {
  const [captures, setCaptures] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCaptures = async () => {
      try {
        const list = await bucket.list({ prefix: 'captures/', limit: 100 });
        const capturesWithUrls = list.blobs.map((blob) => ({
          filename: blob.path,
          date: blob.uploadedAt,
          url: blob.url,
        }));
        setCaptures(capturesWithUrls);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCaptures();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🗂 Mes captures</h1>
      <a href="/" style={styles.link}>← Retour</a>

      {error && (
        <p style={styles.error}>
          ⚠️ Impossible de charger les captures : {error}.
        </p>
      )}

      <div style={styles.grid}>
        {captures.length === 0 && !error && <p>Aucune capture pour l’instant.</p>}
        {captures.map(c => (
          <div key={c.filename} style={styles.card}>
            <img src={c.url} style={styles.img} />
            <div style={styles.date}>{new Date(c.date).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'system-ui', background: '#0f172a', color: 'white', padding: 20, minHeight: '100vh' },
  title: { color: '#25D366' },
  link: { color: '#25D366' },
  error: { background: '#7f1d1d', padding: 15, borderRadius: 8, marginTop: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginTop: 20 },
  card: { border: '1px solid #334155', borderRadius: 10, padding: 8, background: '#1e293b' },
  img: { width: '100%', borderRadius: 6 },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
};