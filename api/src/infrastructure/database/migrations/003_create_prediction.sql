CREATE TABLE IF NOT EXISTS prediction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_region_id UUID NOT NULL REFERENCES beach_region(id),
  ocean_condition_id UUID NOT NULL REFERENCES ocean_condition(id),
  risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level VARCHAR(10) NOT NULL,
  explanation TEXT NOT NULL,
  forecast_hours INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
