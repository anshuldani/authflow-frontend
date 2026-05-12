#!/usr/bin/env bash
# AuthFlow → Vercel deploy
# Usage:  VERCEL_TOKEN=<your-token> bash deploy-to-vercel.sh
# Token:  https://vercel.com/account/tokens  (scope to anshul-danis-projects, 1-day expiry)

set -euo pipefail

cd "$(dirname "$0")"

DEPLOY_URL="https://authflow-frontend-ew19.vercel.app"

# -- Safety checks --------------------------------------------------------------
[ -n "${VERCEL_TOKEN:-}" ]      || { echo "ERR: VERCEL_TOKEN env var not set. See top of this script."; exit 1; }
[ -f .env.local ]               || { echo "ERR: .env.local missing. Cannot read secrets."; exit 1; }
[ -f .vercel/project.json ]     || { echo "ERR: .vercel/project.json missing. Run: vercel link --scope anshul-danis-projects --project authflow-frontend-ew19 --yes --token \"\$VERCEL_TOKEN\""; exit 1; }

# Wrapper so every call passes the token (CLI 53 doesn't persist auth from device flow)
v() { vercel --token "$VERCEL_TOKEN" "$@"; }

echo "==> Verifying Vercel auth..."
v whoami >/dev/null || { echo "ERR: token invalid or expired. Generate a new one at https://vercel.com/account/tokens"; exit 1; }

PROJECT=$(jq -r .projectName .vercel/project.json 2>/dev/null || echo "?")
echo "==> Linked project: ${PROJECT}"

# -- Push env vars (overwrite if exists) ----------------------------------------
KEYS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  RESEND_API_KEY
  GOOGLE_AI_API_KEY
  ANTHROPIC_API_KEY
)

for key in "${KEYS[@]}"; do
  # Pull value from .env.local (everything after the first =), trim trailing \r\n
  value=$(grep -E "^${key}=" .env.local | head -1 | cut -d= -f2- | tr -d '\r\n')
  if [ -z "${value:-}" ]; then
    echo "  WARN: ${key} missing from .env.local — skipping"
    continue
  fi
  echo "==> ${key} → production"
  # Remove existing (no-op if absent) so re-runs are idempotent
  v env rm "$key" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | v env add "$key" production >/dev/null
done

# Override NEXT_PUBLIC_APP_URL — .env.local says localhost
echo "==> NEXT_PUBLIC_APP_URL → ${DEPLOY_URL}"
v env rm NEXT_PUBLIC_APP_URL production --yes >/dev/null 2>&1 || true
printf '%s' "$DEPLOY_URL" | v env add NEXT_PUBLIC_APP_URL production >/dev/null

# -- Deploy ---------------------------------------------------------------------
echo ""
echo "==> Building + deploying to production..."
echo ""
v --prod
