import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logoutUser } from '../firebase.js';

export default function Nav() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDocked, setShowDocked] = useState(false);
  const heroRightRef = useRef(null);

  useEffect(() => {
    const target = heroRightRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowDocked(!entry.isIntersecting);
      },
      { rootMargin: '-56px 0px 0px 0px', threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [user]);

  async function handleLogout() {
    if (!window.confirm('Log out of your account?')) return;
    await logoutUser();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const authControls = (
    <>
      {user && (
        <NavLink to="/profile" onClick={closeMenu} className="ma-avatar-link" title="Your profile">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" />
          ) : (
            <span>{(profile?.displayName || user.email)[0].toUpperCase()}</span>
          )}
        </NavLink>
      )}
      {user ? (
        <button className="ma-tab ma-auth-btn" onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <NavLink to="/login" onClick={closeMenu} className="ma-tab ma-auth-btn">
          Log in
        </NavLink>
      )}
    </>
  );

  return (
    <>
      <header className="ma-hero">
        <div className="ma-hero-top">
          <div>
            <h1 className="ma-title">
              <span>Meme</span>
              <br />
              Generator
            </h1>
            <p className="ma-tagline">
              // upload an image, caption it, ship it to the public wall.
            </p>
          </div>

          <div className="ma-hero-right" ref={heroRightRef}>
            {authControls}
          </div>
        </div>
      </header>

      <div className="ma-site-nav">
        <nav className="ma-desktop-links">
          <NavLink to="/" end className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/create" className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Create</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Gallery</NavLink>
          <NavLink to="/about" className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/services" className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Services</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Contact</NavLink>
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Admin</NavLink>}
        </nav>

        <div className={`ma-nav-right ${showDocked ? 'visible' : ''}`}>
  <button
    className="ma-hamburger"
    aria-label="Toggle menu"
    aria-expanded={menuOpen}
    onClick={() => setMenuOpen((v) => !v)}
  >
    <span></span>
    <span></span>
    <span></span>
  </button>
  <div className="ma-nav-account-group">
    {authControls}
  </div>
</div>

        {menuOpen && (
          <nav className="ma-mobile-menu">
            <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/create" onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Create</NavLink>
            <NavLink to="/gallery" onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Gallery</NavLink>
            <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>About</NavLink>
            <NavLink to="/services" onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Services</NavLink>
            <NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Contact</NavLink>
            {isAdmin && <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => `ma-tab ${isActive ? 'active' : ''}`}>Admin</NavLink>}
          </nav>
        )}
      </div>
    </>
  );
}