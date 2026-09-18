COMMENT ON COLUMN mfa_credentials.secret_encrypted IS
  'AES-256-GCM encrypted TOTP secret; encryption key is held outside PostgreSQL.';
