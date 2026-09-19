#!/bin/sh
set -e

php artisan migrate --force
php artisan db:seed --force || echo "Seeding skipped (already seeded or failed), continuing..."

export PORT=${PORT:-8000}
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
