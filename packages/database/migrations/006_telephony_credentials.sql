ALTER TABLE telephony_providers ADD COLUMN IF NOT EXISTS connection_id VARCHAR(150);
ALTER TABLE telephony_providers ADD COLUMN IF NOT EXISTS credential_id VARCHAR(150);
CREATE INDEX IF NOT EXISTS idx_telephony_providers_connection ON telephony_providers(tenant_id, connection_id);

[executed on device: codespaces-73d925 (e215b2d9-1319-4805-9ed4-b434928d4042)]