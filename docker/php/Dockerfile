FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libonig-dev \
 && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN pecl install redis \
  && docker-php-ext-enable redis

WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
USER www-data