const indice = (nature, cible, picto, libelle, explication) => ({
  nature,
  cible,
  picto,
  libelle,
  explication,
})

// `titres` et `phrases` vont du niveau 1 au 5 (une phrase peut dépendre du fait inventé).
// `verifie` : [niveaux 1 à 3, niveaux 4 et 5]. `niveaux` limite un procédé subtil aux niveaux avancés.
// `ancienne` : le post porte une date vieille de deux ans.
export const CATEGORIES = [
  {
    biais: 'Urgence artificielle',
    titres: [
      (t) => `Urgent, partagez avant suppression : ${t}`,
      (t) => `À partager vite : ${t}`,
      (t) => `Avant que ça disparaisse : ${t}`,
      (t) => `${t}, à lire tant que c'est en ligne`,
      (t) => t,
    ],
    phrases: [
      'Cette information va être retirée dans les prochaines heures. PARTAGEZ MAINTENANT 🔴🔴',
      'Faites tourner avant que ce soit supprimé.',
      "L'article risque d'être retiré, on vous le met ici.",
      "Lisez-le tant qu'il est disponible.",
      'Article susceptible d’être dépublié prochainement.',
    ],
    explication: "L'urgence (« avant suppression ») sert à faire partager avant de vérifier.",
    analyseFaux: "Personne ne retire cette information : l'urgence sert à faire partager sans vérifier.",
    ajout: 'une menace de suppression',
    pression: 'Ils disent que ça va être supprimé !',
    indice: indice('ALERTE', 'TEXTE', 'Clock', 'Une suppression annoncée',
      'Rien n’indique que quoi que ce soit sera retiré. La menace sert seulement à faire partager vite.'),
    croit: ['Partagé direct avant que ça disparaisse 😱', 'Vite, j’enregistre avant que ça saute'],
    doute: ['Pourquoi ce serait supprimé ?', 'Supprimé par qui, et pourquoi ?'],
    suites: [
      'Ils vont tout effacer, alors enregistrez-le et envoyez-le à vos contacts !',
      'Une fois supprimé, ce sera trop tard pour en parler.',
      'Mieux vaut l’avoir lu avant qu’il ne soit plus en ligne.',
    ],
    verifie: [
      'Supprimé par qui ? J’ai cherché, aucun média n’en parle.',
      'Je ne trouve cette info nulle part ailleurs…',
    ],
  },
  {
    biais: 'Autorité inventée',
    titres: [
      (t) => `Un haut responsable brise le silence : ${t}`,
      (t) => `Révélations d'un haut responsable : ${t}`,
      (t) => `${t} : un responsable se confie`,
      (t) => `${t}, selon un responsable`,
      (t) => t,
    ],
    phrases: [
      "Un haut responsable, qui veut rester anonyme, nous l'a confirmé : le dossier complet est bien plus lourd !",
      "Un responsable anonyme affirme que tout n'a pas été dit.",
      "Un responsable, qui a souhaité garder l'anonymat, évoque d'autres éléments.",
      "Selon un responsable proche du dossier, d'autres annonces sont attendues.",
      "D'après une source proche du dossier, la décision était connue depuis plusieurs semaines.",
    ],
    explication: 'La source est anonyme : elle a le ton de l’autorité sans rien offrir à vérifier.',
    analyseFaux: 'La source anonyme n’existe que dans ce post : aucun nom, aucun document.',
    ajout: 'une source anonyme',
    pression: 'C’est un responsable qui le dit, c’est du sérieux.',
    indice: indice('ALERTE', 'TEXTE', 'UserRound', 'Une source sans nom',
      'Un « responsable » anonyme : rien qui puisse être vérifié.'),
    croit: ['Évidemment qu’on nous cache des choses 👏', 'Si un responsable le dit, c’est que c’est vrai.'],
    doute: ['C’est qui ce responsable ? Il a un nom ?', 'Un anonyme, ça peut être n’importe qui…'],
    suites: [
      'Il risque gros en parlant, alors respectez son anonymat !',
      'Il n’a pas voulu donner son nom, mais il sait de quoi il parle.',
      'Le responsable n’a pas souhaité en dire plus pour le moment.',
    ],
    verifie: [
      'Un responsable de quoi ? Aucun média ne rapporte ça.',
      'Une « source proche du dossier », mais quel dossier ? Je ne trouve rien ailleurs.',
    ],
  },
  {
    biais: 'Appel à la peur',
    titres: [
      (t) => `Danger pour vos enfants : ${t}`,
      (t) => `Ce que ça va changer pour votre famille : ${t}`,
      (t) => `${t} : faut-il s'inquiéter ?`,
      (t) => `${t} : des inquiétudes`,
      (t) => t,
    ],
    phrases: [
      'Protégez vos proches, les conséquences pourraient être dramatiques !!',
      'Personne ne vous dit ce qui va suivre. Préparez-vous.',
      'Les conséquences pour les familles pourraient être lourdes.',
      'Certains habitants disent déjà leur inquiétude.',
      'Reste à savoir ce que cela changera pour les familles.',
    ],
    explication: 'Une menace vague est brandie, sans jamais dire laquelle : la peur circule plus vite que la curiosité.',
    analyseFaux: 'Aucune conséquence n’est décrite : l’inquiétude remplace l’information.',
    ajout: 'une inquiétude pour les familles, jamais expliquée',
    pression: 'Ça fait peur quand même, faut prévenir tout le monde non ?',
    indice: indice('ALERTE', 'TEXTE', 'Flame', 'Une menace sans contenu',
      'Aucune conséquence précise n’est décrite : l’inquiétude remplace l’information.'),
    croit: ['J’ai peur pour mes enfants… je préviens la famille.', 'Je préfère prévenir mes parents, on ne sait jamais.'],
    doute: ['Inquiétant comment ? Ils ne disent rien de précis.', 'Ça fait peur, mais peur de quoi exactement ?'],
    suites: [
      'Gardez vos enfants près de vous et ne prenez aucun risque.',
      'Personne ne sait encore jusqu’où ça ira.',
      'Beaucoup de parents se posent des questions.',
    ],
    verifie: [
      'Quel danger ? Aucun média sérieux n’en parle.',
      'Inquiétude de qui ? Je ne trouve cette info nulle part ailleurs.',
    ],
  },
  {
    biais: 'Manipulation statistique',
    titres: [
      (t) => `+312 % !!! ${t}`,
      (t) => `+312 % : ${t}`,
      (t) => `${t} : un chiffre qui interroge`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      "+312 % en un an, un RECORD que personne n'ose publier !",
      "Les chiffres parlent d'eux-mêmes : +312 % sur la période.",
      'Selon les chiffres disponibles, la hausse atteindrait 312 %.',
      'Une évolution de près de 300 % sur la période, selon les données.',
      'Un phénomène qui a presque triplé en quelques années.',
    ],
    explication: 'Le chiffre ne dit ni de quoi, ni par rapport à quand : c’est un argument déguisé en donnée.',
    analyseFaux: 'Ce chiffre n’a ni source ni point de comparaison.',
    ajout: 'un chiffre sans source',
    pression: 'Regarde les chiffres, c’est énorme !',
    indice: indice('ALERTE', 'TEXTE', 'ChartColumn', 'Un chiffre sans base',
      'De quoi, par rapport à quand, mesuré par qui ? Le chiffre n’a aucune source.'),
    croit: ['C’est énorme, faut que ça se sache', 'Les chiffres ne mentent pas.'],
    doute: ['Ce chiffre sort d’où ? 🤔', '+312 % de quoi, depuis quand ?'],
    suites: [
      'Et ce n’est que le chiffre officiel, imaginez le vrai !',
      'Un chiffre pareil, ça ne s’invente pas.',
      'Un chiffre qui mérite qu’on s’y arrête.',
    ],
    verifie: [
      'Aucune source pour ce chiffre, et aucun média n’en parle.',
      'Il sort d’où ce chiffre ? Je ne le trouve nulle part.',
    ],
  },
  {
    biais: 'Faux expert',
    titres: [
      (t) => `Un expert prévient : ${t}, et ce n'est que le début`,
      (t) => `${t} : « ce n'est qu'un début », selon un expert`,
      (t) => `${t} : l'analyse d'un expert`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      'Gérald Mourin, expert reconnu sur les réseaux, est formel : « tout va s’aggraver ».',
      'Pour Gérald Mourin, expert indépendant, « tout cela était prévisible et va s’aggraver ».',
      'Gérald Mourin, consultant, estime que « la situation devrait s’aggraver ».',
      '« La tendance devrait se poursuivre », analyse Gérald Mourin, consultant indépendant.',
      '« Il faut s’attendre à d’autres annonces », estime Gérald Mourin, analyste.',
    ],
    explication: 'L’« expert » n’a ni institution ni spécialité : son titre sert à donner du poids à un avis.',
    analyseFaux: 'Rien ne dit que cet « expert » connaisse le sujet, ni même qu’il existe.',
    ajout: 'l’avis d’un « expert » introuvable',
    pression: 'Même un expert le dit.',
    indice: indice('VERIFICATION', 'TEXTE', 'UserRound', 'Un « expert » de quoi ?',
      'Ni institution, ni spécialité, ni publication : rien ne dit qu’il connaît le sujet.'),
    croit: ['Enfin un expert qui dit les choses 👍', 'S’il le dit, il doit savoir.'],
    doute: ['Il est expert en quoi exactement ?', 'Expert, ça veut dire quoi ici ? Il a étudié le sujet ?'],
    suites: [
      'Lui, au moins, il ose dire les choses.',
      'Il suit le sujet depuis des années.',
      'Son analyse circule beaucoup en ce moment.',
    ],
    verifie: [
      'J’ai cherché Gérald Mourin : aucune publication, aucune institution.',
      'C’est qui, Gérald Mourin ? Je ne trouve rien sur lui.',
    ],
  },
  {
    biais: 'Biais de confirmation',
    titres: [
      (t) => `On vous l'avait dit : ${t}`,
      (t) => `${t} : la preuve de ce que beaucoup pensaient`,
      (t) => `${t}, comme on pouvait s'y attendre`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      'Ceux qui nous traitaient de complotistes peuvent s’excuser !',
      'Ceux qui alertaient depuis des mois avaient raison.',
      'Un fait qui confirme ce que beaucoup pressentaient.',
      'Un signe de plus d’une tendance de fond.',
      'Une évolution qui s’inscrit dans une tendance déjà observée.',
    ],
    explication: 'Une conclusion générale est tirée d’un seul fait : elle flatte ce que le lecteur croit déjà.',
    analyseFaux: 'Un seul fait, même vrai, ne prouve pas une « tendance ».',
    ajout: 'une conclusion tirée d’un seul fait',
    pression: 'Je le disais depuis le début, tu vois !',
    indice: indice('ALERTE', 'TEXTE', 'Filter', 'Une conclusion plaquée',
      'Un fait isolé ne prouve pas une tendance. La conclusion flatte ce qu’on pense déjà.'),
    croit: ['Je le disais depuis le début ! 🙏', 'Ça confirme tout ce que je pensais.'],
    doute: ['Un seul cas, ça fait une tendance ?', 'Un exemple, ce n’est pas une preuve.'],
    suites: [
      'On ne pourra plus dire qu’on ne savait pas.',
      'Les faits finissent toujours par parler.',
      'Un exemple de plus, pour ceux qui doutaient encore.',
    ],
    verifie: [
      'Quelle tendance ? Aucun média ne parle même de ce fait.',
      'Un seul cas, et introuvable ailleurs. Ça ne prouve rien.',
    ],
  },
  {
    biais: 'Fausse corrélation',
    titres: [
      (t) => `Comme par hasard : ${t}`,
      (t) => `${t} : pas un hasard`,
      (t) => `${t} : un lien troublant`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      'Comme par hasard, juste après les décisions du mois dernier… Ouvrez les yeux !',
      'Ce n’est pas un hasard si ça arrive juste après les décisions du mois dernier.',
      'Difficile de ne pas faire le lien avec les décisions du mois dernier.',
      'Ce n’est sans doute pas un hasard si cela arrive après les décisions du mois dernier.',
      'Une annonce qui intervient quelques semaines après les décisions du mois dernier.',
    ],
    explication: 'Un lien de cause est insinué sans être démontré : deux faits proches dans le temps ne sont pas liés pour autant.',
    analyseFaux: 'Aucun lien avec des « décisions du mois dernier » n’est établi, ni même expliqué.',
    ajout: 'un lien avec « les décisions du mois dernier »',
    pression: 'C’est pas un hasard tout ça.',
    indice: indice('ALERTE', 'TEXTE', 'Brain', 'Un lien insinué',
      'La phrase suggère une cause sans la démontrer, ni dire de quelles décisions il s’agit.'),
    croit: ['Exactement, tout est lié 😤', 'Comme par hasard, oui…'],
    doute: ['Quelles décisions ?', 'Arriver après, ça ne veut pas dire arriver à cause de.'],
    suites: [
      'Faites le lien vous-mêmes.',
      'Chacun en tirera ses conclusions.',
      'Le calendrier interroge, forcément.',
    ],
    verifie: [
      'Quelles décisions ? Aucun média ne fait ce lien, ni ne parle de ce fait.',
      'Quel rapport avec le mois dernier ? Je ne trouve rien ailleurs.',
    ],
  },
  {
    biais: 'Certitude ajoutée',
    titres: [
      (t) => `C'est confirmé !!! ${t}`,
      (t) => `C'est confirmé : ${t}`,
      (t) => `${t} : c'est officiel`,
      (t) => `${t}, confirme-t-on`,
      (t) => t,
    ],
    phrases: [
      '100 % CONFIRMÉ par toutes les sources !',
      "L'information est confirmée par plusieurs sources.",
      'Plusieurs sources concordantes le confirment.',
      'Une information confirmée par plusieurs sources.',
      'Information recoupée auprès de plusieurs sources.',
    ],
    explication: 'Une certitude est affichée sans source : « confirmé » rassure, mais personne n’est nommé.',
    analyseFaux: 'La « confirmation » n’a pas de source : aucune n’est nommée.',
    ajout: 'un « c’est confirmé » sans source',
    pression: 'C’est confirmé en plus !',
    indice: indice('VERIFICATION', 'TEXTE', 'Scale', 'Confirmé par qui ?',
      'Aucune source n’est nommée. « Plusieurs sources », ce n’est personne.'),
    croit: ['Ah ben si c’est confirmé 👍', 'Confirmé, donc je partage.'],
    doute: ['Confirmé par qui ?', 'Plusieurs sources, mais lesquelles ?'],
    suites: [
      'Plus de doute possible, c’est vérifié !',
      'Ce n’est plus une rumeur.',
      'Le doute n’est plus permis.',
    ],
    verifie: [
      'Confirmé par qui ? Aucun média ne donne cette info.',
      'Ces « plusieurs sources », elles ont un nom ? Je ne trouve rien.',
    ],
  },
]

