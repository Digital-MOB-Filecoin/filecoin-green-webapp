#!/bin/bash
set -e

BASE_URL="https://api.filecoin.energy"
START="2025-12-14"
END="2026-06-14"
OUT="public/data"

mkdir -p "$OUT"

echo "Fetching models list..."
curl -sf "$BASE_URL/models/list" -o "$OUT/models-list.json"
echo "  -> $OUT/models-list.json"

echo "Fetching map list..."
curl -sf "$BASE_URL/map/list" -o "$OUT/map-list.json"
echo "  -> $OUT/map-list.json"

CHART_IDS=(0 1 2 3 4 5 6 7 12 13 14)
FILTERS=(day week month)

echo "Fetching chart data..."
for id in "${CHART_IDS[@]}"; do
  for filter in "${FILTERS[@]}"; do
    FILE="$OUT/model-$id-$filter.json"
    curl -sf "$BASE_URL/models/model?id=$id&start=$START&end=$END&filter=$filter" -o "$FILE"
    echo "  -> $FILE"
  done
done

echo "Done. $(ls $OUT | wc -l | tr -d ' ') files saved to $OUT/"
