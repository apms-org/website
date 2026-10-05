# Docs gap report: old site vs new docs

> **Update 2026-10-05, about 21:15 IST (fact-checker).** The v12 MCP change, committed as `aef9bbf` at 21:02, changes several MCP entries below.
>
> - **The agent self-approval flow is gone.** The "preview, `tx_id` and `approve: true`" bullet under **agents** and the "Pending → Preview → Approved → Committed" states under **S-1** describe it. Now `add_entry`, `edit_entry` and `delete_entry` only queue a request, and each queued request logs `MCP_TX_REQUESTED`. Only **Approve** in the app's **Settings → AI access** applies the change. Sending `tx_id` with `approve: true` commits nothing (`CLI/src/mcp.go:280-290`).
> - **`check_installation` and `install_apm` were removed.** The server has 17 tools.
> - **`pm mcp config`** now prints the plain `pm mcp serve` entry, with no PowerShell bootstrap.
> - **The other MCP warnings still stand:** tokens printed on a bad token, `search_vault` returning secrets, the admin tools acting without approval, and checks made only at server start. See `_factcheck.md`, "MCP change (v12)".

Snapshot: 2026-10-05, 20:10 IST. Read-only audit by the "reference" agent. Other agents were writing while this ran, so re-check anything marked missing before acting on it.

## Sources

- **Live old site** https://apms-org.github.io/cli/: all 44 pages in its nav were fetched. 4 pages exist only on the live site, not in `CLI/docs`: `autofill_windows/`, `concepts/plugins/`, `guides/plugins/` and `reference/plugin-api/`. The live site is older than `CLI/docs`. It still has plugins and Windows autofill, and lacks the bridge, import and autolock material that `CLI/docs` added.
- **`CLI/docs/**/*.md`** (38 files) and **`CLI/mkdocs.yml`**. The nav also lists `autofill_windows.md`, which no longer exists in the repo.
- **Secondary old docs:** `CLI/README.md` and `CLI/mcp.md`. Both are stale. See the REMOVED section.
- **Checked against:** `CLI/` (Go engine, `pm`, `team/`), `GUI/` (Electron) and `extension/`. All paths below are relative to `apm_master/`.
- **New docs state at the snapshot:**
  - `cli/`: 24 pages, including `commands*`, `team-edition`, `scripting` and `recovery`.
  - `reference/`: only `index` and `environment-variables`.
  - `agents/`, `desktop/`, `extension/`, `getting-started/` and `security/`: as listed in the tree.

**Status legend**

| Status | Meaning |
|---|---|
| CURRENT | The old docs are still accurate |
| CHANGED | The topic still exists but works differently. The entry says how |
| REMOVED | Gone from the code |
| UNSURE | Can't be settled from the source alone |

## Summary

Most old-site topics are already covered by the new docs, and covered more accurately. The remaining gaps cluster in `reference/`, which has no pages yet even though other pages link to them. The rest are a few install and migration topics.

| Target section | Open gaps (CURRENT or CHANGED, not yet in new docs) |
|---|---|
| getting-started | 5 |
| desktop | 1 |
| cli | 4 |
| extension | 0 |
| agents | 0 |
| security | 2 (optional) |
| reference | 9 |
| **Total** | **21** |

There are also 40+ REMOVED items. Don't bring them back.

**Broken internal links in the new docs.** These pages are linked but don't exist yet:

| Page | Inbound links |
|---|---|
| `/docs/reference/file-locations` | 8 |
| `/docs/reference/apmignore` | 4 |
| `/docs/reference/environment-variables` | 3 (now exists) |
| `/docs/reference/policies` | 2 |
| `/docs/reference/apminject` | 1 |
| `/docs/reference/exit-codes` | 1 |

`reference/index.mdx` also links `/docs/reference/faq` and `/docs/reference/glossary`, which don't exist yet.

---

## Gaps by target section

Within each section, CURRENT and CHANGED topics that are missing come first.

### getting-started

**GS-1. One-line install scripts.** *Decision needed.*

- **Old docs:**
  - macOS and Linux: `curl -sSL https://raw.githubusercontent.com/aaravmaloo/apm/master/scripts/install.sh | bash`. Installs to `/usr/local/opt/apm/apm` (macOS) or `/opt/apm/apm` (Linux), symlinked to `/usr/local/bin/apm`.
  - Windows: `iwr …/install.ps1 | iex` into `%LOCALAPPDATA%\pm\apm.exe`.
- **Code: CHANGED and stale.**
  - `CLI/scripts/install.sh:3-6` targets the `aaravmaloo/apm` releases API.
  - `install.sh:65` looks for assets named `stable-*-{mac,linux}_{amd64,arm64}.tar.gz`, but `CLI/.github/workflows/release.yml:54,70` publishes `apm-<tag>-<goos>_<goarch>.tar.gz` to the repo `pm update` uses (`apms-org/apm`, `CLI/main.go:3187`). The script will most likely fail to find an asset.
  - It installs the command as **`apm`**, not `pm` (`install.sh:3,47-48,99`).
  - `CLI/scripts/install.ps1:3` only throws "Windows release assets are no longer published".
- **Target:** don't document these scripts. Either add one line to `getting-started/installation` and `cli/installation` saying there is no one-line installer, or ask the maintainers to fix `install.sh` (asset pattern, repo, command name) and delete `install.ps1`.

**GS-2. Homebrew and WinGet.** *UNSURE.*

- **Old docs:** nothing. `desktop/terminal` and `desktop/troubleshooting` already mention `brew upgrade pm`.
- **Code:** publishing workflows exist.
  - `CLI/.github/workflows/homebrew-release.yml:63-75` updates `aaravmaloo/homebrew-tap` `Formula/apm.rb`. It is a source build, and the formula is named `apm`.
  - `CLI/.github/workflows/winget.yml:49-53` publishes `*-windows_amd64.zip`.
- **Target:** confirm the tap and the WinGet package are live and what command name they install. If they are, add "Package managers" to `getting-started/installation` and `cli/installation`.

