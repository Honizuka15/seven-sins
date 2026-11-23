// Identité des sept péchés : couleur, symbole, rangs exceptionnels, textes
export const SINS = [
{k:'org',n:'Orgueil',en:'Pride',c:'#a77bff',sym:'crown',title:'THE FALLEN KING',adj:'COURONNÉE',
 desc:"Le péché des gens qui ont toujours raison. Même quand ils ont tort.",
 ladder:['Narcissique','Roi du monde','Empereur','Dieu autoproclamé','Divinité suprême'],inf:'Ego infini',shiny:'Orgueil Shiny',neg:'PAILLASSON',
 lines:["Ton ego est tellement discret qu'on se demande s'il est en arrêt maladie.",
 "Tu as un ego normal : il ne sort que quand on te contredit ou qu'on écorche ton prénom.",
 "Tu ne te prends pas pour Dieu, mais tu trouves qu'il aurait deux ou trois choses à apprendre de toi.",
 "Ton reflet est ton meilleur ami et ton seul rival. Quand tu entres dans une pièce, tu attends les applaudissements.",
 "Ce n'est plus de l'orgueil, c'est une religion avec un seul fidèle et un seul dieu. Le même."]},
{k:'ava',n:'Avarice',en:'Greed',c:'#e0b04a',sym:'coins',title:'THE GOLD DRAGON',adj:'DORÉE',
 desc:"Tout ce qui est à toi est à toi. Tout ce qui est aux autres devrait l'être aussi.",
 ladder:['Radin','Collectionneur','Accumulateur','Dragon de richesse','Midas'],inf:'Cupidité infinie',shiny:'Avarice Shiny',neg:'MÉCÈNE',
 lines:["Tu partages tellement que ton banquier pense que tu es une association caritative.",
 "Tu paies ta part. Pile ta part. Et tu t'en souviens.",
 "Tu ne prêtes pas, tu investis. Avec intérêts émotionnels.",
 "Tes poches ont des oursins, ton porte-monnaie un antivol, et tes amis apportent leurs propres chips.",
 "Tu dors sur un tas d'or imaginaire et tu craches du feu dès qu'on parle de partager l'addition."]},
{k:'lux',n:'Luxure',en:'Lust',c:'#e0457b',sym:'rose',title:'THE VELVET SERPENT',adj:'ÉCARLATE',
 desc:"Le désir, la tentation, et les pensées que tu n'oses pas dire à voix haute.",
 ladder:['Tentateur','Incorrigible','Démon du désir','Insatiable'],inf:'Luxure infinie',shiny:'Luxure Shiny',neg:'EUNUQUE',
 lines:["Ta libido a été aperçue pour la dernière fois en 2014. Un avis de recherche est en cours.",
 "Tu as des désirs, tu les gères, tu ne mords pas. En général.",
 "Ton cerveau garde un onglet ouvert en permanence, et ce n'est pas la météo.",
 "Tu ne regardes pas les gens, tu les évalues. Même le livreur sent que quelque chose se passe.",
 "Ton aura fait monter la température de la pièce de trois degrés. Les plantes rougissent."]},
{k:'env',n:'Envie',en:'Envy',c:'#45c97a',sym:'eye',title:'THE GREEN EYE',adj:'VERTE',
 desc:"Le bonheur des autres, vécu comme une agression personnelle.",
 ladder:['Jaloux','Comparateur compulsif','Ombre de la réussite des autres','Voleur de destinée'],inf:'Envie infinie',shiny:'Envie Shiny',neg:'BOUDDHA',
 lines:["La réussite des autres te rend sincèrement heureux. C'est beau. C'est suspect.",
 "Tu félicites, tu souris, et tu y repenses un peu le soir. Humain.",
 "Tu ne veux pas forcément ce que les autres ont. Tu veux juste qu'ils ne l'aient pas non plus.",
 "Tu connais le salaire, la voiture et le loyer de tout ton entourage. Tu tiens la comptabilité de vies qui ne sont pas les tiennes.",
 "Tu es l'ombre portée de la réussite des autres. Quand quelqu'un gagne quelque part, tu perds une nuit de sommeil."]},
{k:'gou',n:'Gourmandise',en:'Gluttony',c:'#ef8a3a',sym:'maw',title:'THE BOTTOMLESS MAW',adj:'INSATIABLE',
 desc:"Encore une bouchée. Encore un épisode. Encore un colis.",
 ladder:['Glouton','Super Glouton','Dévoreur','Fléau des buffets','Trou noir gastronomique','Entité insatiable'],inf:'Glouton infini',shiny:'Glouton Shiny',neg:'ASCÈTE',
 lines:["Tu t'arrêtes quand tu n'as plus faim. Les nutritionnistes parlent de toi comme d'une légende.",
 "Tu reprends du dessert « par politesse ». Tout le monde sait.",
 "Ton frigo connaît ta silhouette par cœur et ton panier en ligne ne se vide jamais vraiment.",
 "Tu n'es pas simplement gourmand. Tu es une menace pour l'approvisionnement alimentaire de ton entourage.",
 "Si un buffet disparaît en quinze minutes, les autorités devraient commencer par vérifier ta présence. Et ton historique de commandes."]},
{k:'col',n:'Colère',en:'Wrath',c:'#ff4b3e',sym:'flame',title:'THE BURNING FIST',adj:'ARDENTE',
 desc:"La rancune, la vengeance, et ce petit bruit dans ta tête quand on te double.",
 ladder:['Irritable','Bombe humaine','Furie','Cataclysme','Apocalypse'],inf:'Colère infinie',shiny:'Colère Shiny',neg:'MOINE ZEN',
 lines:["Ta patience est telle qu'on pourrait te laisser une journée à la préfecture sans conséquence.",
 "Tu t'énerves, tu respires, tu oublies. Presque toujours.",
 "Tu ne cries pas. Tu notes. Et un jour, tu rends la monnaie.",
 "Tu as un calme apparent, comme une cocotte-minute a un couvercle.",
 "Tu n'as pas de colère, tu as une météo. Et elle est classée catastrophe naturelle."]},
{k:'par',n:'Paresse',en:'Sloth',c:'#5b8ff0',sym:'moon',title:'THE IDLE THRONE',adj:'ENDORMIE',
 desc:"Pourquoi faire aujourd'hui ce que personne ne t'obligera jamais à faire ?",
 ladder:['Flemmard','Expert du canapé','Maître de la procrastination','Divinité du sommeil','Objet immobile'],inf:'Paresse infinie',shiny:'Paresse Shiny',neg:'MACHINE',
 lines:["Tu fais les choses tout de suite. C'est épuisant rien qu'à regarder.",
 "Tu procrastines avec modération, comme un honnête citoyen.",
 "Ton « je le ferai demain » a déjà vu passer plusieurs demains.",
 "Ton canapé a pris ta forme et refuse de la rendre. Tes tâches en attente ont elles-mêmes des tâches en attente.",
 "Tu n'es pas paresseux, tu es en économie d'énergie permanente. Les escargots te trouvent lent."]}
];
export const SIN = Object.fromEntries(SINS.map(s => [s.k, s]));

