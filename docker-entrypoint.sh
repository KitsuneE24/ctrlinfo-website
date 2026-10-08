#!/bin/sh
# Règle au démarrage les deux choses qu'une image ne doit pas contenir : le mot
# de passe de l'administration, et le chemin absolu du fichier qui le garde.
set -e

HTPASSWD=/etc/apache2/.htpasswd

# Le dossier d'administration peut être renommé à la construction : on le
# reconnaît à son point d'enregistrement, pas à son nom.
ADMIN=$(dirname "$(find /var/www/html -maxdepth 2 -name enregistrer.php | head -1)")
if [ ! -d "$ADMIN" ]; then
  echo "→ aucun dossier d'administration dans l'image"
  exec "$@"
fi

if [ -s "$HTPASSWD" ]; then
  echo "→ fichier de mots de passe fourni, laissé tel quel"
elif [ -n "$ADMIN_USER" ] && [ -n "$ADMIN_PASSWORD" ]; then
  htpasswd -cbB "$HTPASSWD" "$ADMIN_USER" "$ADMIN_PASSWORD" > /dev/null
  chmod 644 "$HTPASSWD"
  echo "→ administration ouverte à « $ADMIN_USER »"
else
  # Un fichier vide ne contient aucun utilisateur valide : /admin/ refuse tout
  # le monde. C'est le repli voulu — jamais une administration ouverte.
  : > "$HTPASSWD"
  chmod 644 "$HTPASSWD"
  echo "→ ADMIN_USER / ADMIN_PASSWORD absents : /admin/ est fermé à tous"
fi

sed -i "s|^AuthUserFile .*|AuthUserFile $HTPASSWD|" "$ADMIN/.htaccess"
echo "→ administration servie depuis /$(basename "$ADMIN")/"

# L'administration réécrit ce fichier : Apache doit pouvoir y écrire.
chown -R www-data:www-data /var/www/html/donnees

exec "$@"
