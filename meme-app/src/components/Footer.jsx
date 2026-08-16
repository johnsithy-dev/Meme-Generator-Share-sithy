import React from 'react';

export default function Footer() {
  return (
    <footer className="ma-footer">
      <p>
        Meme Generator + Share &middot; built by <strong>JohnSithy</strong> &middot; © {new Date().getFullYear()}
      </p>
    </footer>
  );
}