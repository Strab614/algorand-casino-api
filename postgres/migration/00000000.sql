CREATE TABLE platforms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL,
  address VARCHAR(58) NOT NULL, /* algorand address */
  webhook_url TEXT NOT NULL
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  platform_id INT NOT NULL,
  status INT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  sender VARCHAR(58) NOT NULL, /* algorand address */
  asset_id INT NOT NULL,
  amount INT NOT NULL,
  transaction_id VARCHAR(52),
  external_id INT NOT NULL, /* used for webhook calls to notify platform */
  CONSTRAINT fk_platform_id FOREIGN KEY (platform_id) REFERENCES platforms (id),
  UNIQUE (transaction_id),
  UNIQUE (platform_id, external_id)
);