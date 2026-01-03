#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

STRICT="${STRICT:-0}"
SITE_URL="${SITE_URL:-http://localhost:4321}"
LIGHTHOUSE_REPORT="${LIGHTHOUSE_REPORT:-./lighthouse-report.html}"
PREVIEW_LOG="${PREVIEW_LOG:-./.prelaunch-preview.log}"

log() {
  printf "\n==> %s\n" "$1"
}

warn() {
  printf "WARN: %s\n" "$1"
}

fail_or_warn() {
  local message="$1"
  if [[ "$STRICT" == "1" ]]; then
    printf "ERROR: %s\n" "$message" >&2
    exit 1
  fi
  warn "$message"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf "ERROR: Required command not found: %s\n" "$cmd" >&2
    exit 1
  fi
}

require_cmd npm
require_cmd curl

log "Build verification"
npm run build

preview_pid=""
cleanup() {
  if [[ -n "$preview_pid" ]]; then
    kill "$preview_pid" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if curl -sSf "$SITE_URL" >/dev/null 2>&1; then
  log "Using existing server at $SITE_URL"
else
  if [[ "$SITE_URL" == http://localhost* || "$SITE_URL" == http://127.0.0.1* ]]; then
    port=$(printf "%s" "$SITE_URL" | sed -nE 's#^http://(localhost|127\.0\.0\.1):([0-9]+).*#\2#p')
    port="${port:-4321}"
    log "Starting preview server on http://127.0.0.1:$port"
    npm run preview -- --host 127.0.0.1 --port "$port" > "$PREVIEW_LOG" 2>&1 &
    preview_pid=$!

    for _ in {1..30}; do
      if curl -sSf "$SITE_URL" >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done

    if ! curl -sSf "$SITE_URL" >/dev/null 2>&1; then
      printf "ERROR: Preview server did not become ready.\n" >&2
      printf "Last 50 lines of %s:\n" "$PREVIEW_LOG" >&2
      tail -n 50 "$PREVIEW_LOG" >&2 || true
      exit 1
    fi
  else
    fail_or_warn "SITE_URL is not reachable and is not localhost. Start the server and re-run."
  fi
fi

log "Link checking"
if npx --yes linkinator "$SITE_URL" --recurse --timeout 5000 --concurrency 10 --skip "mailto:|tel:"; then
  log "Link check passed"
else
  fail_or_warn "Link check failed"
fi

log "Lighthouse audit"
if npx --yes lighthouse "$SITE_URL" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path="$LIGHTHOUSE_REPORT" \
  --chrome-flags="--headless --no-sandbox"; then
  log "Lighthouse report saved to $LIGHTHOUSE_REPORT"
else
  fail_or_warn "Lighthouse audit failed"
fi

log "Security headers check"
headers=$(curl -sI "$SITE_URL")
missing_headers=()

check_header() {
  local name="$1"
  if ! printf "%s" "$headers" | grep -qi "^${name}:"; then
    missing_headers+=("$name")
  fi
}

check_header "content-security-policy"
check_header "referrer-policy"
check_header "x-content-type-options"
check_header "x-frame-options"
check_header "permissions-policy"

if [[ "$SITE_URL" == https://* ]]; then
  check_header "strict-transport-security"
fi

if [[ ${#missing_headers[@]} -gt 0 ]]; then
  printf "Missing security headers:\n" >&2
  for header in "${missing_headers[@]}"; do
    printf "- %s\n" "$header" >&2
  done
  fail_or_warn "One or more security headers are missing"
else
  log "Security headers look good"
fi

log "Pre-launch checks complete"
