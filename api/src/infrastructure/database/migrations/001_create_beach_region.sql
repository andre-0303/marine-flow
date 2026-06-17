CREATE TABLE IF NOT EXISTS beach_region (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  city VARCHAR(80) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);
