-- Azure Database for PostgreSQL schema for the NewPort Portal.
-- NILS remains the source of truth for official BL data and workflow states.

CREATE TYPE organisation_type AS ENUM ('customer', 'forwarder');
CREATE TYPE portal_role AS ENUM ('newport_admin', 'external_user');
CREATE TYPE user_status AS ENUM ('invited', 'active', 'deactivated');

CREATE TABLE organisations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  organisation_type organisation_type NOT NULL,
  relation_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE portal_users (
  id UUID PRIMARY KEY,
  identity_subject TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role portal_role NOT NULL DEFAULT 'external_user',
  status user_status NOT NULL DEFAULT 'invited',
  organisation_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bills_of_lading (
  bol_id BIGINT PRIMARY KEY,
  bol_number TEXT,
  status TEXT NOT NULL,
  customer_reference TEXT,
  product TEXT,
  place_of_receipt TEXT,
  port_of_loading TEXT,
  port_of_discharge TEXT,
  place_of_delivery TEXT,
  created_at_source TIMESTAMPTZ,
  updated_at_source TIMESTAMPTZ,
  source_version TEXT,
  detail_snapshot JSONB NOT NULL,
  portal_access_party JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bills_of_lading_status_idx ON bills_of_lading(status);
CREATE INDEX bills_of_lading_created_idx ON bills_of_lading(created_at_source DESC);
CREATE INDEX bills_of_lading_access_idx ON bills_of_lading USING GIN(portal_access_party);

CREATE TABLE secure_links (
  id UUID PRIMARY KEY,
  bol_id BIGINT NOT NULL REFERENCES bills_of_lading(bol_id),
  token_hash TEXT NOT NULL UNIQUE,
  requested_email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE correction_audit (
  id UUID PRIMARY KEY,
  bol_id BIGINT NOT NULL REFERENCES bills_of_lading(bol_id),
  submitted_by UUID NOT NULL REFERENCES portal_users(id),
  organisation_id UUID NOT NULL REFERENCES organisations(id),
  changes JSONB NOT NULL,
  terms_version TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
