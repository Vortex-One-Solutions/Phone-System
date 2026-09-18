-- Membership rows are tenant-owned. Role authorization is enforced by the API;
-- RLS must not reduce legitimate tenant-admin visibility to a single user row.
DROP POLICY IF EXISTS tenant_memberships_isolation ON tenant_memberships;
CREATE POLICY tenant_memberships_isolation ON tenant_memberships
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);
