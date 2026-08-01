#!/usr/bin/env bash
# Package src/ into a Chrome Web Store zip (manifest at archive root).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src"
OUT_DIR="${1:-$ROOT/store}"
VERSION="$(python3 -c "import json; print(json.load(open('$SRC/manifest.json'))['version'])")"
OUT_ZIP="$OUT_DIR/chromecuts-${VERSION}.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_ZIP"

(
  cd "$SRC"
  zip -r "$OUT_ZIP" . \
    -x "*.DS_Store" \
    -x "**/.DS_Store" \
    -x "*/.git/*"
)

# Sanity: manifest must be at zip root
if ! unzip -l "$OUT_ZIP" | awk '{print $4}' | grep -qx 'manifest.json'; then
  echo "error: manifest.json not at zip root" >&2
  exit 1
fi

echo "Wrote $OUT_ZIP"
echo "version=$VERSION"
echo "zip_path=$OUT_ZIP"
