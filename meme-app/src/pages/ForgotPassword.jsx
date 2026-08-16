import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../firebase.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ msg: '', kind: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ msg: '', kind: '' });
    try {
      await resetPassword(email);
      setStatus({ msg: 'Check your inbox for a password reset link.', kind: 'ok' });
    } catch (err) {
      console.error(err);
      setStatus({ msg: 'Could not send reset email. Check the address and try again.', kind: 'err' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ma-card" style={{ maxWidth: 420 }}>
      <h2 className="ma-gallery-title" style={{ fontSize: 24, marginBottom: 16 }}>Reset password</h2>
      <form onSubmit={handleSubmit}>
        <div className="ma-field">
          <span className="ma-label">Email</span>
          <input
            className="ma-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="ma-btn primary" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        {status.msg && <div className={`ma-status ${status.kind}`}>{status.msg}</div>}
      </form>
      <p style={{ fontFamily: 'Courier New, monospace', fontSize: 12, marginTop: 16 }}>
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  );
}
