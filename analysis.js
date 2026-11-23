// Profil global et analyse personnalisée, construits à partir des réponses réelles
import { SINS, SIN, COMBOS, PROFILE_NOUNS } from '../data/sins.js';
import { FREQ } from '../data/questions.js';
import { sortValue, isExceptional, levelIndex } from './scoring.js';

const cut = (s, n = 95) => s.length > n ? s.slice(0, n - 1).trim() + '…' : s;

export function answerText(q, a) {
  if (q.t === 'S') return `${a}/10`;
  if (q.t === 'F') return FREQ[a];
  if (q.t === 'O') return a;
  return q.o[a] ? q.o[a].t : '';
}

export function ranking(result) {
  const list = SINS.map(s => ({ k: s.k, r: result.sins[s.k] })).filter(x => !x.r.empty);
  const key = (r) => r.kind === 'glitch' ? 50 : sortValue(r);
  const sorted = list.slice().sort((a, b) => key(b.r) - key(a.r));
  return sorted;
}

function tier(r) {
  if (isExceptional(r)) return 4;
  const v = r.display;
  return v <= 25 ? 0 : v <= 55 ? 1 : v <= 85 ? 2 : 3;
}

export function profileTitle(result) {
  const sorted = ranking(result);
  if (!sorted.length) return 'LE VIDE';
  const d = sorted.find(x => x.r.kind !== 'glitch') || sorted[0];
  let noun;
  if (d.r.kind === 'inf' || d.r.kind === 'infshiny') noun = 'LA FIN DES TEMPS';
  else if (d.r.kind === 'exc') noun = "L'ANOMALIE";
  else if (d.r.kind === 'neg') noun = "L'ÂME SUSPECTE";
  else noun = PROFILE_NOUNS[levelIndex(d.r.display)];
  return noun + ' ' + SIN[d.k].adj;
}

export function buildProfile(result, questions, answers, name) {
  const sorted = ranking(result);
  const ng = sorted.filter(x => x.r.kind !== 'glitch');
  const dom = ng[0] || sorted[0], sec = ng[1];
  const weakest = sorted.slice().reverse().find(x => x.r.kind !== 'glitch') || sorted[sorted.length - 1];
  const P = [];
  if (!dom) return { title: 'LE VIDE', dominant: null, secondary: null, weakest: null, paragraphs: ["Tu n'as répondu à rien. Le tribunal note ta prudence. Et ta lâcheté."] };
  const ds = SIN[dom.k];
  // 1. Pourquoi ce péché domine, avec la pièce à conviction
  let p1 = ds.lines[tier(dom.r)];
  if (dom.r.top && dom.r.top.l >= 2) p1 += ` Pièce à conviction : à « ${cut(dom.r.top.q.q)} », tu as répondu « ${cut(answerText(dom.r.top.q, answers[dom.r.top.q.id]), 80)} ».`;
  if (dom.r.extremes >= 2) p1 += ` ${dom.r.extremes} réponses extrêmes dans cette catégorie : ce n'est plus un écart, c'est un mode de vie.`;
  P.push(p1);
  // 2. Interaction entre les deux péchés principaux
  if (sec && sortValue(sec.r) >= 26) {
    const key = [dom.k, sec.k].sort((a, b) => SINS.findIndex(s => s.k === a) - SINS.findIndex(s => s.k === b)).join('-');
    let p2 = COMBOS[key] || '';
    p2 += ' ' + SIN[sec.k].lines[tier(sec.r)];
    P.push(p2.trim());
  }
  // 3. Le péché le plus faible
  if (weakest && weakest.k !== dom.k) {
    const w = weakest.r;
    P.push(w.kind === 'neg'
      ? `En ${SIN[weakest.k].n.toLowerCase()}, tu as répondu zéro partout. Pas « peu » : zéro. Le tribunal te décerne le rang « ${SIN[weakest.k].neg} », un shiny à l'envers.`
      : `Ton point faible, c'est-à-dire ta seule vertu : ${SIN[weakest.k].n.toLowerCase()} (${w.display}/100). ${SIN[weakest.k].lines[tier(w)]}`);
  }
  // 4. Contradictions et mensonges
  const glitches = sorted.filter(x => x.r.kind === 'glitch');
  glitches.forEach(g => P.push(`En ${SIN[g.k].n.toLowerCase()}, le tribunal n'a rien pu mesurer : tes réponses se contredisent tellement que le résultat est NaN. Pas zéro, pas cent. Not a Number.`));
  const contras = sorted.filter(x => x.r.contraPairs && x.r.contraPairs.length && x.r.kind !== 'glitch');
  if (contras.length) {
    const c = contras[0].r.contraPairs[0];
    P.push(`Contradiction relevée en ${SIN[contras[0].k].n.toLowerCase()} : tes réponses sur « ${c[0].f.toLowerCase()} » et « ${c[1].f.toLowerCase()} » disent l'inverse l'une de l'autre. Soit tu mens, soit tu ne te connais pas. Les deux sont inquiétants. Ta fiabilité baisse, ton score est ramené vers le centre.`);
  }
  if (result.lies.length) {
    const l = result.lies[0]; const t = l.o.find(x => x.lie).t;
    P.push(`Tu as aussi affirmé : « ${t} ». Personne ne te croit, et l'algorithme non plus. ${result.lies.length > 1 ? `Et tu l'as fait ${result.lies.length} fois.` : ''}`.trim());
  }
  // 5. Rangs exceptionnels
  const exc = sorted.filter(x => isExceptional(x.r));
  if (exc.length) P.push(`Rang${exc.length > 1 ? 's' : ''} hors échelle débloqué${exc.length > 1 ? 's' : ''} : ${exc.map(x => `${x.r.rank} (${SIN[x.k].n})`).join(', ')}. Plusieurs réponses extrêmes, cohérentes entre elles, répétées : le barème a rendu les armes.`);
  // 6. Type de personnalité
  const avg = sorted.reduce((s, x) => s + Math.min(100, Number.isFinite(x.r.display) ? x.r.display : (x.r.kind === 'glitch' ? 50 : 100)), 0) / sorted.length;
  const close = sec && Number.isFinite(dom.r.display) && Number.isFinite(sec.r.display) && Math.abs(dom.r.display - sec.r.display) <= 8;
  P.push(avg >= 70 ? `Verdict : corruption générale à ${Math.round(avg)} %. Tu n'as pas un péché, tu as un abonnement à tous.`
    : avg >= 45 ? `Verdict : pécheur polyvalent, ${Math.round(avg)} % de corruption moyenne. ${close ? 'Deux péchés se disputent le trône, et aucun ne compte céder.' : `Le reste suit ${ds.n.toLowerCase()} comme une cour suit son roi.`}`
    : avg >= 25 ? `Verdict : ${Math.round(avg)} % de corruption moyenne. Tu as un vice principal et une façade respectable. Classique.`
    : `Verdict : ${Math.round(avg)} % de corruption moyenne. Soit tu es un saint, soit tu as menti avec talent. Le tribunal penche pour la deuxième option.`);
  return { title: profileTitle(result), dominant: dom.k, secondary: sec ? sec.k : null, weakest: weakest ? weakest.k : null, paragraphs: P };
}
