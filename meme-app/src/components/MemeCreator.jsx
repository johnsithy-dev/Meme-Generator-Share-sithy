import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { postMeme } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getTemplates, CATEGORIES } from '../data/templates.js';

const MAX_DIM = 700;
const FONT_OPTIONS = [
  { label: 'Impact', value: "'Arial Black', Impact, sans-serif" },
  { label: 'Comic', value: "'Comic Sans MS', cursive" },
  { label: 'Typewriter', value: "'Courier New', monospace" },
  { label: 'Elegant', value: 'Georgia, serif' },
  { label: 'Casual', value: "'Trebuchet MS', sans-serif" },
];
const STICKERS = ['😂', '😍', '🔥', '💀', '🤣', '😭', '👍', '👎', '🎮', '📚', '❤️', '💔', '🐱', '🐶', '⭐', '🎉', '🤔', '😎', '🙄', '👀'];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function setLayerFont(ctx, layer) {
  if (layer.type === 'sticker') {
    ctx.font = `${layer.fontSize}px sans-serif`;
  } else {
    ctx.font = `900 ${layer.fontSize}px ${layer.fontFamily}`;
  }
}

function getLayerBox(ctx, layer, w, h) {
  setLayerFont(ctx, layer);
  const metrics = ctx.measureText(layer.text);
  const width = metrics.width;
  const height = layer.fontSize * 1.2;
  const cx = layer.x * w;
  const cy = layer.y * h;
  return { left: cx - width / 2, top: cy - height / 2, width, height, cx, cy };
}

