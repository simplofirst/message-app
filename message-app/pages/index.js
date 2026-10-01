import { useState } from 'react';

export default function Home() {
  const [link, setLink] = useState('');

  const generateLink = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/capture?token=${token}`;
    setLink(url);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📸 Message-App</h1>
      <p style={styles.subtitle}>Capture ton écran en un clic, où que tu sois.</p>

      <button onClick={generateLink} style={styles.button}>
        Générer mon lien
      </button>

      {link && (
        <div style={styles.box}>
          <p><strong>Ton lien :</strong></p>
          <a href={link} style={styles.link}>{link}</a>
          <p style={styles.hint}>
            Ajoute-le à ton écran d’accueil pour capturer en 1 clic.
          </p>
        </div>
      )}

      <a href="/gallery" style={styles.galleryLink}>Voir mes captures →</a>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'system-ui', padding: 20, maxWidth: 600, margin: 'auto', background: '#0f172a', color: 'white', minHeight: '100vh' },
  title: { fontSize: 26 },
  subtitle: { color: '#94a3b8' },
  button: { background: '#25D366', color: 'white', padding: '14px 22px', border: 'none', borderRadius: 10, fontSize: 16, cursor: 'pointer' },
  box: { background: '#1e293b', padding: 15, borderRadius: 10, marginTop: 15, wordBreak: 'break-all' },
  link: { color: '#25D366' },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 10 },
  galleryLink: { display: 'block', marginTop: 30, color: '#25D366' },
};