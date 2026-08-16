import React, { useEffect, useState } from 'react';

export default function PhotoCarousel({ images, intervalMs = 3500 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className="ma-carousel">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`ma-carousel-img ${i === index ? 'active' : ''}`}
        />
      ))}
      {images.length > 1 && (
        <div className="ma-carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`ma-carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}