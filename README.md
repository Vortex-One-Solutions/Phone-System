# Platform Foundation

Production-oriented foundation for the multi-tenant Sales Engagement & Communication SaaS.

## Runtime

- Node.js 24.21 LTS
- TypeScript
- pnpm + Turborepo
- Next.js 16
- Fastify
- PostgreSQL 17
- Redis

Node 24.21 is the pinned LTS development target. PostgreSQL 17 is the supported database target.

## Local startup

```bash
cp .env.example .env
# Set DATABASE_URL and DATABASE_ADMIN_URL to your PostgreSQL 17 credentials.
pnpm install
pnpm db:migrate
docker compose up -d redis
pnpm dev
```

The Docker Compose PostgreSQL service is available for isolated development, but an existing
PostgreSQL 17 installation may be used instead.

## Security

PostgreSQL runtime access is intended to use a non-owner role without BYPASSRLS. Tenant context
is transaction-local. Tenant membership is validated inside the RLS boundary before a session
request is authorized.

See `SECURITY.md` and `security-secrets-register.xlsx`.

## Scope

This repository implements the foundation only. Contacts, campaigns, telephony, messaging,
sequences, integrations, billing, and AI are deliberately outside this milestone.


## Handoff 01 verification

The repository contains security-contract tests under `apps/api/tests` and
`packages/database/tests`. Full acceptance requires executing them against
PostgreSQL 17 and Redis, including the documented cross-tenant RLS attack cases.
