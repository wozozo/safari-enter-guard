# Safari Enter Guard

Safari Enter Guard is a Safari Web Extension that prevents accidental form submission when pressing Enter to confirm Japanese IME conversion.

## Behavior

- Blocks Enter while a text field is in IME composition.
- Blocks the first Enter immediately after `compositionend`, which covers Safari cases where the confirming Enter arrives after composition has technically ended.
- Blocks related `keypress`, `keyup`, and form `submit` events in the same short window.
- Leaves normal Enter behavior intact after the IME confirmation Enter has been consumed.

## Local Testing

1. Open Safari settings.
2. Enable developer features, then allow unsigned extensions if needed.
3. Load `WebExtension` as a temporary extension.
4. Start a local server from this repository:

   ```sh
   python3 -m http.server 8765
   ```

5. Open `http://localhost:8765/test/ime-enter-harness.html`.
6. In a Japanese IME, type into the message box and press Enter to confirm conversion. The message should not send until Enter is pressed again after composition is complete.

For packaged macOS builds, generate the Xcode wrapper with:

```sh
xcrun safari-web-extension-converter WebExtension \
  --project-location . \
  --app-name SafariEnterGuard \
  --bundle-identifier com.example.SafariEnterGuard \
  --swift \
  --macos-only \
  --copy-resources \
  --no-open \
  --no-prompt \
  --force
```

## Release

`WebExtension` is the source of truth for extension resources. Before archiving, check that the Xcode resources are in sync:

```sh
./script/sync_web_extension.sh --check
```

To sync the copied Xcode resources after editing `WebExtension`:

```sh
./script/sync_web_extension.sh
```

Create a signed App Store archive with:

```sh
DEVELOPMENT_TEAM=YOURTEAMID ./script/archive_app_store.sh archive
```

Upload to App Store Connect with:

```sh
DEVELOPMENT_TEAM=YOURTEAMID ./script/archive_app_store.sh --upload
```

The App Store privacy answer should be `Data Not Collected`. Use the GitHub Pages pages under `docs/` for the privacy policy and support URLs.

Before a real App Store release, replace the placeholder bundle identifiers in the Xcode project:

- `com.example.SafariEnterGuard`
- `com.example.SafariEnterGuard.Extension`

Use bundle identifiers registered in your Apple Developer account.
