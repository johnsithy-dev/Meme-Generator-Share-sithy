import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../firebase.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser({ email, password });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Could not log in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ma-card" style={{ maxWidth: 420 }}>
      <h2 className="ma-gallery-title" style={{ fontSize: 24, marginBottom: 16 }}>Log in</h2>
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
        <div className="ma-field">
          <span className="ma-label">Password</span>
          <input
            className="ma-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="ma-btn primary" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
        {error && <div className="ma-status err">{error}</div>}
      </form>
      <p style={{ fontFamily: 'Courier New, monospace', fontSize: 12, marginTop: 16 }}>
        No account? <Link to="/register">Register</Link> &middot; <Link to="/forgot-password">Forgot password?</Link>
      </p>
    </div>
  );
}
