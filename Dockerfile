# CTRL INFO — le site, dans une réplique de son hébergement.
#
# L'image n'est pas une commodité de développement : elle reproduit la cible —
# Apache, PHP, et les .htaccess honorés. C'est ce qui permet d'essayer
# l'administration avant de déployer, et de déployer sans surprise.
#
#   docker build -t ctrlinfo .
#   docker run -p 8080:80 -e ADMIN_USER=admin -e ADMIN_PASSWORD=… \
#     -v "$PWD/public/donnees:/var/www/html/donnees" ctrlinfo
#
# Sans ADMIN_USER / ADMIN_PASSWORD, /admin/ est fermé à tout le monde.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM php:8.3-apache AS runtime

RUN apt-get update \
 && apt-get install -y --no-install-recommends apache2-utils \
 && rm -rf /var/lib/apt/lists/* \
 && a2enmod rewrite deflate expires headers

# Sans AllowOverride, Apache ignore les .htaccess : le repli des adresses ne
# marcherait pas, et surtout /admin/ ne serait plus protégé.
RUN printf '<Directory /var/www/html>\n  AllowOverride All\n  Require all granted\n</Directory>\n' \
      > /etc/apache2/conf-available/ctrlinfo.conf \
 && a2enconf ctrlinfo

COPY --from=build /app/dist/ /var/www/html/
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
