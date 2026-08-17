import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMemeById } from '../firebase.js';
import MemeCard from '../components/MemeCard.jsx';

export default function MemeView() {
  const { memeId } = useParams();
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memeId]);

  async function load() {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await fetchMemeById(memeId);
      if (!data) {
        setNotFound(true);
      } else {
        setMeme(data);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="ma-loading">loading meme&hellip;</div>;
  }

  if (notFound || !meme) {
    return (
      <div className="ma-card">
        <div className="ma-emptystate">This meme could not be found. It may have been deleted.</div>
        <div className="ma-btn-row" style={{ marginTop: 12 }}>
          <Link to="/gallery" className="ma-btn ghost">Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/gallery" className="ma-btn ghost" style={{ marginBottom: 16, display: 'inline-block' }}>
        ← Back to Gallery
      </Link>
      <div className="ma-card">
        <div className="ma-grid" style={{ maxWidth: 340 }}>
          <MemeCard meme={meme} autoOpen />
        </div>
      </div>
    </div>
  );
}