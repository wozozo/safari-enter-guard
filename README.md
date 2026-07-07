# Safari Enter Guard

Safari Web Extension that prevents accidental form submission when pressing Enter to confirm CJK IME conversion.

## What it does

- Blocks Enter during IME composition.
- Blocks the first Enter immediately after composition ends.
- Keeps normal Enter behavior after the conversion-confirming Enter is consumed.
- Does not collect, store, or send user data.

## Development

`WebExtension` is the source of truth. Sync it into the Safari wrapper with:

```sh
./script/sync_web_extension.sh
```

Build and run locally:

```sh
./script/build_and_run.sh
```

Use it in local Safari:

1. Run the app with `./script/build_and_run.sh`.
2. In Safari, enable `Develop > Allow Unsigned Extensions`.
3. Open `Safari > Settings > Extensions`.
4. Enable Safari Enter Guard and allow it on the sites you want.

Test page:

```sh
python3 -m http.server 8765
open http://localhost:8765/test/ime-enter-harness.html
```

## Release Notes

The checked-in bundle IDs are placeholders:

- `com.example.SafariEnterGuard`
- `com.example.SafariEnterGuard.Extension`

Replace them with IDs from your Apple Developer account before release.

For App Store archiving:

```sh
DEVELOPMENT_TEAM=YOURTEAMID ./script/archive_app_store.sh archive
```

App Store privacy answer: `Data Not Collected`.
