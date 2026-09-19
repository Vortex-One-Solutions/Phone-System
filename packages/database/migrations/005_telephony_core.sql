CREATE TABLE IF NOT EXISTS telephony_providers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL CHECK (provider IN ('telnyx','twilio')),
  name VARCHAR(150) NOT NULL,
  api_base_url TEXT,
  api_key_encrypted TEXT,
  webhook_public_key TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DISABLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES telephony_providers(id) ON DELETE RESTRICT,
  e164 VARCHAR(32) NOT NULL,
  label VARCHAR(150),
  capabilities JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DISABLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, e164)
);

CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID,
  campaign_id UUID,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  phone_number_id UUID REFERENCES phone_numbers(id) ON DELETE SET NULL,
  direction VARCHAR(16) NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND')),
  state VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
  from_number VARCHAR(32) NOT NULL,
  to_number VARCHAR(32) NOT NULL,
  provider_call_id VARCHAR(150),
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  disposition VARCHAR(64),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_legs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  provider_call_id VARCHAR(150),
  leg_index INTEGER NOT NULL,
  state VARCHAR(32) NOT NULL DEFAULT 'CREATED',
  from_number VARCHAR(32),
  to_number VARCHAR(32),
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  UNIQUE (call_id, leg_index)
);

CREATE TABLE IF NOT EXISTS call_events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  provider_event_id VARCHAR(200),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider_event_id)
);

CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  provider_recording_id VARCHAR(150),
  storage_url TEXT,
  duration_seconds INTEGER,
  status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_suppressions (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  phone_e164 VARCHAR(32) NOT NULL,
  reason VARCHAR(64) NOT NULL,
  source VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, phone_e164)
);

CREATE INDEX IF NOT EXISTS idx_telephony_providers_tenant ON telephony_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_tenant ON phone_numbers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calls_tenant_created ON calls(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_legs_call ON call_legs(tenant_id, call_id);
CREATE INDEX IF NOT EXISTS idx_call_events_call ON call_events(tenant_id, call_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_recordings_call ON recordings(tenant_id, call_id);
CREATE INDEX IF NOT EXISTS idx_contact_suppressions_phone ON contact_suppressions(tenant_id, phone_e164);

ALTER TABLE telephony_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephony_providers FORCE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers FORCE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls FORCE ROW LEVEL SECURITY;
ALTER TABLE call_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_legs FORCE ROW LEVEL SECURITY;
ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_events FORCE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings FORCE ROW LEVEL SECURITY;
ALTER TABLE contact_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_suppressions FORCE ROW LEVEL SECURITY;

CREATE POLICY telephony_providers_isolation ON telephony_providers
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

CREATE POLICY phone_numbers_isolation ON phone_numbers
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

CREATE POLICY calls_isolation ON calls
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

CREATE POLICY call_legs_isolation ON call_legs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

CREATE POLICY call_events_isolation ON call_events
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

CREATE POLICY recordings_isolation ON recordings
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

CREATE POLICY contact_suppressions_isolation ON contact_suppressions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID);

GRANT SELECT, INSERT, UPDATE, DELETE ON telephony_providers, phone_numbers, calls, call_legs, call_events, recordings, contact_suppressions TO platform_app;
