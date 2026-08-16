const SIZE = 500;

function newCanvas() {
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  return c;
}

function bg(ctx, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function bigGrin(ctx) {
  bg(ctx, '#ffd400', '#ffb300');
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(250, 260, 150, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  circle(ctx, 180, 190, 20, '#111');
  circle(ctx, 320, 190, 20, '#111');
}

function lolZigzag(ctx) {
  bg(ctx, '#ff8a3d', '#ff5e3a');
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(140, 300);
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(140 + i * 44, i % 2 === 0 ? 330 : 290);
  }
  ctx.stroke();
  circle(ctx, 170, 190, 18, '#111');
  circle(ctx, 330, 190, 18, '#111');
}

function chalkboard(ctx) {
  bg(ctx, '#0b3d2e', '#0f5132');
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(100, 150);
  ctx.quadraticCurveTo(250, 100, 400, 160);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(120, 350);
  ctx.lineTo(380, 350);
  ctx.stroke();
  ctx.font = '80px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('A+', 200, 280);
}

function reportCard(ctx) {
  bg(ctx, '#ffffff', '#f2f2f2');
  ctx.strokeStyle = '#d33';
  ctx.lineWidth = 6;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(100, 150 + i * 60);
    ctx.lineTo(400, 150 + i * 60);
    ctx.stroke();
  }
  ctx.strokeStyle = '#2a2';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(160, 400);
  ctx.lineTo(220, 450);
  ctx.lineTo(340, 340);
  ctx.stroke();
}

function pixelArena(ctx) {
  const colors = ['#3a1c71', '#4a2a8a'];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      ctx.fillStyle = colors[(x + y) % 2];
      ctx.fillRect(x * 50, y * 50, 50, 50);
    }
  }
}

function levelUp(ctx) {
  bg(ctx, '#0b0e2e', '#1b2470');
  ctx.fillStyle = '#ffd400';
  ctx.beginPath();
  const cx = 250, cy = 250, spikes = 8, outerR = 160, innerR = 70;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerR;
    let y = cy + Math.sin(rot) * outerR;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerR;
    y = cy + Math.sin(rot) * innerR;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

function heartSketch(ctx) {
  bg(ctx, '#ffd1e8', '#ff9ec7');
  ctx.strokeStyle = '#c0116b';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(250, 350);
  ctx.bezierCurveTo(100, 220, 150, 100, 250, 180);
  ctx.bezierCurveTo(350, 100, 400, 220, 250, 350);
  ctx.stroke();
}

function twoChairs(ctx) {
  bg(ctx, '#e8d9c0', '#d8c19f');
  ctx.fillStyle = '#5a3d2b';
  ctx.fillRect(120, 250, 60, 120);
  ctx.fillRect(110, 200, 80, 20);
  ctx.fillRect(300, 250, 60, 120);
  ctx.fillRect(290, 200, 80, 20);
}

const SPECS = [
  { id: 'tpl-grin', name: 'Big Grin', category: 'Funny', draw: bigGrin },
  { id: 'tpl-lol', name: 'LOL Zigzag', category: 'Funny', draw: lolZigzag },
  { id: 'tpl-chalk', name: 'Chalkboard', category: 'School', draw: chalkboard },
  { id: 'tpl-report', name: 'Report Card', category: 'School', draw: reportCard },
  { id: 'tpl-pixel', name: 'Pixel Arena', category: 'Gaming', draw: pixelArena },
  { id: 'tpl-levelup', name: 'Level Up', category: 'Gaming', draw: levelUp },
  { id: 'tpl-heart', name: 'Heart Sketch', category: 'Relationship', draw: heartSketch },
  { id: 'tpl-chairs', name: 'Two Chairs', category: 'Relationship', draw: twoChairs },
];

let cachedTemplates = null;

export function getTemplates() {
  if (cachedTemplates) return cachedTemplates;
  cachedTemplates = SPECS.map((spec) => {
    const canvas = newCanvas();
    const ctx = canvas.getContext('2d');
    spec.draw(ctx);
    return {
      id: spec.id,
      name: spec.name,
      category: spec.category,
      dataUrl: canvas.toDataURL('image/png'),
    };
  });
  return cachedTemplates;
}

export const CATEGORIES = ['All', 'Funny', 'School', 'Gaming', 'Relationship'];