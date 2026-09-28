#!/bin/sh
# Règle au démarrage les deux choses qu'une image ne doit pas contenir : le mot
# de passe de l'administration, et le chemin absolu du fichier qui le garde.
set -e

HTPASSWD=/etc/apache2/.htpasswd

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

sed -i "s|^AuthUserFile .*|AuthUserFile $HTPASSWD|" /var/www/html/admin/.htaccess

# L'administration réécrit ce fichier : Apache doit pouvoir y écrire.
chown -R www-data:www-data /var/www/html/donnees

exec "$@"
