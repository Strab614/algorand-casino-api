CREATE TABLE stake_profit_snapshots (
	id SERIAL PRIMARY KEY,
  staking_period_id INT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL,
	profit NUMERIC NOT NULL,
  CONSTRAINT fk_staking_period_id FOREIGN KEY (staking_period_id) REFERENCES staking_periods (id)
);