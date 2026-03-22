#!/bin/bash
set -e

echo "☀️  Deploying Zo Promise Keeper..."

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="/home/workspace/promise-keeper-data"

if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR"
  echo '{"promises":[],"people":[],"nextPromiseId":1,"nextPersonId":1}' > "$DATA_DIR/promises.json"
  echo "✅ Created data directory"
fi

echo "📡 Deploying API route..."
curl -s -X POST http://localhost:3099/__space/routes \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "
import json
code = open('$SCRIPT_DIR/routes/api-promise-keeper.ts').read()
print(json.dumps({'path': '/api/promise-keeper', 'route_type': 'api', 'code': code}))
")" > /dev/null

echo "✅ API route deployed at /api/promise-keeper"

echo "🎨 Deploying page route..."
curl -s -X POST http://localhost:3099/__space/routes \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "
import json
code = open('$SCRIPT_DIR/routes/page-promise-keeper.tsx').read()
print(json.dumps({'path': '/promise-keeper', 'route_type': 'page', 'code': code}))
")" > /dev/null

echo "✅ Page route deployed at /promise-keeper"
echo ""
echo "☀️  Zo Promise Keeper is live!"
echo "   Visit: https://\$(hostname).zo.space/promise-keeper"
