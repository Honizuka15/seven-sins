// Moteur de notation : sélection des questions, niveaux, score pondéré, confiance, rangs
import { QUESTIONS } from '../data/questions.js';
import { SINS, SIN, TH, LEVEL_TH, DEFAULT_LEVELS } from '../data/sins.js';

// Contribution par niveau : occasionnel faible, systématique fort, extrême très fort (au-delà de la référence 100)
export const W = [0, 1, 2.5, 4.5, 7];
const REF = 4.5; // « systématique partout » = 100/100

export const DURATIONS = {
  quick: { label: 'Rapide', mins: '≈ 5 min', perSin: 3, open: false },
  standard: { label: 'Standard', mins: '≈ 15 min', perSin: 7, open: true },
  full: { label: 'Complet', mins: '≈ 30 min', perSin: 16, open: true }
};

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Choisit les questions : renouvelées (les jamais vues d'abord), paires de cohérence gardées ensemble, piège inclus
export function selectQuestions({ perSin, open, sins, adult, seen = [] }) {
  const seenSet = new Set(seen);
  const order = shuffle(sins);
  const out = [];
  for (const s of order) {
    let pool = QUESTIONS.filter(q => q.s === s && (adult || !q.adult));
    const opens = pool.filter(q => q.t === 'O');
    pool = pool.filter(q => q.t !== 'O');
    const n = Math.min(perSin, pool.length);
    const fresh = shuffle(pool.filter(q => !seenSet.has(q.id)));
    const old = shuffle(pool.filter(q => seenSet.has(q.id)));
    let ranked = [...fresh, ...old];
    const pick = [];
    const add = (q) => { if (q && !pick.includes(q) && pick.length < n) pick.push(q); };
    if (n >= 5) { add(pool.find(q => q.trap)); }
    for (const q of ranked) {
      if (pick.length >= n) break;
      if (pick.includes(q)) continue;
      if (q.pair || pool.some(p => p.pair === q.id)) {
        const mate = pool.find(p => p.id === q.pair) || pool.find(p => p.pair === q.id);
        if (n - pick.length >= 2 && n >= 5) { add(q); add(mate); continue; }
      }
      add(q);
    }
    const group = shuffle(pick);
    if (open && opens.length) { const of = shuffle(opens.filter(q => !seenSet.has(q.id))); group.push(of[0] || shuffle(opens)[0]); }
    out.push(...group);
  }
  return out;
}

export function levelOf(q, a) {
  if (a === undefined || a === null || a === '') return null;
  if (q.t === 'O') return null;
  if (q.t === 'S') { const l = Math.min(4, Math.floor((a - 1) / 2)); return q.rev ? 4 - l : l; }
  if (q.t === 'F') return q.rev ? 4 - a : a;
  return q.o[a] ? q.o[a].l : null;
}

export function levelName(v, levels = DEFAULT_LEVELS) {
  for (let i = 0; i < LEVEL_TH.length; i++) if (v <= LEVEL_TH[i]) return levels[i] || DEFAULT_LEVELS[i];
  return levels[7] || DEFAULT_LEVELS[7];
}
export function levelIndex(v) { for (let i = 0; i < LEVEL_TH.length; i++) if (v <= LEVEL_TH[i]) return i; return 7; }

const maxLevel = (q) => q.o ? Math.max(...q.o.map(o => o.l)) : 4;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// Calcule le profil complet à partir des réponses
export function scoreTest(questions, answers, levels = DEFAULT_LEVELS) {
  const lies = questions.filter(q => q.trap && answers[q.id] != null && q.o[answers[q.id]] && q.o[answers[q.id]].lie);
  const res = {};
  for (const sin of SINS) {
    const items = questions.filter(q => q.s === sin.k && q.t !== 'O' && levelOf(q, answers[q.id]) !== null)
      .map(q => ({ q, l: levelOf(q, answers[q.id]), w: q.w || 1 }));
    if (!items.length) { res[sin.k] = { sin: sin.k, empty: true, kind: 'num', display: 0, rank: '—', conf: 1, items: [] }; continue; }
    const num = items.reduce((s, x) => s + x.w * W[x.l], 0);
    const den = items.reduce((s, x) => s + x.w * REF, 0);
    const raw = num / den * 100;
    const n = items.length;
    const extremes = items.filter(x => x.l === 4).length;
    const strong = items.filter(x => x.l >= 3).length;
    const ratio = strong / n;
    const absurd = items.filter(x => x.q.o && x.q.o[answers[x.q.id]] && x.q.o[answers[x.q.id]].a).length;
    // Cohérence : une question et son inverse doivent dire la même chose
    let contra = 0; const contraPairs = [];
    for (const x of items) {
      if (!x.q.pair) continue;
      const m = items.find(y => y.q.id === x.q.pair);
      if (!m) continue;
      const d = Math.abs(x.l - m.l);
      if (d >= 3) { contra += 1; contraPairs.push([x.q, m.q]); } else if (d === 2) contra += 0.5;
    }
    const conf = clamp(1 - 0.3 * contra - 0.12 * lies.length, 0.2, 1);
    // Ajustement de confiance : on rapproche du centre au lieu de punir
    const score = raw - (raw - 50) * (1 - conf) * 0.5;
    const zeros = items.every(x => x.l === 0);
    const th = TH[sin.k];
    let kind = 'num';
    if (n >= 4 && conf <= 0.45 && contra >= 1) kind = 'glitch';
    else if (zeros && n >= 3 && lies.length === 0) kind = 'neg';
    else if (score >= 145 && extremes >= Math.max(4, Math.ceil(n * 0.5)) && conf >= 0.9 && ratio >= 0.8)
      kind = (items.every(x => x.l >= Math.min(3, maxLevel(x.q))) && absurd >= 1 && conf === 1) ? 'infshiny' : 'inf';
    else if (score > 100 + th.off && extremes >= th.ext && conf >= 0.75 && ratio >= 0.5) kind = 'exc';
    let display, rank;
    if (kind === 'exc') {
      display = Math.round(score);
      const step = 60 / sin.ladder.length;
      rank = sin.ladder[Math.min(Math.floor((score - 100 - 0.001) / step), sin.ladder.length - 1)];
    } else if (kind === 'inf') { display = Infinity; rank = sin.inf; }
    else if (kind === 'infshiny') { display = Infinity; rank = sin.shiny; }
    else if (kind === 'glitch') { display = NaN; rank = 'Inquantifiable'; }
    else if (kind === 'neg') { display = 0; rank = sin.neg; }
    else { display = clamp(Math.round(score), 0, 100); rank = levelName(display, levels); }
    const top = items.slice().sort((a, b) => b.w * W[b.l] - a.w * W[a.l])[0];
    res[sin.k] = { sin: sin.k, kind, display, rank, raw, score, conf, extremes, strong, n, absurd, contra, contraPairs, top, items };
  }
  return { sins: res, lies };
}

// Valeur comparable (classements, tri) : ∞ en haut, NaN hors classement, négatif en bas
export function sortValue(r) {
  if (!r) return -1;
  if (r.kind === 'glitch') return -0.5;
  if (r.kind === 'neg') return -1;
  if (r.kind === 'inf' || r.kind === 'infshiny') return 1e6;
  return r.display;
}
export const isExceptional = (r) => ['exc', 'inf', 'infshiny'].includes(r.kind);
export const isShiny = (r) => ['infshiny', 'glitch', 'neg'].includes(r.kind);

export function fmtScore(r) {
  if (r.kind === 'inf') return '∞';
  if (r.kind === 'infshiny') return '∞ SHINY';
  if (r.kind === 'glitch') return 'NaN';
  if (r.kind === 'neg') return SIN[r.sin] ? SIN[r.sin].neg : '0';
  return String(r.display);
}

// Données au format carte de collection
export function toCardSins(result) {
  return SINS.map(s => {
    const r = result.sins[s.k];
    if (r.kind === 'inf') return { kind: 'inf', label: r.rank };
    if (r.kind === 'infshiny') return { kind: 'infshiny', label: '' };
    if (r.kind === 'glitch') return { kind: 'glitch', label: '' };
    if (r.kind === 'neg') return { kind: 'neg', label: s.neg };
    return { kind: 'num', score: r.display, label: r.rank };
  });
}
