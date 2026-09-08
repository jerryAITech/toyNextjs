#!/usr/bin/env bash
# Convenience launcher for the ToyStore app.
#
# Usage:
#   ./run.sh            install deps if needed, then start the dev server
#   ./run.sh --seed      also (re)seed the database before starting
#   ./run.sh --build     production build + start instead of the dev server

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f .env.local ]; then
  echo "Missing .env.local — copying from .env.example."
  cp .env.example .env.local
  echo "Fill in MONGODB_URI, JWT_SECRET and the Razorpay keys in .env.local, then re-run this script."
  exit 1
fi

if ! grep -q "^MONGODB_URI=.\+" .env.local; then
  echo "MONGODB_URI is not set in .env.local. Add it before starting the app."
  exit 1
fi

if ! grep -q "^JWT_SECRET=.\+" .env.local; then
  echo "JWT_SECRET is not set in .env.local. Add a random secret before starting the app."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

if [[ "${1:-}" == "--seed" ]]; then
  echo "Seeding the database (this wipes existing data)..."
  npm run seed
  shift
fi

if [[ "${1:-}" == "--build" ]]; then
  npm run build
  exec npm run start
fi

exec npm run dev
