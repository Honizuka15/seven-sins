// Graphique radar des sept péchés. Les scores au-delà de 100 débordent dans une zone dédiée, jamais écrêtés.
import { SINS } from '../data/sins.js';

const MAX = 160; // bord extérieur du radar
const val = (r) => {
  if (!r || r.empty) return 0;
  if (r.kind === 'inf' || r.kind === 'infshiny') return MAX;
  if (r.kind === 'glitch' || r.kind === 'neg') return 0;
  return Math.min(r.display, MAX - 4);
};

// series : [{ color, sins }] ; opts.labels : afficher les noms
export function radarSVG(series, opts = {}) {
  const S = 420, C = S / 2, R = 150;
  const ang = (i) => -Math.PI / 2 + i * 2 * Math.PI / 7;
  const pt = (i, v) => [C + Math.cos(ang(i)) * R * v / MAX, C + Math.sin(ang(i)) * R * v / MAX];
  const poly = (v) => SINS.map((_, i) => pt(i, v).join(',')).join(' ');
  let g = `<svg viewBox="-90 -6 ${S + 180} ${S + 12}" role="img" aria-label="Radar des sept péchés" class="radar">`;
  g += `<defs><radialGradient id="beyond"><stop offset="62%" stop-color="#b3262e" stop-opacity="0"/><stop offset="100%" stop-color="#b3262e" stop-opacity=".28"/></radialGradient></defs>`;
  g += `<polygon points="${poly(MAX)}" fill="url(#beyond)" stroke="#b3262e" stroke-opacity=".5" stroke-dasharray="4 5"/>`;
  [25, 50, 75].forEach(v => g += `<polygon points="${poly(v)}" fill="none" stroke="currentColor" stroke-opacity=".12"/>`);
  g += `<polygon points="${poly(100)}" fill="none" stroke="#c9a45c" stroke-width="1.5" stroke-opacity=".8"/>`;
  SINS.forEach((s, i) => { const [x, y] = pt(i, MAX); g += `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="currentColor" stroke-opacity=".12"/>`; });
  g += `<text x="${C + 4}" y="${C - R * 100 / MAX - 4}" font-size="10" fill="#c9a45c">100</text>`;
  g += `<text x="${C + 4}" y="${C - R + 12}" font-size="10" fill="#e06a70">au-delà</text>`;
  series.forEach((se, si) => {
    const pts = SINS.map((s, i) => pt(i, val(se.sins[s.k])));
    g += `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${se.color}" fill-opacity="${series.length > 1 ? .12 : .28}" stroke="${se.color}" stroke-width="2.5" class="rpoly" style="animation-delay:${si * 120}ms"/>`;
    SINS.forEach((s, i) => {
      const r = se.sins[s.k]; const [x, y] = pts[i];
      if (!r || r.empty) return;
      if (r.kind === 'inf' || r.kind === 'infshiny') g += `<text x="${x}" y="${y + 7}" text-anchor="middle" font-size="22" font-weight="900" fill="${se.color}" class="glow">∞</text>`;
      else if (r.kind === 'glitch') g += `<text x="${x + 10 * (si + 1)}" y="${y - 6}" font-size="14" font-weight="800" fill="#00f0ff" class="blink">NaN</text>`;
      else if (r.kind === 'exc') g += `<circle cx="${x}" cy="${y}" r="6" fill="${se.color}" class="glow"/>`;
      else g += `<circle cx="${x}" cy="${y}" r="3.5" fill="${se.color}"/>`;
    });
  });
  if (opts.labels !== false) SINS.forEach((s, i) => {
    const [x, y] = pt(i, MAX + 24);
    const anchor = Math.abs(x - C) < 10 ? 'middle' : x > C ? 'start' : 'end';
    g += `<text x="${x}" y="${y + 5}" text-anchor="${anchor}" font-size="19" font-weight="700" fill="${s.c}" font-family="Cinzel, serif">${s.n}</text>`;
  });
  return g + '</svg>';
}
