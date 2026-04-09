#!/usr/bin/env bash
# Requires `npm run dev` on http://localhost:3000 and a valid PINATA_JWT in `.env`.
set -euo pipefail
URL="${1:-http://localhost:3000/api/ipfs/json}"
echo "POST $URL (JSON pin smoke test)..."
code=$(curl -sS -o /tmp/smoke-ipfs-out.json -w "%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"body":{"smoke":true,"note":"treegens-smoke"},"name":"smoke.json"}')
cat /tmp/smoke-ipfs-out.json
echo ""
if [[ "$code" != "200" ]]; then
  echo "HTTP $code — fix PINATA_JWT (Pinata dashboard JWT with pin permissions; no quotes/newlines)." >&2
  exit 1
fi
echo "OK: Pinata JSON pin succeeded."