// Seuils des niveaux classiques (bornes hautes) et noms par défaut, personnalisables
export const LEVEL_TH = [10, 25, 40, 55, 70, 85, 99, 100];
export const DEFAULT_LEVELS = ['Innocent', 'Tentation', 'Pécheur occasionnel', 'Compromis', 'Corrompu', 'Démoniaque', 'Abomination', 'Incarnation'];
export const LEVEL_DESC = ["Tu es presque suspect de normalité.", "Le péché existe, mais reste discret.", "Tu connais le chemin.", "Tu as quelques habitudes douteuses.", "Le péché commence à prendre le contrôle.", "Tu as clairement dépassé les limites.", "Même les démons prennent leurs distances.", "Tu es devenu le péché lui-même."];

// Seuils propres à chaque péché pour les rangs exceptionnels
// off : points au-delà de 100 exigés · ext : réponses extrêmes minimum
export const TH = { org:{off:0,ext:2}, ava:{off:0,ext:2}, lux:{off:5,ext:3}, env:{off:0,ext:2}, gou:{off:0,ext:2}, col:{off:5,ext:3}, par:{off:0,ext:2} };

export const COMBOS = {
'org-ava':"Orgueil et avarice : tu veux qu'on t'admire, mais sans que ça te coûte un centime. Une statue, oui. Payée par les autres.",
'org-lux':"Orgueil et luxure : tu ne cherches pas un partenaire, tu cherches un public.",
'org-env':"Orgueil et envie : tu te crois supérieur à tout le monde, et pourtant tout le monde a quelque chose que tu veux. Ça doit être épuisant.",
'org-gou':"Orgueil et gourmandise : tu manges comme un roi, et tu trouves normal que le royaume règle l'addition.",
'org-col':"Orgueil et colère : on ne te contredit pas, on te survit.",
'org-par':"Orgueil et paresse : tu te crois capable de tout, ce qui t'évite d'avoir à le prouver.",
'ava-lux':"Avarice et luxure : tu désires beaucoup, mais tu ne paies jamais le premier verre.",
'ava-env':"Avarice et envie : tu comptes ton argent, puis celui des autres. Surtout celui des autres.",
'ava-gou':"Avarice et gourmandise : tu veux tout manger, à condition que ce soit gratuit. Les buffets d'hôtel te craignent.",
'ava-col':"Avarice et colère : touche à ton argent et découvre la vraie définition du mot vengeance.",
'ava-par':"Avarice et paresse : tu veux l'argent sans le travail. Le loto est ton plan de carrière.",
'lux-env':"Luxure et envie : tu ne veux pas quelqu'un, tu veux le quelqu'un des autres.",
'lux-gou':"Luxure et gourmandise : le plaisir, tout le temps, sous toutes ses formes. Ton corps est un parc d'attractions sans heure de fermeture.",
'lux-col':"Luxure et colère : passion et dispute, dispute et passion. Tes voisins ont renoncé à dormir.",
'lux-par':"Luxure et paresse : tu as des envies, mais il faudrait que ça vienne jusqu'à toi. Au lit, de préférence.",
'env-gou':"Envie et gourmandise : tu ne veux pas ton assiette, tu veux celle du voisin. Puis la tienne.",
'env-col':"Envie et colère : la réussite des autres ne te rend pas triste, elle te rend dangereux.",
'env-par':"Envie et paresse : tu veux la vie des autres, mais tu n'iras pas la chercher. Tu préfères la regarder en story.",
'gou-col':"Gourmandise et colère : ne touche jamais à son assiette. Personne n'a survécu pour raconter.",
'gou-par':"Gourmandise et paresse : le combo canapé-livraison. Le livreur connaît ton code d'entrée et ton deuxième prénom.",
'col-par':"Colère et paresse : tu t'énerves violemment, puis tu as la flemme d'agir. Une bombe à retardement en mode veille."
};

export const PROFILE_NOUNS = ["L'ÂME SUSPECTE", 'LA TENTATION', "L'OMBRE", 'LA CHUTE', 'LA CORRUPTION', "L'ENGEANCE", "L'ABOMINATION", "L'INCARNATION"];
