#!/usr/bin/env sh

set -e

pnpm exec prisma migrate deploy
exec pnpm run start