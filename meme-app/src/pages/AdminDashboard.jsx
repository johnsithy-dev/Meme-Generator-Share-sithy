import React, { useEffect, useState } from 'react';
import { fetchMemes, updateMeme, deleteMeme, fetchMessages, deleteMessage } from '../firebase.js';

export default function AdminDashboard() {
  const [tab, setTab] = useState('memes');

  return (
    <<div className="ma-admin-tabs">
  <button className={`ma-admin-tab ${tab === 'memes' ? 'active' : ''}`} onClick={() => setTab('memes')}>
    Memes
  </button>
  <button className={`ma-admin-tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
    Messages
  </button>
</div>
      {tab === 'memes' ? <MemesPanel /> : <MessagesPanel />}
    </div>
  );
}

function MemesPanel() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMemes();
      setMemes(data);
    } catch (err) {
      console.error(err);
      setError('Could not load memes.');
    } finally {
      setLoading(false);
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
      setMemes((prev) => prev.map((m) => (m.id === id ? { ...m, title: editTitle } : m)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError('Could not save: ' + (err.message || 'permission denied'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this meme? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await deleteMeme(id);
      setMemes((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete this meme.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="ma-card">
      <div className="ma-gallery-head">
        <h2 className="ma-gallery-title">Admin Dashboard</h2>
        <span className="ma-gallery-note">{memes.length} meme{memes.length === 1 ? '' : 's'} total</span>
      </div>

      {loading && <div className="ma-loading">loading&hellip;</div>}
      {!loading && error && <div className="ma-status err">{error}</div>}
      {!loading && memes.length === 0 && (
        <div className="ma-emptystate">No memes have been posted yet.</div>
      )}

      {!loading && memes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', fontFamily: "'Arial Black', sans-serif", fontSize: 11, textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 6px' }}>Preview</th>
              <th style={{ padding: '8px 6px' }}>Author</th>
              <th style={{ padding: '8px 6px' }}>Title</th>
              <th style={{ padding: '8px 6px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memes.map((meme) => (
              <tr key={meme.id} style={{ borderTop: '2px solid var(--ink)' }}>
                <td style={{ padding: '10px 6px', width: 90 }}>
                  <img src={meme.imageUrl} alt="" style={{ width: 70, border: '2px solid var(--ink)', display: 'block' }} />
                </td>
                <td style={{ padding: '10px 6px', fontFamily: 'Courier New, monospace', fontSize: 12 }}>
                  @{meme.author || 'anonymous'}
                </td>
                <td style={{ padding: '10px 6px', minWidth: 220 }}>
                  {editingId === meme.id ? (
                    <input
                      className="ma-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                      maxLength={60}
                    />
                  ) : (
                    <span style={{ fontFamily: 'Courier New, monospace', fontSize: 12 }}>
                      {meme.title || <em>(no title)</em>}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 6px' }}>
                  {editingId === meme.id ? (
                    <div className="ma-btn-row">
                      <button className="ma-btn primary" onClick={() => saveEdit(meme.id)} disabled={busyId === meme.id}>
                        Save
                      </button>
                      <button className="ma-btn ghost" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="ma-btn-row">
                      <button className="ma-btn ghost" onClick={() => startEdit(meme)}>Edit</button>
                      <button className="ma-btn ghost" onClick={() => handleDelete(meme.id)} disabled={busyId === meme.id}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function MessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this message?')) return;
    setBusyId(id);
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete this message.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="ma-card">
      <div className="ma-gallery-head">
        <h2 className="ma-gallery-title">Contact Messages</h2>
        <span className="ma-gallery-note">{messages.length} message{messages.length === 1 ? '' : 's'}</span>
      </div>

      {loading && <div className="ma-loading">loading&hellip;</div>}
      {!loading && error && <div className="ma-status err">{error}</div>}
      {!loading && messages.length === 0 && (
        <div className="ma-emptystate">No messages yet.</div>
      )}

      {!loading && messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ border: '2px solid var(--ink)', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Arial Black', sans-serif", fontSize: 12 }}>
                <span>{msg.name || 'anonymous'}{msg.email ? ` <${msg.email}>` : ''}</span>
                <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 'normal', color: 'var(--gray)' }}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : ''}
                </span>
              </div>
              <p style={{ fontFamily: 'Courier New, monospace', fontSize: 13, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </p>
              <button className="ma-btn ghost" onClick={() => handleDelete(msg.id)} disabled={busyId === msg.id}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
