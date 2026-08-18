import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfilePicture, updateUserProfile, fetchMemesByUser, updateMeme, deleteMeme, resendVerificationEmail } from '../firebase.js';
import MemeCard from '../components/MemeCard.jsx';

const MAX_DIM = 300;

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [myMemes, setMyMemes] = useState([]);
  const [loadingMemes, setLoadingMemes] = useState(true);
  const [showPfpModal, setShowPfpModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ msg: '', kind: '' });

  useEffect(() => {
    if (!user) return;
    loadMyMemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setShowPfpModal(false);
        setShowEditModal(false);
      }
    }
    if (showPfpModal || showEditModal) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showPfpModal, showEditModal]);

  async function loadMyMemes() {
    setLoadingMemes(true);
    try {
      const data = await fetchMemesByUser(user.uid);
      setMyMemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMemes(false);
    }
  }

  function openEditModal() {
    setEditName(profile?.displayName || '');
    setEditBio(profile?.bio || '');
    setPendingPhoto(null);
    setStatus({ msg: '', kind: '' });
    setShowEditModal(true);
  }

  function handlePhotoPick(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          const scale = MAX_DIM / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setPendingPhoto(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ msg: '', kind: '' });
    try {
      await updateUserProfile(user.uid, { displayName: editName.trim(), bio: editBio.trim() });
      if (pendingPhoto) {
        await updateProfilePicture(user.uid, pendingPhoto);
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus({ msg: err.message || 'Could not save your profile.', kind: 'err' });
      setSaving(false);
    }
  }

  function startEdit(meme) {
    setEditingId(meme.id);
    setEditTitle(meme.title || '');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    setBusyId(id);
    try {
      await updateMeme(id, { title: editTitle });
      setMyMemes((prev) => prev.map((m) => (m.id === id ? { ...m, title: editTitle } : m)));
      setEditingId(null);
      setStatus({ msg: 'Saved.', kind: 'ok' });
    } catch (err) {
      console.error(err);
      setStatus({ msg: 'Could not save: ' + (err.message || 'permission denied'), kind: 'err' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this meme? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await deleteMeme(id);
      setMyMemes((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  }

  if (!user) {
    return (
      <div className="ma-card">
        <div className="ma-emptystate">Log in to view your profile.</div>
      </div>
    );
  }

  const totalLikes = myMemes.reduce((sum, m) => sum + (m.likedBy || []).length, 0);
  const joined = profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : '—';

  return (
    <div>
      <button className="ma-btn ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <div className="ma-card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="ma-avatar-lg ma-avatar-btn"
          onClick={() => profile?.photoURL && setShowPfpModal(true)}
          disabled={!profile?.photoURL}
          title={profile?.photoURL ? 'View profile picture' : ''}
        >
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" />
          ) : (
            <span>{(profile?.displayName || user.email)[0].toUpperCase()}</span>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 className="ma-gallery-title" style={{ fontSize: 22 }}>
            {profile?.displayName || user.email}
          </h2>
          <p style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color: 'var(--gray)' }}>
            {user.email}
          </p>
          {!user.emailVerified && (
            <div className="ma-status err" style={{ marginTop: 6 }}>
              Email not verified —{' '}
              <button
                className="ma-btn ghost"
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() =>
                  resendVerificationEmail().then((result) => {
                    if (result?.alreadyVerified) {
                      alert('Your email is already verified — refreshing your session.');
                      window.location.reload();
                    } else {
                      alert('Verification email sent!');
                    }
                  })
                }
              >
                resend email
              </button>
            </div>
          )}
          {profile?.bio && (
            <p style={{ fontFamily: 'Courier New, monospace', fontSize: 13, marginTop: 6 }}>{profile.bio}</p>
          )}
          <div className="ma-profile-stats">
            <span><strong>{myMemes.length}</strong> posts</span>
            <span><strong>{totalLikes}</strong> likes received</span>
            <span>joined {joined}</span>
          </div>
          <button className="ma-btn primary" style={{ marginTop: 12 }} onClick={openEditModal}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="ma-card">
        <div className="ma-gallery-head">
          <h2 className="ma-gallery-title">Your Posts</h2>
        </div>
        {loadingMemes && <div className="ma-loading">loading&hellip;</div>}
        {!loadingMemes && myMemes.length === 0 && (
          <div className="ma-emptystate">You haven't posted any memes yet.</div>
        )}
        {!loadingMemes && myMemes.length > 0 && (
          <div className="ma-grid">
            {myMemes.map((meme) => (
              <div key={meme.id}>
                <MemeCard meme={meme} />

                {editingId === meme.id ? (
                  <div className="ma-owner-edit-panel">
                    <input
                      className="ma-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                      maxLength={60}
                    />
                    <div className="ma-btn-row" style={{ marginTop: 8 }}>
                      <button
                        className="ma-btn primary"
                        onClick={() => saveEdit(meme.id)}
                        disabled={busyId === meme.id}
                      >
                        Save
                      </button>
                      <button className="ma-btn ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ma-btn-row ma-owner-controls">
                    <button className="ma-btn ghost ma-small-btn" onClick={() => startEdit(meme)}>
                      Edit title
                    </button>
                    <button
                      className="ma-btn ghost ma-small-btn"
                      onClick={() => handleDelete(meme.id)}
                      disabled={busyId === meme.id}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPfpModal && (
        <div className="ma-modal-overlay" onClick={() => setShowPfpModal(false)}>
          <div className="ma-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ma-modal-close" onClick={() => setShowPfpModal(false)} aria-label="Close">
              ✕
            </button>
            <img src={profile.photoURL} alt="Profile large" />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="ma-modal-overlay" onClick={() => !saving && setShowEditModal(false)}>
          <div className="ma-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button className="ma-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close" disabled={saving}>
              ✕
            </button>
            <h2 className="ma-gallery-title" style={{ fontSize: 20, marginBottom: 14 }}>Edit Profile</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="ma-field" style={{ textAlign: 'center' }}>
                <div className="ma-avatar-lg" style={{ margin: '0 auto 10px' }}>
                  {pendingPhoto || profile?.photoURL ? (
                    <img src={pendingPhoto || profile.photoURL} alt="Preview" />
                  ) : (
                    <span>{(editName || user.email)[0].toUpperCase()}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="ma-btn ghost"
                  onClick={() => fileInputRef.current.click()}
                >
                  Choose new picture
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="ma-hidden"
                  onChange={handlePhotoPick}
                />
              </div>

              <div className="ma-field">
                <span className="ma-label">Display name</span>
                <input
                  className="ma-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={30}
                  required
                />
              </div>

              <div className="ma-field">
                <span className="ma-label">Bio</span>
                <textarea
                  className="ma-input"
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={140}
                  placeholder="Tell people a bit about yourself…"
                />
              </div>

              <button className="ma-btn primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {status.msg && <div className={`ma-status ${status.kind}`}>{status.msg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
