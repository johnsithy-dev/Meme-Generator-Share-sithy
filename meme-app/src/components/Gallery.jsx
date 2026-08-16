import React, { useEffect, useMemo, useState } from 'react';
import { fetchMemes } from '../firebase.js';
import MemeCard from './MemeCard.jsx';

export default function Gallery() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    const key = 'ma-scroll:' + window.location.pathname;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      // Wait a beat for the grid to actually render before jumping.
      const timer = setTimeout(() => {
        window.scrollTo(0, parseInt(saved, 10));
        sessionStorage.removeItem(key);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMemes();
      setMemes(data);
    } catch (err) {
      console.error(err);
      setError('Could not load the gallery right now.');
    } finally {
      setLoading(false);
    }
  }

  const visibleMemes = useMemo(() => {
    let result = memes;

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((m) => {
        const haystack = `${m.title || ''} ${m.author || ''} ${m.captionText || ''} ${m.top || ''} ${m.bottom || ''}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    result = [...result];
    if (sortBy === 'liked') {
      result.sort((a, b) => (b.likedBy || []).length - (a.likedBy || []).length);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    } else {
      result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }

    return result;
  }, [memes, searchTerm, sortBy]);

  return (
    <div className="ma-card">
      <div className="ma-gallery-head">
        <h2 className="ma-gallery-title">The Wall</h2>
        <span className="ma-gallery-note">shared &middot; visible to everyone</span>
      </div>

      {!loading && !error && memes.length > 0 && (
        <div className="ma-search-bar">
          <input
            className="ma-input"
            placeholder="Search by title, author, or caption…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="ma-input ma-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="liked">Most liked</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      )}

      {loading && <div className="ma-loading">loading memes&hellip;</div>}
      {!loading && error && <div className="ma-emptystate">{error}</div>}
      {!loading && !error && memes.length === 0 && (
        <div className="ma-emptystate">The wall is empty. Be the first to post a meme.</div>
      )}
      {!loading && !error && memes.length > 0 && visibleMemes.length === 0 && (
        <div className="ma-emptystate">No memes match your search.</div>
      )}

      {!loading && !error && visibleMemes.length > 0 && (
        <div className="ma-grid">
          {visibleMemes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>
      )}
    </div>
  );
}