**GS-3. Preview and canary builds.**

- **Old docs:** stages Canary `can-8`, Beta `beta-8`, Pre-release `pre-8`, Release `v8`, with a "may corrupt your vault" warning. The README describes the tiers as Canary, Alpha, Beta, Stable.
- **Code: CHANGED.** `CLI/.github/workflows/release.yml:4-7` builds only tags `v*` and `can*`. The "Builds page" (`tree/master/build`) no longer exists.
- **Target:** a short "Canary builds" note in `cli/installation`, with a back-up-first warning. Beta and pre-release tags are not built, so leave them out.

**GS-4. Getting help.**

- **Old docs:** `getting-started/help.md` covered:
  - `pm --help` and `pm <cmd> --help`
  - running `pm info` and `pm cinfo` for bug reports
  - the issue tracker and the private security email
- **Code: CURRENT, with changes.**
  - `pm info` now prints user, install dir, vault, version, build, repo and support address (`CLI/main.go:1484-1535`). It no longer prints the Go version or OS/arch.
  - `pm --version` prints the bare version (`main.go:87-88`).
- **New docs:** split across `cli/index`, `desktop/troubleshooting` ("Report a problem") and `security/reporting`. Nothing covers getting help across all surfaces.
- **Target:** a "Getting help" section in `reference/faq`, or a card on `getting-started/index`. Include what to put in a bug report (`pm --version`, `pm info`, OS, app version).

**GS-5. A diagram of how the pieces connect.**

- **Old docs:** `concepts/architecture.md` had a layer diagram (CLI → domain → integration) and an "unlock → save" sequence.
- **Code: CHANGED.**
  - There is no plugin layer any more.
  - The desktop app runs the hidden `pm desktop` engine, a JSON-RPC backend over stdio (`CLI/desktop.go:163-165`).
  - The browser bridge listens on loopback `127.0.0.1:41417` (`CLI/desktop_bridge.go:26`), or uses the native messaging host `dev.apm.bridge` (`CLI/native_host.go`).
  - MCP runs over stdio.
- **New docs:** the relationships are described in prose in `desktop/index`, `extension/index`, `agents/index` and `getting-started/choose-your-surface`. No single diagram exists.
- **Target:** add a "How the pieces connect" text diagram to `getting-started/concepts`, in the same ASCII style as `security/encryption#key-hierarchy` since mermaid isn't supported: app ⇄ `pm desktop` engine ⇄ `vault.dat`, browser ⇄ bridge or native host, AI client ⇄ `pm mcp serve`, terminal `pm`.

### desktop

**D-1. Where the app keeps its own settings.** Not in the old docs, but needed for `reference/file-locations`.

- **Code:**
  - The app's userData is `<appData>/APM Desktop`, for example `~/Library/Application Support/APM Desktop` (`GUI/electron/main.js:20-21`).
  - `config.json` there stores `vaultPath` (`GUI/electron/paths.js:81-99`).
  - `APM_USER_DATA_DIR` overrides the folder (`main.js:20`).
  - `APM_PM_PATH` picks the `pm` binary (`paths.js:43`). It is documented in `desktop/install` but not in `reference/environment-variables`.
- **Target:** `desktop/index#where-your-data-lives`, `reference/file-locations` and `reference/environment-variables`.

Every other old-docs mention of the app is already covered: Settings → Sessions → Auto-lock, "Show website icons", "Clear icon cache" and "Other websites".

### cli

**C-1. Removed and renamed commands.**

- **Old docs:** several command forms that no longer work.
- **New docs:** `cli/commands#removed-in-12-0` lists only `pm plugins`, `pm audit` and `pm completion`.
- **Target:** extend that section into a removed-and-renamed table, and link it from `reference/faq`. Code status for each item is in the table below.

| Old command | Status | Evidence |
|---|---|---|
| `pm autofill start\|stop\|status\|list-profiles\|daemon`, `pm autocomplete enable\|disable\|start\|stop\|status`, `pm autocomplete window enable\|disable\|status` | REMOVED. The Windows daemon, the Ctrl+Shift+L hotkey and `{USERNAME}{TAB}{PASSWORD}{ENTER}` fill sequences are gone. Replaced by the browser extension | No autofill or autocomplete command in `CLI/main.go:3157-3178`. Only a leftover vault flag remains (`CLI/src/vault.go:382`, `CLI/src/cleanup.go:216-221`) |
| `pm autocomplete link-totp` | REMOVED. Use `pm totp link <entry> <domain>` | `CLI/main.go:3176`, `CLI/passkeys_cmd.go:301` |
| `pm audit` | Renamed to `pm logs` | `CLI/main.go:1166-1232` (already noted in the new docs) |
| `pm space remove`, `pm space current` | REMOVED. Only create, switch and list exist | `CLI/main.go:3019` |
| `pm cloud autosync` | Renamed to `pm cloud auto-sync --true` | `CLI/main.go:1731-1738` |
| `pm readonly <mins>` at the root | Now `pm mode readonly <mins>` only | `CLI/main.go:2229` (readonly is not in the root `AddCommand` at `main.go:3157`) |
| `pm import json\|csv\|txt <file>` | CHANGED to `pm import <file>` with auto-detection and `--from` | `CLI/transfer_cmd.go:330-369` (`ExactArgs(1)`) |
| `pm import … --decrypt` | REMOVED. Use `-p/--password`; pm prompts when needed | `CLI/transfer_cmd.go:357-358` |
| `pm export json\|csv\|txt` | CHANGED to `--format apm\|cxf\|bitwarden\|csv\|txt`. The command takes no positional arguments | `CLI/transfer_cmd.go:611-646` (`cobra.NoArgs`) |
| `pm export txt --no-password` | Renamed to `--without-password` | `CLI/transfer_cmd.go:642` |
| `pm policy load ./policies/` | CHANGED. Loads one policy **by name** from `<vault dir>/policies` | `CLI/main.go:2493-2510` |
| `pm-team dept info`, `pm-team user role` | Never existed or REMOVED. Use `dept list` and `user promote` | `CLI/team/main.go:206-517` |

