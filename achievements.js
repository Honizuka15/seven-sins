// Succès : visibles et secrets
import { SINS } from '../data/sins.js';
import { isExceptional } from './scoring.js';

const vals = (r) => SINS.map(s => r.sins[s.k]).filter(x => !x.empty);
const num = (x) => Number.isFinite(x.display) ? x.display : (x.kind === 'glitch' ? 0 : x.kind === 'neg' ? 0 : 200);

export const ACHIEVEMENTS = [
{id:'first',name:'Premier péché',desc:'Terminer son premier test.',test:(r)=>true},
{id:'multi',name:'Le Multiclassé',desc:'Au moins 50 dans trois péchés.',test:(r)=>vals(r).filter(x=>num(x)>=50).length>=3},
{id:'incarn',name:"L'Incarnation",desc:'Atteindre 100 dans une catégorie.',test:(r)=>vals(r).some(x=>num(x)>=100)},
{id:'coll',name:'Le Collectionneur',desc:'Débloquer trois rangs exceptionnels, tous tests confondus.',test:(r,h)=>[...h,r].reduce((s,x)=>s+vals(x).filter(isExceptional).length,0)>=3},
{id:'absolu',name:'Le Pécheur Absolu',desc:'Dépasser 80 dans les sept catégories.',test:(r)=>vals(r).length===7&&vals(r).every(x=>num(x)>80)},
{id:'shiny',name:'Le Shiny',desc:'Débloquer un rang Shiny.',test:(r)=>vals(r).some(x=>x.kind==='infshiny')},
{id:'incomp',name:"L'Incompréhensible",desc:'Obtenir des résultats extrêmement contradictoires.',test:(r)=>vals(r).some(x=>x.kind==='glitch')||vals(r).reduce((s,x)=>s+(x.contra||0),0)>=2},
{id:'saint',name:'Le Sans-Faute',desc:'Score très faible dans les sept catégories.',test:(r)=>vals(r).length===7&&vals(r).every(x=>num(x)<=15)},
{id:'supreme',name:'Le Démon Suprême',desc:'Rang exceptionnel dans plusieurs péchés en un seul test.',test:(r)=>vals(r).filter(isExceptional).length>=2},
{id:'liar',secret:true,name:'Le Menteur',desc:'Affirmer au moins deux réponses trop saintes pour être vraies.',test:(r)=>(r.lies||0)>=2},
{id:'ascete',secret:true,name:"L'Anti-Pécheur",desc:'Obtenir un rang négatif : zéro absolu dans un péché.',test:(r)=>vals(r).some(x=>x.kind==='neg')},
{id:'infini',secret:true,name:"L'Infini",desc:'Atteindre un score infini.',test:(r)=>vals(r).some(x=>x.kind==='inf'||x.kind==='infshiny')},
{id:'marathon',secret:true,name:'Le Marathonien',desc:'Finir un test complet.',test:(r)=>r.duration==='full'},
{id:'bavard',secret:true,name:'Le Confessé',desc:'Répondre à trois questions libres dans un test.',test:(r)=>(r.opens||[]).length>=3},
{id:'social',secret:true,name:'La Bande Maudite',desc:'Finir une partie à quatre joueurs ou plus.',test:(r)=>r.mode==='party'&&(r.partySize||0)>=4}
];

// r : résultat léger { sins, lies, duration, opens, mode, partySize } ; history : anciens résultats légers
export function checkAchievements(r, history, unlocked) {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (unlocked[a.id]) continue;
    try { if (a.test(r, history)) { unlocked[a.id] = r.date || new Date().toISOString().slice(0, 10); fresh.push(a); } } catch (e) {}
  }
  return fresh;
}
