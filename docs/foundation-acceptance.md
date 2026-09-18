# Foundation Acceptance Gate

The foundation is not release-ready until these cases pass against PostgreSQL 17:

1. Tenant A user can read only Tenant A membership-owned rows.
2. Tenant A cannot SELECT, UPDATE, DELETE, or INSERT Tenant B membership/seat/API-key/audit/idempotency rows.
3. A revoked API key receives 401.
4. An API key cannot access another tenant.
5. A session cannot select a tenant without an active membership.
6. Password reset revokes existing sessions.
7. MFA recovery codes are single-use.
8. Audit events contain request correlation identifiers at the API boundary.
9. Redis failure causes readiness failure without deleting persistent PostgreSQL state.
10. No test or log output contains plaintext passwords, API keys, session tokens, or recovery codes.

Cross-tenant failures are release blockers.


## RLS invariant

Tenant membership RLS is tenant-scoped, not user-row-scoped. A user with an
authorized tenant-management role may read/manage membership rows belonging to
their active tenant; PostgreSQL RLS must still prevent access to every other
tenant.


## Executable RLS gate

Run the database integration suite with a PostgreSQL 17 database:

```text
pnpm --filter @platform/database test:integration
```

The suite executes SELECT, UPDATE, DELETE, and INSERT cross-tenant attempts
through the `platform_app` runtime role. Missing `DATABASE_URL` skips the
integration suite rather than claiming a pass.


## Security contract gate

The API package contains non-network security contract tests covering tenant
selection, membership authorization, session revocation, recovery-code
single-use semantics, and idempotency request identity. These tests complement
the PostgreSQL integration suite and do not substitute for live acceptance
testing.


## Final-candidate audit

`docs/handoff-01-final-candidate-audit.json` records the last static audit.
A `BLOCKED` gate is intentionally not treated as a pass. The final release
requires live PostgreSQL 17 and Redis execution plus the repository's pnpm
install/build/typecheck/test pipeline.