const meme = (t) => t
const ecart = (base) => base.ecart

CATEGORIES.push(
  {
    biais: 'Information recyclée',
    niveaux: [3, 4, 5],
    ancienne: true,
    titres: [meme, meme, meme, meme, meme],
    phrases: [
      'Ça se passe en ce moment, faites passer !',
      'Ça vient de tomber.',
      'À voir cette semaine.',
      'Une info qui circule beaucoup en ce moment.',
      'Une nouvelle qui refait parler d’elle.',
    ],
    explication: 'Une vieille histoire est partagée comme si elle venait d’arriver : seule la date la trahit.',
    analyseFaux: 'La date du post a plus de deux ans : ce n’est pas une nouvelle du jour.',
    ajout: 'une vieille histoire présentée comme neuve',
    pression: 'C’est tout récent en plus !',
    indice: indice('ALERTE', 'DATE', 'Clock', 'Une date qui ne colle pas',
      'Le post date de plus de deux ans, mais il est partagé comme une nouvelle du jour.'),
    croit: ['Incroyable, je ne savais pas que c’était cette semaine 😮', 'Je fais suivre, c’est tout frais.'],
    doute: ['Ça ne date pas un peu, ça ?', 'J’ai l’impression d’avoir déjà vu passer ça…'],
    suites: [
      'Je viens de le voir passer, faites tourner.',
      'Tout le monde en parle aujourd’hui.',
      'Ça circule beaucoup depuis ce matin.',
    ],
    verifie: [
      'Regardez la date : ça a plus de deux ans.',
      'La date du post est ancienne, ce n’est pas d’actualité.',
    ],
  },
  {
    biais: 'Détail modifié',
    niveaux: [3, 4, 5],
    besoin: 'ecart',
    titres: [meme, meme, meme, meme, meme],
    phrases: [ecart, ecart, ecart, ecart, ecart],
    explication: 'Le titre et le texte se contredisent : un chiffre, un lieu ou un jour a changé en route.',
    analyseFaux: 'Le texte ne dit pas la même chose que le titre : au moins l’un des deux est faux.',
    ajout: 'un détail qui change entre le titre et le texte',
    pression: 'Lis jusqu’au bout, c’est fou !',
    indice: indice('ALERTE', 'TEXTE', 'Search', 'Un détail qui change',
      'Relisez le titre puis le texte : un chiffre, un lieu ou un jour ne correspond pas.'),
    croit: ['Trop bien, je partage 👍', 'Génial, merci pour l’info.'],
    doute: ['Attends, le titre et le texte ne disent pas pareil…', 'Le titre et l’article ne racontent pas la même chose, non ?'],
    verifie: [
      'Le titre et le texte ne racontent pas la même chose.',
      'Relisez : le chiffre du titre n’est pas celui du texte.',
    ],
  }
)

