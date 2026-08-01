#!/usr/bin/env bash
# Package src/ into a Chrome Web Store zip (manifest at archive root).
# Uses Python's zipfile so CI does not depend on the zip CLI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src"
OUT_DIR="${1:-$ROOT/store}"

if [[ ! -f "$SRC/manifest.json" ]]; then
  echo "error: missing $SRC/manifest.json" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Emit version= / zip_path= / Wrote … for CI parsing
python3 - "$SRC" "$OUT_DIR" <<'PY'
import json
import sys
import zipfile
from pathlib import Path

src = Path(sys.argv[1]).resolve()
out_dir = Path(sys.argv[2]).resolve()
manifest = src / "manifest.json"
version = json.loads(manifest.read_text(encoding="utf-8"))["version"]
out_zip = out_dir / f"chromecuts-{version}.zip"

skip_names = {".DS_Store", ".git"}
skip_suffixes = (".pyc",)

if out_zip.exists():
    out_zip.unlink()

count = 0
with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for path in sorted(src.rglob("*")):
        if not path.is_file():
            continue
        if any(part in skip_names for part in path.parts):
            continue
        if path.name in skip_names or path.suffix in skip_suffixes:
            continue
        arcname = path.relative_to(src).as_posix()
        zf.write(path, arcname)
        count += 1

names = zipfile.ZipFile(out_zip).namelist()
if "manifest.json" not in names:
    raise SystemExit(
        "error: manifest.json not at zip root; got: "
        + ", ".join(names[:20])
    )

print(f"Wrote {out_zip} ({count} files)")
print(f"version={version}")
print(f"zip_path={out_zip}")
PY
