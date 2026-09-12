# Running the platform with Docker

Four containers: SQL Server, the .NET API, the Angular dashboard (nginx), and the
Next.js public site.

## First run

```bash
cp .env.example .env          # then edit MSSQL_SA_PASSWORD and JWT_KEY
docker compose up --build
```

| Service   | URL                            | Notes                                     |
| --------- | ------------------------------ | ----------------------------------------- |
| Public web | http://localhost:3000         | Next.js, server-rendered                   |
| Dashboard | http://localhost:4200          | login `superadmin@gmail.com` / `SuperAdmin!123` |
| API       | http://localhost:5266          | Scalar docs at `/scalar`                   |
| SQL Server | `localhost,1433`              | user `sa`, password from `.env`            |

The API host port deliberately matches the local-development default (`5266`), so the
dashboard and public site need no reconfiguration when you switch between Docker and
`dotnet run`.

## How configuration reaches each container

- **API** — every setting is overridable via env vars using ASP.NET Core's `__`
  convention (`ConnectionStrings__Default`, `Jwt__Key`, `SuperUser__Password`). The
  `appsettings*.json` files ship in the image but compose values win.
- **Public web** — `API_BASE_URL=http://api:8080` is read at request time, so one image
  works against any API. Browser-facing image URLs go through `/api/proxy`, keeping
  everything same-origin.
- **Dashboard** — a static bundle can't read env vars, so
  `docker-entrypoint.d/40-runtime-config.sh` writes `runtime-config.js` at container
  start from `DASHBOARD_API_BASE_URL`, and `index.html` loads it before the bundle.
  This URL is resolved by the **browser**, so it must be a host URL
  (`http://localhost:5266`), never the compose-internal `http://api:8080`.

## Migrations

`Database__AutoMigrate=true` is set for the `api` service, which makes
`MigrateDatabaseAsync` apply pending migrations at startup (retrying for up to ~50s
while SQL Server finishes coming up). The flag defaults to **false**, so running
locally still goes through:

```bash
dotnet ef database update --project server/Server.Api
```

## Common tasks

```bash
docker compose up -d --build api        # rebuild just the API
docker compose logs -f api              # follow API logs
docker compose down                     # stop, keep data
docker compose down -v                  # stop and wipe the database + uploads
```

Uploaded photos live in the `api-images` volume mounted at `/app/images`; the database
lives in `mssql-data`. Both survive `down` and are deleted by `down -v`.

## Notes and limits

- **HTTP only.** Containers serve plain HTTP; there are no dev certificates to trust.
  `UseHttpsRedirection` stays in the pipeline but no-ops because no HTTPS port is
  configured. Put a TLS-terminating proxy in front for anything beyond local use.
- **CORS is `AllowAnyOrigin`** (`ServiceCollectionExtensions.cs:51`). Fine locally,
  needs tightening before this is exposed.
- **SQL Server needs ~2GB of RAM** available to Docker.
- The seeded superuser is created only if its email is not already present. Changing
  `SUPERUSER_PASSWORD` will not reset an account that already exists in the volume.