const introuvable = 'Aucune source sérieuse ne dit ça : cherchez avant de le croire.'

// Comment chaque profil écrit. Les vrais et les faux utilisent les mêmes voix.
// `relais` : comment le profil a eu l'info (`fait` : un fait connu, `actu` : un événement).
// `source(ou)` : la source dite dans une phrase ; `ou` vaut par exemple « sur Wikipédia ».
export const VOIX = {
  ado: {
    casse: 'min',
    ouvertures: ['frr', 'attendez', 'genre', 'wsh', 'jsp si vous saviez mais', ''],
    relais: {
      fait: ['on a vu ça en cours aujourd’hui', 'ma sœur me l’a dit et j’y croyais pas', 'je l’ai appris en faisant mon exposé', 'personne m’avait jamais dit ça'],
      actu: ['on me l’a envoyé sur le groupe de la classe', 'tout le monde en parle au lycée', 'mon cousin m’a envoyé ça ce matin'],
    },
    appels: ['vous saviez ?', 'qui savait ??', 'dites moi que jsuis pas le seul'],
    fins: ['😭', '💀', 'ptdr', '🤯', 'c fou', 'jsuis choqué 😭'],
    source: (ou) => `c’est ${ou} jsuis pas fou`,
  },
  parent: {
    ouvertures: ['Coucou tout le monde 🌺', 'Bonjour à tous !', 'Petite info du jour :', 'Les amis,'],
    relais: {
      fait: ['Ma fille me l’a appris en rentrant de l’école, je ne le savais pas du tout !', 'On en parlait hier soir à table avec les enfants.', 'Je l’ai découvert en aidant mon fils pour ses devoirs.'],
      actu: ['Une maman de l’école me l’a envoyé ce matin.', 'On en parlait tout à l’heure à la sortie de l’école.', 'Ma voisine m’en a parlé ce matin.'],
    },
    appels: ['Vous le saviez, vous ?', 'Qui d’autre l’ignorait ? 😅', 'Dites-moi en commentaire si vous connaissiez !'],
    fins: ['🙏', 'Bonne journée à tous ☀️', 'Partagez autour de vous 🙏', '❤️'],
    source: (ou) => `Je l’ai vu ${ou} 👍`,
  },
  ancien: {
    ouvertures: ['Bonjour à tous,', 'Mes amis,', 'Une information intéressante :'],
    relais: {
      fait: ['Mon père me le racontait déjà quand j’étais enfant.', 'Une chose que les jeunes ne savent pas toujours.', 'Je l’ai redécouvert en rangeant de vieux livres sur le pays.'],
      actu: ['Un ami me l’a appris ce matin au marché.', 'On m’en a parlé au club hier après-midi.'],
    },
    appels: ['Le saviez-vous ?', 'Qu’en pensez-vous ?'],
    fins: ['Bonne journée.', 'À méditer...', 'Bien à vous.'],
    source: (ou) => `Je l’ai lu ${ou}.`,
  },
  neutre: {
    ouvertures: ['', 'Tiens,', 'Bon à savoir :', 'Appris aujourd’hui :'],
    relais: {
      fait: ['Je suis tombé dessus par hasard.', 'Je pensais le contraire depuis des années.', 'On en parlait au boulot ce midi.'],
      actu: ['On me l’a envoyé ce matin.', 'Ça tourne dans mes groupes depuis hier.'],
    },
    appels: ['Vous saviez ?', 'Ça vous étonne aussi ?'],
    fins: ['👀', '🤔', '', 'Intéressant.'],
    source: (ou) => `Lu ${ou}.`,
  },
  vulgarisation: {
    ouvertures: ['🔎 Le saviez-vous ?', '🌿 Nature calédo :', '📌 À retenir :'],
    relais: {
      fait: ['Un petit fait qu’on adore partager avec vous.', 'Une info qui étonne souvent nos abonnés.', 'On en parle souvent, mais peu de gens le savent.'],
      actu: ['On nous l’a signalé en message privé.', 'Plusieurs abonnés nous en ont parlé cette semaine.'],
    },
    appels: ['Vous le saviez ? 👇', 'Dites-nous en commentaire !', 'Enregistrez ce post pour le retrouver.'],
    fins: ['#NouvelleCalédonie #LeSaviezVous', '#Caillou #Nature', '#Science #NC'],
    source: (ou) => `📚 Pour aller plus loin, c’est ${ou}.`,
  },
  quiz: {
    ouvertures: ['❓ Vrai ou faux ?', '🧠 Culture G du jour :', '🎯 Le quiz du jour :'],
    relais: {
      fait: ['Beaucoup se trompent sur celle-là !', 'La réponse va peut-être vous surprendre.'],
      actu: ['Une question d’actu, cette fois !', 'On change un peu : place à l’actu.'],
    },
    appels: ['Vous aviez trouvé ? 👇', 'Votre score en commentaire !'],
    fins: ['Réponse : VRAI ✅', '#Quiz #NC', 'Rendez-vous demain pour la suite 😉'],
    source: (ou) => `On a vérifié ${ou} 😉`,
  },
  alarmiste: {
    casse: 'maj',
    ouvertures: ['⚠️🔴', '🚨🚨🚨', '‼️'],
    relais: {
      fait: ['On ne vous le dira nulle part ailleurs.', 'Tout le monde doit être au courant.'],
      actu: ['On ne vous le dira nulle part ailleurs.', 'Ça concerne tout le monde.', 'Tout le monde doit être au courant.'],
    },
    appels: ['Vous êtes au courant ???', 'Pourquoi personne n’en parle ???'],
    fins: ['PARTAGEZ !!!', 'FAITES TOURNER 🔴', 'AVANT QUE ÇA SOIT SUPPRIMÉ !!'],
    source: (ou) => `Vu ${ou} !!!`,
  },
  militant: {
    ouvertures: ['Réveillez-vous.', 'On ne vous le dira pas ailleurs :', 'Encore une fois :'],
    relais: {
      fait: ['Les grands médias n’en parleront pas, comme d’habitude.', 'Ce n’est pas la première fois.'],
      actu: ['Les grands médias n’en parleront pas, comme d’habitude.', 'On vous prend pour des idiots, et ça marche.', 'Ce n’est pas la première fois.'],
    },
    appels: ['Jusqu’à quand ?', 'Et vous, vous en pensez quoi ?'],
    fins: ['#OnNousMent #RéveilNC', 'Ouvrez les yeux 👁️', '#VéritéNC'],
    source: (ou) => `C’est ${ou}, cherchez vous-mêmes.`,
  },
  informe: {
    ouvertures: ['🧵 Info :', 'Je vous le dis avant tout le monde :', 'Exclu :'],
    relais: {
      fait: ['J’ai mes contacts, je vous tiens au courant.', 'Je l’ai su avant tout le monde.'],
      actu: ['J’ai mes contacts, je vous tiens au courant.', 'Je l’ai su avant tout le monde.', 'Ça va sortir partout dans quelques jours.'],
    },
    appels: ['Vous en saviez quelque chose ?', 'On en reparle bientôt.'],
    fins: ['Retenez bien ça.', 'Vous verrez.', '👀'],
    source: (ou) => `Repéré ${ou}.`,
  },
}

