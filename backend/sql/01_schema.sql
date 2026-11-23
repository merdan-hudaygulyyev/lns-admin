-- LNS admin schema. Run against the "admin" database (DBeaver or npm run db:migrate).

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'members_currency') THEN
        CREATE TYPE members_currency AS ENUM ('TL', 'USD');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS admins (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
    id                 UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    username           VARCHAR(100)     NOT NULL UNIQUE,
    password_hash      TEXT             NOT NULL,
    full_name          VARCHAR(255)     NOT NULL,
    mother_name        VARCHAR(255)     NOT NULL,
    heir               VARCHAR(255)     NOT NULL,
    -- AES-256-GCM envelope: base64(iv):base64(authTag):base64(ciphertext)
    passport_number    TEXT             NOT NULL,
    -- HMAC-SHA256 blind index: lets us search an exact passport without decrypting every row.
    passport_hash      CHAR(64)         NOT NULL,
    birth_date         DATE             NOT NULL,
    secret_question    VARCHAR(500)     NOT NULL,
    secret_answer_hash TEXT             NOT NULL,
    email              VARCHAR(255)     NOT NULL UNIQUE,
    pin_code_hash      TEXT             NOT NULL,
    phone              VARCHAR(30)      NOT NULL,
    inviter            VARCHAR(255)     NOT NULL,
    product            VARCHAR(255)     NOT NULL,
    address            TEXT             NOT NULL,
    postal_index       VARCHAR(30)      NOT NULL,
    official_site      TEXT             NOT NULL,
    registration_date  DATE             NOT NULL,
    amount             NUMERIC(12, 2)   NOT NULL CHECK (amount > 0),
    currency           members_currency NOT NULL,
    image_path         TEXT             NOT NULL,
    created_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_members_username          ON members (username);
CREATE INDEX IF NOT EXISTS ix_members_email             ON members (email);
CREATE INDEX IF NOT EXISTS ix_members_full_name         ON members (full_name);
CREATE INDEX IF NOT EXISTS ix_members_phone             ON members (phone);
CREATE INDEX IF NOT EXISTS ix_members_registration_date ON members (registration_date);
CREATE INDEX IF NOT EXISTS ix_members_currency          ON members (currency);
CREATE INDEX IF NOT EXISTS ix_members_passport_hash     ON members (passport_hash);
CREATE INDEX IF NOT EXISTS ix_members_created_at        ON members (created_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_members_updated_at ON members;
CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
