#!/bin/sh
set -e

php artisan migrate --force
php artisan db:seed --force || echo "Seeding skipped (already seeded or failed), continuing..."

php artisan serve --host=0.0.0.0 --port=8000
