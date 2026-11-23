// SEVEN SINS — application (écrans, déroulé de partie, révélation, résultats)
import { SINS, SIN, DEFAULT_LEVELS, LEVEL_DESC } from './data/sins.js';
import { FREQ, QUESTIONS } from './data/questions.js';
import { DURATIONS, selectQuestions, scoreTest, toCardSins, sortValue, isExceptional, isShiny, levelIndex } from './engine/scoring.js';
import { buildProfile, ranking } from './engine/analysis.js';
import { ACHIEVEMENTS, checkAchievements } from './engine/achievements.js';
import { compute as cardCompute, draw as drawCard, sigil, RARC } from './ui/cards.js';
import { radarSVG } from './ui/radar.js';
import { store } from './store.js';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { App as CapApp } from '@capacitor/app';
const NATIVE = Capacitor.isNativePlatform();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const frDate = (d) => (d || '').split('-').reverse().join('/');
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const PCOLORS = ['#ff4b3e', '#5fc8ff', '#e0b04a', '#45c97a', '#e0457b', '#a77bff', '#ef8a3a', '#ffffff', '#00e0c0', '#ff9ad5', '#b0d040', '#8aa0ff'];
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEFAULT_SETTINGS = { adult: false, sound: true, back: true, levels: DEFAULT_LEVELS.slice(), name: '' };

const S = {
  screen: 'home', mode: 'solo', duration: 'standard', custom: { sins: SINS.map(s => s.k), perSin: 6 },
  privacy: 'public', players: [], pi: 0, qs: [], qi: 0, perm: {}, tshown: new Set(),
  reveal: 0, view: null, viewBack: 'menu', reportOpen: false, fresh: [], confirmClear: false,
  cmpA: null, cmpB: null, evoName: ''
};
let dl = null, audio = null;
const settings = () => store.state.settings;

// ───────── son (facultatif)
function tone(f = 220, d = 0.25, type = 'sine', vol = 0.08) {
  if (!settings().sound) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + d);
  } catch (e) {}
}
const gong = () => { tone(110, 1.4, 'sine', .12); tone(165, 1.1, 'triangle', .05); };

function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

// ───────── résultats : sérialisation (JSON ne garde pas ∞ ni NaN)
function serialize(p, qs) {
  const sins = {};
  for (const s of SINS) { const r = p.result.sins[s.k]; sins[s.k] = { kind: r.kind, display: Number.isFinite(r.display) ? r.display : null, rank: r.rank, contra: r.contra || 0, extremes: r.extremes || 0, conf: r.conf ?? 1, empty: !!r.empty }; }
  const opens = qs.filter(q => q.t === 'O' && p.answers[q.id]).map(q => ({ q: q.q, a: String(p.answers[q.id]).slice(0, 600) }));
  return { id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), ts: Date.now(), date: today(), name: p.name, mode: S.mode, duration: S.duration, partySize: S.players.length, sins, lies: p.result.lies.length, opens, profile: p.profile, card: p.card };
}
function hydrate(h) {
  const sins = {};
  for (const s of SINS) { const r = { ...(h.sins[s.k] || { kind: 'num', display: 0, empty: true }) }; r.sin = s.k; if (r.kind === 'inf' || r.kind === 'infshiny') r.display = Infinity; else if (r.kind === 'glitch') r.display = NaN; else r.display = r.display ?? 0; sins[s.k] = r; }
  return { ...h, sins };
}

