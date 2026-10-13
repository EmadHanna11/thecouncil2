-- Development schema; Replit's Publish flow applies schema changes to production.
-- Never run schema mutations at application startup.
CREATE TABLE IF NOT EXISTS council_records (
  store text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (store, key)
);