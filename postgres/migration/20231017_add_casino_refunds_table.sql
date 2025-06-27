CREATE TABLE casino_refunds (
  id SERIAL PRIMARY KEY,
  address VARCHAR(58) UNIQUE NOT NULL,
  refund_type INT NOT NULL,
  status INT NOT NULL,
  amount FLOAT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  user_profile JSONB NOT NULL,
  transaction_id VARCHAR(52) UNIQUE
);