// ───────── navigation
function go(screen, extra = {}) { Object.assign(S, extra); S.screen = screen; S.reportOpen = false; render(); window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' }); }

function startGame() {
  const st = settings();
  const d = S.duration === 'custom' ? { perSin: S.custom.perSin, open: true } : DURATIONS[S.duration];
  const sins = S.duration === 'custom' ? S.custom.sins : SINS.map(s => s.k);
  S.qs = selectQuestions({ perSin: d.perSin, open: d.open, sins, adult: st.adult, seen: store.state.seen || [] });
  S.players.forEach(p => { p.answers = {}; p.result = null; p.consent = S.privacy === 'public'; });
  S.pi = 0; S.qi = 0; S.perm = {}; S.tshown = new Set(); S.reveal = 0; S.fresh = [];
  go('intro');
}

function afterIntro() { if (S.mode === 'party') go('handoff'); else go('question'); }

function answer(v) {
  if (S.locked) return; S.locked = true;
  const q = S.qs[S.qi]; const p = S.players[S.pi];
  p.answers[q.id] = v;
  tone(300 + (q.t === 'S' ? v * 30 : 120), .12, 'triangle', .05);
  setTimeout(next, REDUCE ? 0 : 260);
}
function next() {
  S.locked = false;
  S.qi++;
  if (S.qi < S.qs.length) return go('question');
  if (S.mode === 'party' && S.pi < S.players.length - 1) { S.pi++; S.qi = 0; return go('handoff'); }
  go('calc');
  setTimeout(finalize, REDUCE ? 400 : 2800);
}

async function finalize() {
  const st = settings();
  const seen = new Set(store.state.seen || []); S.qs.forEach(q => seen.add(q.id)); store.state.seen = [...seen].slice(-1500);
  const hist = store.history.map(hydrate);
  S.fresh = [];
  for (const p of S.players) {
    p.result = scoreTest(S.qs, p.answers, st.levels);
    p.profile = buildProfile(p.result, S.qs, p.answers, p.name);
    p.card = { name: p.name.toUpperCase(), date: today(), tpl: 'auto', sins: toCardSins(p.result) };
    p.saved = serialize(p, S.qs);
    const light = hydrate(p.saved);
    const fresh = checkAchievements(light, hist, store.state.unlocked);
    fresh.forEach(a => { if (!S.fresh.find(x => x.id === a.id)) S.fresh.push(a); });
    await store.addResult(p.saved);
    hist.push(light);
  }
  store.saveState();
  S.reveal = 0;
  if (S.mode === 'solo') go('reveal');
  else if (S.privacy === 'consent') go('consent');
  else if (S.privacy === 'private') go('private');
  else go('reveal');
}

// ───────── étapes de révélation : plus faible → 2e plus faible → intermédiaires → dominant → hors échelle → profil
function revealSteps() {
  const ref = ranking(S.players[0].result).reverse(); // croissant
  const n = ref.length; const steps = [];
  if (n <= 2) ref.forEach((_, i) => steps.push({ pos: [i], label: i === n - 1 ? 'Le péché dominant' : 'Le péché le plus faible' }));
  else {
    steps.push({ pos: [0], label: 'Le péché le plus faible' });
    steps.push({ pos: [1], label: 'Le deuxième péché le plus faible' });
    if (n > 3) steps.push({ pos: Array.from({ length: n - 3 }, (_, i) => i + 2), label: 'Les péchés intermédiaires' });
    steps.push({ pos: [n - 1], label: 'Le péché dominant', dom: true });
  }
  const visible = S.players.filter(p => S.mode === 'solo' || p.consent);
  if (visible.some(p => SINS.some(s => isExceptional(p.result.sins[s.k]) || isShiny(p.result.sins[s.k])))) steps.push({ exc: true, label: 'Rangs hors échelle' });
  steps.push({ end: true });
  return steps;
}

// ───────── rendu des fragments
function scoreHTML(r, big) {
  if (r.kind === 'inf') return `<span class="sc rainbow">∞</span>`;
  if (r.kind === 'infshiny') return `<span class="sc rainbow">∞</span><span class="rk rainbow">SHINY</span>`;
  if (r.kind === 'glitch') return `<span class="sc glitch">NaN</span>`;
  if (r.kind === 'neg') return `<span class="sc" style="font-size:${big ? 46 : 32}px">${esc(SIN[r.sin].neg)}</span>`;
  return `<span class="sc"><span data-count="${r.display}">${REDUCE ? r.display : 0}</span><small>/100</small></span>`;
}
function tileHTML(k, r, opts = {}) {
  const s = SIN[k]; const cls = ['tile', opts.big ? 'big' : '', isExceptional(r) ? 'exc' : '', isShiny(r) ? 'shiny' : ''].join(' ');
  const desc = r.kind === 'num' ? LEVEL_DESC[levelIndex(r.display)] : r.kind === 'exc' ? 'Rang exceptionnel : le barème a cédé.' : r.kind === 'glitch' ? 'Réponses si contradictoires que rien n\'est mesurable.' : r.kind === 'neg' ? 'Zéro absolu. Un shiny à l\'envers.' : 'Au-delà de toute mesure.';
  return `<div class="${cls}" style="--c:${s.c};animation-delay:${opts.delay || 0}ms">${opts.who ? `<span class="who">${esc(opts.who)}</span>` : ''}<canvas data-sigil="${k}" width="300" height="300" aria-hidden="true"></canvas><span class="nm">${s.n}</span>${scoreHTML(r, opts.big)}<span class="rk">${esc(r.rank)}</span>${opts.big ? `<span class="small">${desc}</span>` : ''}</div>`;
}
function topbar(title = '') {
  return `<div class="topbar"><button class="brand" data-act="menu" aria-label="Retour au menu">SEVEN <span>SINS</span></button><span class="small">${esc(title)}</span></div>`;
}
function durationPicker() {
  const opts = Object.entries(DURATIONS).map(([k, d]) => `<button class="choice" type="button" data-act="dur" data-v="${k}" aria-pressed="${S.duration === k}"><b>${d.label}</b><span class="small">${d.mins} · ${d.perSin * 7} questions${d.open ? ' + questions libres' : ''}</span></button>`).join('')
    + `<button class="choice" type="button" data-act="dur" data-v="custom" aria-pressed="${S.duration === 'custom'}"><b>Personnalisé</b><span class="small">Tu choisis les péchés et le nombre de questions</span></button>`;
  const custom = S.duration === 'custom' ? `<div class="card stack"><div class="row">${SINS.map(s => `<label class="check" style="padding:8px 10px"><input type="checkbox" data-act="csin" data-v="${s.k}" ${S.custom.sins.includes(s.k) ? 'checked' : ''}><span style="color:${s.c};font-weight:700">${s.n}</span></label>`).join('')}</div>
    <label class="f">Questions par péché : <b id="ppv">${S.custom.perSin}</b><input type="range" min="2" max="15" value="${S.custom.perSin}" data-act="cper" style="accent-color:var(--red)"></label></div>` : '';
  return `<div class="stack"><h3>Durée de l'interrogatoire</h3><div class="choices">${opts}</div>${custom}</div>`;
}
function adultBox() {
  return `<label class="check"><input type="checkbox" data-act="adult" ${settings().adult ? 'checked' : ''}><span><b>J'ai 18 ans ou plus.</b><br><span class="small">Active les questions de luxure explicites. Sans ça, la luxure reste au niveau « soirée entre amis ».</span></span></label>`;
}

// ───────── écrans
const screens = {
  home() {
    const dots = SINS.map((s, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 7; return `<i class="dot" style="color:${s.c};left:calc(${(50 + Math.cos(a) * 44).toFixed(2)}% - 8px);top:calc(${(50 + Math.sin(a) * 44).toFixed(2)}% - 8px)"></i>`; }).join('');
    return `<div class="home"><div class="seal" aria-hidden="true"><div class="ring"></div><div class="ring"></div>${dots}<div class="core">VII</div></div>
      <h1 class="flicker">SEVEN <span class="red">SINS</span></h1><p class="motto">« Tout le monde a un péché. La question, c'est jusqu'où tu es prêt à aller. »</p>
      <button class="btn pri" data-act="menu">Entrer dans le tribunal</button><p class="small">Jeu pour adultes au second degré. Ce n'est pas un diagnostic psychologique.</p></div>`;
  },
  menu() {
    const n = store.history.length, u = Object.keys(store.state.unlocked || {}).length;
    return `${topbar()}<div class="stack"><h2>Le tribunal t'attend.</h2><p class="sub">Sept péchés. Des questions que personne n'ose poser. Un verdict sans appel.</p>
      <div class="menu">
        <button class="btn pri" data-act="setup" data-v="solo">Seul face au tribunal <small>Test solo</small></button>
        <button class="btn" data-act="setup" data-v="party">Entre amis <small>2 à 12 joueurs, un téléphone</small></button>
        <button class="btn" data-act="go" data-v="history">Collection et historique <small>${n} carte${n > 1 ? 's' : ''}</small></button>
        <button class="btn" data-act="go" data-v="achievements">Succès <small>${u}/${ACHIEVEMENTS.length}</small></button>
        <button class="btn" data-act="go" data-v="settings">Paramètres <small>18+, son, niveaux</small></button>
      </div><p class="disclaimer">Expérience ludique et subjective. Aucune valeur scientifique ou médicale.</p></div>`;
  },
  setup() {
    if (S.mode === 'solo') {
      return `${topbar('Mode solo')}<div class="stack"><h2>Identifie-toi, pécheur.</h2>
        <label class="f">Ton nom ou pseudo<input id="pname" data-act="pname" maxlength="16" value="${esc(S.draftName ?? settings().name ?? '')}" placeholder="Ex : HAMZA" autocomplete="off"></label>
        ${durationPicker()}${adultBox()}
        <button class="btn pri block" data-act="start">Comparaître</button></div>`;
    }
    const list = S.players.map((p, i) => `<div class="row" style="flex-wrap:nowrap"><input data-act="pn" data-i="${i}" maxlength="16" value="${esc(p.name)}" aria-label="Joueur ${i + 1}" placeholder="Joueur ${i + 1}"><button class="btn sm" data-act="prm" data-i="${i}" aria-label="Retirer le joueur ${i + 1}" ${S.players.length <= 2 ? 'disabled' : ''}>✕</button></div>`).join('');
    const priv = [['public', 'Publics', 'Tout le groupe voit tout'], ['consent', 'Après validation', 'Chacun accepte ou refuse avant la révélation'], ['private', 'Privés', 'Chacun voit seulement son résultat']]
      .map(([k, a, b]) => `<button class="choice" data-act="priv" data-v="${k}" aria-pressed="${S.privacy === k}"><b>${a}</b><span class="small">${b}</span></button>`).join('');
    return `${topbar('Entre amis')}<div class="stack"><h2>Qui ose ?</h2><p class="sub">Tout le monde répond aux mêmes questions, chacun son tour, en se passant le téléphone.</p>
      <div class="stack">${list}</div><button class="btn" data-act="padd" ${S.players.length >= 12 ? 'disabled' : ''}>Ajouter un joueur (${S.players.length}/12)</button>
      ${durationPicker()}<div class="stack"><h3>Confidentialité des résultats</h3><div class="choices">${priv}</div></div>${adultBox()}
      <button class="btn pri block" data-act="start">Ouvrir la séance</button></div>`;
  },
  intro() {
    return `${topbar()}<div class="stack"><h2>Les sept accusations</h2><p class="sub">${S.qs.length} questions. Réponds vite, réponds vrai : le tribunal repère les contradictions et les réponses trop saintes.</p>
      <div class="sins">${SINS.map(s => `<div class="sintile" style="border-color:${s.c}55"><canvas data-sigil="${s.k}" width="200" height="200" aria-hidden="true"></canvas><div><b style="color:${s.c}">${s.n}</b><p>${esc(s.desc)}</p></div></div>`).join('')}</div>
      <button class="btn pri block" data-act="intro">Que le jugement commence</button></div>`;
  },
  handoff() {
    const p = S.players[S.pi];
    return `<div class="center"><p class="small">Joueur ${S.pi + 1} sur ${S.players.length}</p><h2>Au tour de <span class="red">${esc(p.name)}</span></h2><p class="sub">Les autres, détournez les yeux. Ce qui se dit ici reste ici. Jusqu'à la révélation.</p>
      <button class="btn pri" data-act="handok">Je suis ${esc(p.name)}, je commence</button></div>`;
  },
  question() {
    const q = S.qs[S.qi]; const s = SIN[q.s];
    const first = S.qi === 0 || S.qs[S.qi - 1].s !== q.s;
    const key = S.pi + ':' + S.qi;
    if (first && !S.tshown.has(key)) {
      const idx = [...new Set(S.qs.map(x => x.s))].indexOf(q.s) + 1;
      const total = new Set(S.qs.map(x => x.s)).size;
      return `<div class="center" style="--c:${s.c}"><p class="small">Accusation ${idx} sur ${total}</p><canvas class="bigsigil" data-sigil="${s.k}" width="360" height="360" aria-hidden="true"></canvas><h2 style="color:${s.c}">${s.n}</h2><p class="sub" style="max-width:36ch">${esc(s.desc)}</p><button class="btn pri" data-act="tok" data-v="${key}">Affronter</button></div>`;
    }
    const p = S.players[S.pi]; const cur = p.answers[q.id];
    let body = '';
    if (q.t === 'S') body = `<div class="scale">${Array.from({ length: 10 }, (_, i) => `<button class="ans ${cur === i + 1 ? 'sel' : ''}" data-act="ans" data-v="${i + 1}" aria-label="${i + 1} sur 10">${i + 1}</button>`).join('')}</div><div class="ends"><span>1 · ${esc(q.lo)}</span><span>10 · ${esc(q.hi)}</span></div>`;
    else if (q.t === 'F') body = `<div class="answers">${FREQ.map((f, i) => `<button class="ans ${cur === i ? 'sel' : ''}" data-act="ans" data-v="${i}">${f}</button>`).join('')}</div>`;
    else if (q.t === 'O') body = `<p class="small" style="margin-bottom:10px">Facultatif. Non noté, mais il apparaîtra sur ton profil.</p><textarea id="openA" maxlength="600" placeholder="Raconte. Le tribunal écoute.">${esc(cur || '')}</textarea><div class="row" style="margin-top:12px"><button class="btn pri" data-act="openok">Valider</button><button class="btn ghost" data-act="skip">Passer</button></div>`;
    else {
      if (!S.perm[q.id]) S.perm[q.id] = (q.t === 'C' || q.t === 'X') ? shuffle(q.o.map((_, i) => i)) : q.o.map((_, i) => i);
      const btns = S.perm[q.id].map(i => `<button class="ans ${cur === i ? 'sel' : ''}" data-act="ans" data-v="${i}">${esc(q.o[i].t)}</button>`);
      body = q.t === 'D' ? `<div class="dilemma">${btns[0]}<span class="or">OU</span>${btns[1]}</div>` : `<div class="answers">${btns.join('')}</div>`;
    }
    const canBack = settings().back && S.qi > 0;
    return `${topbar(S.mode === 'party' ? p.name : '')}<div class="qhead"><span>Question ${S.qi + 1} / ${S.qs.length}</span><span class="pill" style="color:${s.c}">${s.n}</span></div>
      <div class="progress"><i style="width:${S.qi / S.qs.length * 100}%"></i></div>
      <div class="question">${esc(q.q)}</div>${body}
      <div class="qfoot">${canBack ? '<button class="linkbtn" data-act="back">← Question précédente</button>' : '<span></span>'}<button class="linkbtn" data-act="report">Signaler</button></div>
      ${S.reportOpen ? `<div class="report">${['Trop violent', 'Mal formulé', 'Offensant', 'Hors sujet'].map(r => `<button class="btn sm" data-act="rep" data-v="${r}">${r}</button>`).join('')}</div>` : ''}`;
  },
  calc() {
    return `<div class="center"><canvas class="bigsigil" data-sigil="org" width="360" height="360" aria-hidden="true" id="calcSig"></canvas><h2>Le tribunal délibère…</h2><p class="sub">Pondération des aveux. Recherche des contradictions. Mesure de la corruption.</p>
      <div class="deliberate">${SINS.map((s, i) => `<i style="color:${s.c};background:${s.c};animation-delay:${i * 0.3}s"></i>`).join('')}</div></div>`;
  },
  consent() {
    return `${topbar('Validation')}<div class="stack"><h2>Avant la révélation</h2><p class="sub">Chaque joueur décide si ses résultats sont montrés au groupe. Les autres restent privés.</p>
      ${S.players.map((p, i) => `<label class="check"><input type="checkbox" data-act="cons" data-i="${i}" ${p.consent ? 'checked' : ''}><span><b>${esc(p.name)}</b> accepte que ses résultats soient révélés</span></label>`).join('')}
      <button class="btn pri block" data-act="go" data-v="reveal">Lancer la révélation</button></div>`;
  },
  private() {
    return `${topbar('Résultats privés')}<div class="stack"><h2>Chacun son verdict</h2><p class="sub">Passe le téléphone. Chaque joueur ouvre son résultat seul.</p>
      ${S.players.map((p, i) => `<button class="btn block" data-act="pview" data-i="${i}">Je suis ${esc(p.name)} : voir mon verdict</button>`).join('')}
      <button class="btn ghost block" data-act="menu">Terminer la partie</button></div>`;
  },
  reveal() {
    const steps = revealSteps(); const st = steps[Math.min(S.reveal, steps.length - 1)];
    const players = S.players.filter(p => S.mode === 'solo' || p.consent);
    const solo = S.mode === 'solo';
    if (st.end) {
      if (solo) { S.view = hydrate(S.players[0].saved); S.viewBack = 'menu'; return screens.profile(); }
      return screens.group();
    }
    let content = '';
    if (st.exc) {
      const items = [];
      players.forEach(p => SINS.forEach(s => { const r = p.result.sins[s.k]; if (isExceptional(r) || isShiny(r)) items.push(tileHTML(s.k, r, { big: true, who: solo ? '' : p.name, delay: items.length * 250 })); }));
      content = `<div class="tiles">${items.join('')}</div>`;
    } else {
      const tiles = [];
      players.forEach(p => { const asc = ranking(p.result).reverse(); st.pos.forEach(pos => { const x = asc[pos]; if (x) tiles.push(tileHTML(x.k, x.r, { big: st.dom || (solo && st.pos.length === 1), who: solo ? '' : p.name, delay: tiles.length * 160 })); }); });
      content = `<div class="tiles">${tiles.join('')}</div>`;
    }
    const done = solo ? ranking(S.players[0].result).reverse().filter((_, i) => steps.slice(0, S.reveal).some(x => x.pos && x.pos.includes(i))) : [];
    return `${topbar('Révélation')}<div class="center" style="justify-content:flex-start;min-height:0">
      <p class="small">Étape ${S.reveal + 1} sur ${steps.length - 1}</p><h2 class="${st.exc ? 'rainbow' : ''}">${st.label}</h2>
      ${done.length ? `<div class="revealed">${done.map(x => `<span class="chip" style="color:${SIN[x.k].c}">${SIN[x.k].n}</span>`).join('')}</div>` : ''}
      ${content}${!players.length ? '<p class="sub">Personne n\'a accepté la révélation. Lâches.</p>' : ''}
      <button class="btn pri" data-act="rnext">${S.reveal >= steps.length - 2 ? 'Voir le profil complet' : 'Révéler la suite'}</button></div>`;
  },
  profile() {
    const v = S.view; if (!v) return screens.menu();
    const rows = SINS.map(s => { const r = v.sins[s.k]; if (r.empty) return ''; const w = r.kind === 'num' ? r.display : r.kind === 'neg' || r.kind === 'glitch' ? 0 : 100;
      const val = r.kind === 'inf' ? '∞' : r.kind === 'infshiny' ? '∞ SHINY' : r.kind === 'glitch' ? 'NaN' : r.kind === 'neg' ? s.neg : r.display + (r.kind === 'exc' ? '' : '/100');
      return `<div class="srow"><span class="dot" style="background:${s.c}"></span><span><b>${s.n}</b><br><span class="small">${esc(r.rank)}</span></span><span class="v ${r.kind === 'infshiny' || r.kind === 'inf' ? 'rainbow' : r.kind === 'glitch' ? 'glitch' : ''}" style="${r.kind === 'exc' ? `color:${s.c}` : ''}">${esc(val)}</span><span class="bar"><i style="width:${Math.min(w, 100)}%;background:${r.kind === 'exc' || r.kind === 'inf' || r.kind === 'infshiny' ? 'linear-gradient(90deg,#ff5f6d,#ffc371,#6dffb0,#5fc8ff,#c86dff)' : s.c}"></i></span></div>`; }).join('');
    const prof = v.profile || {}; const C = cardCompute(v.card);
    const fresh = S.fresh.length && S.screen === 'reveal' ? `<div class="unlock">Succès débloqué${S.fresh.length > 1 ? 's' : ''} : ${S.fresh.map(a => esc(a.name)).join(', ')}</div>` : '';
    const party = S.mode === 'party' && S.players.some(p => p.saved && p.saved.id === v.id);
    return `${topbar(frDate(v.date))}<div class="stack">${fresh}
      <div><p class="small">PROFIL DE ${esc(v.name.toUpperCase())}</p><div class="ptitle">${esc(prof.title || '')}</div></div>
      <p class="sub">Dominant : <b style="color:${SIN[prof.dominant]?.c}">${SIN[prof.dominant]?.n || '—'}</b>${prof.secondary ? ` · Secondaire : <b style="color:${SIN[prof.secondary].c}">${SIN[prof.secondary].n}</b>` : ''}${prof.weakest ? ` · Plus faible : <b style="color:${SIN[prof.weakest].c}">${SIN[prof.weakest].n}</b>` : ''}</p>
      <div class="grid2"><div>${radarSVG([{ color: SIN[prof.dominant]?.c || '#b3262e', sins: v.sins }])}</div><div class="slist">${rows}</div></div>
      <div class="card analysis"><h3 style="margin-bottom:12px">Le réquisitoire</h3>${(prof.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>
      ${v.opens && v.opens.length ? `<div class="card analysis"><h3 style="margin-bottom:12px">Aveux spontanés</h3>${v.opens.map(o => `<p><span class="small">${esc(o.q)}</span><br>« ${esc(o.a)} »</p>`).join('')}</div>` : ''}
      <div class="stack" style="align-items:center"><h3>Ta Sin Card · <span style="color:${RARC[C.rar]}">${C.rar}</span></h3>
        <div class="cardbox" id="cardbox"><canvas id="cardcv" width="1000" height="1400" role="img" aria-label="Sin Card de ${esc(v.name)}"></canvas><div class="holo ${C.variant === 'shiny' ? 'shiny' : C.variant === 'legendary' ? 'leg' : C.variant === 'neg' ? 'neg' : ''}" id="cardholo"></div></div>
        <div class="row" style="justify-content:center"><button class="btn pri" data-act="exp" data-v="png">Image PNG</button><button class="btn" data-act="exp" data-v="jpg">JPG</button><button class="btn" data-act="ctext">Copier le texte</button></div></div>
      <div class="row" style="justify-content:center">${party ? '<button class="btn" data-act="backgroup">Retour au groupe</button>' : ''}<button class="btn" data-act="${S.viewBack === 'history' ? 'go' : 'menu'}" data-v="history">${S.viewBack === 'history' ? 'Retour à la collection' : 'Menu'}</button>${S.viewBack !== 'history' && !party ? '<button class="btn pri" data-act="setup" data-v="solo">Refaire le test</button>' : ''}</div>
      <p class="disclaimer">Résultat ludique, pas une évaluation psychologique.</p></div>`;
  },
  group() {
    const vis = S.players.filter(p => p.consent);
    const val = (r) => { const v = sortValue(r); return Number.isFinite(v) ? v : -2; };
    const adj = { org: 'orgueilleux', ava: 'avare', lux: 'luxurieux', env: 'envieux', gou: 'gourmand', col: 'colérique', par: 'paresseux' };
    const rows = [];
    if (vis.length) {
      SINS.forEach(s => { const m = Math.max(...vis.map(p => val(p.result.sins[s.k]))); const w = vis.filter(p => val(p.result.sins[s.k]) === m); if (!w.length) return; rows.push([`Le plus ${adj[s.k]}`, w.map(p => p.name).join(', ') + ' · ' + (w[0].saved.sins[s.k].kind === 'num' || w[0].saved.sins[s.k].kind === 'exc' ? w[0].saved.sins[s.k].display : ({ inf: '∞', infshiny: '∞ SHINY', glitch: 'NaN', neg: s.neg })[w[0].saved.sins[s.k].kind])]); });
      const tot = (p) => SINS.reduce((a, s) => { const r = p.result.sins[s.k]; return a + (r.kind === 'inf' || r.kind === 'infshiny' ? 200 : r.kind === 'glitch' ? 50 : r.kind === 'neg' ? 0 : r.display); }, 0);
      const best = vis.slice().sort((a, b) => tot(b) - tot(a))[0]; const hasInf = SINS.some(s => ['inf', 'infshiny'].includes(best.result.sins[s.k].kind)); rows.push(['Le plus corrompu', `${best.name} · ${hasInf ? '∞' : Math.round(tot(best) / 7)} de moyenne`]);
      const sd = (p) => { const xs = SINS.map(s => { const r = p.result.sins[s.k]; return r.kind === 'glitch' ? 50 : Math.min(Number.isFinite(r.display) ? r.display : 160, 160); }); const m = xs.reduce((a, b) => a + b, 0) / 7; return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / 7); };
      const bal = vis.slice().sort((a, b) => sd(a) - sd(b))[0]; rows.push(['Le profil le plus équilibré', `${bal.name} · écart ${Math.round(sd(bal))}`]);
      const sh = (p) => SINS.filter(s => isShiny(p.result.sins[s.k])).length; const ms = Math.max(...vis.map(sh));
      rows.push(['Le plus de rangs Shiny', ms ? vis.filter(p => sh(p) === ms).map(p => p.name).join(', ') + ' · ' + ms : 'Personne. Bande de gens normaux.']);
      const rare = vis.slice().sort((a, b) => cardCompute(b.card).ri - cardCompute(a.card).ri)[0]; rows.push(['La carte la plus rare', `${rare.name} · ${cardCompute(rare.card).rar}`]);
    }
    const hidden = S.players.filter(p => !p.consent);
    return `${topbar('Verdict collectif')}<div class="stack"><h2>Le verdict de la bande</h2>
      ${S.fresh.length ? `<div class="unlock">Succès débloqué${S.fresh.length > 1 ? 's' : ''} : ${S.fresh.map(a => esc(a.name)).join(', ')}</div>` : ''}
      ${vis.length ? `<div class="grid2"><div>${radarSVG(vis.map((p, i) => ({ color: PCOLORS[i % 12], sins: p.result.sins })))}<div class="legend">${vis.map((p, i) => `<span><i style="background:${PCOLORS[i % 12]}"></i>${esc(p.name)}</span>`).join('')}</div></div><div class="rank">${rows.map(([a, b]) => `<div><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}</div></div>` : '<p class="sub">Aucun résultat partagé.</p>'}
      <h3>Les cartes</h3><div class="thumbs">${vis.map((p, i) => `<button class="thumb" data-act="gview" data-i="${S.players.indexOf(p)}"><img data-thumb="${S.players.indexOf(p)}" alt=""><b>${esc(p.name)}</b><span class="small" style="color:${RARC[cardCompute(p.card).rar]}">${cardCompute(p.card).rar}</span></button>`).join('')}</div>
      ${hidden.length ? `<p class="small">Résultats privés : ${hidden.map(p => esc(p.name)).join(', ')}. Ils peuvent les voir seuls :</p><div class="row">${hidden.map(p => `<button class="btn sm" data-act="pview" data-i="${S.players.indexOf(p)}">Je suis ${esc(p.name)}</button>`).join('')}</div>` : ''}
      <div class="row"><button class="btn pri" data-act="replay">Nouvelle partie, mêmes joueurs</button><button class="btn" data-act="menu">Menu</button></div></div>`;
  },
  history() {
    const H = store.history.map(hydrate).slice().reverse();
    const names = [...new Set(store.history.map(h => h.name))];
    if (!S.evoName || !names.includes(S.evoName)) S.evoName = names[0] || '';
    const opts = H.map(h => `<option value="${h.id}">${esc(h.name)} · ${frDate(h.date)} · ${esc(h.profile?.title || '')}</option>`).join('');
    const A = H.find(h => h.id === S.cmpA) || H[0], B = H.find(h => h.id === S.cmpB) || H[1] || H[0];
    return `${topbar('Collection')}<div class="stack"><h2>Ta collection</h2><p class="small">${store.mode === 'db' ? 'Sauvegardée sur ton compte, visible par toi seul.' : store.mode === 'local' ? 'Sauvegardée dans ce navigateur.' : store.mode === 'loading' ? 'Chargement…' : 'Sauvegarde indisponible ici : tout disparaîtra à la fermeture.'}</p>
      ${H.length ? `<div class="thumbs">${H.map(h => `<button class="thumb" data-act="hview" data-v="${h.id}"><img data-hthumb="${h.id}" alt=""><b>${esc(h.name)}</b><span class="small">${frDate(h.date)} · <span style="color:${RARC[cardCompute(h.card).rar]}">${cardCompute(h.card).rar}</span>${h.mode === 'party' ? ' · groupe' : ''}</span></button>`).join('')}</div>` : '<div class="card sub">Aucune carte encore. Passe un test pour commencer ta collection.</div>'}
      ${names.length ? `<div class="card stack"><div class="spread"><h3>Évolution dans le temps</h3><select data-act="evo" style="max-width:220px" aria-label="Joueur">${names.map(n => `<option ${n === S.evoName ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>${evoChart(S.evoName)}</div>` : ''}
      ${H.length >= 2 ? `<div class="card stack"><h3>Comparer deux résultats</h3><div class="grid2" style="gap:10px"><select data-act="cmpA" aria-label="Résultat A">${opts.replace(`value="${A.id}"`, `value="${A.id}" selected`)}</select><select data-act="cmpB" aria-label="Résultat B">${opts.replace(`value="${B.id}"`, `value="${B.id}" selected`)}</select></div>
        ${radarSVG([{ color: '#ff4b3e', sins: A.sins }, { color: '#5fc8ff', sins: B.sins }])}<div class="legend"><span><i style="background:#ff4b3e"></i>${esc(A.name)} (${frDate(A.date)})</span><span><i style="background:#5fc8ff"></i>${esc(B.name)} (${frDate(B.date)})</span></div>
        <table><thead><tr><th>Péché</th><th>A</th><th>B</th></tr></thead><tbody>${SINS.map(s => { const a = A.sins[s.k], b = B.sins[s.k]; const va = sortValue(a), vb = sortValue(b); const f = (r) => r.kind === 'inf' ? '∞' : r.kind === 'infshiny' ? '∞ SHINY' : r.kind === 'glitch' ? 'NaN' : r.kind === 'neg' ? s.neg : r.display;
          return `<tr><td>${s.n}</td><td class="n ${va > vb ? 'win' : ''}">${esc(f(a))}</td><td class="n ${vb > va ? 'win' : ''}">${esc(f(b))}</td></tr>`; }).join('')}</tbody></table></div>` : ''}
      </div>`;
  },
  achievements() {
    const U = store.state.unlocked || {};
    return `${topbar('Succès')}<div class="stack"><h2>Succès</h2><p class="sub">${Object.keys(U).length} sur ${ACHIEVEMENTS.length} débloqués. Certains sont secrets.</p>
      <div class="ach">${ACHIEVEMENTS.map(a => U[a.id] ? `<div class="on"><b>${esc(a.name)}</b><span class="small">${esc(a.desc)} · ${frDate(U[a.id])}</span></div>` : a.secret ? `<div class="lock"><b>???</b><span class="small">Succès secret</span></div>` : `<div class="lock"><b>${esc(a.name)}</b><span class="small">${esc(a.desc)}</span></div>`).join('')}</div></div>`;
  },
  whois() {
    const p = S.players[S.pending];
    return `<div class="center"><h2>Tu es bien <span class="red">${esc(p.name)}</span> ?</h2><p class="sub">Les autres, regardez ailleurs. Ce verdict ne regarde que lui.</p><div class="row"><button class="btn pri" data-act="pviewok">Oui, montre-moi</button><button class="btn" data-act="pviewno">Non, retour</button></div></div>`;
  },
  settings() {
    const st = settings();
    return `${topbar('Paramètres')}<div class="stack"><h2>Paramètres</h2>${adultBox()}
      <label class="check"><input type="checkbox" data-act="sound" ${st.sound ? 'checked' : ''}><span><b>Effets sonores</b><br><span class="small">Gong de révélation et petits sons de validation.</span></span></label>
      <label class="check"><input type="checkbox" data-act="backok" ${st.back ? 'checked' : ''}><span><b>Autoriser le retour en arrière</b><br><span class="small">Décoche pour un interrogatoire sans repentir.</span></span></label>
      <div class="card stack"><h3>Noms des niveaux</h3><p class="small">Personnalise les huit niveaux classiques (0-10, 11-25, 26-40, 41-55, 56-70, 71-85, 86-99, 100).</p>
        ${st.levels.map((l, i) => `<input data-act="lvl" data-i="${i}" maxlength="24" value="${esc(l)}" aria-label="Niveau ${i + 1}">`).join('')}<button class="btn sm" data-act="lvlreset">Remettre par défaut</button></div>
      <div class="card stack"><h3>Mes données</h3><p class="small">${store.history.length} résultat(s) enregistré(s). ${store.mode === 'db' ? 'Stockés sur ton compte, privés.' : 'Stockés dans ce navigateur.'}</p>
        ${S.confirmClear ? `<p>Tout effacer ? Historique, cartes et succès disparaîtront définitivement.</p><div class="row"><button class="btn pri" data-act="clearyes">Oui, tout effacer</button><button class="btn" data-act="clearno">Annuler</button></div>` : '<button class="btn" data-act="clear">Effacer mon historique</button>'}</div>
      <p class="disclaimer">SEVEN SINS est un jeu. Les questions explicites sont réservées aux adultes. ${QUESTIONS.length} questions dans la banque.</p></div>`;
  }
};

function evoChart(name) {
  const H = store.history.filter(h => h.name === name).map(hydrate).slice(-12);
  if (H.length < 2) return '<p class="small">Il faut au moins deux tests de ce joueur pour voir une évolution.</p>';
  const W = 640, Ht = 260, pl = 36, pr = 12, pt = 14, pb = 28;
  const x = (i) => pl + i * (W - pl - pr) / (H.length - 1), y = (v) => pt + (1 - v / 160) * (Ht - pt - pb);
  const v = (r) => r.kind === 'inf' || r.kind === 'infshiny' ? 160 : r.kind === 'glitch' ? null : r.kind === 'neg' ? 0 : Math.min(r.display, 160);
  let g = `<svg class="chart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Évolution des scores de ${esc(name)}">`;
  [0, 50, 100, 150].forEach(t => g += `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="${t === 100 ? '#c9a45c' : 'currentColor'}" stroke-opacity="${t === 100 ? .7 : .12}"/><text x="${pl - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#a99f94">${t}</text>`);
  H.forEach((h, i) => g += `<text x="${x(i)}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="#a99f94">${frDate(h.date).slice(0, 5)}</text>`);
  SINS.forEach(s => { const pts = H.map((h, i) => [x(i), v(h.sins[s.k])]).filter(p => p[1] !== null); if (pts.length < 2) return; g += `<polyline fill="none" stroke="${s.c}" stroke-width="2.5" points="${pts.map(p => p[0] + ',' + y(p[1])).join(' ')}"/>`; pts.forEach(p => g += `<circle cx="${p[0]}" cy="${y(p[1])}" r="3" fill="${s.c}"/>`); });
  return g + `</svg><div class="legend">${SINS.map(s => `<span><i style="background:${s.c}"></i>${s.n}</span>`).join('')}</div>`;
}

// ───────── rendu + post-traitement (canvas, compteurs)
function render() {
  const app = $('#app');
  const wideScreens = ['profile', 'group', 'history', 'reveal'];
  app.classList.toggle('wide', wideScreens.includes(S.screen));
  app.innerHTML = (screens[S.screen] || screens.menu)();
  $$('canvas[data-sigil]').forEach(cv => { const ctx = cv.getContext('2d'); const k = cv.dataset.sigil; ctx.clearRect(0, 0, cv.width, cv.height); ctx.save(); ctx.translate(cv.width / 2, cv.height / 2); const sc = cv.width / 270; ctx.scale(sc, sc); sigil(ctx, SIN[k].sym, SIN[k].c); ctx.restore(); });
  $$('[data-count]').forEach(el => { const to = +el.dataset.count; if (REDUCE) { el.textContent = to; return; } const t0 = performance.now(), d = 900; const step = (t) => { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  $$('img[data-thumb]').forEach(img => { const p = S.players[+img.dataset.thumb]; img.src = thumb(p.card); });
  $$('img[data-hthumb]').forEach(img => { const h = store.history.find(x => x.id === img.dataset.hthumb); if (h) img.src = thumb(h.card); });
  const cv = $('#cardcv'); if (cv && S.view) { drawCard(cv, S.view.card, 1); bindTilt($('#cardbox'), $('#cardholo')); }
  if (S.screen === 'calc') animateCalc();
}
const thumbCache = new Map();
function thumb(card) { const k = JSON.stringify(card); if (thumbCache.has(k)) return thumbCache.get(k); const c = document.createElement('canvas'); drawCard(c, card, .34); const u = c.toDataURL('image/jpeg', .85); thumbCache.set(k, u); return u; }
function bindTilt(box, holo) {
  if (!box || REDUCE) return;
  box.addEventListener('pointermove', e => { const r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; box.style.setProperty('--ry', ((x - .5) * 16) + 'deg'); box.style.setProperty('--rx', ((.5 - y) * 16) + 'deg'); if (holo) holo.style.backgroundPosition = `${x * 100}% ${y * 100}%`; });
  box.addEventListener('pointerleave', () => { box.style.setProperty('--rx', '0deg'); box.style.setProperty('--ry', '0deg'); });
}
function animateCalc() {
  let i = 0; const cv = $('#calcSig'); if (!cv) return;
  const tick = () => { if (S.screen !== 'calc' || !document.body.contains(cv)) return; const s = SINS[i++ % 7]; const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height); ctx.save(); ctx.translate(cv.width / 2, cv.height / 2); ctx.scale(cv.width / 270, cv.width / 270); sigil(ctx, s.sym, s.c); ctx.restore(); tone(90 + i * 20, .3, 'sine', .03); setTimeout(tick, 380); };
  tick();
}

async function exportCard(fmt) {
  const v = S.view; const c = document.createElement('canvas'); const C = drawCard(c, v.card, 2);
  const type = fmt === 'png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise(r => c.toBlob(r, type, .93));
  const fn = `sin-card-${v.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}-${C.id}.${fmt}`;
  if (dl && blob) { try { await dl.save({ filename: fn, data: blob }); toast('Carte enregistrée.'); return; } catch (e) { if (e && e.code === 'declined') return toast('Enregistrement annulé.'); } }
  // Application Android : fichier temporaire puis menu de partage natif (WhatsApp, Discord, Instagram, Galerie…)
  if (NATIVE && blob) {
    try {
      const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
      const w = await Filesystem.writeFile({ path: fn, data: b64, directory: Directory.Cache });
      await Share.share({ title: 'Ma Sin Card', text: 'Mon verdict SEVEN SINS', files: [w.uri], dialogTitle: 'Partager ma Sin Card' });
      return;
    } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; }
  }
  // Navigateur du téléphone (iPhone, Android) : menu de partage avec l'image
  if (blob && navigator.canShare) {
    try { const file = new File([blob], fn, { type }); if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Ma Sin Card' }); return; } }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  // Ordinateur : téléchargement direct
  if (blob && !window.claude) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fn; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Carte téléchargée.'); return; }
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<img alt="Sin Card" src="${c.toDataURL(type, .93)}"><p class="sub" style="text-align:center">Appui long sur l'image pour l'enregistrer ou la partager.</p><button class="btn">Fermer</button>`;
  m.querySelector('button').onclick = () => m.remove(); document.body.appendChild(m);
}
function cardText(v) {
  const C = cardCompute(v.card);
  return [`SEVEN SINS — PLAYER CARD`, `${v.name.toUpperCase()} · ${C.title}`, `Profil : ${v.profile?.title || ''}`, `Rareté : ${C.rar}`,
    ...SINS.map(s => { const r = v.sins[s.k]; const val = r.kind === 'inf' ? '∞' : r.kind === 'infshiny' ? '∞ SHINY' : r.kind === 'glitch' ? 'NaN' : r.kind === 'neg' ? s.neg : r.display + '/100'; return `${s.n} : ${val} — ${r.rank}`; }),
    `Péché dominant : ${SIN[v.profile?.dominant]?.n.toUpperCase() || '—'}`, `${C.id} · ${frDate(v.date)}`, `« Tout le monde a un péché. »`].join('\n');
}

// ───────── événements
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, v = el.dataset.v, i = +el.dataset.i;
  if (['csin', 'adult', 'sound', 'backok', 'cons', 'evo', 'cmpA', 'cmpB', 'pn', 'pname', 'lvl', 'cper'].includes(act)) return; // gérés par change/input
  switch (act) {
    case 'menu': go('menu'); break;
    case 'go': if (v === 'reveal') S.reveal = 0; go(v); break;
    case 'setup':
      S.mode = v;
      if (v === 'party' && S.players.length < 2) S.players = [{ name: 'MEHDI' }, { name: 'HAMZA' }, { name: 'YAZID' }, { name: 'AMRO' }].map(p => ({ ...p, answers: {} }));
      go('setup'); break;
    case 'dur': S.duration = v; render(); break;
    case 'priv': S.privacy = v; render(); break;
    case 'padd': if (S.players.length < 12) { S.players.push({ name: 'JOUEUR ' + (S.players.length + 1), answers: {} }); render(); } break;
    case 'prm': if (S.players.length > 2) { S.players.splice(i, 1); render(); } break;
    case 'start': {
      if (S.duration === 'custom' && !S.custom.sins.length) return toast('Choisis au moins un péché.');
      if (S.mode === 'solo') { const n = ($('#pname').value.trim() || 'ANONYME').slice(0, 16); settings().name = n; store.saveState(); S.players = [{ name: n, answers: {} }]; }
      else { S.players.forEach((p, k) => p.name = (p.name || '').trim() || 'JOUEUR ' + (k + 1)); }
      tone(196, .6); startGame(); break;
    }
    case 'intro': afterIntro(); break;
    case 'handok': go('question'); break;
    case 'tok': S.tshown.add(v); gong(); go('question'); break;
    case 'ans': el.classList.add('picked'); answer(+v); break;
    case 'openok': { const t = ($('#openA').value || '').trim(); const q = S.qs[S.qi]; if (t) S.players[S.pi].answers[q.id] = t; else delete S.players[S.pi].answers[q.id]; next(); break; }
    case 'skip': delete S.players[S.pi].answers[S.qs[S.qi].id]; next(); break;
    case 'back': if (S.qi > 0) { S.qi--; const key = S.pi + ':' + S.qi; S.tshown.add(key); go('question'); } break;
    case 'report': S.reportOpen = !S.reportOpen; render(); break;
    case 'rep': await store.report(S.qs[S.qi].id, v); S.reportOpen = false; render(); toast('Merci, question signalée.'); break;
    case 'rnext': S.reveal++; gong(); render(); window.scrollTo({ top: 0 }); break;
    case 'pview': go('whois', { pending: i }); break;
    case 'pviewok': S.view = hydrate(S.players[S.pending].saved); S.viewBack = 'group'; go('profile'); break;
    case 'pviewno': S.privacy === 'private' ? go('private') : (S.reveal = revealSteps().length - 1, go('reveal')); break;
    case 'gview': S.view = hydrate(S.players[i].saved); S.viewBack = 'group'; go('profile'); break;
    case 'backgroup': S.view = null; if (S.privacy === 'private') go('private'); else { S.reveal = revealSteps().length - 1; go('reveal'); } break;
    case 'replay': S.mode = 'party'; go('setup'); break;
    case 'hview': { const h = store.history.find(x => x.id === v); if (h) { S.view = hydrate(h); S.viewBack = 'history'; go('profile'); } break; }
    case 'exp': exportCard(v); break;
    case 'ctext': try { await navigator.clipboard.writeText(cardText(S.view)); toast('Texte copié : colle-le sur WhatsApp ou Discord.'); } catch (err) { toast('Copie impossible ici.'); } break;
    case 'lvlreset': settings().levels = DEFAULT_LEVELS.slice(); store.saveState(); render(); break;
    case 'clear': S.confirmClear = true; render(); break;
    case 'clearno': S.confirmClear = false; render(); break;
    case 'clearyes': await store.clearAll(); S.confirmClear = false; thumbCache.clear(); render(); toast('Historique effacé.'); break;
  }
});

document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, i = +el.dataset.i;
  const st = settings();
  if (act === 'csin') { const k = el.dataset.v; S.custom.sins = el.checked ? [...new Set([...S.custom.sins, k])] : S.custom.sins.filter(x => x !== k); }
  if (act === 'adult') { st.adult = el.checked; store.saveState(); }
  if (act === 'sound') { st.sound = el.checked; store.saveState(); }
  if (act === 'backok') { st.back = el.checked; store.saveState(); }
  if (act === 'cons') S.players[i].consent = el.checked;
  if (act === 'evo') { S.evoName = el.value; render(); }
  if (act === 'cmpA') { S.cmpA = el.value; render(); }
  if (act === 'cmpB') { S.cmpB = el.value; render(); }
  if (act === 'lvl') { st.levels[i] = el.value.trim() || DEFAULT_LEVELS[i]; store.saveState(); }
});
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.dataset.act === 'pname') S.draftName = el.value;
  if (el.dataset.act === 'pn') S.players[+el.dataset.i].name = el.value.slice(0, 16);
  if (el.dataset.act === 'cper') { S.custom.perSin = +el.value; const o = $('#ppv'); if (o) o.textContent = el.value; }
});

// ───────── bouton retour Android
if (NATIVE) {
  CapApp.addListener('backButton', () => {
    if (S.screen === 'question' && settings().back && S.qi > 0) { S.qi--; S.tshown.add(S.pi + ':' + S.qi); go('question'); }
    else if (['home', 'menu'].includes(S.screen)) CapApp.exitApp();
    else if (['question', 'handoff', 'intro', 'calc'].includes(S.screen)) toast('Termine l\'interrogatoire. Ou utilise le logo pour fuir vers le menu.');
    else go('menu');
  });
}

// ───────── démarrage
function embers() { const d = document.createElement('div'); d.className = 'embers'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = Array.from({ length: 18 }, (_, i) => `<i style="left:${(i * 53) % 100}%;animation-duration:${9 + (i * 7) % 11}s;animation-delay:${(i * 1.3) % 9}s"></i>`).join(''); document.body.appendChild(d); }
store.state.settings = { ...DEFAULT_SETTINGS };
embers();
render();
const fonts = document.fonts ? Promise.all(['900 40px Cinzel', '700 40px Cinzel', '600 20px Inter', '800 20px Inter'].map(f => document.fonts.load(f))).catch(() => {}) : Promise.resolve();
fonts.then(() => { thumbCache.clear(); render(); });
store.init().then(async () => {
  store.state.settings = { ...DEFAULT_SETTINGS, ...(store.state.settings || {}) };
  if (!Array.isArray(store.state.settings.levels) || store.state.settings.levels.length !== 8) store.state.settings.levels = DEFAULT_LEVELS.slice();
  store.state.unlocked = store.state.unlocked || {};
  if (['menu', 'history', 'achievements', 'settings'].includes(S.screen)) render();
});
(async () => { try { if (window.claude && window.claude.use) dl = await window.claude.use('downloads'); } catch (e) {} })();
