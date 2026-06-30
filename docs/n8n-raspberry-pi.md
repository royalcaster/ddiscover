# Raspberry Pi n8n Hosting

This setup runs DDiscover's n8n workflows on a Raspberry Pi 5 with Docker Compose, n8n, and PostgreSQL.

## Files

- `n8n/self-host/raspberry-pi/docker-compose.yml`
- `n8n/self-host/raspberry-pi/.env.example`
- `n8n/workflows/ddiscover-webpage-llm-ingestion.json`
- `n8n/workflows/ddiscover-google-places-bootstrap.json`

## First Setup On The Pi

1. Install Raspberry Pi OS 64-bit.
2. Install Docker and the Docker Compose plugin.
3. Copy or clone this repository onto the Pi.
4. Create the n8n env file:

```sh
cd n8n/self-host/raspberry-pi
cp .env.example .env
openssl rand -hex 32
```

5. Put the generated value into `N8N_ENCRYPTION_KEY`.
6. Fill in:
   - `POSTGRES_PASSWORD`
   - `DDISCOVER_CONVEX_SITE_URL`
   - `DDISCOVER_INGESTION_TOKEN`
   - `OPENAI_API_KEY` for webpage LLM extraction
   - `GOOGLE_PLACES_API_KEY` for Google Places bootstrap
7. Start n8n:

```sh
docker compose up -d
docker compose logs -f n8n
```

8. Open `http://raspberrypi.local:5678` or the Pi's LAN IP and create the first n8n owner account.
9. Import the workflow JSON files from `n8n/workflows/`.

## Convex Setup

The Pi's `DDISCOVER_INGESTION_TOKEN` must match the Convex environment variable with the same name.

The Convex backend also needs:

- `DDISCOVER_INGESTION_TOKEN`
- `DDISCOVER_ADMIN_EMAILS`

Use the Convex site URL for n8n:

- Correct: `https://your-deployment.convex.site`
- Not this: `https://your-deployment.convex.cloud`

## Network And Security

For local testing, `http://raspberrypi.local:5678` is fine.

For internet access, put n8n behind HTTPS before exposing it. Good options:

- Cloudflare Tunnel
- Tailscale Funnel
- Caddy or Traefik reverse proxy with TLS

When using HTTPS, update `.env`:

```sh
N8N_PROTOCOL=https
N8N_EDITOR_BASE_URL=https://your-n8n-domain.example
N8N_WEBHOOK_URL=https://your-n8n-domain.example/
N8N_SECURE_COOKIE=true
```

Do not expose port `5678` directly to the internet without HTTPS and n8n user authentication.

## Operations

Start:

```sh
docker compose up -d
```

Stop:

```sh
docker compose down
```

Update:

```sh
docker compose pull
docker compose up -d
```

Backup before updates:

```sh
docker compose exec postgres pg_dump -U n8n n8n > n8n-postgres-backup.sql
```

Keep `N8N_ENCRYPTION_KEY` safe. Without it, stored n8n credentials cannot be decrypted after restore.

## Future GitHub Actions Deploy

The workflow JSON files are versioned in the repo. A later GitHub Action can deploy them to the Pi-hosted n8n instance by:

1. Storing `N8N_BASE_URL` and `N8N_API_KEY` as GitHub Actions secrets.
2. Validating the JSON files.
3. Calling the n8n public API to create or update workflows.
4. Keeping activation manual until the deployed workflow has been reviewed.
