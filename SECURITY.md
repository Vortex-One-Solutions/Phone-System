# Security and Secret Handling

`security-secrets-register.xlsx` is a metadata register only.

Never store passwords, plaintext API keys, session/cookie secrets, MFA recovery codes,
password-reset tokens, email-verification tokens, OAuth secrets, or private keys in the
spreadsheet or source repository.

Actual secret values belong in an approved password manager, deployment secret store,
or equivalent secret-management system.

When a tenant API key is created, record its API-key ID, tenant, purpose, owner,
creation date, rotation policy, and status. The plaintext key is displayed once and
must not be copied into the register.

The Docker Compose development credentials are local-development defaults only and
must be replaced before shared or production use.

## Runtime API-key creation

The API returns a tenant API-key secret exactly once at creation. Copy it only into
the approved secret store. Add the API-key ID and metadata to the security register;
never paste the plaintext secret into the spreadsheet.


## MFA encryption

`MFA_ENCRYPTION_KEY` is a base64-encoded 32-byte AES-256 key used to encrypt TOTP
secrets before persistence. The actual value must never be committed, logged, or
placed in the security register. Store it only in the deployment secret store.

## Database runtime role

Application traffic must connect through a non-superuser PostgreSQL role with
`NOBYPASSRLS` (the foundation role is `platform_app`). Administrative migration
credentials are separate from the application runtime credential. Using a
superuser or `BYPASSRLS` role for API traffic would invalidate the tenant
isolation boundary.


## Handoff 01 release gates

Before release, execute unit, integration, RLS isolation, authentication,
API-key revocation, idempotency, rate-limit, and security scanning checks.
Cross-tenant access failures are release blockers. Tests that cannot connect
to required infrastructure must not be interpreted as passing.
