import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMemes } from '../firebase.js';
import MemeCard from '../components/MemeCard.jsx';
import PhotoCarousel from '../components/PhotoCarousel.jsx';

export default function Home() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchMemes();
      setMemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalMemes = memes.length;
  const totalLikes = memes.reduce((sum, m) => sum + (m.likedBy || []).length, 0);
  const uniqueAuthors = new Set(memes.map((m) => m.authorId).filter(Boolean)).size;
  const recentMemes = memes.slice(0, 3);

  return (
    <div>
      <div className="ma-card ma-about-grid">
        <div>
          <h2 className="ma-gallery-title" style={{ fontSize: 32, marginBottom: 16 }}>
            Welcome to the Wall
          </h2>
          <p className="ma-about-text">
            Upload a picture, add some text and stickers, and post it for everyone to see.
            No fuss, no filters — just a place to make something dumb and share it.
          </p>
          <div className="ma-btn-row" style={{ marginTop: 20 }}>
            <Link to="/create" className="ma-btn primary">Start creating</Link>
            <Link to="/gallery" className="ma-btn ghost">View gallery</Link>
          </div>
        </div>
<div className="ma-about-photo-col">
  <div className="ma-about-photo-frame">
    <PhotoCarousel
      images={[
        '/home-photo-1.jpg',
        '/home-photo-2.jpg',
        '/home-photo-3.jpg',
        '/home-photo-4.jpg',
        '/home-photo-5.jpg',
      ]}
    />
  </div>
  <span className="ma-about-sticker ma-about-sticker-1">😍</span>
  <span className="ma-about-sticker ma-about-sticker-2">🔥</span>
</div>
      </div>

      {!loading && totalMemes > 0 && (
        <div className="ma-card">
          <div className="ma-home-stats">
            <div className="ma-home-stat">
              <span className="ma-home-stat-number">{totalMemes}</span>
              <span className="ma-home-stat-label">memes posted</span>
            </div>
            <div className="ma-home-stat">
              <span className="ma-home-stat-number">{totalLikes}</span>
              <span className="ma-home-stat-label">total likes</span>
            </div>
            <div className="ma-home-stat">
              <span className="ma-home-stat-number">{uniqueAuthors}</span>
              <span className="ma-home-stat-label">creators</span>
            </div>
          </div>
        </div>
      )}

      {!loading && recentMemes.length > 0 && (
        <div className="ma-card">
          <div className="ma-gallery-head">
            <h2 className="ma-gallery-title">Fresh on the Wall</h2>
            <Link to="/gallery" className="ma-gallery-note" style={{ textDecoration: 'underline' }}>
              see all &rarr;
            </Link>
          </div>
         <div className="ma-home-recent-grid">
  {recentMemes.map((meme) => (
    <MemeCard key={meme.id} meme={meme} />
  ))}
</div>
        </div>
      )}
    </div>
  );
}