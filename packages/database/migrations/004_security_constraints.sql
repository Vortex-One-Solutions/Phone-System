CREATE UNIQUE INDEX IF NOT EXISTS uq_active_mfa_recovery_code
  ON mfa_recovery_codes(user_id, code_hash)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_password_reset_active
  ON password_reset_tokens(token_hash, expires_at)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_active
  ON sessions(user_id, expires_at)
  WHERE revoked_at IS NULL;
