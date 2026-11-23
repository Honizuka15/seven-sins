# SEVEN SINS · Guide d'installation

Ce projet donne, comme pour l'application Commandes :
- **une application Android** (fichier `.apk`) à installer sur les téléphones Android ;
- **une version web installable** pour iPhone et PC, avec **un lien à partager** à toute la bande ;
- **aucune base de données à créer** : chaque téléphone garde ses propres cartes, son historique et ses succès.

Il faut le faire **une seule fois**, environ 10 minutes.

---

## Étape 1 – Créer le dépôt GitHub

1. Va sur **https://github.com** avec le compte que tu utilises déjà pour Commandes.
2. **New repository** → nom **`seven-sins`** → **Public** (nécessaire pour la version web gratuite) → **Create repository**.
   Laisse-le vide (pas de README).
3. Dis à Claude que le dépôt existe : Claude y envoie tout le code lui-même.
   (Sinon : sur la page du dépôt, **Add file → Upload files** et glisse tout le contenu du dossier, sauf `node_modules`.)
4. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
5. Onglet **Actions** : la fabrication démarre toute seule (≈ 5 min). Une coche verte ✓ = c'est prêt.

## Étape 2 – Android

1. Sur le téléphone, ouvre `https://github.com/TON-NOM/seven-sins/releases/latest` dans Chrome.
2. Touche **SevenSins.apk** pour le télécharger, puis ouvre-le.
3. Android demande d'autoriser l'installation depuis Chrome : **Autoriser** → **Installer**.
4. Ouvre **Seven Sins**. C'est tout.

**Mises à jour :** à chaque changement, GitHub refait l'APK. Il suffit de le retélécharger et de l'installer par-dessus : la collection et les succès sont gardés.

Envoie ce même lien de téléchargement à tes amis Android.

## Étape 3 – iPhone et PC (le lien à partager)

- Adresse : `https://TON-NOM.github.io/seven-sins/`
- **iPhone (Safari)** : bouton **Partager → Sur l'écran d'accueil**. L'icône Seven Sins apparaît comme une vraie appli, plein écran.
- **Android sans APK (Chrome)** : menu **⋮ → Installer l'application**.
- **PC (Chrome / Edge)** : icône **Installer** dans la barre d'adresse.

Ce lien fonctionne pour tout le monde, sans compte, et le jeu marche ensuite même hors connexion.

---

## Bon à savoir

- **Partage des cartes** : sur téléphone, le bouton « Image PNG » ouvre le menu de partage (WhatsApp, Instagram, Discord, Galerie…). Sur PC, l'image se télécharge.
- **Bouton retour Android** : revient à la question précédente si c'est autorisé, sinon au menu.
- **Données** : tout reste sur le téléphone. Paramètres → « Effacer mon historique » supprime tout.
- **Questions** : 700 questions (100 par péché), dans `src/data/questions.js` et `src/data/questions_extra.js`.
- **App Store (iPhone)** : une vraie appli iPhone dans l'App Store demande un Mac et un compte développeur Apple (99 €/an). La version web installée sur l'écran d'accueil fait la même chose gratuitement.
- **Coût** : gratuit.

## Pour les développeurs

```
npm install
npm run dev            # version web en local
npm run android:sync   # met à jour le projet Android (dossier android/)
```
Le projet Android se compile avec Android Studio ou `cd android && ./gradlew assembleRelease`.
La clé de signature `android/app/sevensins-release.jks` doit rester la même pour que les mises à jour s'installent par-dessus.
