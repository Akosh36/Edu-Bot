#!/bin/bash
set -e

echo "Installing PostgreSQL..."
sudo apt-get update > /dev/null
sudo apt-get install -y postgresql postgresql-contrib > /dev/null

echo "Starting PostgreSQL service..."
sudo service postgresql start || true

echo "Creating database and user..."
sudo -u postgres psql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS edubot;
DROP USER IF EXISTS edubot_user;

-- Create user
CREATE USER edubot_user WITH PASSWORD 'edubot_password';

-- Create database
CREATE DATABASE edubot OWNER edubot_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE edubot TO edubot_user;

-- Connect to the database and grant schema privileges
\c edubot
GRANT ALL ON SCHEMA public TO edubot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO edubot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO edubot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO edubot_user;
EOF

echo "Database setup complete!"
echo "DATABASE_URL=postgresql://edubot_user:edubot_password@localhost:5432/edubot"
