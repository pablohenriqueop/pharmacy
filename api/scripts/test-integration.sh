#!/bin/bash
set -e

echo ">> Subindo Postgres de teste..."
docker compose -f docker-compose.test.yml up -d --wait

echo ">> Aguardando Postgres ficar pronto..."
until docker exec pharmacy_db_test pg_isready -U pharmacy_test > /dev/null 2>&1; do
  sleep 0.5
done

echo ">> Rodando migrations..."
DATABASE_URL="postgresql://pharmacy_test:pharmacy_test@localhost:5433/pharmacy_test" bun run db:generate 2>/dev/null || true
DATABASE_URL="postgresql://pharmacy_test:pharmacy_test@localhost:5433/pharmacy_test" bun run db:migrate

echo ">> Rodando testes de integração..."
DATABASE_URL="postgresql://pharmacy_test:pharmacy_test@localhost:5433/pharmacy_test" \
BETTER_AUTH_SECRET="test-secret-key-minimum-32-chars!!" \
BETTER_AUTH_URL="http://localhost:3000" \
bun test --coverage src/test/integration/

EXIT_CODE=$?

echo ">> Derrubando Postgres de teste..."
docker compose -f docker-compose.test.yml down

exit $EXIT_CODE