**C-2. Troubleshooting `pm cloud`.**

- **Old docs:** troubleshooting entries for "OAuth token expired", "Vault not found on provider" and "HMAC verification failed after download". None of these strings exist in the code.
- **Code:** the real messages, all CURRENT, with their pointers:

| Message | Where |
|---|---|
| `Cloud sync is already initialized.` | `CLI/main.go:1594` |
| `Cloud sync not initialized. Run 'pm cloud init' first.` | `main.go:1694` |
| `Unsupported cloud provider '%s'. Use gdrive, github, dropbox, or all.` | `main.go:1647` |
| `Missing GitHub repo. Use owner/repo.` | `main.go:1868` |
| `A retrieval key or direct cloud file identifier is required.` | `main.go:1932` |
| `Key resolution failed: …` | `main.go:2002` |
| `no vault found with key '<key>'` | `CLI/src/cloud.go:192` |
| `direct download failed for '<x>'. please use provider-specific retrieval.` | `cloud.go:210` |
| `Failed to decrypt cloud vault with the current master password: …` | `main.go:2046` |
| `Failed to apply .apmignore for upload: …` | `main.go:144,204,5539` |
| `Usage: pm cloud auto-sync --true` | `main.go:1737` |

- **New docs:** `cli/cloud-sync` has no troubleshooting section. `desktop/troubleshooting#sync-fails` covers only the app.
- **Target:** `cli/cloud-sync#troubleshooting`, or `reference/faq`.

**C-3. Which commands need a session.** *Optional.*

- **Old docs:** `concepts/sessions.md` had a "Session interaction matrix": requires a session, read-only OK, ephemeral OK, per command.
- **Code: CHANGED.**
  - Commands that need the vault don't fail without a session. They prompt for the master password (or Touch ID) and continue (`CLI/main.go:3708-3830`).
  - An ephemeral session with scope `read` is read-only. Scope `write` allows writes (`main.go:3716-3727`, `CLI/src/auth_logic.go:24-37`).
  - These don't touch the vault and need no unlock: `pm info`, `pm cinfo` (reads the header only, `main.go:1057-1092`), `pm gen`, `pm compromise`, `pm update`, `pm extension status` and `pm extension status`.
  - The old "Autofill daemon" row is REMOVED.
- **Target:** a small table in `cli/scripting` or `cli/sessions`.

**C-4. `pm cinfo` on a legacy vault.** *Fact-check note.*

- **Code:** `pm cinfo` always prints `KDF:       Argon2id` (`CLI/main.go:1083`), even when the profile is `legacy` (PBKDF2, `CLI/src/utils.go:71-80`).
- **New docs:** `cli/commands-vault` already notes the `Memory … KB` label quirk.
- **Target:** add a sentence to `cli/commands-vault#pm-cinfo`, or tell the maintainers.

### extension

**No open gaps.** Every extension item in the old docs is covered:

- the bridge on `127.0.0.1:41417` and `APM_BRIDGE_PORT`
- pairing, `pm extension link|status|unlink` and the browser list
- the `dev.apm.bridge` native host
- several websites per login and "Fill and remember"
- passkeys and `siteIcons` / `APM_ICONS_OFFLINE`

The only leftover is the icon cache internals, which belong in `reference/file-locations` (R-1).

### agents

**No open gaps.** All old MCP topics are covered in `agents/*`:

- tokens, client config and `pm mcp token --auto`
- the preview, `tx_id` and `approve: true` flow
- ephemeral sessions with `APM_EPHEMERAL_ID` and `APM_EPHEMERAL_AGENT`
- revocation and the tool list

The new docs use the current tool names. Make sure no writer copies tool names from the old pages; see the REMOVED section.

### security

**S-1. Lifecycle diagrams.** *Optional.*

- **Old docs:** mermaid diagrams for:
  - the session lifecycle (Locked ⇄ Unlocked, expired or idle back to Locked)
  - the ephemeral session sequence (issue → pass ID → `APM_EPHEMERAL_ID=… pm get` → expiry)
  - the MCP transaction states (Pending → Preview → Approved → Committed, or Expired)
- **Code: CHANGED.**
  - Sessions now also end on sleep (`CLI/src/session.go:26-41`).
  - Defaults are 15 min idle and 1 h maximum (`CLI/lock_policy.go:26-31`).
  - MCP transactions expire after 15 min (`CLI/src/mcp.go:290`). They can also be aborted (`tx_abort`) or approved in the desktop app.
- **New docs:** use `<Steps>` and tables. `security/encryption` already has an ASCII key-hierarchy diagram.
- **Target:** optional ASCII diagrams in `security/sessions-and-locking` (session and ephemeral lifecycle) and `agents/scopes-and-approval` (transaction states).

**S-2. Field names in the vault body.** *Optional, for tool authors.*

- **Old docs:** `concepts/vault-format.md` showed an example of the decrypted JSON. Most of its keys were wrong.
- **Code:** the real keys are in `CLI/src/vault.go:342-422`, for example:
  - `entries`, `totp_entries`, `totp_order`, `totp_domain_links`
  - `tokens`, `secure_notes`, `api_keys`, `ssh_keys`, `wifi_credentials`, `recovery_codes`
  - `certificates`, `banking_items`, `documents`, `audio_files`, `video_files`, `photo_files`
  - `gov_ids`, `medical_records`, `travel_docs`, `contacts`, `cloud_credentials_items`
  - `k8s_secrets`, `docker_registries`, `ssh_configs`, `cicd_secrets`, `software_licenses`, `legal_contracts`
  - `history`, `spaces`, `current_space`, `active_policy`, `secret_telemetry`, `desktop`, `format_revision`
  - Login entries (`vault.go:98-110`) also carry `passkeys`, `notes`, `totp` and `fields`.
  - Some structs serialize their space key as `"Space"`, capital S: travel, docker, ssh-config and software-license (`vault.go:180,216,227,242`).