export const RELAIS_THEME = {
  mer: ['On en parlait justement en sortant en bateau dimanche.', 'Ça m’a fait penser à notre dernière sortie sur l’îlot.'],
  faune: ['J’ai toujours eu un faible pour nos animaux.', 'Les enfants adorent ce genre d’info sur les bêtes d’ici.'],
  flore: ['On en a parlé pendant une balade en brousse.', 'Je regarde les arbres autrement depuis.'],
  meteo: ['Toujours utile à savoir avant la saison.', 'Avec le temps qu’il fait en ce moment, ça tombe bien.'],
  geo: ['Pratique à savoir quand on fait visiter le pays.', 'Les cousins de France me posent toujours la question.'],
  histoire: ['Un bout de notre histoire qu’on oublie trop vite.', 'J’adore ces petites histoires du pays.'],
  sortie: ['Ça fait une idée de sortie pour le week-end.', 'On y passera sûrement avec les enfants.'],
  cuisine: ['Rien que d’y penser, j’ai faim.', 'Il faudra goûter ça au moins une fois.'],
  jeunes: ['Ça fait plaisir de voir les jeunes bouger.', 'Une belle histoire, pour une fois.'],
  ville: ['On en parlait justement au boulot.', 'Ça va changer un peu le quotidien en ville.'],
  environnement: ['Chaque geste compte, franchement.', 'Ça donne envie de s’y mettre aussi.'],
}

