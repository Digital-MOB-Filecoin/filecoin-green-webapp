#!/bin/bash
set -e

BASE_URL="https://api.filecoin.energy"
END="2026-06-14"
OUT="public/data"

mkdir -p "$OUT"

# Remove old files that used the old naming (no interval suffix)
echo "Removing old chart files..."
for id in 0 1 2 3 4 5 6 7 12 13 14; do
  for filter in day week month; do
    rm -f "$OUT/model-$id-$filter.json"
  done
done

echo "Fetching models list..."
curl -sf "$BASE_URL/models/list" -o "$OUT/models-list.json"
echo "  -> $OUT/models-list.json"

echo "Fetching map list..."
curl -sf "$BASE_URL/map/list" -o "$OUT/map-list.json"
echo "  -> $OUT/map-list.json"

CHART_IDS=(0 1 2 3 4 5 6 7 12 13 14)
FILTERS=(day week month)

get_start() {
  case $1 in
    1m) echo "2026-05-14" ;;
    3m) echo "2026-03-14" ;;
    6m) echo "2025-12-14" ;;
    1y) echo "2025-06-14" ;;
    3y) echo "2023-06-14" ;;
    5y) echo "2021-06-14" ;;
  esac
}

INTERVAL_KEYS=(1m 3m 6m 1y 3y 5y)

echo "Fetching chart data (${#CHART_IDS[@]} models × ${#FILTERS[@]} filters × ${#INTERVAL_KEYS[@]} intervals)..."
for id in "${CHART_IDS[@]}"; do
  for filter in "${FILTERS[@]}"; do
    for interval in "${INTERVAL_KEYS[@]}"; do
      FILE="$OUT/model-$id-$filter-$interval.json"
      START=$(get_start "$interval")
      curl -sf "$BASE_URL/models/model?id=$id&start=$START&end=$END&filter=$filter" -o "$FILE"
      echo "  -> $FILE"
    done
  done
done

echo "Done. $(ls $OUT | wc -l | tr -d ' ') files saved to $OUT/"
