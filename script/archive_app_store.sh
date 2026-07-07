#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-archive}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_PATH="$ROOT_DIR/SafariEnterGuard/SafariEnterGuard.xcodeproj"
SCHEME="SafariEnterGuard"
TEAM_ID="${DEVELOPMENT_TEAM:-}"
ARCHIVE_PATH="$ROOT_DIR/build/archives/SafariEnterGuard.xcarchive"
EXPORT_PATH="$ROOT_DIR/build/app-store"
EXPORT_OPTIONS="$ROOT_DIR/ExportOptions-AppStore.plist"
APP_IN_ARCHIVE="$ARCHIVE_PATH/Products/Applications/SafariEnterGuard.app"
EXTENSION_IN_ARCHIVE="$APP_IN_ARCHIVE/Contents/PlugIns/SafariEnterGuard Extension.appex"

usage() {
  echo "usage: $0 [archive|validate|--upload]" >&2
}

archive() {
  if [[ -z "$TEAM_ID" ]]; then
    echo "DEVELOPMENT_TEAM is required, for example: DEVELOPMENT_TEAM=ABCDE12345 $0 archive" >&2
    exit 2
  fi

  "$ROOT_DIR/script/sync_web_extension.sh" --check
  xcodebuild archive \
    -project "$PROJECT_PATH" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination "generic/platform=macOS" \
    -archivePath "$ARCHIVE_PATH" \
    -allowProvisioningUpdates \
    DEVELOPMENT_TEAM="$TEAM_ID"
}

validate_archive() {
  codesign -dvvv --entitlements :- "$APP_IN_ARCHIVE"
  codesign -dvvv --entitlements :- "$EXTENSION_IN_ARCHIVE"
}

case "$MODE" in
  archive)
    archive
    validate_archive
    ;;
  validate)
    validate_archive
    ;;
  --upload|upload)
    archive
    rm -rf "$EXPORT_PATH"
    xcodebuild -exportArchive \
      -archivePath "$ARCHIVE_PATH" \
      -exportPath "$EXPORT_PATH" \
      -exportOptionsPlist "$EXPORT_OPTIONS" \
      -allowProvisioningUpdates
    ;;
  *)
    usage
    exit 2
    ;;
esac
