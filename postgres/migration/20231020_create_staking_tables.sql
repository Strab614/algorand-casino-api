CREATE TABLE staking_periods (
  id SERIAL PRIMARY KEY,
  registration_begin TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  commitment_begin TIMESTAMP WITH TIME ZONE NOT NULL,
  commitment_end TIMESTAMP WITH TIME ZONE NOT NULL,
  chip_ratio NUMERIC NOT NULL
);

CREATE TABLE staking_commitments (
  id SERIAL PRIMARY KEY,
  staking_period_id INT NOT NULL,
  algorand_address VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  chip_commitment NUMERIC NOT NULL,
  liquidity_commitment NUMERIC NOT NULL,
  liquidity_commitment_v2 NUMERIC,
  eligible BOOLEAN NOT NULL,
  CONSTRAINT fk_staking_period_id FOREIGN KEY (staking_period_id) REFERENCES staking_periods (id),
  UNIQUE (staking_period_id, algorand_address)
);

CREATE TABLE staking_results (
  id SERIAL PRIMARY KEY,
  staking_period_id INT NOT NULL,
  profit NUMERIC NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT fk_staking_period_id FOREIGN KEY (staking_period_id) REFERENCES staking_periods (id),
  UNIQUE (staking_period_id)
);