export default function MemeCreator() {
  const { user, profile } = useAuth();
  const isVerified = user?.emailVerified;
  const canvasRef = useRef(null);
  const draggingRef = useRef(null);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [sourceTab, setSourceTab] = useState('upload');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState({ msg: '', kind: '' });

  const templates = getTemplates();
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = templateCategory === 'All' || t.category === templateCategory;
    const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, layers, selectedLayerId]);

  function loadImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setLayers([]);
      setSelectedLayerId(null);
    };
    img.onerror = () => setStatus({ msg: 'Could not load that image.', kind: 'err' });
    img.src = dataUrl;
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus({ msg: 'Please choose an image file.', kind: 'err' });
      return;
    }
    if (file.size > 8_000_000) {
      setStatus({ msg: 'That image is too large. Try one under 8MB.', kind: 'err' });
      return;
    }
    setStatus({ msg: '', kind: '' });
    const reader = new FileReader();
    reader.onload = (ev) => loadImage(ev.target.result);
    reader.onerror = () => setStatus({ msg: 'Could not read that file.', kind: 'err' });
    reader.readAsDataURL(file);
  }

  function selectTemplate(tpl) {
    setStatus({ msg: '', kind: '' });
    loadImage(tpl.dataUrl);
  }

  function addTextLayer() {
    const layer = {
      id: uid(),
      type: 'text',
      text: 'NEW TEXT',
      x: 0.5,
      y: 0.5,
      fontSize: 42,
      color: '#ffffff',
      fontFamily: FONT_OPTIONS[0].value,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
  }

  function addSticker(emoji) {
    const layer = { id: uid(), type: 'sticker', text: emoji, x: 0.5, y: 0.5, fontSize: 60 };
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
    setShowStickerPicker(false);
  }

  function updateSelectedLayer(patch) {
    setLayers((prev) => prev.map((l) => (l.id === selectedLayerId ? { ...l, ...patch } : l)));
  }

  function deleteLayer(id) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');

    let w = image.width;
    let h = image.height;
    if (w > MAX_DIM || h > MAX_DIM) {
      const scale = MAX_DIM / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    layers.forEach((layer) => {
      setLayerFont(ctx, layer);
      if (layer.type === 'text') {
        ctx.lineWidth = Math.max(2, layer.fontSize / 12);
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = layer.color;
        ctx.lineJoin = 'round';
        ctx.strokeText(layer.text, layer.x * w, layer.y * h);
        ctx.fillText(layer.text, layer.x * w, layer.y * h);
      } else {
        ctx.fillText(layer.text, layer.x * w, layer.y * h);
      }

      if (layer.id === selectedLayerId) {
        const box = getLayerBox(ctx, layer, w, h);
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#3ec1ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.left - 6, box.top - 6, box.width + 12, box.height + 12);
        ctx.restore();
      }
    });
  }

  function getPointerPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function hitTestLayer(px, py, w, h) {
    const ctx = canvasRef.current.getContext('2d');
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      const box = getLayerBox(ctx, layer, w, h);
      const pad = 12;
      if (px >= box.left - pad && px <= box.left + box.width + pad && py >= box.top - pad && py <= box.top + box.height + pad) {
        return layer;
      }
    }
    return null;
  }

  function handlePointerDown(e) {
    if (!image) return;
    const canvas = canvasRef.current;
    const pos = getPointerPos(e);
    const hit = hitTestLayer(pos.x, pos.y, canvas.width, canvas.height);
    if (hit) {
      setSelectedLayerId(hit.id);
      draggingRef.current = { id: hit.id };
      canvas.setPointerCapture(e.pointerId);
    } else {
      setSelectedLayerId(null);
    }
  }

  function handlePointerMove(e) {
    if (!draggingRef.current) return;
    const canvas = canvasRef.current;
    const pos = getPointerPos(e);
    const w = canvas.width;
    const h = canvas.height;
    const xFrac = Math.min(0.95, Math.max(0.05, pos.x / w));
    const yFrac = Math.min(0.95, Math.max(0.05, pos.y / h));
    const id = draggingRef.current.id;
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, x: xFrac, y: yFrac } : l)));
  }

  function handlePointerUp(e) {
    draggingRef.current = null;
    try {
      canvasRef.current.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function handleDownload() {
    if (!image) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  async function handlePost() {
  if (!image || !user) return;
  setPosting(true);
  setStatus({ msg: 'Posting…', kind: '' });
  try {
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7);
    const captionText = layers
      .filter((l) => l.type === 'text')
      .map((l) => l.text)
      .join(' ');
    await postMeme({
      dataUrl,
      title,
      captionText,
      author: profile?.displayName || user.email,
      authorId: user.uid,
    });
    setStatus({ msg: 'Posted! Check the Gallery tab.', kind: 'ok' });
  } catch (err) {
    console.error(err);
    setStatus({ msg: err.message || 'Something went wrong posting this meme.', kind: 'err' });
  } finally {
    setPosting(false);
  }
}

  return (
    <div className="ma-card ma-create-grid">
      <div>
        <div className="ma-canvas-frame">
          {!image && <div className="ma-empty">no image yet<br />pick a template or upload one &rarr;</div>}
          <canvas
            ref={canvasRef}
            className={image ? 'ma-editable-canvas' : 'ma-hidden'}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>

        {image && (
          <div className="ma-layer-toolbar">
            <button className="ma-btn ghost" onClick={addTextLayer}>+ Add Text</button>
            <button className="ma-btn ghost" onClick={() => setShowStickerPicker((v) => !v)}>
              + Add Sticker
            </button>
            <button className="ma-btn ghost" onClick={handleDownload}>Download PNG</button>
          </div>
        )}

        {showStickerPicker && (
          <div className="ma-sticker-grid">
            {STICKERS.map((s) => (
              <button key={s} className="ma-sticker-option" onClick={() => addSticker(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {selectedLayer && (
          <div className="ma-layer-editor">
            <div className="ma-gallery-note" style={{ marginBottom: 8 }}>
              Editing {selectedLayer.type === 'text' ? 'text' : 'sticker'} layer &mdash; drag it on the image to reposition
            </div>
            {selectedLayer.type === 'text' && (
              <>
                <div className="ma-field">
                  <span className="ma-label">Text</span>
                  <input
                    className="ma-input"
                    value={selectedLayer.text}
                    onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                    maxLength={60}
                  />
                </div>
                <div className="ma-row ma-field">
                  <div>
                    <span className="ma-label">Font</span>
                    <select
                      className="ma-input"
                      value={selectedLayer.fontFamily}
                      onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="ma-label">Color</span>
                    <input
                      className="ma-input"
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                      style={{ height: 42, padding: 2 }}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="ma-field">
              <span className="ma-label">Size</span>
              <input
                className="ma-input"
                type="range"
                min={16}
                max={100}
                value={selectedLayer.fontSize}
                onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
              />
            </div>
            <button className="ma-btn ghost" onClick={() => deleteLayer(selectedLayer.id)}>
              Delete this layer
            </button>
          </div>
        )}

        {layers.length > 0 && (
          <div className="ma-layer-list">
            {layers.map((l) => (
              <button
                key={l.id}
                className={`ma-layer-item ${l.id === selectedLayerId ? 'active' : ''}`}
                onClick={() => setSelectedLayerId(l.id)}
              >
                {l.type === 'sticker' ? l.text : `"${l.text}"`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="ma-field">
          <span className="ma-label">Title (shown under your post, editable later)</span>
          <input
            className="ma-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your meme a title"
            maxLength={60}
          />
        </div>

        <div className="ma-source-tabs">
          <button
  className={`ma-source-tab ${sourceTab === 'upload' ? 'active' : ''}`}
  onClick={() => setSourceTab('upload')}
>
  Upload
</button>
<button
  className={`ma-source-tab ${sourceTab === 'templates' ? 'active' : ''}`}
  onClick={() => setSourceTab('templates')}
>
  Templates
</button>
        </div>

        {sourceTab === 'upload' ? (
          <div className="ma-field">
            <span className="ma-label">Choose an image</span>
            <label className="ma-file-btn">
              Choose file
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>
          </div>
        ) : (
          <div>
            <div className="ma-field">
              <input
                className="ma-input"
                placeholder="Search templates…"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
              />
            </div>
            <div className="ma-template-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`ma-tab ${templateCategory === cat ? 'active' : ''}`}
                  onClick={() => setTemplateCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="ma-template-grid">
              {filteredTemplates.map((tpl) => (
                <button key={tpl.id} className="ma-template-thumb" onClick={() => selectTemplate(tpl)}>
                  <img src={tpl.dataUrl} alt={tpl.name} />
                  <span>{tpl.name}</span>
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="ma-emptystate" style={{ gridColumn: '1 / -1' }}>No templates match.</div>
              )}
            </div>
          </div>
        )}

        {user && isVerified && (
  <div className="ma-btn-row" style={{ marginTop: 16 }}>
    <button className="ma-btn primary" onClick={handlePost} disabled={!image || posting}>
      {posting ? 'Posting…' : 'Post to Gallery'}
    </button>
  </div>
)}
{!user && (
  <div className="ma-status" style={{ fontSize: 13, marginTop: 16 }}>
    <Link to="/login">Log in</Link> to post your meme to the gallery.
  </div>
)}
{user && !isVerified && (
  <div className="ma-status err" style={{ marginTop: 16 }}>
    Please verify your email before posting. Check your inbox for a link from Firebase.
  </div>
)}
        <div className={`ma-status ${status.kind}`}>{status.msg}</div>
      </div>
    </div>
  );
}