const sigle = (nom) => /^[A-ZÉ]{2,}$/.test(nom)
export const surLeSite = (nom) => (nom === 'Wikipédia' ? 'sur Wikipédia' : `sur le site ${sigle(nom) ? 'de l’' : 'de '}${nom}`)
export const dapres = (nom) => `D’après ${sigle(nom) ? 'l’' : ''}${nom}`

export const PERSONNES = [
  ['Mélissa R.', '#791561', '@melissa.r', 'parent'], ['Teva', '#14663f', '@teva.nc', 'ado'],
  ['Christophe M.', '#1800ad', '@christophe.m', 'neutre'], ['Josiane', '#b45309', '@josiane988', 'parent'],
  ['Kenji T.', '#8a4fbe', '@kenji.t', 'ado'], ['Aline B.', '#c2410c', '@aline.b', 'neutre'],
  ['Steeve', '#57534e', '@steeve_nc', 'ado'], ['Poema', '#791561', '@poema.w', 'parent'],
  ['Yannick D.', '#14663f', '@yannick.d', 'neutre'], ['Manon', '#1800ad', '@manon.988', 'ado'],
  ['Rose-Marie', '#b45309', '@rosemarie.nc', 'ancien'], ['Dylan', '#8a4fbe', '@dylan.k', 'ado'],
]

