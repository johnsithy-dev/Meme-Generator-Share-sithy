import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    icon: '/service-create.png',
    title: 'Meme Creator',
    description:
      'Upload your own image or pick from built-in templates across Funny, School, Gaming, and Relationship categories. Add text layers, drag them anywhere, pick fonts and colors, and drop in stickers and emojis.',
    action: { label: 'Start creating', to: '/create' },
  },
  {
    icon: '/service-gallery.png',
    title: 'Public Gallery',
    description:
      'Every meme posted lands on the public wall for everyone to see. Search by title, author, or caption, and sort by newest, oldest, or most liked.',
    action: { label: 'Browse the gallery', to: '/gallery' },
  },
  {
    icon: '/service-reactions.png',
    title: 'Reactions & Comments',
    description:
      'Like any meme with one tap, drop a comment, reply to other comments in a thread, and react with a heart on comments you agree with.',
    action: null,
  },
  {
    icon: '/service-profile.png',
    title: 'User Profiles',
    description:
      'Customize your display name, bio, and profile picture. Every profile shows post count, total likes received, and join date — visible to anyone who checks out your page.',
    action: { label: 'Edit your profile', to: '/profile' },
  },
  {
    icon: '/service-share.png',
    title: 'Download & Share',
    description:
      'Download any meme as an image file, or share a direct link straight to your friends via your device\'s share menu.',
    action: null,
  },
  {
    icon: '/service-moderation.png',
    title: 'Moderation',
    description:
      'Admin accounts can review every post and message, edit or remove content that breaks the rules, and keep the wall a place people actually want to visit.',
    action: null,
  },
];

export default function Services() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SERVICES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = SERVICES[index];

  return (
    <div>
      <div className="ma-card">
        <h2 className="ma-gallery-title" style={{ fontSize: 30, marginBottom: 10 }}>
          What This Site Offers
        </h2>
        <p className="ma-about-text" style={{ maxWidth: 640 }}>
          Everything here is built around one wall — make something, post it, and see what
          people think. Here's a breakdown of what you can actually do.
        </p>
      </div>

      <div className="ma-card ma-service-showcase">
        <div className="ma-service-showcase-image">
          <img src={current.icon} alt={current.title} key={current.icon} />
        </div>

        <div className="ma-service-showcase-body">
          <h3 className="ma-service-showcase-title">{current.title}</h3>
          <p className="ma-service-showcase-desc">{current.description}</p>
          {current.action && (
            <Link to={current.action.to} className="ma-btn primary" style={{ marginTop: 10 }}>
              {current.action.label}
            </Link>
          )}

          <div className="ma-service-dots">
            {SERVICES.map((s, i) => (
              <button
                key={s.title}
                className={`ma-service-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show ${s.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}