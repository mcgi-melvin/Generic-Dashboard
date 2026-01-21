FROM php:8.0-fpm-alpine


RUN set -ex \ && apk --no-cache a postgresql-dev nodejs yarn\ && docker-php-ext-install pdo pod_pgsql

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html
COPY . /var/www/html

RUN composer update
RUN composer install

CMD php artisan serve --port=8000

EXPOSE 8000

