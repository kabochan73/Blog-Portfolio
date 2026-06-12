#!/bin/sh
set -e

export PORT="${PORT:-80}"

envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ ! -d "vendor" ]; then
    composer install --no-interaction --optimize-autoloader
fi

php artisan migrate --force
php artisan config:cache
php artisan route:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
