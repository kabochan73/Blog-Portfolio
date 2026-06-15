#!/bin/sh
set -e

export PORT="${PORT:-80}"

envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ ! -d "vendor" ]; then
    composer install --no-interaction --optimize-autoloader
fi

echo "Waiting for database..."
for i in $(seq 1 30); do
    php artisan migrate --force && break
    echo "Retrying in 3s... ($i/30)"
    sleep 3
done
php artisan db:seed --force || echo "Warning: db:seed failed (non-fatal, continuing startup)"
php artisan config:cache
php artisan route:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
