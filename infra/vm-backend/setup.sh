#!/usr/bin/env bash
set -euo pipefail

echo "=== VM Backend Setup Script ==="
# 1. Docker network
if ! docker network ls --format '{{.Name}}' | grep -q '^compresso-net$'; then
  docker network create compresso-net
fi

# 2. MySQL container
docker rm -f db 2>/dev/null || true
docker run -d --network compresso-net --name db \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
  -e MYSQL_DATABASE=ecommerce_db \
  mysql:5.7
sleep 10

# 3. Import schema & data
docker cp database/init.sql db:/init.sql
docker exec db sh -c "mysql -u root ecommerce_db < /init.sql"
docker cp database/sample_data.sql db:/sample_data.sql
docker exec db sh -c "mysql -u root ecommerce_db < /sample_data.sql"

# 4. Build & run backend
docker rm -f compresso-backend 2>/dev/null || true
(cd backend && docker build -t compresso-backend .)
docker run -d --network compresso-net --name compresso-backend \
  --env-file backend/.env --restart=always -p 80:5000 \
  compresso-backend

echo "✅ VM backend is up (DB + API)."
