#!/usr/bin/env bash
set -euo pipefail

echo "=== VM Backend Setup Script ==="

# 1. Install MySQL
echo "Installing MySQL..."
sudo apt-get update
sudo apt-get install -y mysql-server-5.7

# 2. Configure MySQL
echo "Configuring MySQL..."
# Allow remote connections
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# 3. Create database and user
echo "Setting up database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ecommerce_db;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'compresso'@'%' IDENTIFIED BY 'compresso_pass';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'compresso'@'%';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 4. Import schema & data
echo "Importing database schema and sample data..."
sudo mysql ecommerce_db < database/init.sql
sudo mysql ecommerce_db < database/sample_data.sql

# 5. Build & run backend container
echo "Setting up backend service..."
docker rm -f compresso-backend 2>/dev/null || true
(cd backend && docker build -t compresso-backend .)
docker run -d --name compresso-backend \
  --env-file backend/.env \
  --restart=always \
  -p 80:5000 \
  -e DB_HOST=localhost \
  -e DB_USER=compresso \
  -e DB_PASS=compresso_pass \
  -e DB_NAME=ecommerce_db \
  --network=host \
  compresso-backend

echo "✅ VM backend is up (Native MySQL + API)."
