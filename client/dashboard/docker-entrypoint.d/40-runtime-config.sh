#!/bin/sh
set -eu

# app.config.ts reads globalThis.__DASHBOARD_API_BASE_URL and falls back to
# https://localhost:7110/ when it is missing. index.html loads this file before the
# bundle, so the value is in place by the time Angular bootstraps.
#
# Note this URL is resolved by the BROWSER, not by nginx -- it must be reachable from
# the host (e.g. http://localhost:5266), not the compose-internal http://api:8080.
API_BASE="${DASHBOARD_API_BASE_URL:-http://localhost:5266}"

TARGET=/usr/share/nginx/html/runtime-config.js

cat > "$TARGET" <<EOF
// Generated at container start by 40-runtime-config.sh -- do not edit.
window.__DASHBOARD_API_BASE_URL = "${API_BASE}";
EOF

echo "40-runtime-config.sh: dashboard API base set to ${API_BASE}"