export const PAGES_ORDINAIRES = [
  ['Les Curieux du Pacifique', '#14663f', 'page de vulgarisation', 'vulgarisation'],
  ['Nature et Lagon NC', '#1800ad', 'page nature', 'vulgarisation'],
  ['Quiz du Caillou', '#791561', 'page de quiz', 'quiz'],
]

export const HABILLAGES = [
  {
    niveau: 1,
    comptes: [
      ['ALERTE-INFO NC', '#dc2626', 'page créée il y a 3 jours'],
      ['LA VÉRITÉ CACHÉE', '#b91c1c', 'page créée il y a 2 semaines'],
      ['ALERTE ROUGE NC 🔥', '#991b1b', 'page créée hier'],
      ['Jojo_Vérité 🔥', '#dc2626', '@jojo_verite · compte créé hier'],
      ['Ninou ALERTE', '#b91c1c', '@ninou_alerte · compte créé il y a 4 jours'],
    ],
    voix: 'alarmiste',
    explication: 'Le compte crie : nom alarmiste, majuscules, compte tout récent.',
    indice: (compte) =>
      indice('ALERTE', 'SOURCE', 'Megaphone', 'Un compte qui crie',
        `${compte.nom} : nom alarmiste, majuscules, ${compte.domaine}. Personne d’identifiable derrière.`),
  },
  {
    niveau: 2,
    comptes: [
      ['Vigilance Citoyenne', '#991b1b', 'page militante'],
      ['Chiffres & Vérité', '#ea580c', 'page militante'],
      ['Le Vrai Dossier', '#b91c1c', 'page militante'],
      ['Patou Nouméa', '#991b1b', '@patou.noumea · « je dis ce qu’on vous cache »'],
      ['Sandy B.', '#ea580c', '@sandy_b88 · « réveillez-vous »'],
    ],
    voix: 'militant',
    explication: 'Le compte défend une cause, sans auteur identifiable.',
    indice: (compte) =>
      indice('VERIFICATION', 'SOURCE', 'Search', 'Un compte militant',
        `${compte.nom} ne dit pas qui écrit, ni d’où vient l’information.`),
  },
  {
    niveau: 3,
    comptes: [
      ['Info Directe NC', '#c2410c', 'page d’actualité'],
      ['Le Caillou Dévoilé', '#9a3412', 'page d’actualité'],
      ['Nouméa Décrypte', '#57534e', 'page d’actualité'],
      ['Fabrice L.', '#c2410c', '@fabrice.l · « toujours bien informé »'],
      ['Lina K.', '#9a3412', '@lina.k · « l’info avant tout le monde »'],
    ],
    voix: 'informe',
    explication: 'Le compte a l’air bien informé, sans journaliste ni source.',
    indice: (compte) =>
      indice('VERIFICATION', 'SOURCE', 'Newspaper', 'Un compte qui se dit bien informé',
        `${compte.nom} se présente comme une source fiable, sans jamais dire d’où vient l’information.`),
  },
  {
    niveau: 4,
    comptes: [...PERSONNES, ...PAGES_ORDINAIRES],
    explication: 'Le post vient d’un compte ordinaire, qui ne cite pas de source sérieuse.',
    indice: (compte) =>
      indice('VERIFICATION', 'SOURCE', 'UserRound', 'Un compte, pas une source',
        `${compte.nom} partage l’info sans source sérieuse. Être sympathique ne rend pas une info vraie.`),
  },
  {
    niveau: 5,
    comptes: [...PERSONNES, ...PAGES_ORDINAIRES],
    explication: 'Le post a tout d’un partage honnête : ton naturel, détails précis. Aucune source sérieuse derrière.',
    indice: (compte) =>
      indice('VERIFICATION', 'SOURCE', 'Search', 'Aucune source sérieuse',
        `${compte.nom} ne s’appuie sur aucune source qu’on puisse consulter. « Vu sur internet », ce n’est pas une source.`),
  },
]

