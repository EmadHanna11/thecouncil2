#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../website"

# Use the committed lockfile and include the build-time minifier.
npm ci --include=dev --no-audit --no-fund
npm run build

# Schema changes are managed separately; merges must not mutate live data.
