#!/bin/bash
set -e

echo "☀️  Installing Zo Promise Keeper..."
echo ""

DATA_DIR="/home/workspace/promise-keeper-data"
if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR"
  echo '{"promises":[],"people":[],"nextPromiseId":1,"nextPersonId":1}' > "$DATA_DIR/promises.json"
  echo "✅ Created data directory: $DATA_DIR"
else
  echo "✅ Data directory already exists: $DATA_DIR"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "📦 Installing routes to Zo Space..."
echo "   Paste the following into Zo chat:"
echo ""
echo "────────────────────────────────────"
echo ""
echo "   Install Zo Promise Keeper from the repo at:"
echo "   $SCRIPT_DIR"
echo ""
echo "   1. Create API route at /api/promise-keeper"
echo "      → Use code from: routes/api-promise-keeper.ts"
echo ""
echo "   2. Create page route at /promise-keeper"
echo "      → Use code from: routes/page-promise-keeper.tsx"
echo ""
echo "────────────────────────────────────"
echo ""
echo "Or tell Zo:"
echo ""
echo '   "Install Zo Promise Keeper from zo-promise-keeper/"'
echo ""
echo "☀️  Done! Once routes are deployed, visit:"
echo "   https://<your-handle>.zo.space/promise-keeper"
echo ""
