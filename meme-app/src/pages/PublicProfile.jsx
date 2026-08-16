import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserProfile, fetchMemesByUser } from '../firebase.js';
import MemeCard from '../components/MemeCard.jsx';

export default function PublicProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function load() {
    setLoading(true);
    setNotFound(false);
    try {
      const p = await getUserProfile(uid);
      if (!p) {
        setNotFound(true);
        return;
      }
      setProfile(p);
      const userMemes = await fetchMemesByUser(uid);
      setMemes(userMemes);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="ma-loading">loading profile&hellip;</div>;
  }

  if (notFound || !profile) {
    return (
      <div className="ma-card">
        <div className="ma-emptystate">This user could not be found.</div>
        <div className="ma-btn-row" style={{ marginTop: 12 }}>
          <button className="ma-btn ghost" onClick={() => navigate(-1)}>← Back to Gallery</button>
        </div>
      </div>
    );
  }

  const totalLikes = memes.reduce((sum, m) => sum + (m.likedBy || []).length, 0);
  const joined = profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : '—';

  return (
    <div>
      <button className="ma-btn ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back to Gallery
      </button>

      <div className="ma-card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ma-avatar-lg">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} />
          ) : (
            <span>{(profile.displayName || '?')[0].toUpperCase()}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 className="ma-gallery-title" style={{ fontSize: 22 }}>{profile.displayName}</h2>
          {profile.bio && (
            <p style={{ fontFamily: 'Courier New, monospace', fontSize: 13, marginTop: 6 }}>{profile.bio}</p>
          )}
          <div className="ma-profile-stats">
            <span><strong>{memes.length}</strong> posts</span>
            <span><strong>{totalLikes}</strong> likes received</span>
            <span>joined {joined}</span>
          </div>
        </div>
      </div>

      <div className="ma-card">
        <div className="ma-gallery-head">
          <h2 className="ma-gallery-title">Posts</h2>
        </div>
        {memes.length === 0 ? (
          <div className="ma-emptystate">No posts yet.</div>
        ) : (
          <div className="ma-grid">
            {memes.map((meme) => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}