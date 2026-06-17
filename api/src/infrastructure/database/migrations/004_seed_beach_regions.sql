INSERT INTO beach_region (name, latitude, longitude, city, status) VALUES
  ('Copacabana',    -22.971100, -43.182200, 'Rio de Janeiro', 'active'),
  ('Ipanema',       -22.986800, -43.200500, 'Rio de Janeiro', 'active'),
  ('Barra da Tijuca', -23.009100, -43.365600, 'Rio de Janeiro', 'active'),
  ('Leblon',        -22.984800, -43.222800, 'Rio de Janeiro', 'active'),
  ('Flamengo',      -22.931400, -43.173600, 'Rio de Janeiro', 'active'),
  ('Recreio dos Bandeirantes', -23.022500, -43.464200, 'Rio de Janeiro', 'active')
ON CONFLICT DO NOTHING;