- **New docs:** `security/vault-format#encrypted-body` lists groups, not keys.
- **Target:** an optional collapsible key table there.

### reference

Only `index` and `environment-variables` exist. Each item below lists the facts its page needs, verified against the code.

**R-1. `reference/file-locations`** (8 inbound links).

- **Old page:** `reference/storage.md`. Most of it is CHANGED.
- **"APM config folder"** below means `os.UserConfigDir()/apm`: `~/Library/Application Support/apm` (macOS), `~/.config/apm` (Linux), `%AppData%\apm` (Windows) (`CLI/src/log_signing.go:9-19`). The old docs used `~/.config/apm` for every platform.

The vault:

| File | Where | Evidence | Old docs |
|---|---|---|---|
| `vault.dat` | `$APM_VAULT_PATH`, else `vault.dat` next to the `pm` binary if one exists, else `~/.apm/vault.dat`. A relative `APM_VAULT_PATH` resolves against the binary's folder. `--vault` / `-v` overrides it | `CLI/main.go:51-73,3178` | CHANGED. Old docs said `./vault.dat` in the current directory |
| Conflict copy | `<vault>.conflict.<provider>.<YYYYMMDD-HHMMSS>` | `main.go:5660` | |
| Policy files | `<vault dir>/policies/*.yaml\|*.yml` | `main.go:2501` | |
| `.apmignore` | Current directory first, then the vault's directory | `CLI/src/apmignore.go:40-47` | CHANGED. The old order was the reverse |
| `.apminject` | Searched upward from the current directory | `CLI/internal/inject/apminject.go:20-40` | |

Sessions, state and logs:

