import React from 'react';

export default function About() {
  return (
    <div className="ma-card ma-about-grid">
      <div>
        <h2 className="ma-gallery-title" style={{ fontSize: 30, marginBottom: 16 }}>
          About This Wall
        </h2>
        <p className="ma-about-text">
          Meme Generator + Share started as a school project and turned into an actual
          little corner of the internet. Upload a picture, slap some text and stickers on
          it, and put it up on the wall for everyone to see.
        </p>
        <p className="ma-about-text">
          Browsing the gallery is open to everyone. Sign in and you can post your own
          creations, react to other people's memes, drop comments, and build a profile
          people can check out. Admins keep things running smoothly behind the scenes.
        </p>
        <p className="ma-about-text">
          Built with React, Firebase Authentication, and Firestore — no fancy backend
          server, just a front end and a database doing the heavy lifting.
        </p>
      </div>

      <div className="ma-about-photo-col">
        <div className="ma-about-photo-frame">
          <img src="/about-photo.jpg" alt="About this site" />
        </div>
        <span className="ma-about-sticker ma-about-sticker-1">✨</span>
        <span className="ma-about-sticker ma-about-sticker-2">🔥</span>
      </div>
    </div>
  );
}