export const MEDIAS_FICTIFS = [
  ['Le Quotidien du Pacifique', '#1800ad', 'quotidien-pacifique.info'],
  ['Nouméa Matin', '#0d0080', 'noumea-matin.info'],
  ['Pacifique Express Info', '#1800ad', 'pacifique-express.info'],
  ['Le Fil Calédonien', '#0d0080', 'fil-caledonien.info'],
]

export const JOURNALISTES = ['Claire Weber', 'Thomas Naudin', 'Sarah Kowalczyk', 'Julien Ferrand', 'Anaïs Labbé', 'Marc Ollivier']

export const HABILLAGE_MEDIA = {
  explication: 'L’article ne dit pas qui l’a écrit ni d’où vient l’information : rien ne permet de le vérifier.',
  explicationSigne: 'L’article est signé, mais sa seule source est vague : impossible de remonter à l’information.',
  indice: (compte) =>
    indice('VERIFICATION', 'SOURCE', 'Newspaper', 'Un article sans auteur ni source',
      `« ${compte.nom} » publie l’article sans nom d’auteur et sans dire d’où vient l’information. Un article fiable est signé et sourcé.`),
  indiceSigne: (compte) =>
    indice('VERIFICATION', 'SOURCE', 'Search', 'Une source qui n’en est pas une',
      `L’article de « ${compte.nom} » est signé, mais il s’appuie sur une source vague, impossible à consulter.`),
}

export const VRAI_MEDIA = {
  indices: (f, compte, journaliste) => [
    indice('FIABLE', 'TEXTE', 'BadgeCheck', 'Une source citée',
      `L’article cite ${f.source.nom}, qu’on peut consulter pour vérifier.`),
    indice('FIABLE', 'SOURCE', 'Newspaper', 'Un article signé',
      `${journaliste} signe l’article pour ${compte.nom} : on sait qui écrit.`),
    indice('FIABLE', 'TITRE', 'Scale', 'Un titre qui décrit',
      'Ni majuscules, ni « partagez », ni révélation promise : le titre décrit, il ne pousse pas.'),
  ],
}

export const AVIS_VRAI = (f) => {
  const ou = surLeSite(f.source.nom)
  return {
    croit: ['Merci pour l’info 🙏', 'Bon à savoir, je fais tourner.', 'Enfin une info claire.', 'Je ne savais pas du tout !'],
    doute: ['Vous êtes sûrs ? J’avais entendu autre chose…', 'Ça m’étonne quand même.', 'On ne sait jamais avec ce qu’on lit sur internet…'],
    verifie: [`J’ai vérifié ${ou} : c’est exact.`, `C’est bien ce qu’on trouve ${ou}.`, `Confirmé ${ou}, j’ai regardé.`, `Exact, et c’est bien expliqué ${ou}.`],
  }
}

export const CORRECTIONS_FAIT = (f, vraiEnMinuscule) => {
  const ou = surLeSite(f.source.nom)
  return [
    `Non, ${vraiEnMinuscule} C’est ${ou}.`,
    `J’ai vérifié ${ou} : ce n’est pas ça. ${f.vrai}`,
    `Attention, c’est faux : ${vraiEnMinuscule} Ça se vérifie ${ou}.`,
  ]
}