| File | Where | Evidence | Old docs |
|---|---|---|---|
| Session file | `$TMPDIR/pm_session_global.json`, or `pm_session_<APM_SESSION_ID with non-alphanumerics stripped>.json`. Holds the **master password encrypted** with `session.key` from the config folder | `CLI/src/session.go:17,54-70` | CHANGED. Old docs said "hashed master password" |
| Ephemeral sessions | `ephemeral_sessions.json` in the config folder | `CLI/src/ephemeral_session.go:35-42` | CHANGED. Old docs said `$TEMP/.apm_ephemeral_sessions.json` |
| Audit log | `audit.json` plus `audit_signing.key` in the config folder. The `user` field is the home-folder name | `CLI/src/audit.go:26-37,55-57` | CHANGED. Path and signing |
| Access log and failure counter | `apm_audit.log` and `.apm_lock` in the state folder (`$APM_STATE_DIR`, else next to the binary; the app sets it to the vault's folder) | `CLI/src/anomaly.go:33`, `CLI/src/utils.go:245-275`, `CLI/desktop.go:184-185` | |
| Alerts | `email.log` in the current working directory | `CLI/src/security.go:78` | |
| History (lgit) | `lgit.jsonl`, `lgit_snapshots/`, `lgit_signing.key` and `lgit_notes.json` in the config folder | `CLI/src/lgit.go:30,35,43`, `CLI/src/desktop_support.go:71` | |
| MCP | `mcp_auth.json` (tokens stored **in plaintext**) and `mcp_transactions.json` in the config folder | `CLI/src/mcp.go:170-176,206-236`, `CLI/src/mcp_transactions.go:38` | CHANGED. Old docs said a hashed token inside the vault |
| Inject | `inject_session` in `$APM_DATA_DIR`, else the config folder | `CLI/internal/inject/session.go:145-153` | |

Browser extension:

| File | Where | Evidence |
|---|---|---|
| `bridge_token` | Config folder | `CLI/desktop_bridge.go:172` |
| `native_host.json`, `extension_link.json`, `extension_seen.json` | Config folder | `CLI/native_host.go:72,391,398` |
| `dev.apm.bridge.json` | Each browser's `NativeMessagingHosts` folder. On Windows it goes in `native-messaging\` with an `HKCU\Software\<browser>\NativeMessagingHosts` key | Old `reference/storage.md` |
| Icon cache | `icons/<sha256(host)>.img` and `.json` in the config folder. At most 2000 sites, oldest dropped first. Failures retried after 3 days, logos refreshed after 30 days. Files are 0600 in a 0700 folder and **not encrypted**; each `.json` names its host | `CLI/icons.go:35-37,228` |

Temporary files:

| File | Evidence |
|---|---|
| `apm-cloud-upload-*.dat`, the filtered upload copy | `CLI/src/cloud_ignore.go:28` |
| `apm_mcp_*.enc` | `CLI/src/mcp.go:1325` |
| Document and media temp copies, deleted after about 5 s | `CLI/main.go:5339,5441` |

The old `$TEMP/apm_export_*` and `$TEMP/apm_recovery_*` patterns are REMOVED (not found in the code).

Other locations:

| File | Where | Evidence |
|---|---|---|
| Drive credential override | `credentials.json` and `token.json` next to the `pm` binary replace the built-in Google Drive credentials in APM_PUBLIC mode | `CLI/main.go:5600-5620` |
| Desktop app | `<appData>/APM Desktop/config.json`, or `$APM_USER_DATA_DIR` (D-1) | `GUI/electron/main.js:20-21` |
| Team edition | `team_vault.dat` and `pm_team_session.json` next to the `pm-team` binary | `CLI/team/main.go:36`, `CLI/team/session.go` |
| `pm update` backup | `pm.old` next to the binary | `CLI/main.go:3321` |

**R-2. `reference/apmignore`** (4 inbound links).

- **Old pages:** `guides/apmignore.md` and `reference/apmignore.md`. CHANGED in several ways that matter:
  - **Search order:** current directory first, then the vault's directory. Only the first file found is used (`CLI/src/apmignore.go:40-64`).
  - **Matching is case-insensitive everywhere, entry names included.** Every token is lowercased (`apmignore.go:362-374`, `ignorePatternMatch(..., false)` at `:136-160`). The old docs said names were case-sensitive.
  - **Type identifiers:** the old underscore IDs `api_key`, `ssh_key`, `ssh_config`, `gov_id`, `cloud_creds`, `recovery_codes` and `software_license` **are not recognized** and silently match nothing (`normalizeIgnoreType`, `apmignore.go:384-445`).
- **Accepted type IDs and aliases:**

| Canonical | Aliases |
|---|---|
| `password` | `pass` |
| `totp` | `otp` |
| `token` | `tokens` |
| `note` | `notes`, `secure-note(s)` |
| `api-key` | `api`, `apikey`, `api-keys` |
| `ssh-key` | `ssh`, `ssh-keys` |
| `wifi` | `wi-fi` |
| `recovery-codes` | `recovery`, `recovery-code` |
| `certificate` | `cert`, `certs` |
| `banking` | `bank` |
| `document` | `docs` |
| `audio` | |
| `video` | |
| `photo` | `image` |
| `gov-id` | `government-id`, `id` |
| `medical` | `medical-record` |
| `travel` | |
| `contact` | |
| `cloud-credentials` | `cloud` |
| `k8s-secret` | `k8s`, `kubernetes`, `kubernetes-secret` |
| `docker-registry` | `docker` |
| `ssh-config` | |
| `cicd-secret` | `cicd`, `ci/cd`, `ci-cd` |
| `software-license` | `license` |
| `legal-contract` | `legal`, `contract` |

  An empty type or `secret` means `*`. Glob characters `* ? []` are passed through.
- **What "name" means per type** (`apmignore.go:186-260`):

| Type | Matched field |
|---|---|
| Login | account |
| Wi-Fi | SSID |
| Recovery codes | service |
| Certificate, banking, medical, travel, cloud credentials | label |
| **Government ID** | **ID number**, not the name |
| SSH config | alias |
| Software license | product name |
| Everything else | name |

- **Sections:**
  - `[spaces]`, `[entries]` (`space:type:name`) and `[cloud-specific-ignore]` (`provider:space:type:name`) are CURRENT.
  - An empty space means `default`.
  - `[misc]` is parsed as `key: value` (`:110-115`), but `MiscIgnoreEnabled` (`:166`) is never called, so **`[misc]` has no effect**. Document it as reserved, or leave it out.
  - Inline `#` comments are stripped unless quoted. Quoted tokens are unquoted (`:307-327,362-369`).
  - A malformed entry or cloud rule fails the whole upload with `.apmignore line N: entry rule must be 'space:type:name'` (`:99-108,329-352`).
- **Also filtered:** spaces, the current space, telemetry and history entries for ignored items (`:268-300`). The local vault is never changed.
- **Debugging:** `pm loaded` shows which file is in effect. The old "check `pm audit` for entry counts" no longer applies.

**R-3. `reference/policies`** (2 inbound links).

- **Old pages:** `reference/policies.md` and `concepts/policy-engine.md`. CHANGED. Schema at `CLI/src/policy.go:12-34`:

```yaml
name: string                 # how you load it
password_policy:
  min_length: int
  require_uppercase: bool
  require_numbers: bool
  require_symbols: bool      # unicode.IsPunct || IsSymbol
rotation_policy:
  rotate_every_days: int
  notify_before_days: int
classification:              # map of NAME → object
  <name>:
    max_access_level: string
    mfa_required: bool
```

- **Classification:** the old `classification: {aws_root: critical}` shape (string values) **fails to unmarshal**. `LoadPolicies` then **silently skips the whole file** (`policy.go:96-99`), so `pm policy load` reports "not found". This warning is worth a callout.
- **Not in the schema:** `description` is ignored. `allowed_plugins` was dropped (`CHANGES.md`).
- **Old classification penalties:** the table (critical/root −15, admin −12, elevated −8) is CHANGED and not tied to policies at all.
  - Trust privilege comes from item telemetry (`CLI/src/items.go:281-292`).
  - Critical, root and admin all score −15; elevated scores −8 (`CLI/src/trust.go:170-177`).
- **Loading:** `pm policy load <name>` looks in `<vault dir>/policies` (`CLI/main.go:2493-2510`). The policy is **saved in the vault** (`active_policy`, `CLI/src/vault.go:398`). The old docs said "not persisted".
- **Enforcement:** rotation and classification are not enforced (already noted in `cli/policies`).
- **Example:** `CLI/examples/policies/password_policy` exists. Check it before quoting it.

**R-4. `reference/apminject`** (1 inbound link).

- **Old docs:** `guides/inject.md`. CURRENT.
- **Formats:** a plain list of `- entry: x`, `inject:` or `entries:`. `entries:` wins if both are present (`CLI/internal/inject/apminject.go:43-70`). `as:` sets the variable name (`CLI/cmd/inject.go:56-57`).
- **Name derivation:** letters and digits are uppercased, other runs become `_`, and a leading digit gets `_` (`CLI/internal/inject/resolver.go:48-77`). The old examples are still right: `github`→`GITHUB`, `aws-prod`→`AWS_PROD`, `openai token`→`OPENAI_TOKEN`.
- **Lookup:** searched upward from the current directory (`apminject.go:20-40`). Missing entries fail the whole run (`resolver.go:42`). `APM_INJECT_SESSION` is exported too (`CLI/internal/inject/session.go:81-82`).

**R-5. `reference/exit-codes`** (1 inbound link). Not in the old docs.

- Many commands print errors with `color.Red` and return without `os.Exit(1)`, for example most `pm cloud` paths (`CLI/main.go:1578-2226`). The real exit status needs a careful audit before it is documented.
- `cli/scripting#detect-failures` may already cover part of this.

**R-6. `reference/faq`.** Seed it with migration questions from the old docs:

- Where is my vault? (`~/.apm/vault.dat` vs next to `pm`, R-1)
- What happened to plugins? To Windows autofill? To `pm audit`? (C-1)
- Why is my Drive vault "public"? (APM_PUBLIC: `CLI/src/cloud.go:105-113`, already explained in `security/sync-security`)
- Why does `.apmignore` ignore my `ssh_key` rule? (R-2)
- Why won't my old policy file load? (R-3)
- Can I still use `install.sh`? (GS-1)
- Does `pm` clear the clipboard? No (`CLI/main.go:3632-3653`)
- Does `pm gen` copy to the clipboard? No, it only prints (`main.go:1448-1459`)
- Is there a trash in the CLI? Deletes are immediate, but `pm lgit undo` reverts them.
- Which Go version do I need to build? 1.25 (`CLI/go.mod:3`)
- Getting help (GS-4).

**R-7. `reference/glossary`.** Not in the old docs.

- Terms from the old pages worth defining: vault, space, profile, KDF, DEK / data key, key slot, recovery key, retrieval key, APM_PUBLIC / self-hosted, ephemeral session, trust score, telemetry, lgit, bridge, native messaging host, MCP token and permissions, transaction (`tx_id`), `.apmignore`, `.apminject`, policy, quorum / trustee share.

**R-8. Additions to `reference/environment-variables`.** The page exists and is accurate. Add:

- `APM_PM_PATH` and `APM_USER_DATA_DIR`, which the desktop app reads (`GUI/electron/paths.js:43`, `GUI/electron/main.js:20`).
- `APM_DESKTOP=1`, set by the app for its engine (`GUI/electron/main.js:65`). Internal.
- Dev-only variables `APM_WEB_BRIDGE_DIR` and `APM_SRC` / `APM_CLI_REF` in GUI scripts. Probably leave these out.

Two old claims are already corrected on the page and must not come back:

- `APM_ACTOR` doesn't tag the audit log (`CLI/src/audit.go:55-57` uses the home-folder name). It only feeds item telemetry (`CLI/src/trust.go:84-90`).
- Agent binding uses `APM_EPHEMERAL_AGENT`, not `APM_ACTOR` (`CLI/src/ephemeral_session.go:163`, `CLI/main.go:3717`).

**R-9. Vault-stored settings keys.**

- **Old docs:** mentioned "the `siteIcons` vault setting".
- **Code:** settings stored in the vault, with defaults (`CLI/desktop.go:711-721`, `GUI/renderer/src/lib/store.js:11`):

| Key | Default |
|---|---|
| `sessionTimeout` | `"60"` |
| `inactivity` | `"15"` |
| `lockOnSleep` | `true` |
| `clipboard` | `"30"` |
| `copyOnClick` | `true` |
| `confirmDelete` | `true` |
| `showTypeIcons` | `true` |
| `openOnLaunch` | `"all"` |
| `siteIcons` | `"on"` |

  `pm autolock` writes `inactivity`, `sessionTimeout` and `lockOnSleep` (`CLI/lock_policy.go:55-62`).
- **Target:** a table in `desktop/settings` mapping each UI label to its key and default, or a short `reference/vault-settings` page. The key names matter to anyone scripting or reading `pm autolock` output.

---

## REMOVED: don't bring these back

These appear in the old site, `CLI/docs`, `CLI/README.md` or `CLI/mcp.md`, and no longer exist in the code.

### Plugins (whole subsystem)

- **Commands:** `pm plugins installed|list|market|add|install|push|remove|search|local|access|run` and plugin-added root commands.
- **Manifest and runtime:** `plugin.json`, the 100+ permission catalog (`vault.*`, `network.*` and so on), the step executor, `pre:`/`post:` hooks and the Google Drive marketplace.
- **Leftovers:** the `~/.config/apm/plugins/` directory, the vault field `plugin_permission_overrides`, and the MCP tools `install_plugin` and `list_plugins`.
- **Example plugins:** `quick_backup`, `clip_auto_clear` and `cloud_sync_hook`.
- **Evidence:** `CHANGES.md:11,54,58` and `CLI/changes.md:32-38`. Live-only pages: `concepts/plugins/`, `guides/plugins/` and `reference/plugin-api/`.

### Windows autofill and autocomplete

- **Commands:** `pm autofill …` and `pm autocomplete …`, including `link-totp` and `window enable|disable|status`.
- **Features:** the Ctrl+Shift+L hotkey, `--hotkey`, autofill profiles (`service`, `domains`, `process_names`, `window_contains`, `sequence`) and the tokens `{USERNAME}{PASSWORD}{TOTP}{TAB}{ENTER}{DELAY:N}`.
- **Leftovers:** the `$TEMP/.apm_autofill_state.json` state file, and "pm lock also locks the autofill daemon".
- **Evidence:** no command in `CLI/main.go:3157-3178` and no `autofill/` package. Live-only page `autofill_windows/`.
- **Note:** `pm add totp` still prompts "Link domain for autofill" (`main.go:456`). That prompt now feeds the extension's `totp_domain_links`.

### Other removed commands and flags

All are listed in the C-1 table:

- `pm audit`
- `pm space remove`, `pm space current`
- `pm cloud autosync` and root `pm readonly`
- the positional import and export formats, `--decrypt` and `--no-password`
- `pm-team dept info`, `pm-team user role`
- `pm-team init "<org>"` with one argument (it needs `<org_name> <admin_username>`, `CLI/team/main.go:47`)

### MCP (old `reference/mcp-tools.md`, `concepts/mcp.md`, `CLI/mcp.md`)

- **Renamed tools:** `list_entries` is now `list_vault` and `search_entries` is now `search_vault` (`CLI/src/mcp.go:25-45`).
- **Removed tool:** `install_plugin`.
- **Error codes:** `PERMISSION_DENIED`, `SESSION_REQUIRED`, `ENTRY_NOT_FOUND`, `TRANSACTION_EXPIRED`, `INVALID_PARAMETERS` and `VAULT_LOCKED` don't exist as MCP error codes. `VAULT_LOCKED` is only an audit action.
- **Old parameter schemas:** `get_entry {id,name,include_secret}`, `decrypt_entry {id}`, `add_entry {type,fields,space}` and `get_totp {account}`. Use the current schemas in `agents/tools`.
- **Token storage:** the claim "tokens stored hashed (`token_hash: sha256:…`) inside the vault (`mcp_tokens`)" is false. Tokens are plaintext `apm_mcp_<hex>` in `mcp_auth.json` (`CLI/src/mcp.go:170-236`).
- **Scopes:** "scopes are cumulative (admin ⊇ write ⊇ read)" is false. Permissions are per tool, and legacy group names expand to fixed lists (`mcp.go:47-70`).
- **`CLI/mcp.md`:** the claims "HMAC-signed JWT-like tokens", the `totp` permission and "requires `APM_SESSION_ID`" are all false.

### Sessions, cloud, files and other claims

| Old claim | Status |
|---|---|
| Ephemeral store at `$TEMP/.apm_ephemeral_sessions.json` | REMOVED. See R-1 |
| Session file holds a "hashed master password" | False. It holds the encrypted password (`CLI/src/session.go:20-30`) |
| Unlock defaults of 30 min session and 10 min idle | Now 1 h maximum, 15 min idle and lock on sleep (`CLI/lock_policy.go:26-31`) |
| `--bind-host` defaults to false | Now true (`CLI/main.go:1013`) |
| `--bind-pid <pid>` | Now a bool that binds to the issuing process (`main.go:1014`) |
| `--ttl` is required | Now defaults to 15m (`main.go:1009`) |
| Google Drive and Dropbox use OAuth2 PKCE, the Drive "Application Data folder hidden from Drive UI", and the Dropbox "App folder" | False. Self-hosted Drive uses `DriveFileScope` and uploads to My Drive root. APM_PUBLIC uploads to APM's shared folder with an `anyone: reader` permission. OAuth redirects to `localhost:8080` without PKCE (`CLI/src/cloud.go:53,78-115,257-262`). The new docs are already correct |
| "No entry-level merge" | CHANGED. `pm cloud diff` now merges item by item (`CLI/src/cloud_diff.go`). Whole-vault conflict handling still exists for `pm cloud get` (`CLI/main.go:5653-5665`) |
| Clipboard auto-clears after `pm get` copies | False for `pm`. Only the desktop app clears it |
| `pm gen` copies to the clipboard | False. It prints only |
| `pm get` keys `c` copy, `s` show/hide, `q` quicklook, `m` metadata | CHANGED. Now Space quicklook, `s` select, `a` all, `c` clear marks, `i` metadata, `v`/Enter view (`CLI/main.go:4036-4220`) |
| `pm totp` keys `u`/`d` reorder | CHANGED. Now Shift+↑/↓, plus `1`-`9` to copy (`main.go:4453`) |
| "Deletion is permanent. There is no trash or undo" | CHANGED. `pm lgit undo` reverts, and the app has a Trash |
| `pm info` shows the Go version and OS/arch | CHANGED (`main.go:1484-1535`) |
| `pm cinfo` shows "whether recovery is configured" | False (`main.go:1057-1092`) |
| Import "validates against loaded password policies" | False. Imports are not policy-checked |
| Import "detects duplicates by account name" | CHANGED. There is a full conflict and duplicate plan (`CLI/src/transfer_plan.go`) |
| Vault version history "V1 AES-CBC, V2 HMAC, V3 AES-GCM + Argon2id" | Wrong. `security/vault-format#older-formats` has the correct table |
| "Re-encrypt with `pm profile` to upgrade legacy vaults to V4" | CHANGED. Any save rewrites them as v4 |
| Default vault `./vault.dat` in the current directory | Wrong. See R-1 |
| Prerequisite Go 1.21+ | Now 1.25 (`CLI/go.mod:3`) |
| Windows installer `%LOCALAPPDATA%\pm\apm.exe` and `install.ps1` | REMOVED (`CLI/scripts/install.ps1:3`) |
| Release stages `beta-*` and `pre-*` | Not built (`release.yml:4-7`) |

### Team edition pages (old `team/*.md`, internally inconsistent)

| Old claim | Status |
|---|---|
| Roles Owner, Admin, Manager, Member and Viewer, with their hierarchy and permission matrix | False. The roles are `ADMIN`, `MANAGER`, `USER`, `AUDITOR` and `SECURITY`, with per-user overrides `add_entry`, `edit_entry`, `delete_entry`, `share_entry`, `manage_depts`, `manage_users` and `view_audit` (`CLI/team/team_vault.go:12-110`). `cli/team-edition` is correct |
| Approvals gate **access requests**, and Owner/Admin/Manager can approve | False. Approvals queue **create, edit and delete changes** to sensitive entries (`team_vault.go:126-136`). `cli/team-edition` says admins approve |
| Audit actions `APPROVAL_REQUESTED`, `APPROVAL_GRANTED`, `APPROVAL_DENIED` | Not found in `CLI/team/main.go` |
| Departments are "isolated encryption domains" with a key per department | Partly true. Users hold per-department wrapped keys (`team_vault.go:105-117`), but `cli/team-edition` notes that multi-user key handling is incomplete. Don't promise cryptographic isolation without checking |

---

## Old material still accurate and worth reusing

Most of this is already reused in the new docs. Listed so nobody re-derives it.

| Material | Status | Already in |
|---|---|---|
| **Profile parameter table** (old `concepts/security-profiles.md`): standard 64 MiB/3/2/salt 16/nonce 12, hardened 256/5/4/32/12, paranoid 512/6/4/32/24, legacy PBKDF2 600000/1/16/12, all AES-GCM by default | CURRENT (`CLI/src/utils.go:40-88`) | `security/profiles` |
| **Hardware recommendation flow**: ≥16 GB and ≥8 cores → paranoid, ≥8 GB and ≥4 cores → hardened, else standard | CURRENT, plus a fallback when RAM can't be read: ≥8 cores → hardened (`CLI/src/system_profile.go:36-51`) | Check `security/profiles` includes the fallback |
| **96-byte Argon2id split table** (encryption, auth and validator keys) and the **V4 byte layout list** | CURRENT (`CLI/src/vault.go`) | `security/encryption`, `security/vault-format` |
| **Trust score penalty table and risk bands** (≥80 low, ≥55 medium, ≥35 high, else critical) | CURRENT (`CLI/src/trust.go:116-177`), except "admin −12" is wrong: it is −15 | `cli/health-and-audit` |
| **Health score factors** | CURRENT (`CLI/src/health.go:16-69`). The +20 for hardened or paranoid is display-only | `cli/health-and-audit` |
| **Ephemeral binding table** (host = SHA-256 of lowercased `hostname\|user`, PID, agent) | CURRENT except the agent source (`APM_EPHEMERAL_AGENT`) | `security/sessions-and-locking` |
| **Ephemeral sequence diagram** (issue → hand over `eps_…` → `APM_EPHEMERAL_ID=… pm get` → "ephemeral session expired") | CURRENT | Could become an ASCII diagram (S-1) |
| **`pm session issue --label "CI Build" --scope read --ttl 15m --bind-host --agent github-actions`** | Valid. `--bind-pid` takes no value now | |
| **`.apminject` examples** (list, `inject:` and `as:`) and **`setup-shell` targets** (`~/.bashrc`, `~/.zshrc`, `~/.config/fish/config.fish`, `$PROFILE`) | CURRENT | `cli/inject` |
| **Cloud conflict prompt** (overwrite local, keep local plus conflict copy, cancel) | CURRENT (`CLI/main.go:5653-5665`) | |
| **Old `.apmignore` complete example** | Reusable only after changing `personal:ssh_key:…` to `ssh-key` and making sure no other underscore type IDs remain | R-2 |
| **"Minimal" policy example** (`name: basic`, `min_length: 12`), and the enterprise and dev-team examples **without** their `classification` blocks | CURRENT | R-3 |
| **Team edition command list and type namespaces** (`pm-team password\|totp\|apikey\|token\|note\|ssh\|cert\|wifi\|recovery\|banking\|doc\|gov\|medical\|travel\|contact\|cloud\|k8s\|docker\|ssh-config\|cicd\|license\|legal`, each with `add`, `list` and `get`) | CURRENT (`CLI/team/main.go:1194-1270`) | Check `cli/team-edition` lists the namespaces |
| **Secret-types field table** (old `concepts/secret-types.md`) | CURRENT. Logins also carry passkeys, notes, totp and custom fields. Recovery codes carry `used` | `cli/items` has the full table |

---

## Crosswalk: each old page

| Old page | Code status | New home |
|---|---|---|
| `index` | CHANGED: plugins and autofill gone | `getting-started/index` |
| `contributing` | CURRENT (`CLI/CONTRIBUTING.md`, 12 lines) | none. Optional; probably the repo only |
| `getting-started/installation` | CHANGED (GS-1, GS-3; Go 1.25) | `getting-started/installation`, `cli/installation` |
| `getting-started/first-steps` | CHANGED (vault path, autofill) | `getting-started/quickstart`, `cli/vault-basics` |
| `getting-started/features` | CHANGED (plugins, autofill) | `getting-started/index`, `choose-your-surface` |
| `getting-started/help` | CHANGED (GS-4) | partly in `cli/index` and `security/reporting` |
| `guides/vault-management` | CHANGED (keys, clipboard, spaces, audit) | `cli/items`, `cli/spaces`, `cli/generator`, `cli/health-and-audit` |
| `guides/cloud-sync` | CHANGED (providers, modes, troubleshooting) | `cli/cloud-sync`, `desktop/sync`, `security/sync-security` (C-2 open) |
| `guides/apmignore` | CHANGED | `cli/cloud-sync#leave-items-out`, `desktop/sync` (R-2 open) |
| `autofill_windows` (live only) | REMOVED | none |
| `guides/inject` | CURRENT | `cli/inject`, `desktop/terminal` (R-4 open) |
| `guides/totp` | CHANGED (keys, link) | `cli/totp`, `desktop/authenticator` |
| `guides/sessions` | CHANGED (defaults, flags) | `cli/sessions`, `security/sessions-and-locking` |
| `guides/plugins` (live only) | REMOVED | none |
| `guides/mcp-integration` | CHANGED | `agents/setup`, `agents/scopes-and-approval` |
| `guides/team-edition` | CURRENT | `cli/team-edition` |
| `guides/import-export` | CHANGED (rewritten) | `cli/import-export`, `desktop/import-export` |
| `concepts/architecture` | CHANGED | spread out (GS-5 open) |
| `concepts/encryption` | CURRENT with the DEK model | `security/encryption` |
| `concepts/vault-format` | layout CURRENT; JSON and history wrong | `security/vault-format` (S-2 optional) |
| `concepts/secret-types` | CURRENT | `cli/items`, `desktop/items` |
| `concepts/security-profiles` | CURRENT | `security/profiles` |
| `concepts/policy-engine` | CHANGED | `cli/policies` (R-3 open) |
| `concepts/sessions` | CHANGED | `security/sessions-and-locking` (C-3, S-1 optional) |
| `concepts/cloud-sync` | CHANGED | `security/sync-security` |
| `concepts/plugins` (live only) | REMOVED | none |
| `concepts/mcp` | CHANGED | `agents/scopes-and-approval` |
| `concepts/recovery` | CURRENT | `security/recovery`, `cli/recovery`, `desktop/recovery` |
| `reference/cli` | CHANGED (live version: plugins and autofill) | `cli/commands*` (C-1 open) |
| `reference/apmignore` | CHANGED | missing (R-2) |
| `reference/storage` | CHANGED | missing `reference/file-locations` (R-1) |
| `reference/environment-variables` | CHANGED | `reference/environment-variables` (R-8 additions) |
| `reference/mcp-tools` | CHANGED | `agents/tools` |
| `reference/plugin-api` (live only) | REMOVED | none |
| `reference/policies` | CHANGED | missing (R-3) |
| `team/index`, `team/rbac`, `team/departments`, `team/approvals` | CHANGED (roles, approvals) | `cli/team-edition` |
| Section index pages (`guides/`, `concepts/`, `reference/`, `team/`, `getting-started/`) | n/a | section `index.mdx` pages |
