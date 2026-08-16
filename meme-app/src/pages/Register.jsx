import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase.js';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ email, password, displayName });
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('That email is already registered.');
      } else {
        setError('Could not create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ma-card" style={{ maxWidth: 420 }}>
      <h2 className="ma-gallery-title" style={{ fontSize: 24, marginBottom: 16 }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="ma-field">
          <span className="ma-label">Display name</span>
          <input
            className="ma-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="optional"
          />
        </div>
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
        <div className="ma-field">
          <span className="ma-label">Password (min. 6 characters)</span>
          <input
            className="ma-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="ma-btn primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>
        {error && <div className="ma-status err">{error}</div>}
      </form>
      <p style={{ fontFamily: 'Courier New, monospace', fontSize: 12, marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
