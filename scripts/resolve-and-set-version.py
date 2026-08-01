#!/usr/bin/env python3
"""Resolve the next ChromeCuts version, write it to src/manifest.json, print machine lines.

Source of truth order for the *current* version:
  max(src/manifest.json version, highest git tag vX.Y.Z)

Then either:
  --version X.Y.Z  (explicit, must be strictly greater), or
  --bump patch|minor|major  (default: patch)
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src" / "manifest.json"
VERSION_RE = re.compile(r"^\d+(\.\d+){0,3}$")
TAG_RE = re.compile(r"^v(\d+(?:\.\d+){0,3})$")


def parse_version(v: str) -> list[int]:
    if not VERSION_RE.fullmatch(v):
        raise SystemExit(f"Invalid version: {v!r} (use e.g. 1.0.1)")
    parts = [int(x) for x in v.split(".")]
    # Normalize to at least 3 components for bumping; keep 4th if present.
    while len(parts) < 3:
        parts.append(0)
    return parts


def format_version(parts: list[int]) -> str:
    # Drop trailing zeros beyond major.minor.patch only if we never had a 4th component
    # Keep simple: always emit major.minor.patch (or 4 if length was 4 and last != 0)
    if len(parts) >= 4 and parts[3] != 0:
        return ".".join(str(p) for p in parts[:4])
    return f"{parts[0]}.{parts[1]}.{parts[2]}"


def version_key(parts: list[int]) -> tuple[int, ...]:
    padded = parts + [0] * (4 - len(parts))
    return tuple(padded[:4])


def max_version(a: str, b: str | None) -> str:
    if b is None:
        return a
    return a if version_key(parse_version(a)) >= version_key(parse_version(b)) else b


def bump_version(parts: list[int], kind: str) -> list[int]:
    major, minor, patch = parts[0], parts[1], parts[2]
    if kind == "major":
        return [major + 1, 0, 0]
    if kind == "minor":
        return [major, minor + 1, 0]
    if kind == "patch":
        return [major, minor, patch + 1]
    raise SystemExit(f"Unknown bump kind: {kind}")


def latest_git_tag_version() -> str | None:
    try:
        out = subprocess.check_output(
            ["git", "tag", "-l", "v*", "--sort=-v:refname"],
            cwd=ROOT,
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    for line in out.splitlines():
        m = TAG_RE.fullmatch(line.strip())
        if m:
            return m.group(1)
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--version",
        default="",
        help="Explicit version (must be > current). Empty = auto-bump.",
    )
    parser.add_argument(
        "--bump",
        default="patch",
        choices=("patch", "minor", "major"),
        help="Auto-bump kind when --version is empty (default: patch).",
    )
    args = parser.parse_args()

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    manifest_version = data["version"]
    tag_version = latest_git_tag_version()
    current = max_version(manifest_version, tag_version)

    if args.version.strip():
        new = args.version.strip()
        parse_version(new)  # validate
        if version_key(parse_version(new)) <= version_key(parse_version(current)):
            raise SystemExit(
                f"New version {new} must be greater than current {current} "
                f"(manifest={manifest_version}, latest_tag={tag_version or 'none'})"
            )
        new_version = format_version(parse_version(new))
        mode = "explicit"
    else:
        new_version = format_version(bump_version(parse_version(current), args.bump))
        mode = f"auto-{args.bump}"

    # Refuse if tag already exists
    existing = subprocess.run(
        ["git", "rev-parse", "-q", "--verify", f"refs/tags/v{new_version}"],
        cwd=ROOT,
        capture_output=True,
    )
    if existing.returncode == 0:
        raise SystemExit(f"Git tag v{new_version} already exists")

    data["version"] = new_version
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    print(f"Version: {current} → {new_version} ({mode})")
    print(f"  manifest was {manifest_version}; latest tag was {tag_version or 'none'}")
    print(f"version={new_version}")
    print(f"previous={current}")
    print(f"mode={mode}")


if __name__ == "__main__":
    main()
