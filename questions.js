// Banque de questions SEVEN SINS
// Format : { id, s (péché), t (type), f (facette), q (question), o (options [texte, niveau 0-4, drapeau]),
//            lo/hi (bornes d'échelle), rev (question inversée), w (poids), pair (question de cohérence),
//            adult (18+), trap (question piège) }
// Types : S échelle 1-10 · F fréquence · C choix multiple · D dilemme · Q quantité · X extrême · O ouverte (non notée)
// Niveaux : 0 aucun · 1 occasionnel · 2 régulier · 3 systématique · 4 extrême
// Drapeaux : 'a' réponse absurde (compte pour le Shiny) · 'lie' réponse trop sainte (baisse la fiabilité)

const o = (...arr) => arr.map(([t, l, fl]) => ({ t, l, a: fl === 'a', lie: fl === 'lie' }));

import { EXTRA } from './questions_extra.js';

const BASE = [
// ───────────── ORGUEIL ─────────────
{id:'org01',s:'org',t:'S',f:"Supériorité intellectuelle",q:"Tout le monde dans la pièce pense que tu as tort. Tu sais que tu as raison. Combien de temps tu tiens avant de leur faire un exposé ?",lo:"Je laisse couler, ils comprendront tout seuls",hi:"Sources, schéma et ton condescendant en moins de 30 secondes"},
{id:'org02',s:'org',t:'C',f:"Incapacité à s'excuser",q:"Tu as clairement merdé devant tout le monde. Ta vraie première réaction :",o:o(["Je m'excuse tout de suite, simplement",0],["Je m'excuse, avec un « si je t'ai blessé » bien placé",2],["J'explique pourquoi, techniquement, ce n'était pas vraiment ma faute",3],["Je ressors une erreur qu'ILS ont faite en 2019",4],["Je change de sujet et j'attends que ça passe",1])},
{id:'org03',s:'org',t:'D',f:"Image publique",q:"Tu dois choisir pour toujours :",o:o(["Être aimé sincèrement par cinq personnes que personne ne connaît",0],["Être admiré par des milliers d'inconnus qui ne t'aiment pas vraiment",3])},
{id:'org04',s:'org',t:'F',f:"Narcissisme",q:"Tu te regardes dans un reflet en passant devant : vitrine, écran éteint, dos de cuillère."},
{id:'org05',s:'org',t:'C',f:"Rapport aux compliments",q:"Quelqu'un te fait un compliment sincère. Ce qui se passe vraiment dans ta tête :",o:o(["« Merci, ça me touche »",0],["« Enfin quelqu'un qui remarque »",3],["« Il veut quoi en échange ? »",1],["« Il aurait pu le dire plus tôt. Et plus fort. »",4],["Je minimise, puis je le rejoue dans ma tête le soir",2])},
{id:'org06',s:'org',t:'S',f:"Mépris",q:"As-tu déjà méprisé quelqu'un simplement parce que tu le trouvais plus bête que toi ?",lo:"Jamais, je ne classe pas les gens",hi:"Mon classement est à jour et il y a des relégations",w:1.3},
{id:'org07',s:'org',t:'C',f:"Rapport à l'échec",q:"Tu perds à un jeu de société contre quelqu'un que tu juges moins malin que toi.",o:o(["Bien joué, sincèrement",0],["Revanche. Immédiatement.",2],["Le jeu est mal conçu, c'est de la pure chance",3],["Je range la boîte. On ne rejouera plus jamais à ce jeu.",4],["Je boude dix minutes, puis ça passe",1])},
{id:'org08',s:'org',t:'Q',f:"Le beau rôle",q:"Sur tes dix dernières anecdotes racontées, combien te donnaient le beau rôle ?",o:o(["0 à 2",0],["3 ou 4",1],["5 ou 6",2],["7 ou 8",3],["Toutes. Et les autres étaient des mensonges par omission.",4])},
{id:'org09',s:'org',t:'S',f:"Admettre ses limites",q:"Tu arrives à dire « je ne sais pas » devant des gens que tu veux impressionner ?",lo:"Impossible, je bluffe avec aplomb",hi:"Sans aucun problème",rev:true,pair:'org01'},
{id:'org10',s:'org',t:'X',f:"Besoin de domination",q:"Dans ton groupe d'amis, qui choisit le resto ?",o:o(["Peu importe, je suis le mouvement",0],["Je propose, on vote",1],["Je propose, et je relance jusqu'à ce qu'on prenne ma proposition",2],["J'ai réservé avant même d'en parler",3],["Moi. Et j'ai déjà commandé pour toi.",4])},
{id:'org11',s:'org',t:'C',f:"Besoin de reconnaissance",q:"Si personne ne pouvait jamais savoir ce que tu as accompli, tu continuerais ?",o:o(["Oui, c'est pour moi que je le fais",0],["Ça dépend de ce que j'ai accompli",1],["Oui, mais avec beaucoup moins d'envie",2],["Non. Une victoire sans public, c'est un brouillon.",3],["Je trouverais un moyen de le faire savoir. Toujours.",4])},
{id:'org13',s:'org',t:'F',f:"Image publique",q:"Tu supprimes une photo ou un post parce qu'il n'a pas eu assez de likes."},
{id:'org14',s:'org',t:'X',f:"Narcissisme",q:"Ta ville te propose une statue à ton effigie sur la place principale.",o:o(["Non merci, quelle horreur",0],["D'accord, si c'est pour une vraie raison",1],["Avec plaisir, c'est flatteur",2],["Je négocie la taille et l'emplacement",3],["Seulement si elle est plus grande que celle d'avant. Et en or.",4,'a'])},
{id:'org15',s:'org',t:'D',f:"Compétition",q:"Tu préfères :",o:o(["Gagner un concours dont personne ne parle",1],["Perdre en finale devant tout le monde, mais avec panache",2])},
{id:'org16',s:'org',t:'O',f:"Libre",q:"Le moment où ton ego t'a coûté le plus cher. Raconte."},

// ───────────── AVARICE ─────────────
{id:'ava01',s:'ava',t:'Q',f:"Générosité",q:"Tu gagnes 10 millions d'euros demain. Combien de tes proches pourraient réellement compter sur toi ?",o:o(["Tous ceux qui en ont besoin",0],["Ma famille proche et mes meilleurs amis",1],["Mes parents. Avec un échéancier.",2],["Un cadeau symbolique, je ne suis pas une banque",3],["Personne. Je change de numéro.",4])},
{id:'ava02',s:'ava',t:'F',f:"Dettes",q:"Tu laisses quelqu'un payer alors que tu sais très bien que tu lui dois déjà de l'argent.",w:1.3},
{id:'ava03',s:'ava',t:'D',f:"Amitié contre argent",q:"Ton meilleur ami ou 200 000 € en liquide. Tu ne gardes qu'un des deux.",o:o(["L'ami",0],["L'argent. Je lui offrirai un très bon dîner avec.",4])},
{id:'ava04',s:'ava',t:'X',f:"Cupidité",q:"Tu peux toucher 5 000 € en faisant virer un collègue que tu détestes. Personne ne le saura jamais.",o:o(["Jamais",0],["Non, mais j'y pense pendant trois jours",1],["Pour 5 000, non. Pour 50 000, on discute.",2],["Oui, et je dors très bien",3],["Oui, et je propose la même offre pour deux autres collègues",4,'a'])},
{id:'ava05',s:'ava',t:'F',f:"Mensonge sur le prix",q:"Tu laisses entendre qu'un cadeau t'a coûté plus cher qu'en vrai."},
{id:'ava06',s:'ava',t:'C',f:"Partage de l'addition",q:"Resto à huit. Tu as pris une salade et une carafe d'eau. Quelqu'un propose de diviser l'addition en parts égales.",o:o(["Ok, pas de souci",0],["Ok, mais je ne ressors plus avec eux",1],["J'ai payé ma part au comptoir en douce, au centime près",2],["Je sors la calculette du téléphone, devant tout le monde",3],["Je dis oui, puis je réclame la différence par virement le lendemain, ticket en photo",4])},
{id:'ava07',s:'ava',t:'S',f:"Douleur de dépenser",q:"Dépenser de l'argent pour les autres te fait ressentir une petite douleur physique ?",lo:"Non, j'adore offrir",hi:"Oui, comme une extraction dentaire sans anesthésie"},
{id:'ava08',s:'ava',t:'D',f:"Confort contre proches",q:"Une vie de luxe garantie pour toi, mais tes proches restent dans la galère. Tu signes ?",o:o(["Non",0],["Oui. Je leur enverrai des cartes postales des Maldives.",4])},
{id:'ava09',s:'ava',t:'Q',f:"Accumulation",q:"Combien d'objets chez toi sont gardés « au cas où » sans avoir servi depuis plus d'un an ?",o:o(["Presque rien",0],["Quelques-uns",1],["Un tiroir entier",2],["Une pièce. Ou une cave.",3],["J'ai des sacs plastiques qui contiennent des sacs plastiques",4,'a'])},
{id:'ava10',s:'ava',t:'C',f:"Objet trouvé",q:"Tu trouves un portefeuille avec 300 € et la carte d'identité du propriétaire.",o:o(["Je rends tout",0],["Je rends tout, et j'attends une récompense",1],["Je rends les papiers, je garde un « dédommagement »",3],["Je garde le liquide, je poste les papiers anonymement",3],["Je garde tout et je vérifie s'il y a une carte de fidélité avec des points",4])},
{id:'ava11',s:'ava',t:'S',f:"Plaisir d'offrir",q:"À quel point tu aimes faire des cadeaux surprises, sans aucune occasion ?",lo:"Jamais. Pourquoi faire ?",hi:"J'adore ça",rev:true,pair:'ava07'},
{id:'ava12',s:'ava',t:'F',f:"Le gratuit",q:"Tu prends beaucoup plus que nécessaire quand c'est gratuit : échantillons, sachets de sauce, petit-déj d'hôtel."},
{id:'ava14',s:'ava',t:'X',f:"Héritage",q:"Un grand-oncle très riche que tu n'as jamais vu est mourant.",o:o(["Je ne change rien",0],["Je l'appelle, puisque c'est l'occasion",1],["Je lui rends visite chaque semaine, avec des fleurs",2],["Je connais le nom du notaire avant celui de ses enfants",3],["J'apprends sa langue maternelle et je m'installe chez lui",4,'a'])},
{id:'ava15',s:'ava',t:'Q',f:"Prêter",q:"Combien tu prêtes à un ami proche, sans contrat ni date de remboursement ?",o:o(["Ce qu'il lui faut",0],["Jusqu'à 500 €",1],["Jusqu'à 50 €",2],["Rien sans un papier signé",3],["Je prête, avec intérêts calculés à la journée",4])},
{id:'ava16',s:'ava',t:'O',f:"Libre",q:"La chose la plus radine que tu aies faite, et dont tu es secrètement fier."},

// ───────────── LUXURE ─────────────
{id:'lux01',s:'lux',t:'S',f:"Fantasme interdit",adult:true,q:"As-tu déjà eu un fantasme sexuel avec quelqu'un que tu n'étais vraiment pas censé désirer ?",lo:"Jamais",hi:"J'ai une liste, classée par niveau de risque"},
{id:'lux02',s:'lux',t:'D',f:"Sexe sans sentiments",adult:true,q:"Une relation purement physique, zéro sentiment, pendant un an :",o:o(["Impossible pour moi",0],["Où est-ce que je signe ?",3])},
{id:'lux03',s:'lux',t:'C',f:"Tentation dangereuse",q:"Tu es attiré par quelqu'un, mais céder risquerait de détruire une relation importante : amitié, couple, famille.",o:o(["Je coupe court immédiatement",0],["J'évite la personne, je connais mes faiblesses",1],["Je flirte un peu, ça ne compte pas",2],["Je pèse le pour et le contre. Longtemps. En la regardant.",3],["Les relations importantes, ça se reconstruit",4])},
{id:'lux04',s:'lux',t:'Q',f:"Abstinence",adult:true,q:"Combien de temps sans aucune activité sexuelle avant que ça devienne vraiment un problème pour toi ?",o:o(["Des années, ça m'est égal",0],["Plusieurs mois",1],["Quelques semaines",2],["Quelques jours",3],["Je compte en heures",4])},
{id:'lux05',s:'lux',t:'F',f:"Mensonge pour l'intimité",adult:true,q:"Tu as menti sur tes intentions (sentiments, avenir, situation) pour obtenir de l'intimité.",w:1.3},
{id:'lux06',s:'lux',t:'X',f:"Fantasme sans conséquence",adult:true,q:"Un fantasme, zéro conséquence, personne ne saura jamais, tout le monde est consentant. Jusqu'où tu vas ?",o:o(["Je n'en ai pas vraiment",0],["Quelque chose de doux, rien de fou",1],["Assez loin pour rougir en y repensant",2],["Très loin. Il faudrait un contrat et un échauffement.",3],["Il me faudrait un week-end, trois personnes et un notaire",4,'a'])},
{id:'lux07',s:'lux',t:'C',f:"Désir contre personnalité",q:"Quelqu'un de magnifique, avec la conversation d'une huître.",o:o(["Aucun intérêt",0],["Un verre, par politesse",1],["Ça dépend de la suite de la soirée",2],["La conversation n'est pas le sujet",3],["Les huîtres sont aphrodisiaques, de toute façon",4,'a'])},
{id:'lux08',s:'lux',t:'F',f:"Le regard",q:"Tu te retournes dans la rue pour regarder quelqu'un."},
{id:'lux09',s:'lux',t:'S',f:"Séduction gratuite",q:"Tu flirtes avec des gens qui ne t'intéressent même pas, juste pour vérifier que ça marche encore ?",lo:"Jamais",hi:"C'est mon cardio"},
{id:'lux10',s:'lux',t:'Q',f:"Historique privé",adult:true,q:"Ton historique de navigation privée des 30 derniers jours est projeté en public. Ta réaction :",o:o(["Rien à cacher",0],["Un peu gênant",1],["Je quitte la pièce",2],["Je quitte le pays",3],["Il faudrait prévoir plusieurs séances de projection",4])},
{id:'lux11',s:'lux',t:'S',f:"Retenue",q:"Tu arrives à passer une soirée entière avec quelqu'un d'attirant sans jamais penser à « la suite » ?",lo:"Impossible",hi:"Facilement",rev:true,pair:'lux09'},
{id:'lux13',s:'lux',t:'C',f:"L'ex",q:"Ton ex t'envoie « tu dors ? » à 2h du matin.",o:o(["Bloqué",0],["Je lis et je laisse en vu",1],["J'hésite vingt minutes avant de répondre",2],["« Non, et toi ? »",3],["Je suis déjà en bas de chez lui ou elle",4])},
{id:'lux14',s:'lux',t:'F',f:"Pensées déplacées",adult:true,q:"En réunion, en cours ou au repas de famille, ton esprit part dans une direction franchement pas professionnelle."},
{id:'lux15',s:'lux',t:'D',f:"Passion",q:"Tu préfères :",o:o(["Une relation stable, rassurante et un peu prévisible",0],["Une passion explosive qui te détruit en six mois",3])},
{id:'lux16',s:'lux',t:'O',f:"Libre",q:"Ta pire tentative de séduction. Ou la plus réussie."},

// ───────────── ENVIE ─────────────
{id:'env01',s:'env',t:'C',f:"Possession",q:"Un ami s'achète la voiture dont tu rêves.",o:o(["Je suis content pour lui, point",0],["Content, avec un petit pincement",1],["Je lui demande combien il a payé, pour vérifier",2],["Je cherche tous les défauts du modèle sur internet",3],["Je prie pour une rayure. Petite. Profonde.",4])},
{id:'env02',s:'env',t:'F',f:"Joie maligne",q:"Tu espères secrètement que quelqu'un échoue, juste pour te sentir mieux.",w:1.3},
{id:'env03',s:'env',t:'F',f:"Comparaison sur les réseaux",q:"Tu regardes le profil de quelqu'un que tu détestes, juste pour comparer vos vies."},
{id:'env04',s:'env',t:'D',f:"Voler une vie",q:"Tu peux échanger ta vie contre celle de quelqu'un que tu connais, sans retour possible.",o:o(["Non, je garde la mienne",0],["Oui. Et j'ai choisi qui depuis longtemps.",4])},
{id:'env05',s:'env',t:'S',f:"Minimiser",q:"Quand quelqu'un t'annonce une réussite, à quel point tu cherches le « oui mais » ?",lo:"Jamais, je félicite",hi:"« Oui mais c'est grâce à son père »"},
{id:'env06',s:'env',t:'S',f:"Réussite sans effort",q:"Quelqu'un réussit sans effort apparent. À quel point ça te rend amer ?",lo:"Pas du tout, tant mieux pour lui",hi:"Ça me gâche la semaine"},
{id:'env07',s:'env',t:'S',f:"Joie pour un ami",q:"Ton meilleur ami réussit beaucoup mieux que toi. À quel point tu es sincèrement heureux pour lui ?",lo:"Pas du tout, ça me ronge",hi:"Totalement, sans arrière-pensée",rev:true,pair:'env05'},
{id:'env08',s:'env',t:'Q',f:"Salaire",q:"Tu apprends qu'un collègue moins compétent gagne 400 € de plus que toi. Combien de temps tu y penses ?",o:o(["Zéro, ça ne me regarde pas",0],["Une journée",1],["Une semaine",2],["Un mois, et je le regarde différemment",3],["J'y pense encore. C'était il y a deux ans.",4])},
{id:'env09',s:'env',t:'C',f:"Le couple des autres",q:"Le couple parfait de ta bande annonce ses fiançailles.",o:o(["Trop bien pour eux",0],["Super, mais je trouve ça rapide",1],["Je like, puis je fouille les photos pour trouver le défaut",2],["Je leur donne deux ans",3],["J'ai déjà parié sur la date du divorce",4])},
{id:'env10',s:'env',t:'X',f:"Sabotage",q:"Tu pourrais faire rater discrètement le projet d'un rival, sans aucun risque.",o:o(["Jamais",0],["Non, mais je ne l'aiderais pas non plus",1],["Je ne sabote rien, mais je ne signale pas l'erreur que je vois",2],["Un petit coup de pouce vers le bas, oui",3],["J'ai déjà le plan, les complices et le gâteau pour fêter ça",4,'a'])},
{id:'env11',s:'env',t:'F',f:"Comparaison",q:"Tu compares ton physique, ton salaire ou ta vie à ceux des gens autour de toi."},
{id:'env12',s:'env',t:'C',f:"Rivalité familiale",q:"À Noël, ton frère ou ta sœur reçoit un plus beau cadeau que toi.",o:o(["Je m'en fiche",0],["Je le remarque, c'est tout",1],["Je fais une remarque « pour rire »",2],["Je calcule la différence de prix",3],["Trente ans plus tard, j'en parle encore",4])},
{id:'env14',s:'env',t:'D',f:"Richesse relative",q:"Tu préfères :",o:o(["Gagner 3 000 € par mois quand tout le monde autour gagne 4 000 €",0],["Gagner 2 000 € par mois quand tout le monde autour gagne 1 500 €",3])},
{id:'env15',s:'env',t:'S',f:"Bonheur des autres",q:"Les stories de vacances des autres en plein mois d'août te font quel effet ?",lo:"Je like et je souris",hi:"Je masque les comptes un par un"},
{id:'env16',s:'env',t:'O',f:"Libre",q:"La personne dont tu as été le plus jaloux, et pourquoi. Pas besoin de nom."},

// ───────────── GOURMANDISE ─────────────
{id:'gou01',s:'gou',t:'F',f:"Excès",q:"Tu manges jusqu'à avoir mal au ventre. Et tu recommences la fois suivante."},
{id:'gou02',s:'gou',t:'C',f:"Opportunisme",q:"Quelqu'un laisse sa dernière frite sans surveillance.",o:o(["Elle est à lui, point",0],["Je demande",1],["Je demande en la mangeant déjà",3],["Je la prends quand il regarde ailleurs",3],["Je prends la frite. Puis l'assiette.",4,'a'])},
{id:'gou03',s:'gou',t:'F',f:"Surcommande",q:"Tu commandes beaucoup trop en sachant pertinemment que tu ne finiras pas."},
{id:'gou04',s:'gou',t:'Q',f:"Sans conséquence",q:"Manger tout ce que tu veux, zéro conséquence physique. Combien de temps par jour tu passes à manger ?",o:o(["Pareil qu'aujourd'hui",0],["Un peu plus, pour le plaisir",1],["Trois ou quatre heures",2],["Le travail, c'est entre deux repas",3],["Je mange en dormant, si c'est techniquement possible",4])},
{id:'gou05',s:'gou',t:'F',f:"Nourriture des autres",q:"Tu manges un truc dans le frigo qui appartient clairement à quelqu'un d'autre."},
{id:'gou06',s:'gou',t:'S',f:"Résistance",q:"Ta nourriture préférée est devant toi et tu n'as pas faim. Tu résistes facilement ?",lo:"Impossible",hi:"Sans le moindre effort",rev:true,pair:'gou07'},
{id:'gou07',s:'gou',t:'F',f:"Faim absente",q:"Tu continues à manger juste parce que c'est bon, alors que tu n'as plus faim du tout."},
{id:'gou08',s:'gou',t:'C',f:"Achats compulsifs",q:"Il est 1h du matin, tu es sur un site de vente en ligne.",o:o(["Je ferme et je dors",0],["Je remplis le panier, sans valider",1],["Je valide un petit truc",2],["Je valide plusieurs trucs dont je ne me souviendrai pas",3],["Je reçois des colis dont j'ignore le contenu. C'est Noël tous les jours.",4,'a'])},
{id:'gou09',s:'gou',t:'Q',f:"Séries",q:"Combien d'épisodes d'affilée avant ton « allez, le dernier » qui est vraiment le dernier ?",o:o(["1 ou 2",0],["3 ou 4",1],["Une saison",2],["La série entière",3],["La plateforme m'a demandé si j'étais encore en vie",4])},
{id:'gou10',s:'gou',t:'X',f:"Buffet",q:"Buffet à volonté, 25 €.",o:o(["Une assiette raisonnable",0],["Deux assiettes, je rentabilise",1],["Je saute le repas de midi pour me préparer",2],["Stratégie : pas de pain, pas de féculents, que le plus cher",3],["Le restaurant a ma photo affichée à l'entrée",4,'a'])},
{id:'gou11',s:'gou',t:'D',f:"Plaisir immédiat",q:"Tu préfères :",o:o(["Un repas exceptionnel dans un mois",0],["Un repas moyen, là, tout de suite",2])},
{id:'gou13',s:'gou',t:'S',f:"Luxe et gratification",q:"À quel point tu dépenses pour te faire plaisir tout de suite, même en sachant que tu vas le regretter ?",lo:"Jamais, je réfléchis toujours",hi:"Le regret, c'est le problème du moi de demain"},
{id:'gou14',s:'gou',t:'C',f:"Partage",q:"Pizza à quatre. Il reste une part.",o:o(["Je la laisse aux autres",0],["Je propose de la couper en quatre",1],["Je demande qui la veut en la fixant",2],["Je l'ai déjà dans la main",3],["Il n'en reste pas : j'en ai mangé deux pendant que vous parliez",4])},
{id:'gou15',s:'gou',t:'F',f:"Dopamine",q:"Dès que tu t'ennuies, tu cherches un plaisir immédiat : sucre, achat, vidéo, notification."},
{id:'gou16',s:'gou',t:'O',f:"Libre",q:"Le plus gros excès de ta vie : nourriture, achats, autre."},

// ───────────── COLÈRE ─────────────
{id:'col01',s:'col',t:'Q',f:"Humiliation",q:"Quelqu'un t'humilie en public. Combien de temps avant de vouloir lui faire payer ?",o:o(["Je ne veux pas lui faire payer",0],["Quelques jours, puis ça passe",1],["Je m'en souviens, sans agir",2],["Tout de suite, sur place",3],["Dans dix ans, quand il s'y attendra le moins",4])},
{id:'col02',s:'col',t:'F',f:"Mots qui blessent",q:"Tu blesses volontairement quelqu'un avec des mots, parce que tu sais exactement où frapper.",w:1.3},
{id:'col03',s:'col',t:'Q',f:"Rancune",q:"Ta plus vieille rancune encore active date de :",o:o(["Je n'en ai pas",0],["Quelques semaines",1],["Quelques années",2],["L'école primaire",3],["Avant ma naissance. J'ai hérité de celle de mon père.",4,'a'])},
{id:'col04',s:'col',t:'S',f:"Vengeance",q:"As-tu déjà imaginé des scénarios de vengeance complètement disproportionnés ?",lo:"Jamais",hi:"Avec storyboard, casting et bande originale"},
{id:'col05',s:'col',t:'C',f:"File d'attente",q:"Quelqu'un te double dans la file après 30 minutes d'attente.",o:o(["Je laisse tomber",0],["Je lui fais remarquer, calmement",1],["Je soupire bruyamment en fixant sa nuque",2],["Je lui dis, devant tout le monde, pas calmement du tout",3],["Je reprends ma place. Physiquement.",4])},
{id:'col06',s:'col',t:'F',f:"Objets",q:"Tu casses, frappes ou jettes un objet sous le coup de la colère."},
{id:'col07',s:'col',t:'S',f:"Lucidité",q:"Une fois énervé, tu arrives à reconnaître sur le moment que tu exagères ?",lo:"Jamais",hi:"Oui, immédiatement",rev:true,pair:'col09'},
{id:'col08',s:'col',t:'C',f:"Au volant",q:"Au volant, quelqu'un te fait une queue de poisson.",o:o(["Rien, ça arrive",0],["Un petit coup de klaxon",1],["Insultes dans l'habitacle, vitres fermées",2],["Insultes vitre ouverte, gestes inclus",3],["Je le suis jusqu'à chez lui",4])},
{id:'col09',s:'col',t:'F',f:"Impulsivité",q:"Tu dis des choses que tu regrettes dans les cinq minutes qui suivent."},
{id:'col10',s:'col',t:'C',f:"Disputes en ligne",q:"Quelqu'un a tort sur internet.",o:o(["Je scrolle",0],["Je like le commentaire qui le contredit",1],["Je réponds une fois",2],["Je réponds jusqu'à 3h du matin",3],["Je crée un deuxième compte pour l'humilier en stéréo",4,'a'])},
{id:'col11',s:'col',t:'D',f:"Pardon",q:"Un ami t'a gravement trahi, mais s'excuse sincèrement.",o:o(["Je pardonne, avec le temps",0],["Je pardonne en façade et je garde le dossier",3])},
{id:'col12',s:'col',t:'X',f:"Pire version",q:"Ta pire crise de colère, c'était quoi ?",o:o(["Rien de spécial, je me calme seul",0],["J'ai crié",1],["J'ai claqué une porte assez fort pour la décrocher",2],["J'ai dit des choses impardonnables",3],["On en parle encore à chaque repas de famille",4])},
{id:'col14',s:'col',t:'S',f:"Rumination",q:"Quand quelqu'un te fait une remarque, à quel point tu la rumines ?",lo:"Je l'oublie aussitôt",hi:"Je prépare ma réplique pendant trois jours sous la douche"},
{id:'col15',s:'col',t:'F',f:"Bouc émissaire",q:"Tu passes tes nerfs sur quelqu'un qui n'y est pour rien : serveur, livreur, proche.",w:1.3},
{id:'col16',s:'col',t:'O',f:"Libre",q:"Ta colère la plus disproportionnée, en détail."},

// ───────────── PARESSE ─────────────
{id:'par01',s:'par',t:'F',f:"Procrastination",q:"Tu repousses une tâche tellement longtemps qu'elle devient un vrai problème."},
{id:'par02',s:'par',t:'D',f:"Abandon des responsabilités",q:"Quelqu'un propose de tout faire à ta place, pour toujours : papiers, courses, décisions.",o:o(["Non, je veux garder le contrôle",0],["Oui. Je ne me lèverai plus que pour les repas.",4])},
{id:'par03',s:'par',t:'Q',f:"Le lit",q:"Aucune obligation. Combien de temps tu restes au lit ?",o:o(["Je me lève à l'heure habituelle",0],["Une heure de plus",1],["Jusqu'à midi",2],["Toute la journée",3],["Jusqu'à ce que quelqu'un vérifie que je respire encore",4,'a'])},
{id:'par04',s:'par',t:'F',f:"Excuses",q:"Tu inventes une excuse pour éviter une activité qui demandait juste un peu d'effort."},
{id:'par05',s:'par',t:'C',f:"Salaire sans travail",q:"Salaire garanti à vie, à condition de ne plus jamais rien accomplir.",o:o(["Non, j'ai besoin de faire des choses",0],["Oui, mais je ferais des projets perso",1],["Oui, et je me mettrai au sport. Un jour.",2],["Oui, sans la moindre hésitation",3],["Accomplir quoi ? Je n'ai jamais commencé.",4])},
{id:'par06',s:'par',t:'F',f:"Déléguer",q:"Tu refiles une tâche importante à quelqu'un d'autre parce que tu n'as pas envie de la faire."},
{id:'par07',s:'par',t:'Q',f:"« Demain »",q:"Combien de « je le ferai demain » non tenus cette semaine ?",o:o(["Zéro",0],["Un ou deux",1],["Trois à cinq",2],["Plus que de jours dans la semaine",3],["J'ai reporté le fait de les compter",4])},
{id:'par08',s:'par',t:'C',f:"Ménage",q:"La vaisselle est dans l'évier depuis :",o:o(["Elle est faite tout de suite",0],["Ce matin",1],["Hier",2],["Elle a développé un écosystème",3],["J'ai déménagé, elle est restée",4,'a'])},
{id:'par09',s:'par',t:'S',f:"Discipline",q:"Face à une tâche pénible, tu la fais tout de suite pour être débarrassé ?",lo:"Jamais",hi:"Toujours",rev:true,pair:'par01'},
{id:'par10',s:'par',t:'C',f:"Messages",q:"Tu as 47 messages non lus.",o:o(["Impossible, je réponds au fur et à mesure",0],["Je les lirai ce soir",1],["Je les lis, je ne réponds pas",2],["Mode avion, et j'attends que ça disparaisse",3],["47 ? C'est un bon jour.",4])},
{id:'par11',s:'par',t:'X',f:"Moindre effort",q:"La télécommande est à deux mètres.",o:o(["Je me lève",0],["Je demande à quelqu'un",1],["Je regarde ce qui passe, tant pis",2],["Je tente de l'attraper avec le pied pendant dix minutes",3],["J'ai appris à changer de chaîne par la pensée",4,'a'])},
{id:'par12',s:'par',t:'F',f:"Annulations",q:"Tu annules un sport, un rendez-vous ou un engagement au dernier moment, par pure flemme."},
{id:'par14',s:'par',t:'D',f:"Rapport à l'effort",q:"Tu préfères :",o:o(["Un travail passionnant mais épuisant",0],["Un travail ennuyeux où tu ne fais rien",3])},
{id:'par15',s:'par',t:'S',f:"Énergie",q:"Après le travail ou les cours, quelle part de ta soirée est réellement productive ?",lo:"Toute, j'ai mille projets",hi:"Zéro. Je deviens un meuble."},
{id:'par16',s:'par',t:'O',f:"Libre",q:"La tâche que tu repousses depuis le plus longtemps."}
];

export const QUESTIONS = [...BASE, ...EXTRA];

export const FREQ = ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Presque toujours'];
