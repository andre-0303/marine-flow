CREATE TABLE IF NOT EXISTS ocean_condition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_region_id UUID NOT NULL REFERENCES beach_region(id),
  wind_speed DECIMAL(5,2) NOT NULL,
  current_strength DECIMAL(5,2) NOT NULL,
  tide_level DECIMAL(5,2) NOT NULL,
  pollution_density DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
