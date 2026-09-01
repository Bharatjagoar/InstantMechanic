-- Migration 001: add users table for authentication + role-based access.
-- Purely additive — safe to run against the live, seeded database.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'mechanic', 'ops')),
  customer_id   INT REFERENCES customers(id) ON DELETE CASCADE,
  mechanic_id   INT REFERENCES mechanics(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_role_link_chk CHECK (
    (role = 'customer' AND customer_id IS NOT NULL AND mechanic_id IS NULL) OR
    (role = 'mechanic' AND mechanic_id IS NOT NULL AND customer_id IS NULL) OR
    (role = 'ops'      AND customer_id IS NULL     AND mechanic_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id) WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mechanic_id ON users(mechanic_id) WHERE mechanic_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
