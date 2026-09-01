-- Instant Mechanic — Live Operations Dashboard
-- Schema: customers, vehicles, services, mechanics, bookings

CREATE TABLE customers (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  phone       VARCHAR(20)  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
  id              SERIAL PRIMARY KEY,
  customer_id     INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  make            VARCHAR(50) NOT NULL,
  model           VARCHAR(50) NOT NULL,
  year            INT,
  license_plate   VARCHAR(20) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  category    VARCHAR(50) NOT NULL,
  base_price  NUMERIC(10,2) NOT NULL
);

CREATE TABLE mechanics (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  specialization  VARCHAR(80),
  status          VARCHAR(20) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'busy', 'offline')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id            SERIAL PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(id),
  vehicle_id    INT NOT NULL REFERENCES vehicles(id),
  service_id    INT NOT NULL REFERENCES services(id),
  mechanic_id   INT REFERENCES mechanics(id),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'assigned', 'on_the_way', 'completed', 'cancelled')),
  amount        NUMERIC(10,2) NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes backing dashboard filters, sorting, and time-series charts
CREATE INDEX idx_bookings_status       ON bookings(status);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_customer     ON bookings(customer_id);
CREATE INDEX idx_bookings_mechanic     ON bookings(mechanic_id);
CREATE INDEX idx_bookings_service      ON bookings(service_id);

-- Keep updated_at accurate on every status change, without relying on the app layer
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Users — authentication + role-based access (customer / mechanic / ops).
-- Applied via db/migrations/001_add_users.sql; kept here for documentation.
CREATE TABLE users (
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

CREATE UNIQUE INDEX idx_users_customer_id ON users(customer_id) WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX idx_users_mechanic_id ON users(mechanic_id) WHERE mechanic_id IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