export const VRAI_ARTICLE = {
  explication: (a) =>
    `Un vrai article de ${a.editeur} : média identifiable, auteur nommé, date et lien vers l'article complet. ` +
    'Le titre décrit sans pousser : il peut se partager.',
  analyseVrai: (a) => `Article ${a.deAuteur}, publié par ${a.editeur} le ${a.date}.`,
  indices: (a) => [
    indice('FIABLE', 'SOURCE', 'BadgeCheck', 'Un média identifiable',
      `${a.nom} publie sur ${a.domaine}, avec des auteurs nommés et des mentions légales.`),
    indice('FIABLE', 'DATE', 'Clock', 'Une date précise', `Publié le ${a.date} : on sait de quand date l’information.`),
    indice('FIABLE', 'TITRE', 'Scale', 'Un titre qui décrit',
      'Ni majuscules, ni « partagez », ni révélation promise : le titre décrit, il ne pousse pas.'),
  ],
  avis: (a) => ({
    croit: ['Merci pour l’article 🙏', 'Intéressant, je partage.'],
    doute: ['Encore un article qui va dans tous les sens…', 'On ne sait jamais avec les médias…'],
    verifie: [`L’article complet est sur ${a.domaine}, signé ${a.auteur}.`, `C’est bien sur le site de ${a.nom}, daté du ${a.date}.`],
  }),
}

export const SOURCES_VAGUES = ['dans un docu', 'sur internet', 'dans un groupe Facebook', 'dans une vidéo TikTok', 'à la télé', 'sur un site d’info']

export const TEXTES_ARTICLE = {
  vrai: [
    ({ journaliste, source }) => `Par ${journaliste}. ${dapres(source)}, l’information se vérifie en quelques clics. On vous explique ce qu’il faut retenir.`,
    ({ journaliste, source }) => `${journaliste} fait le point, à partir des informations publiées ${surLeSite(source)}. L’essentiel est à lire en lien en bio.`,
    ({ journaliste, source }) => `Un article de ${journaliste}. ${dapres(source)}, c’est bien le cas, et voici pourquoi. Tous les détails dans l’article.`,
  ],
  faux: ({ journaliste, phrase, suite, cite }) =>
    journaliste
      ? `Par ${journaliste}. ${phrase} ${suite ?? ''} Une information repérée ${cite}.`.replace(/\s+/g, ' ')
      : `Par la rédaction. ${phrase} ${suite ?? ''}`.trim(),
}

export const INDICE_AILLEURS = [
  indice('VERIFICATION', 'TITRE', 'Search', 'Introuvable ailleurs', introuvable),
  indice('FIABLE', 'TITRE', 'Scale', 'Un ton qui rassure',
    `Le post est posé et crédible : c’est ce qui le rend dangereux. ${introuvable}`),
]

export const indiceCorrection = (fait) =>
  indice('VERIFICATION', 'TITRE', 'Search', 'Facile à vérifier',
    `${fait.source.nom} dit autre chose : ${fait.vrai}`)

export const FAIT_DEFORME = {
  biais: 'Fait déformé',
  titres: [meme, meme, meme, meme, meme],
  explication: 'Un fait connu, avec un détail changé : le post a l’air vrai, il ne l’est pas.',
  analyseFaux: 'Un détail du post est faux.',
  ajout: 'un détail faux dans un fait connu',
  pression: 'C’est connu, en plus !',
  indice: indice('ALERTE', 'TITRE', 'Search', 'Un détail faux',
    'Le fait a l’air connu, mais un chiffre, une date ou un détail a été changé.'),
  croit: ['Je ne savais pas, merci 🙏', 'Incroyable, je partage.'],
  doute: ['Tu es sûr de ça ?', 'Ça ne colle pas avec ce que j’ai appris à l’école…'],
}

export const VRAI = {
  explication: (f) =>
    `Information vraie et vérifiable : ${f.source.nom} le confirme. Rien dans le post ne pousse à partager ` +
    'vite : il peut se partager.',
  analyseVrai: (f) => `${f.vrai} À vérifier sur ${f.source.nom}.`,
  indices: (f, compte) => [
    indice('FIABLE', 'TITRE', 'BadgeCheck', 'Une info vérifiable',
      `${f.source.nom} le confirme : une recherche suffit.`),
    indice('FIABLE', 'TEXTE', 'Scale', 'Rien qui pousse',
      'Ni menace, ni « partagez vite », ni révélation : le post raconte, il ne pousse pas.'),
    indice('FIABLE', 'SOURCE', 'UserRound', 'Un compte, pas une source',
      `${compte.nom} n’est pas une source en soi : c’est l’info qui se vérifie, pas le profil.`),
  ],
}

export const CONSEQUENCES_FAUX = {
  share:
    "En partageant, vous donnez à ce post la crédibilité qui lui manquait : celle de quelqu'un que vos proches connaissent.",
  ignore:
    "Vous ne l'avez pas amplifié, et c'est déjà ça. Sans signalement, il continue pourtant sa route auprès d'autres personnes.",
  report:
    'Bien vu. Ce post était faux, et son emballage était conçu pour vous faire réagir avant de réfléchir.',
}

export const CONSEQUENCES_VRAI = {
  share:
    "Vous avez relayé une information vraie, avec une source qu'on peut vérifier. C'est ce qui devrait circuler.",
  ignore:
    "Rien de grave, mais une information utile et vérifiée n'a pas atteint les personnes à qui elle aurait servi.",
  report:
    "Signaler une information vraie et sourcée n'aide personne : ça encombre la modération et fragilise la circulation de ce qui est fiable.",
}

export const SCORES_FAUX = { share: -80, ignore: 10, report: 100 }
export const SCORES_VRAI = { share: 100, ignore: 0, report: -40 }
