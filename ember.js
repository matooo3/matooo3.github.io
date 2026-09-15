/* Loaded only after opting in. Textured flame sprites are prepared once per activation. */
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const hash = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  return (hash(ix, iy) * (1 - sx) + hash(ix + 1, iy) * sx) * (1 - sy) + (hash(ix, iy + 1) * (1 - sx) + hash(ix + 1, iy + 1) * sx) * sy;
}
const turbulence = (x, y) => noise(x, y) * .58 + noise(x * 2.13 + 7.1, y * 2.13) * .28 + noise(x * 4.37, y * 4.37 + 3.4) * .14;
function flameSprite(phase) {
  const sprite = document.createElement('canvas'); sprite.width = 96; sprite.height = 160;
  const ctx = sprite.getContext('2d'), pixels = ctx.createImageData(96, 160);
  for (let py = 0; py < 160; py++) for (let px = 0; px < 96; px++) {
    const x = px / 95 * 2 - 1, y = 1 - py / 159;
    const n = turbulence(x * 3.1 + phase * 2.3, y * 4.6 - phase * 1.7);
    const curl = Math.sin(y * 9 + phase * 2) * y * .16 + (n - .5) * .24;
    const width = Math.pow(1 - y, .8) * .73;
    const mass = (width - Math.abs(x + curl) + (n - .49) * .48) * (1 - y * .32);
    const alpha = smooth(-.055, .17, mass) * smooth(0, .24, y) * (1 - smooth(.90, 1, y));
    const heat = clamp(mass * 1.75 + (1 - y) * .14 + (n - .5) * .20);
    const hot = smooth(.5, 1, heat), edge = smooth(0, .48, heat), i = (py * 96 + px) * 4;
    pixels.data[i] = 205 + edge * 50;
    pixels.data[i + 1] = 35 + edge * 116 + hot * 99;
    pixels.data[i + 2] = 3 + edge * 19 + hot * 193;
    pixels.data[i + 3] = alpha * 230;
  }
  ctx.putImageData(pixels, 0, 0); return sprite;
}
function smokeSprite() {
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 80;
  const ctx = sprite.getContext('2d'), pixels = ctx.createImageData(80, 80);
  for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) {
    const r = Math.hypot((x - 40) / 40, (y - 40) / 40), n = turbulence(x / 15, y / 15);
    const i = (y * 80 + x) * 4;
    pixels.data[i] = 126; pixels.data[i + 1] = 116; pixels.data[i + 2] = 103;
    pixels.data[i + 3] = Math.pow(Math.max(0, 1 - r), 1.5) * n * 74;
  }
  ctx.putImageData(pixels, 0, 0); return sprite;
}
function glowSprite() {
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 96;
  const ctx = sprite.getContext('2d'), glow = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  glow.addColorStop(0, 'rgba(255,196,113,.48)'); glow.addColorStop(.18, 'rgba(255,113,25,.20)'); glow.addColorStop(.5, 'rgba(213,55,4,.065)'); glow.addColorStop(1, 'rgba(170,35,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 96, 96); return sprite;
}

export async function createEmberEffect(shouldContinue = () => true) {
  const canvas = document.createElement('canvas'); canvas.className = 'ember-canvas'; canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) throw new Error('Canvas unavailable');
  let sprites = [];
  for (let i = 0; i < 8; i++) {
    if (!shouldContinue()) { canvas.width = canvas.height = 1; return null; }
    sprites.push(flameSprite(i * .53));
    // Yield between texture preparations so the settings stay responsive.
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  let smoke = smokeSprite(), glow = glowSprite();
  const capacity = 220, pool = Array.from({ length: capacity }, () => ({ life: 0 }));
  let cursor = 0, alive = 0, frame = 0, previous = 0, width = 0, height = 0, ratio = 1;
  let started = false, destroyed = false, last = null, samples = [], clicks = [], lastClick = -Infinity, slowFrames = 0, budget = 12;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const eligible = () => started && !destroyed && !document.hidden && !reduced.matches;
  function resize() {
    width = innerWidth; height = innerHeight;
    ratio = Math.min(devicePixelRatio || 1, 1.25, 2048 / width, 1600 / height);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    budget = width < 650 ? 7 : 12;
  }
  function spawn(kind, x, y, vx = 0, vy = 0, intensity = 1) {
    const p = pool[cursor]; cursor = (cursor + 1) % capacity;
    if (p.life <= 0) alive++;
    p.kind = kind; p.x = x; p.y = y; p.age = 0; p.seed = Math.random() * 7;
    p.vx = vx; p.vy = vy; p.angle = clamp(vx * .008, -.32, .32);
    p.life = p.duration = kind === 0 ? .36 + Math.random() * .37 : kind === 1 ? .30 + Math.random() * .65 : kind === 2 ? .55 + Math.random() * .45 : .23;
    p.size = (kind === 0 ? 19 + Math.random() * 14 : kind === 1 ? .65 + Math.random() * .85 : kind === 2 ? 27 + Math.random() * 17 : 90) * intensity;
    return p;
  }
  function emit(x, y, vx, vy, intensity = 1) {
    const flame = spawn(0, x + (Math.random() - .5) * 5, y + (Math.random() - .5) * 4, -vx * .028 + (Math.random() - .5) * 13, -25 - Math.random() * 15 - vy * .015, intensity);
    flame.angle = Math.atan2(-vx, vy + 170) * .85 + (Math.random() - .5) * .18;
    if (Math.random() < .30) spawn(1, x, y - 3, -vx * .02 + (Math.random() - .5) * 34, -40 - Math.random() * 65);
    if (Math.random() < .10) spawn(2, x, y - 12, (Math.random() - .5) * 14, -23);
    if (Math.random() < .16) spawn(3, x, y, 0, -8, intensity);
  }
  function excluded(target) { return target instanceof Element && !!target.closest('.experience-settings,dialog,.command-launcher,input,textarea,select,[contenteditable="true"]'); }
  function move(event) {
    if (!eligible() || event.pointerType === 'touch' || event.isPrimary === false || excluded(event.target)) { last = null; samples.length = 0; return; }
    const point = { x: event.clientX, y: event.clientY, time: performance.now() };
    if (samples.length >= 24) samples.shift();
    samples.push(point); wake();
  }
  function press(event) {
    const now = performance.now();
    if (!eligible() || event.button !== 0 || event.isPrimary === false || excluded(event.target) || now - lastClick < 180) return;
    lastClick = now;
    if (clicks.length < 2) clicks.push({ x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' });
    wake();
  }
  function processInput() {
    let allowance = budget;
    for (const point of samples) {
      if (!last || point.time - last.time > 180) { emit(point.x, point.y, 0, 0, .85); allowance--; }
      else {
        const dx = point.x - last.x, dy = point.y - last.y, distance = Math.hypot(dx, dy), dt = Math.max(8, point.time - last.time) / 1000;
        if (distance > 700) { last = point; continue; } // Never bridge across an interrupted pointer path.
        const count = Math.min(allowance, Math.floor(distance / 7));
        if (count === 0 && distance < 7) continue;
        const vx = clamp(dx / dt, -1600, 1600), vy = clamp(dy / dt, -1600, 1600);
        for (let i = 1; i <= count; i++) emit(last.x + dx * i / count, last.y + dy * i / count, vx, vy);
        allowance -= count;
      }
      last = point;
      if (allowance <= 0) break;
    }
    if (samples.length && allowance <= 0) last = samples[samples.length - 1];
    samples.length = 0;
    for (const click of clicks) {
      // A brief upward flare and a few fine embers; no rings or explosion pattern.
      const count = click.touch ? 5 : 10;
      for (let i = 0; i < count; i++) spawn(0, click.x + (Math.random() - .5) * 13, click.y + (Math.random() - .5) * 7, (Math.random() - .5) * 27, -28 - Math.random() * 36, 1.1);
      for (let i = 0; i < count; i++) spawn(1, click.x, click.y - 3, (Math.random() - .5) * 55, -45 - Math.random() * 75, .8);
      spawn(3, click.x, click.y, 0, -10, 1.3);
    }
    clicks.length = 0;
  }
  function clear() {
    if (frame) cancelAnimationFrame(frame); frame = 0; previous = 0; alive = 0; last = null; samples.length = clicks.length = 0;
    for (const p of pool) p.life = 0;
    ctx.clearRect(0, 0, width, height);
  }
  function draw(time) {
    frame = 0;
    if (!eligible()) { clear(); return; }
    const elapsed = previous ? time - previous : 16.7, dt = Math.min(elapsed, 40) / 1000; previous = time;
    if (elapsed > 30) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 12) budget = 6;
    ctx.clearRect(0, 0, width, height);
    processInput();
    const dark = document.documentElement.dataset.theme === 'dark';
    for (const p of pool) {
      if (p.life <= 0) continue;
      p.age += dt; p.life -= dt;
      if (p.life <= 0) { alive--; continue; }
      const t = p.age / p.duration;
      p.vx *= Math.exp(-dt * 1.8);
      p.angle *= Math.exp(-dt * 1.5);
      p.x += p.vx * dt + Math.sin(p.age * 12 + p.seed) * dt * (p.kind === 0 ? 9 : 4);
      p.y += p.vy * dt; p.vy -= dt * (p.kind === 1 ? 7 : 12);
      const fade = Math.pow(1 - t, p.kind === 0 ? 1.2 : 1.6);
      if (p.kind === 2) {
        const size = p.size * (1 + t * 1.2); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade * .25;
        ctx.drawImage(smoke, p.x - size / 2, p.y - size / 2, size, size);
      } else if (p.kind === 3) {
        const size = p.size * (1 + t * .45); ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'; ctx.globalAlpha = fade * .6;
        ctx.drawImage(glow, p.x - size / 2, p.y - size / 2, size, size);
      } else if (p.kind === 1) {
        ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'; ctx.globalAlpha = fade * .85;
        ctx.lineWidth = p.size * (1 - t * .5); ctx.strokeStyle = t < .3 ? '#ffdf94' : '#ef882d';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .018, p.y - p.vy * .018); ctx.stroke();
      } else {
        const size = p.size * (1 - t * .42), tall = size * (1.75 + t * .75);
        const flicker = p.seed + p.age * 9, a = Math.floor(flicker) % sprites.length, blend = flicker % 1;
        ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle + Math.sin(p.age * 8 + p.seed) * .07);
        ctx.globalAlpha = fade * .48 * (1 - blend); ctx.drawImage(sprites[a], -size / 2, -tall, size, tall);
        ctx.globalAlpha = fade * .48 * blend; ctx.drawImage(sprites[(a + 1) % sprites.length], -size / 2, -tall, size, tall); ctx.restore();
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (alive || samples.length || clicks.length) frame = requestAnimationFrame(draw);
    else { previous = 0; ctx.clearRect(0, 0, width, height); }
  }
  function wake() { if (!frame && eligible()) { previous = 0; frame = requestAnimationFrame(draw); } }
  function leave() { last = null; samples.length = 0; }
  function visibility() { clear(); canvas.hidden = document.hidden || reduced.matches; }
  return {
    start() {
      if (started || destroyed) return;
      started = true; document.body.append(canvas); resize(); visibility();
      document.addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerdown', press, { passive: true });
      document.documentElement.addEventListener('pointerleave', leave); window.addEventListener('blur', clear);
      window.addEventListener('resize', resize, { passive: true }); document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', visibility);
    },
    destroy() {
      if (destroyed) return;
      clear(); destroyed = true; started = false;
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerdown', press); document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', clear); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', visibility);
      canvas.remove(); canvas.width = canvas.height = 1; sprites = []; smoke = glow = null;
    }
  };
}
