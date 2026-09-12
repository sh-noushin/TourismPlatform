// Local default, copied into the build output as a static asset.
// In Docker this file is overwritten at container start by
// docker-entrypoint.d/40-runtime-config.sh using DASHBOARD_API_BASE_URL.
window.__DASHBOARD_API_BASE_URL = "https://localhost:7110/";
