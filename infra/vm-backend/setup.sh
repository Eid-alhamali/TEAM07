#!/usr/bin/env bash
set -euo pipefail

echo "=== VM Backend Setup Script ==="

# 1. Ensure we're in repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT" || exit
echo "Working directory: $REPO_ROOT"

# 2. Create Docker network if needed
if ! docker network ls --format '{{.Name}}' | grep -q '^compresso-net$'; then
  echo "Creating Docker network: compresso-net"
  docker network create compresso-net
else
  echo "Docker network compresso-net already exists"
fi

# 3. Launch MySQL container
echo "Starting MySQL container (mysql:5.7) as 'db'"
docker rm -f db 2>/dev/null || true
docker run -d \
  --network compresso-net \
  --name db \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
  -e MYSQL_DATABASE=ecommerce_db \
  mysql:5.7

echo "Waiting 10 seconds for MySQL to initialize..."
sleep 10

# 4. Import schema & sample data
echo "Importing schema from database/init.sql"
docker cp database/init.sql db:/init.sql
docker exec db sh -c "mysql -u root ecommerce_db < /init.sql"

echo "Importing sample data from database/sample_data.sql"
docker cp database/sample_data.sql db:/sample_data.sql
docker exec db sh -c "mysql -u root ecommerce_db < /sample_data.sql"

# 5. Build backend image
echo "Building backend image 'compresso-backend'"
docker build -t compresso-backend backend

# 6. Run backend container
echo "Starting backend container"
docker rm -f compresso-backend 2>/dev/null || true
docker run -d \
  --network compresso-net \
  --name compresso-backend \
  --env-file backend/.env \
  --restart=always \
  -p 80:5000 \
  compresso-backend

# 7. Auto-detect VM External IP and display URL
VM_IP=$(curl -s -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip")

echo "✅ Setup complete! Your API is reachable at http://$VM_IP/api/products"
