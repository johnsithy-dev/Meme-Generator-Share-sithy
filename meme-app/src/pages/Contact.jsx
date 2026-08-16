import React, { useState } from 'react';
import { submitContactMessage } from '../firebase.js';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ msg: '', kind: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setStatus({ msg: '', kind: '' });
    try {
      await submitContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() });
      setStatus({ msg: `Thanks${name ? `, ${name}` : ''} — your message has been sent.`, kind: 'ok' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setStatus({ msg: 'Could not send your message. Please try again.', kind: 'err' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ma-card ma-about-grid">
      <div>
        <h2 className="ma-gallery-title" style={{ fontSize: 30, marginBottom: 16 }}>
          Contact
        </h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
          <div className="ma-field">
            <span className="ma-label">Your name</span>
            <input className="ma-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="ma-field">
            <span className="ma-label">Email (optional)</span>
            <input
              className="ma-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="ma-field">
            <span className="ma-label">Message</span>
            <textarea
              className="ma-input"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button className="ma-btn primary" type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
          {status.msg && <div className={`ma-status ${status.kind}`}>{status.msg}</div>}
        </form>
      </div>

      <div className="ma-about-photo-col">
        <div className="ma-about-photo-frame">
          <img src="/contact-photo.jpg" alt="Contact us" />
        </div>
        <span className="ma-about-sticker ma-about-sticker-1">💌</span>
        <span className="ma-about-sticker ma-about-sticker-2">👋</span>
      </div>
    </div>
  );
}