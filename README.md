# Homework Check

Application web locale pour l’enfant et le parent :

1. L’enfant ajoute un devoir (titre, matière, énoncé, date, temps d’écran demandé).
2. Le devoir apparaît dans une liste.
3. Un bouton permet de photographier le document (caméra ou fichier).
4. La photo arrive sur le compte parent.
5. Le parent valide ou demande une reprise.
6. Après validation, le parent ouvre **Microsoft Family Safety** pour ajouter le temps d’écran.

## Family Safety

Microsoft ne fournit **pas d’API publique** pour créditer du temps d’écran depuis une autre application. Homework Check ouvre le site officiel [Family Safety](https://account.microsoft.com/family) et note le bonus une fois que tu l’as ajouté à la main. C’est le seul moyen fiable et autorisé.

D'autre contrôle parentale sont en cours.

En mode local

## Lancer l’app

Dans ce dossier :

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Au premier lancement, crée l’espace famille (nom, prénom de l’enfant, PIN parent, PIN enfant). Connecte-toi ensuite en **Enfant** ou **Parent**.

Les données restent sur l’ordinateur, dans le dossier `data/` (non versionné).

## Sur un téléphone

Le PC et le téléphone doivent être sur le même réseau Wi-Fi. Lance l’app, puis ouvre `http://ADRESSE-IP-DU-PC:3000` depuis le téléphone pour utiliser l’appareil photo.
