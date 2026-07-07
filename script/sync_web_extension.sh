#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-sync}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/WebExtension/"
TARGET_DIR="$ROOT_DIR/SafariEnterGuard/SafariEnterGuard Extension/Resources/"

usage() {
  echo "usage: $0 [sync|--check]" >&2
}

case "$MODE" in
  sync)
    rsync -a --delete --exclude='.DS_Store' "$SOURCE_DIR" "$TARGET_DIR"
    ;;
  --check|check)
    TMP_DIR="$(mktemp -d)"
    trap 'rm -rf "$TMP_DIR"' EXIT
    rsync -a --delete --exclude='.DS_Store' "$SOURCE_DIR" "$TMP_DIR/Resources/"
    diff -ru "$TMP_DIR/Resources" "$TARGET_DIR"
    ;;
  *)
    usage
    exit 2
    ;;
esac
