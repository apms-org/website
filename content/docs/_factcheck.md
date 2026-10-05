# Docs fact-check log

Every correction made during the fact-check, with the original claim, the corrected claim and the code that settles it. Paths are relative to `/Users/aaravmaloo/Desktop/apm_master` unless noted. The sources were the code itself: `CLI/` (engine, `pm`, desktop RPC), `GUI/electron`, `GUI/renderer/src`, `GUI/vendor/design-system/bundle.js`, `extension/`. Comments and older docs were not trusted over code.

**Which code the line numbers refer to.** The CLI changed while the docs were being checked: `fa4bbc5` (20:20), `013843f` (20:21), `5c023b7` (20:40), then `4ecbf31` (21:01, `pm bridge` merged into `pm extension`) and `aef9bbf` (21:02, MCP writes wait for approval in the app; install tools removed).
- The desktop, security, agents, and preliminary extension and getting-started logs cite `CLI/` at `013843f`. `main.go` there is identical to `fa4bbc5` apart from one line.
- `5c023b7` rewrote `pm get` (`item_view.go`, `item_edit.go`) and shifted `main.go` lines after about line 3900. Use `git -C CLI show 013843f:main.go` to follow those citations.
- The cli, reference and second-pass sections name the commit, or the working tree, they were checked at.

Validation: each section's pages compile with `@mdx-js/mdx` plus `remark-gfm`. Every `/docs/...` link and `#anchor` was resolved against the files, with anchors computed by `github-slugger`.

## MCP change (v12): what it resolved and what stays open

Checked on 2026-10-05 at about 21:15. The change is now committed as `4ecbf31` (21:01, the `pm bridge` → `pm extension` merge) and `aef9bbf` (21:02, MCP approval). The files cited here are byte-identical at `aef9bbf`, so the line numbers refer to it. The MCP session has synced the agents pages, `desktop/ai-access.mdx`, `desktop/troubleshooting.mdx`, the MCP rows of `security/threat-model.mdx` and the `pm mcp config` parts of `cli/commands-sync.mdx` and `cli/commands.mdx`.

**Resolved.** The entries marked "Resolved by the v12 MCP change" in this log are fixed:
- **Writes need your approval in the app.** `add_entry`, `edit_entry` and `delete_entry` now only queue a request through `requestMCPApproval` (`CLI/src/mcp.go:280-290`; callers at `701, 721, 751`).
  - Only **Approve** in the app's **Settings → AI access** applies a write (`CLI/desktop_handlers.go` `hMCPTxApprove`).
  - Sending `tx_id` with `approve: true` commits nothing: the handlers don't read those fields, so it just queues another request.
  - Each queued request logs `MCP_TX_REQUESTED` (`src/mcp.go:287`).
- **The server has 17 tools.** `check_installation` and `install_apm` are gone (17 `Name:` entries in `src/mcp.go`).
- **`pm mcp config`** prints the plain `pm mcp serve` entry with no token and no PowerShell bootstrap (`main.go` `mcpConfigCmd`; `src/mcp.go:75-101` adds `--token` only when one is given).
- **The agent-commit side effects no longer apply:** the second call's arguments, the commit check by token name, no lgit commit, and the space switch. Agents can't commit any more.

**Still open.** These are re-checked in the working tree and stay as findings:
- A bad token prints every saved token to stdout (`src/mcp.go:300`). Load and decrypt errors print DEBUG lines to stdout (`1227, 1237`).
- Tokens are stored unhashed, passed on the command line, and checked only when the server starts.
- `search_vault` returns full items, and only `get_entry` is audited.
- `manage_profiles`, `manage_spaces`, `cloud_config` and `cloud_sync` still change the vault without approval (`saveVault` at `src/mcp.go:799, 846, 865, 911, 1022`).
- In a read-only `pm` session MCP still serves the placeholder vault (`src/mcp.go:1232`), and `saveVault` writes with `os.WriteFile` (`1122-1128`). So those four tools can still save the placeholder over the real vault. Add, edit and delete can't, because they now go through the app.
- The ephemeral-session scope is ignored, and every call keeps the session alive.


---

## desktop section

Pages: all 21 in `website/content/docs/desktop/`. About 650 claims were checked: labels, menu paths, settings and defaults, shortcuts, item types and fields, behaviour, file paths, messages and URLs.

Validation after the edits:
- All 21 pages compile.
- All 88 unique `/docs/` links resolve, including the 45 that carry an anchor.
- The reference pages these pages link to (`/docs/reference/policies`, `/docs/reference/file-locations`, `/docs/reference/apmignore`) now exist.

### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| index.mdx | Types: "One entry per item type you use" | "One entry for each item type you use (up to nine)" | `GUI/renderer/src/screens/vault.jsx:229` (`present.slice(0, 9)`) |
| index.mdx | Clicking the commit receipt opens "that commit in **History**" | "Click it to open **History**" (it does not select the commit) | `GUI/renderer/src/screens/shell.jsx:122` (`ui.go({ view: "history" })`) |
| index.mdx | The packaged app "only ever runs" its bundled `pm` | Runs its own copy, never one from `PATH`. `APM_PM_PATH` (a development variable) overrides it. | `GUI/electron/paths.js:43` (`APM_PM_PATH` is checked before the packaged path) |
| index.mdx | `config.json` holds "the window and the vault path you picked" | Holds only the vault path. Display settings live in the same folder (the renderer's localStorage). | `GUI/electron/main.js:158` (`writeConfig(userData(), { vaultPath })`). No window bounds are saved anywhere in `GUI/electron`. `GUI/renderer/src/lib/store.js:10` (prefs in localStorage) |
| install.mdx | The app "never picks up an older `pm` from your PATH" (no exception) | Added: only `APM_PM_PATH` overrides it, and it is meant for development | `GUI/electron/paths.js:36-56` |
| first-run.mdx | Touch ID "stores your master password in the macOS Keychain, protected by your fingerprint" | Stored in the login keychain. APM asks for the fingerprint before reading it. Links to the Touch ID section. | `CLI/src/touchid/touchid_darwin.go:99-163` (`security add-generic-password` / `find-generic-password` with no access control; the fingerprint check is a separate step), `CLI/src/touchid/touchid.go:12` |
| first-run.mdx | "You can change all of this later in **Settings → Sessions**" | Touch ID is changed in **Settings → Security**, the lock rules in **Settings → Sessions** | `GUI/renderer/src/settings/security.jsx` (Touch ID row), `settings/sessions.jsx` |
| first-run.mdx | "Once the email is verified, choose **Create recovery key**" | As soon as the code is accepted, APM creates the recovery key and shows it | `CLI/desktop_handlers.go:1884-1950` (`recovery.email.verify` installs the key and returns `key`, line 1928); `GUI/renderer/src/screens/auth.jsx:204` (`if (r.key) setRecKey(r.key)`) |
| first-run.mdx | Dropbox step: "If it reports that it needs them…" | Connecting here always stops with "Self-hosted Dropbox needs your app key and app secret." Skip, and connect in **Settings → Sync**. | `CLI/desktop_cloud.go:119`. The setup step sends no app key or secret (`auth.jsx`, Sync step). |
| first-run.mdx | Restore by retrieval key for Google Drive or Dropbox (no limit stated) | The app only looks in APM public storage. A vault in your own Drive or Dropbox app needs `pm cloud get`. | `GUI/renderer/src/screens/auth.jsx:685` (no `mode` or token sent), `CLI/desktop_cloud.go:567-640` (lines 62 and 65 of the function default to `apm_public`) |
| first-run.mdx | "The password never leaves this computer and is never stored" | "…never leaves this computer, and APM has no way to reset it" | `CLI/src/session.go:20-21, 78-104` (the session file holds the password, encrypted); Touch ID keeps a copy in the Keychain (`touchid_darwin.go:124`) |
| lock-and-unlock.mdx | Touch ID: password in "the macOS Keychain", released "only after a fingerprint check" | Names the **APM Vault** login-keychain item. Adds a warning callout: the fingerprint check is APM's, and the Keychain item has no biometric lock, so other programs running as you may read it. | `CLI/src/touchid/touchid.go:12`, `touchid_darwin.go:99-163` |
| lock-and-unlock.mdx | "If you start typing your password while Touch ID is armed, the fingerprint check is cancelled" | Cancelled when you type your password and press ↵ | `GUI/renderer/src/screens/auth.jsx:456-459` (`submit` calls `touchApi().cancel()`; no keypress handler cancels it) |
| lock-and-unlock.mdx | "each failed attempt can send an alert email" | Each failed attempt raises an alert. In 12.0.0 alerts are written to a local log file, not emailed. | `CLI/src/security.go:60-84` (`SendAlert` appends to `email.log`), `CLI/desktop_handlers.go:255` |
| items.mdx | "Type a URL and choose **Add**" (implied for **Website** too) | **Add** is in **Other websites** | `GUI/renderer/src/screens/fields.jsx:192` (the list field has the inline Add; Website is a plain field) |
| items.mdx | Versions show "the old and new values" | …for up to three changed fields | `GUI/renderer/src/screens/detail.jsx:207` (`changed.slice(0, 3)`) |
| items.mdx | "Admin, root and critical lower the trust score" | Elevated −8; admin, root and critical −15 | `GUI/renderer/src/lib/health.js:18-19` |
| items.mdx | Quick Look shows "up to six non-secret fields" | "up to six other fields. Secret fields stay masked." Secret fields are among the six, masked. | `GUI/renderer/src/screens/shell.jsx:197` (filter excludes only file, note, custom and totp; password/secret kinds shown as dots) |
| settings.mdx | "**Settings…** in the app menu (macOS) or the **File** menu" | **Settings...** (macOS app menu) or **Settings** (File menu on Windows and Linux) | `GUI/electron/menu.js:45` (`isMac ? "Settings..." : "Settings"`) |
| settings.mdx | Confirm before deleting "Described as: confirm before items go to Trash" | "Described as: items go to Trash either way, and stay there until you empty it" | `GUI/renderer/src/settings/general.jsx:37` |
| settings.mdx | Password policy reads the `policies` folder "next to `pm`" | Reads the folder next to the vault file. Notes that the card's own description says "next to pm". | `CLI/desktop.go:1415-1417` (`filepath.Join(filepath.Dir(s.vaultPath), "policies")`), `CLI/desktop_handlers.go:1796`; `GUI/renderer/src/settings/security.jsx:89` (UI copy) |
| settings.mdx | Touch ID row: "stores it in the macOS Keychain behind your fingerprint" | Stored in the login keychain; APM asks for the fingerprint before reading it | as in lock-and-unlock |
| settings.mdx | "Alerts are emails … sent from this computer" | No email is sent in 12.0.0. Each alert is a line in `email.log` in the folder `pm` was started from. **Follow-up needed (desktop is off-limits right now):** for the desktop app that folder is the vault's folder, because its backend changes into it (`CLI/desktop.go:188`). The page should say `email.log` lands next to the vault for the app, and in the current folder for `pm` in a terminal. | `CLI/src/security.go:60-84`; `CLI/desktop.go:184-188` |
| settings.mdx | Security alerts "Turns alert emails on" | "Turns alerts on" | as above |
| settings.mdx | Anomaly detection "Flags unlocks at unusual hours and bursts of failed attempts, even with email alerts off" | Flags an unlock between 2:00 and 5:59. It only raises an alert when Security alerts is also on. | `CLI/src/anomaly.go:42-52` (hour check only); `CLI/desktop_handlers.go:208` (`v.AlertsEnabled && v.AnomalyDetectionEnabled`) |
| settings.mdx | "Only the last four characters [of the email] are stored in logs" | Logs show the first letter and the domain (`a****@example.com`) | `CLI/src/security.go:86-101` (`maskEmail`) |
| settings.mdx | Recent alertable events "marked **Emailed** or **Logged**" | **Emailed** only means alerts were on, not that an email went out | `GUI/renderer/src/settings/general.jsx:138` (`m.alerts ? "Emailed" : "Logged"`) |
| settings.mdx | Level table "What each level sends" | Table kept as what the card lists. Added which events actually raise alerts: vault destroyed, profile change, AI token, unlock and sync raise none; alert-setting/level changes and recovery reset raise level 2; `pm` entry add/edit/delete raises level 3. (A first version also listed `pm passkeys` rename/delete; that command was deleted in CLI commit 013843f, see below.) | Every `SendAlert` call at CLI HEAD 013843f: `CLI/desktop_handlers.go:209, 255, 607, 610, 1673, 2114, 2404, 2873`; `desktop_transfer.go:350`; `main.go:847, 3846, 3871, 4579, 5205, 6333, 6509, 6547, 6572, 6610`; `transfer_cmd.go:797`; `src/auth_logic.go:109`. UI list: `GUI/renderer/src/settings/general.jsx:89-101` |
| settings.mdx | Import, Export and Compare cards "each with when you last used it" | Only Import and Export show it | `GUI/renderer/src/settings/data.jsx:16-17, 28, 36` |
| ai-access.mdx | "every change it wants to make waits for your approval in the app" | Only add, edit and delete requests wait for approval | `CLI/src/mcp.go:769, 821, 878` (only these call `ensureMCPMutationAuthorized`) |
| ai-access.mdx | MCP server off: "the app stops showing approval requests" | Off only disables **New token** and **Set up**. Added: the switch does not stop assistants, and requests still show. | `MCPEnabled` is read only in `CLI/desktop.go:1374` (view); `pollMCP` `desktop.go:680-698` ignores it; `GUI/renderer/src/settings/ai.jsx:31, 41, 48, 69` |
| ai-access.mdx | Config block (implied: `pm` on PATH) | The dialog's Config runs the app's own `pm` by full path (`cmd /c` on Windows); the manual block runs plain `pm` | `CLI/desktop_handlers.go:2815-2829` → `CLI/main.go:6777-6783` → `CLI/src/mcp.go:78-98` (`os.Executable()`); `GUI/renderer/src/settings/ai.jsx:72, 145` |
| ai-access.mdx | Read group "See names and structure, never secrets" | `search_vault` returns each matching item in full, secrets included | `CLI/src/mcp.go:575-590` (`fmt.Sprintf("[%s] %v", typeName, item.Interface())`) |
| ai-access.mdx | Write group "Changes, which need your approval first" | Only `add_entry`, `edit_entry` and `delete_entry` wait. `manage_spaces` and `cloud_sync` act right away. | `CLI/src/mcp.go:769, 821, 878` vs `985-1024`, `1135-1194` |
| ai-access.mdx | "Every read is written to the audit log" | Only `get_entry` is logged; `decrypt_entry`, `get_totp` and `search_vault` leave no record | `CLI/src/mcp.go:551` is the only `LogAction` among the read tools (`393-692`) |
| ai-access.mdx | (implied) approval is required | Added a warning callout: the assistant can approve its own request with the request ID and `approve: true` | `CLI/src/mcp.go:278-315` (`ensureMCPMutationAuthorized`). **Resolved by the v12 MCP change.** Only **Approve** in the app applies a write; the MCP session has rewritten the page. |
| ai-access.mdx | Past requests lists "approved, rejected or expired" | Lists up to eight approved or rejected requests. Every request leaves the list 15 minutes after it was made, so expired ones disappear. | `CLI/src/mcp_transactions.go:56-62` (expired transactions deleted on load), `:156-174` (`ListMCPTransactions` skips expired); `GUI/renderer/src/settings/ai.jsx:32, 77` |
| ai-access.mdx | "How many calls it has made" | The count (shown as "calls") and the last-used time go up per server start, not per call | `CLI/src/mcp.go:334-337` (`UsageCount++` in `StartMCPServer`) |
| ai-access.mdx | "**Revoke** cuts that assistant off on its next call. Its pending requests are rejected." | Revoke deletes the token, which is only checked when the server starts; pending requests are not rejected | `CLI/src/mcp.go:317-337`; `CLI/desktop_handlers.go:2719-2742` (`hMCPTokenRevoke` does not touch transactions) |
| troubleshooting.mdx | One engine restart "locks the vault with **The APM backend restarted.**" | You see **Vault locked**. The reason text is not shown. | `GUI/electron/backend.js:126` (sends `reason`); `GUI/renderer/src/lib/store.js:182` (toast "Vault locked", reads `d.message`, which is never set) |
| troubleshooting.mdx | "**Open another vault** on the lock screen" | **More options → Open another vault**, then **Open an existing vault** | `GUI/renderer/src/screens/auth.jsx:527-528, 83` |
| troubleshooting.mdx | Sync errors listed as **GitHub error**, **Google sign in failed**, **Dropbox sign in failed** | Those messages carry code `network`, so the toast always reads "Could not reach the provider. Check your connection and try again." The full error is in the provider row after a failed sync. The list now names causes to check. | `CLI/desktop_cloud.go:91, 107, 130, 140, 166, 462, 609, 624, 638, 649` (`rpcErr("network", …)`); `GUI/renderer/src/lib/store.js:94-101` (`friendly()`); `CLI/desktop_cloud.go:370` and `CLI/desktop.go:1252-1254` (provider error); `GUI/renderer/src/settings/sync.jsx:49-50` |
| troubleshooting.mdx | Recovery email errors "Could not send the verification email", "The code expired. Send a new one.", "Too many wrong codes. Send a new one." | Send failure shows the generic network message. Expired and too-many codes come back as "That code does not match." | `CLI/desktop_handlers.go:1876, 1902, 1909, 2235, 2262, 2269`; `GUI/renderer/src/screens/auth.jsx:202, 587`; `GUI/renderer/src/settings/recovery.jsx:81` (every `invalid` replaced with "That code does not match…") |
| troubleshooting.mdx | AI requests: "Make sure **MCP server** is on"; "Look in **Past requests**" for expired ones | Removed the switch tip (it has no effect). Expired requests disappear and are not in Past requests. | as in ai-access |
| troubleshooting.mdx | pm install row "A `pm` **comes first on your PATH**" (a message) | The **pm command** row shows a `pm` at another path. The conflict text is computed but never shown. | `GUI/electron/cli-install.js:129-147` (`conflict()`), `:203`; `GUI/renderer/src/settings/data.jsx:163-183` (never reads `cli.conflict`) |
| troubleshooting.mdx | "**The administrator prompt was cancelled.**" shown | No message when you cancel | `GUI/electron/cli-install.js:213` (code `cancelled`); `GUI/renderer/src/settings/data.jsx:159` (cancelled is not toasted) |
| troubleshooting.mdx | "Quitting APM also clears a secret it copied." / "Usernames … are never cleared" | The timer never clears plain values. Quitting clears the last thing APM copied, secret or not, if it is still on the clipboard. | `GUI/electron/main.js:108-112, 186-200, 456-460`; `GUI/renderer/src/screens/fields.jsx:12` |
| sync.mdx | Drive APM public: "only someone with your retrieval key can find it" | Access to APM's shared Drive account ships in every `pm`, and the file is shared anyone-with-link, so treat it as public. The master password is the protection. | `CLI/src/cloud.go:95-121` (`Type: "anyone", Role: "reader"`), `:330-347` (built-in credentials), `:242-254` (`ListVaults` lists the folder) |
| sync.mdx | Dropbox APM public: "Only someone with your retrieval key can find the file" | Access ships in every `pm`; treat the file as public | `CLI/src/cloud.go:375, 500-502` (`GetDefaultDropboxToken`) |
| sync.mdx | `[misc]` `ignore:history` "leaves History local" | Section is read but ignored, so `ignore:history` has no effect. Removed from the example file. | `CLI/src/apmignore.go:110-115` (parsed into `cfg.Misc`), `:166` (`MiscIgnoreEnabled` is never called anywhere in `CLI/`) |
| sync.mdx | Restore on another device (no limit) | The app only looks in APM public for Drive and Dropbox; your own Drive or Dropbox app needs `pm cloud get` | as in first-run |
| history.mdx | Action **INIT** "The vault was created" | No INIT action exists. A vault made in the app starts with a **SAVE** commit noted "Vault created". | `CLI/src/lgit.go:176, 256, 287, 307` (SAVE, CHECKOUT, SQUASH, UNDO only); `CLI/desktop_handlers.go:469` |
| import-export.mdx | **File → Import…**, **File → Export…**, **Export…** | **Import...**, **Export...** (three periods, as in the menu) | `GUI/electron/menu.js:43-44` |
| import-export.mdx | Credential Exchange exports passkeys: "Yes" | Only passkeys never used to sign in; a passkey with a sign counter above 0 is left out | `CLI/src/transfer_cxf.go:40-54` (`CXFPasskeyExcluded`: `SignCount != 0`) |
| passkeys.mdx | APM, Credential Exchange and Bitwarden exports include passkeys | Added: Credential Exchange only takes never-used passkeys | as above |
| search.mdx | Copy and Settings groups "Shown before you type: No" | 5 each | `GUI/renderer/src/screens/shell.jsx:105` (`idleLimit: 0`); `GUI/vendor/design-system/bundle.js:519` (`g.idleLimit \|\| g.limit`, so 0 falls back to `limit: 5`) |
| search.mdx | **View → Search…** | **View → Search...** | `GUI/electron/menu.js:93` |
| keyboard-shortcuts.mdx | **Settings…**, **New Space…**, **Import…**, **Export…**, **Search…**, **Password Generator…** | Three periods, as the native menu spells them | `GUI/electron/menu.js:41-45, 93, 101` |
| generator.mdx | **View → Password Generator…** | **View → Password Generator...** | `GUI/electron/menu.js:101` |
| spaces.mdx | **File → New Space…** | **File → New Space...** | `GUI/electron/menu.js:41` |
| terminal.mdx | "It tells you if another `pm` comes first on your PATH" | The **pm command** row shows the path of the `pm` your terminal runs | `GUI/electron/cli-install.js:151-166, 182-203` (`whichPm`, `found.path`); `GUI/renderer/src/settings/data.jsx:163-183` |
| browser-extension.mdx | `pm extension link` registers "Chrome, Edge, Arc and Brave" | Chrome, Edge, Brave, Arc, Vivaldi and Chromium | `CLI/extension_cmd.go:38-47` (`nativeBrowsers`; also Chrome Beta and Canary), `:278` |
| authenticator.mdx | "The Authenticator item shows **Used by** with the login" (for either link rule) | Only when the two have the same name. A link through the website alone does not show it. | `GUI/renderer/src/screens/detail.jsx:21-33` (`linkedTotp` matches name or host; `linkedLogin` matches name only), `:124` |

**Follow-up after CLI commit `013843f`** (2026-10-05 20:21, "remove apm passkeys since not needed"). It deleted `CLI/passkeys_cmd.go`, so `pm passkeys list/rename/rm` no longer exist (`pm --help` at HEAD lists no `passkeys`).

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| passkeys.mdx | "`pm passkeys list`, `pm passkeys rename` and `pm passkeys rm` manage the same passkeys" | `pm` has no commands for website passkeys. `pm get` shows a login's passkey count and sites, never private keys. Rename and remove them in the app. | `git show --stat 013843f` (deletes `passkeys_cmd.go`); `CLI/cli_helpers.go:158-177` (`Passkeys: N (sites)`), called from `CLI/main.go:5263` |
| settings.mdx | Level 3 alerts include `pm` passkey rename/delete | Removed; only `pm` entry add/edit/delete | as above; no `SendAlert` remains for passkeys |

Notation used in the table: when a page quotes a UI string that the code contradicts (for example "never secrets" or "next to pm"), the page keeps the quote and says what the code does.

### Findings for the owner (desktop)

These are app or engine behaviours that the old pages described as working. Each is now documented as it is.

1. **Security alerts never send email.** `SendAlert` only appends to `email.log` in the working directory (`CLI/src/security.go:60-84`). For the desktop app that is the vault's folder (`CLI/desktop.go:188`); for `pm` it is wherever you ran it. Several listed events never call it.
2. ~~**MCP approval is not enforced.** An assistant can commit its own add, edit or delete request with `tx_id` plus `approve: true` (`CLI/src/mcp.go:278-315`).~~ **Resolved by the v12 MCP change.** See "MCP change (v12)" at the top.
3. **The MCP server switch does nothing to `pm mcp serve`.** `MCPEnabled` is only read when building the view (`CLI/desktop.go:1374`).
4. **Revoke is not immediate**, because the token is checked once at server start (`CLI/src/mcp.go:317-337`). Pending requests are not rejected (`CLI/desktop_handlers.go:2719-2742`). The UI copy at `ai.jsx:47, 61` says otherwise.
5. **`search_vault` returns full secrets**, and only `get_entry` reads are audited (`CLI/src/mcp.go:551, 575-590`). The UI copy at `ai.jsx:12, 179` says otherwise.
6. **The Touch ID Keychain item has no biometric access control.** The fingerprint check is a separate osascript step before `security find-generic-password` (`CLI/src/touchid/touchid_darwin.go:99-163`).
7. **`.apmignore` `[misc]` is parsed and then ignored.** `MiscIgnoreEnabled` is never called (`CLI/src/apmignore.go:166`).
8. **Copy and Settings groups show 5 entries before typing**, though `idleLimit: 0` looks meant to hide them. `0` is falsy in the CommandMenu (`GUI/vendor/design-system/bundle.js:519`). This is a probable app bug.
9. **Restore from cloud in the app only reaches APM public** for Drive and Dropbox. The dialog never sends a mode or token (`GUI/renderer/src/screens/auth.jsx:685`; `CLI/desktop_cloud.go` `hSyncRestore`).
10. **`friendly()` replaces every `network` error with a generic message.** That includes "GitHub error: …" and "Google sign in failed: …", so the real cause of a failed connect is never shown (`GUI/renderer/src/lib/store.js:94-101`).
11. **`friendly()`-style rewriting also hides "The code expired" and "Too many wrong codes"**, which show as "That code does not match" (`auth.jsx:202, 587`, `recovery.jsx:81`).
12. **The installer's `conflict()` text is computed and never displayed** (`GUI/electron/cli-install.js:129-147, 203`; `data.jsx` never reads it).
13. **The policy card copy says "next to pm"**, but the folder is read next to the vault (`security.jsx:89` vs `CLI/desktop.go:1415-1417`).
14. **The backend-restart reason is lost.** `backend.js:126` sends `reason`, the toast reads `message` (`store.js:182`).
15. **The anomaly-detection copy promises "bursts of failed attempts, even with email alerts off"**, but only the unlock hour is checked, and only with alerts on (`CLI/src/anomaly.go:42-52`, `CLI/desktop_handlers.go:208`).
16. **Failed-attempt counter location.** `.apm_lock` sits in `APM_STATE_DIR`, or next to the running executable when that's unset (`CLI/src/utils.go:245-275`). The app's backend sets `APM_STATE_DIR` to the vault's folder and changes into it (`CLI/desktop.go:184-188`). So the app counts failures next to the vault, while a terminal `pm` counts next to its own binary. They keep separate counts. An earlier note here and in the security section said the app doesn't set `APM_STATE_DIR`; that was wrong.
17. **Edge case (not documented, logged only):** if every one-time recovery code is used up, the backend may still require a second factor during recovery while the app offers none. Compare `CLI/desktop_handlers.go:2119-2134` with the recovery flow in `GUI/renderer/src/screens/auth.jsx`. This was not tested.

### Unresolved (desktop)

- **Issue tracker owner.** The **Report an Issue** menu item and DOCS_URL point to `aaravmaloo/apm` and `aaravmaloo.github.io/apm` (`GUI/electron/menu.js:3-4`), while release workflows and other pages use `apms-org/*`. The desktop troubleshooting page links `github.com/aaravmaloo/apm/issues`, which matches what the menu opens, so it was left as is. The canonical home needs the owner's call.
- **Default for "Shown before you type" (Copy and Settings).** Documented as the app behaves today (5). If the app is fixed to honour `idleLimit: 0`, revert to "No".
- **Platform paths for third-party assistants** (Claude Desktop, Cursor, VS Code, Cline config files in ai-access.mdx) were checked only against the app's own list (`ai.jsx:19-24`), not against those clients.

---

## security section

Pages: all 9 in `website/content/docs/security/` (index, encryption, profiles, sessions-and-locking, recovery, sync-security, threat-model, vault-format, reporting). About 260 claims were checked against `CLI/` (engine, `pm`, desktop RPC handlers), `GUI/renderer/src` and `GUI/electron`. All 9 pages compile before and after the edits, and every `/docs/security/...` anchor resolves. The `/docs/reference/apmignore` link now resolves; the reference section has since been written.

### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| recovery.mdx | Recovery key "Entry is not case sensitive, and the dashes are optional." | Case-insensitive, but you must type the dashes. A key entered without them is rejected. | `CLI/src/vault.go:1037-1056` (generated and stored with dashes), `vault.go:1144-1154` (only adds a no-dash candidate when the input has dashes), `vault.go:1065-1067` (KDF over the dashed string), `GUI/renderer/src/screens/auth.jsx:623` |
| recovery.mdx | Steps list code (5 tries), then key (3 tries) as the only order | Added: that is the desktop order. `pm auth recover` asks for the key before the emailed code. | `CLI/main.go:6200-6247`; `GUI/renderer/src/screens/auth.jsx:607` |
| recovery.mdx | `pm auth recover` stops "once the vault has been saved again after the recovery key was created" | "…once the vault has been saved again after a fresh unlock" | `CLI/src/vault.go:409` (`ObfuscatedKey` is `json:"-"`), `vault.go:528-532`, `vault.go:612-834` (`decryptNewVault` never loads it), `vault.go:915` |
| profiles.mdx | "`pm setup` and `pm profile set paranoid` use AES-256-GCM with a 24-byte nonce" | `pm profile set paranoid` uses AES-256-GCM. `pm setup` offers AES-256-GCM as the default when it asks for a cipher. | `CLI/main.go:2315-2320`, `main.go:2599-2620`, `src/security.go:10-18`, `src/utils.go:61-70` |
| profiles.mdx | Desktop: "choose **Custom**" | "choose **Custom profile…**" | `GUI/renderer/src/settings/security.jsx` (card footer button) |
| profiles.mdx | "It estimates the unlock time on your computer" | A rough estimate from time cost and memory. The app saves every custom profile as `custom`. | `security.jsx` (`estimate = (time*memory)/(3*64)*0.3`); `CLI/desktop.go:813` |
| vault-format.mdx | Profile `Name`: "…or the name you gave a custom profile" | Added: the desktop app always writes `custom` | `CLI/desktop.go:813` |
| vault-format.mdx | `recovery_share_*`: "How many trustee shares exist, how many are needed" | "How many are needed, how many exist" | `CLI/src/quorum_recovery.go:226-228` |
| vault-format.mdx | Body "Recovery: Your full recovery email, plus copies of the recovery fields above" | Lists what is copied. `email_hint` and `obfuscated_key` are not copied. | `CLI/src/vault.go:401-424` |
| sessions-and-locking.mdx | "locking either one locks both" | Locking the app locks `pm`. `pm lock` only ends the terminal session. | `CLI/desktop_handlers.go:363-380`; `main.go:945-956`; no session-file watcher in `CLI/desktop*.go` |
| sessions-and-locking.mdx | Ephemeral callout: password in the file "while a session exists" | Added: a revoked session keeps the password in the file until its TTL expires | `CLI/src/ephemeral_session.go:169-186`, `:73-80` |
| sessions-and-locking.mdx | "not every command checks [scope]" (no examples) | Examples: a `read` session can run `pm session issue --scope write` or `pm auth change`; MCP ignores scope | `CLI/main.go:973, 6582`; `src/mcp.go:1360-1377` |
| sync-security.mdx | APM_PUBLIC "(the default)" | "the default in `pm`". The desktop app preselects self-hosted. | `CLI/main.go:94-118, 5474-5506`; `GUI/renderer/src/settings/sync.jsx:13-14, 108, 118` |
| sync-security.mdx | Drive APM_PUBLIC "A shared folder … shared as anyone with the link" | A folder in APM's Drive; the file gets the anyone-with-link reader permission | `CLI/src/cloud.go:95-121` |
| sync-security.mdx | File names `v_` + "12 random hex characters" | 6 hex characters | `CLI/src/cloud.go:86-91, 427-430`; `src/utils.go:299-305` |
| sync-security.mdx | `.apmignore` copy "encrypts it with your master password the usual way" | Exception: with rules present, the first `pm cloud init github` upload is encrypted with the GitHub token, holds the data key, and stays in repo history | `CLI/main.go:202`, `src/cloud_ignore.go:11-26`, `src/apmignore.go:190` |
| sync-security.mdx | "Self-hosted Dropbox listens on port 8080 …" | Both Drive and Dropbox self-hosted sign-ins listen on `:8080` (all interfaces) for up to 5 minutes | `CLI/src/cloud.go:262, 283, 312, 519, 529`; `desktop_cloud.go:105, 128` |
| encryption.mdx | `.apmignore` row: always encrypted with the master password | Notes the GitHub-init exception | as above |
| threat-model.mdx | Password rules enforced by "`pm setup` and the desktop app" | Names the symbol set, and adds that `pm auth change`, `pm auth recover` and `pm auth quorum-recover` don't check the rules | `CLI/src/utils.go:210-243`; callers `main.go:2288`, `desktop_handlers.go:422, 1660, 2384` |
| threat-model.mdx | `pm auth recover` row: "once the vault has been saved again" | "…after a fresh unlock" | as above |
| threat-model.mdx | Read-only scope row (no examples) | Lists `pm auth change`, `pm auth email`, `pm session issue`, `pm cloud init`, `pm space create`; MCP ignores scope | `CLI/main.go:6582, 6346, 973, 1586, 2886`; `src/mcp.go:1360-1377` |
| threat-model.mdx | Touch ID: "Setting it up also passes your master password to `security`" | "Setting it up, or updating it after a password change, …" | `CLI/src/touchid/touchid_darwin.go:123-135`; `main.go:3658-3667`; `desktop_handlers.go:1728-1733` |
| threat-model.mdx | "`pm auth alerts` and `pm auth level` only write alerts to email.log" | "Alerts you turn on with … are only written to email.log" | `CLI/src/security.go:60-84` |
| threat-model.mdx | MCP table | Added row: `pm mcp serve` without `--token` takes an arbitrary saved token | `CLI/main.go:6955-6973` |

### Security findings verification

| # | Claim on the pages | Verdict | Evidence |
|---|---|---|---|
| 1 | Recovery key XOR-masked into the cleartext header field `obfuscated_key` with a constant from the source | **VERIFIED** | `CLI/src/vault.go:528-532, 1095-1104` (XOR with `"APM_RECOVERY_OBFUSCATION_SALT_2026"`), `1106-1113`, `1144-1260`, `836-931`. `pm` tells the user "NOT stored in plain text" (`main.go:6457`). |
| 1a | The field disappears on the next save after a fresh unlock; copies made in between keep it | **VERIFIED** | `vault.go:408-409`; `decryptNewVault` (`612-834`) never sets it; `DecryptVaultWithDEK` (`915`) reloads it; `main.go:3849-3852`; lgit snapshots every save (`src/storage.go:17`, `src/lgit.go:170-215`) |
| 2 | `pm auth recover` refuses with "Recovery record found but key is missing…" once the field is gone; desktop and `quorum-recover` unaffected | **VERIFIED** | `CLI/main.go:6138-6141`; `desktop_handlers.go:2160-2190, 2278-2369`; `main.go:6678-6770` |
| 3 | Read-only not enforced on several `pm auth` commands | **VERIFIED, broader than written** | Flag discarded at `main.go:6346, 6478, 6520, 6557, 6582, 973, 1586, 1672, 1741, 2121, 2498, 2569, 2886, 2925`. These do check it: profile set/edit/create, auth codes generate, passkey register/disable, touchid setup, quorum-setup, cloud reset, autolock. MCP ignores ephemeral scope (`src/mcp.go:1360-1377`). |
| 4 | APM_PUBLIC is the default; built-in credentials; Drive anyone-with-link | **VERIFIED for `pm`, PARTIAL overall** | `main.go:94-118, 5474-5506`; `src/cloud.go:358-362, 330-347, 500-502, 95-121, 242-254`; desktop preselects self-hosted (`sync.jsx:13-14, 108`); MCP `cloud_sync` always uses `apm_public` (`src/mcp.go:1154`) |
| 5 | MCP tokens stored unhashed and passed on the command line | **VERIFIED** | `src/mcp.go:206-238, 126-167, 78-99` |
| 5a | A bad token prints every saved token to stdout | **VERIFIED** | `src/mcp.go:323-327` (stdout is the stdio MCP channel, `1265-1268`) |
| 5b | Revocation and expiry apply only on server restart | **VERIFIED** | `src/mcp.go:317-337` |
| 5c | Agents can approve their own writes | **VERIFIED** at `013843f`. **Resolved by the v12 MCP change.** | `src/mcp.go:278-315` (old) |
| 5d | `manage_profiles`, `manage_spaces`, `cloud_config`, `cloud_sync` skip the preview; legacy profile allowed | **VERIFIED** | `src/mcp.go:912-1074, 1135-1194`; `src/utils.go:83-99` |
| 5e | `search_vault` returns full item contents | **VERIFIED** | `src/mcp.go:575-582`; legacy `read` scope includes it (`47-51`) |
| 5f | Reads not audited | **VERIFIED** | only `get_entry` logs (`src/mcp.go:551`) |
| 5g | Each MCP call keeps the session alive | **VERIFIED** | `src/mcp.go:1360-1361`; `src/session.go:150-153` |
| 5h | NEW: `pm mcp serve` without `--token` uses an arbitrary saved token | **VERIFIED** | `CLI/main.go:6955-6973` |
| 6 | Session file plus `session.key` reveal the master password to any same-user process | **VERIFIED** | `src/session.go:211-241, 162-180` |
| 7 | Ephemeral sessions store the password in plain text; `--bind-pid` binds to the issuing `pm` | **VERIFIED** | `src/ephemeral_session.go:15-27, 87-93, 160`; `main.go:985-987` |
| 8 | Touch ID Keychain item not biometric-bound; password on the `security` command line | **VERIFIED** | `src/touchid/touchid_darwin.go:109-163` |
| 9 | Failed-attempt counter in a plain file; decoy vault at 6+, lock at 9+ in `pm`; app cooldown every 3rd failure and lockout at 6 | **VERIFIED** | `src/utils.go:245-272`; `main.go:3768-3793`; `desktop_handlers.go:236-266` |
| 10 | Alerts never send email | **VERIFIED** | `src/security.go:60-84` |
| 11 | `pm` clipboard never cleared; on Windows the secret goes on PowerShell's command line | **VERIFIED** | `main.go:3632-3652` |
| 12 | One-time recovery code hashes are unsalted, 40-bit | **VERIFIED** | `src/recovery_codes.go:16-19, 34-38` |
| 13 | `pm compromise` deletes only `vault.dat` | **VERIFIED** | `main.go:1460-1481` |
| 14 | Legacy profile runs Argon2id with almost no memory and 600,000 passes | **VERIFIED** | `src/utils.go:71-80, 136-152`; `src/health.go:19-21`; desktop refuses it (`desktop.go:791-792`) |
| 15 | NEW: first `pm cloud init github` upload with `.apmignore` rules is encrypted with the GitHub token | **VERIFIED** | `main.go:202`, `src/cloud_ignore.go:11-26`, `src/apmignore.go:190` |

### Other observations (logged, not on the pages)

- `src/session.go:204-208`: the session reader also accepts a plain JSON session file with no encryption envelope.
- `src/cloud.go:264, 505`: the OAuth `state` is the constant `"state-token"`, and the callback binds `:8080` on all interfaces.
- `src/mcp.go:1388-1390`: when the `pm` session is read-only, MCP serves the decoy vault. The agents log has the write-over consequence.
- `GUI/renderer/src/settings/sync.jsx:145`: the APM-public callout says "Only someone with your retrieval key can find it", which the anyone-with-link permission contradicts. The desktop docs page was corrected (see the desktop table).
- `main.go:2121-2148` with `src/cloud.go:646-655`: `pm cloud delete` with GitHub as the last provider deletes the whole repository.
- `main.go:6447-6451`: `pm auth email` returns before showing the recovery key if the alert email fails to send.

### Unresolved (security)

- **`.apm_lock` location:** resolved. The app's backend does set `APM_STATE_DIR`, to the vault's folder (`CLI/desktop.go:184-186`), so the app and a terminal `pm` use different counter files. The security fork's "the app does not set it" was wrong, because it looked only at `GUI/electron/main.js`. See desktop finding 16.
- **`grep -c obfuscated_key vault.dat`** in recovery.mdx assumes `grep -c` counts matches in a binary file. It was not run.
- **reporting.mdx uses `apms-org/*`.** That agrees with the release and build code, but the CLI checkout's remote and the app's Help menu use `aaravmaloo/apm`. No SECURITY.md exists, which matches the page.

---

## agents section

Pages: index, setup, scopes-and-approval, tools, recipes, troubleshooting. About 260 claims were checked against `CLI/src/mcp.go`, `mcp_transactions.go`, `mcp_apply.go`, `CLI/main.go`, `src/session.go`, `src/ephemeral_session.go`, `src/cloud.go`, `src/vault.go`, `src/audit.go`, `CLI/desktop*.go`, `GUI/renderer/src/settings/ai.jsx` and `screens/shell.jsx`. All 6 pages compile. `/docs/reference/environment-variables`, reported missing during the pass, now exists, and every link resolves.

### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| index.mdx | "Calls that open an item or change the vault are written to the audit log." | "Opening an item with `get_entry` and most changes to the vault are written to the audit log." | `CLI/src/mcp.go:628-656` (decrypt_entry has no LogAction); `mcp.go:1163-1180` |
| index.mdx | "No tool takes or returns your master password." | "No tool uses or returns…" (`install_apm` lists a `master_password` argument but ignores it) | `mcp.go:376-390`. **Resolved by the v12 MCP change.** `install_apm` was removed. |
| scopes-and-approval.mdx | "never asks for, receives or returns your master password" | "never needs or returns…", with the same note | `mcp.go:376-390` |
| setup.mdx | Desktop token link to `/docs/desktop/settings` | `/docs/desktop/ai-access` | `website/content/docs/desktop/ai-access.mdx` |
| setup.mdx | `pm mcp config` "downloads and runs an install script every time" | Runs PowerShell with `-ExecutionPolicy Bypass` every start; downloads the script only when `pm` isn't on PATH | `CLI/main.go:6786` |
| scopes-and-approval.mdx | `cloud_sync` "Upload … to Google Drive or GitHub" | Google Drive; its GitHub option always fails | `mcp.go:1154`; `cloud.go:579-582` |
| scopes-and-approval.mdx | Callout: `cloud_config` + `cloud_sync` let an agent upload to a repo it chooses | Retitled "cloud_config redirects your own syncs" (the user's next GitHub sync goes to the agent's repo) | `mcp.go:1061-1066`; `main.go:5569-5578`; `desktop_cloud.go:322-329` |
| scopes-and-approval.mdx | Group names "can only be set from the desktop app or by older versions of pm" | `pm mcp token` and the app dialog only offer tool names; older tokens may hold group names | `main.go:6857-6860`; `ai.jsx:11-17, 140`; `mcp.go:47-70, 1349-1355` |
| scopes-and-approval.mdx | Read-only sessions: decoy vault, implied safe | Added danger callout: writes save the placeholder vault over the real file with the real password | `mcp.go:1388-1390, 782-796, 985-1024, 932-958, 1053-1068, 1279-1285`; `vault.go:2267-2304` |
| scopes-and-approval.mdx | search_vault callout | Added: matches JSON field names too, so `password` matches every login | `mcp.go:582-590`; `vault.go:98-109` |
| scopes-and-approval.mdx | Sidebar shows "**AI requests waiting for approval**" | "**N AI requests waiting for approval**" | `GUI/renderer/src/screens/shell.jsx:58` |
| scopes-and-approval.mdx | Added, edited, deleted items appear in the item history | Edits through MCP add no history entry | `mcp_apply.go:151-190`; `vault.go:1484, 1502, 1516, 1534, 1596` |
| tools.mdx | search_vault `query` "matched against every field" | Matched against each item as JSON, field names included | `mcp.go:586-587` |
| tools.mdx | cloud_sync "Dropbox isn't available over MCP." | "The schema doesn't offer Dropbox." | `mcp.go:1137` |
| tools.mdx | cloud_sync GitHub "usually fails" | "always fails", with the exact messages | `mcp.go:1154-1192`; `cloud.go:364-372, 555-567, 579-582` |
| tools.mdx | cloud_sync Drive first upload readable by anyone with the ID | Kept; added that the ID goes to the agent and the built-in account is used | `mcp.go:1170-1180`; `cloud.go:93-121, 353-363` |
| tools.mdx | Example `{"provider": "github"}` → `Sync successful` | Example uses `gdrive` | as above |
| troubleshooting.mdx | Session check (TMPDIR) | Added: some clients start servers with few env vars; set `TMPDIR` in `env` | `session.go:54-70` |
| troubleshooting.mdx | Vault location "`~/.apm/vault.dat`, or `APM_VAULT_PATH`" | `APM_VAULT_PATH`, else `vault.dat` next to `pm`, else `~/.apm/vault.dat` | `CLI/main.go:51-74` |
| troubleshooting.mdx | "`Save failed`: pm couldn't write the vault file" | Only `add_entry` reports it; other writes ignore save errors | `mcp.go:796-798` vs `845, 905, 956, 1003, 1022` |
| recipes.mdx | ephemeral_sessions.json "holds what's needed to open the vault" | "holds your master password in plain text" | `ephemeral_session.go:22, 87-93, 118` |

### Security findings verification

| Claim (page) | Verdict | Evidence |
|---|---|---|
| Revoked or expired token works until the server restarts | VERIFIED | `mcp.go:317-338, 354, 397` |
| Token stored in plain text in `mcp_auth.json` | VERIFIED | `mcp.go:156-177, 198-204, 225-231` |
| Token on the command line | VERIFIED | `mcp.go:89, 96`; `main.go:6985` |
| Invalid token prints every saved token to stdout | VERIFIED | `mcp.go:325` |
| Vault load errors print DEBUG lines to stdout, corrupting the stream | VERIFIED | `mcp.go:1384, 1394` |
| `pm mcp serve` without `--token` uses an arbitrary token | VERIFIED | `main.go:6957-6975` |
| `search_vault` returns full items incl. secrets | VERIFIED, and stronger (field-name matching) | `mcp.go:579-614` |
| Agent can commit its own preview | VERIFIED at `013843f`. **Resolved by the v12 MCP change.** | `mcp.go:278-315` (old) |
| Agent commit applies the second call's arguments, not the previewed ones | VERIFIED at `013843f`. **Resolved by the v12 MCP change.** Agents can no longer commit. | `mcp.go:766-790, 875-899`; desktop approval applies `tx.Args` (`desktop_handlers.go:2764`) |
| Commit check is by token name, not identity | VERIFIED at `013843f`. **Resolved by the v12 MCP change.** | `mcp.go:305` (old) |
| Agent self-commit records no lgit commit; desktop approval does | VERIFIED at `013843f`. **Resolved by the v12 MCP change.** Only the desktop path remains. | `mcp.go:1279-1285` vs `storage.go:8-19`, `desktop_handlers.go:2779-2780` |
| Agent-committed add/edit changes the current space | VERIFIED at `013843f`. **Resolved by the v12 MCP change.** | `mcp_apply.go:70-73, 152-155`; `desktop_handlers.go:2759-2770` |
| `mcp_transactions.json` stores arguments incl. secrets; 15-minute expiry | VERIFIED | `mcp_transactions.go:15-26, 71-107`; `mcp.go:290` |
| `tx_abort` / `tx_list` work across all clients | VERIFIED | `mcp.go:1218-1263`; `mcp_transactions.go:151-174` |
| Read-only session gives the agent a decoy vault | VERIFIED, plus NEW FINDING: writes then overwrite the real vault with the decoy | `mcp.go:1388-1390, 1279-1285`; `vault.go:2267-2304` |
| Ephemeral `--scope` not applied to MCP | VERIFIED | `mcp.go:1360-1380` |
| `--bind-pid` binds to the issuing `pm` | VERIFIED | `main.go:980-983`; `ephemeral_session.go:160-162`; `mcp.go:1367` |
| Server uses the ephemeral session only without a regular one | VERIFIED | `mcp.go:1361-1366` |
| Agent calls reset the idle timer | VERIFIED | `session.go:150-153` |
| MCP server switch doesn't stop `pm mcp serve` | VERIFIED | `items.go:64`, `desktop_handlers.go:2633`, `desktop.go:1374` only |
| `cloud_sync` Drive always public | VERIFIED | `mcp.go:1154`; `cloud.go:93-121` |
| `cloud_sync` GitHub gets the Drive token | VERIFIED, understated (always fails) | `mcp.go:1154`; `cloud.go:579-582` |
| `cloud_config` + `cloud_sync` upload to the agent's repo | NOT VERIFIED as written; the real risk is redirection of the user's own sync. Page fixed. | `mcp.go:1061-1066`; `main.go:5569-5578`; `desktop_cloud.go:322-329` |
| `check_installation` looks for `apm`, not `pm` | VERIFIED at `013843f`. **Resolved by the v12 MCP change.** The tool was removed. | `mcp.go:357` (old) |
| `edit_entry` skips the password policy | VERIFIED | `mcp_apply.go:158-168` vs `vault.go:1472-1477` |
| `get_history` exposes government ID numbers | VERIFIED | `vault.go:1921, 1929` |
| `pm mcp config` runs an install script every start | PARTIAL (only when `pm` is missing). Page fixed. | `main.go:6786-6795` |

### Unresolved (agents)

- **Third-party client details** (config paths, menu names, flags for Claude Desktop, Claude Code, Cursor, VS Code, Cline and Windsurf) can't be checked against this repo.
- **The TMPDIR tip** rests on how MCP stdio clients pass environment variables. It was not verified here, and it is worded as "some clients".
- **The read-only overwrite finding** comes from reading the code. It was not run.

### Out-of-scope observations (app copy and engine)

- **Untrue UI copy in `ai.jsx`:**
  - `ai.jsx:47, 61`: revoking cuts the assistant off on its next call and rejects its pending requests.
  - `ai.jsx:14`: the Write group needs approval first. (Now true for add, edit and delete. **Resolved by the v12 MCP change.**)
  - `ai.jsx:179`: every read is audited.
  - `ai.jsx:60`: "calls" counts server starts.
  - `ai.jsx:37`: turning the switch off stops approval requests.
- **`*` tokens:** `validMCPPerm` accepts `"*"` (`desktop_handlers.go:2677`) but `hasPermission` does not treat it as "all" (`mcp.go:1344`).
- **Older `delete` group:** tokens with this group lose `delete_entry`.
- **`get_entry` schema hint:** it suggests `'recovery_code'`, which never matches (`mcp.go:462` vs `485`).
- **`FindMCPConfigFiles`:** it probes `%APPDATA%` paths on every OS (`mcp.go:108-112`).
- **`tx_abort`:** it can flip a committed transaction to `aborted` (`mcp_transactions.go:127-148`).

---

## extension and getting-started: preliminary pass

Both sections were checked, and corrected in place, before the coordinator moved them behind the depth agent. The depth agent is now expanding these pages and logs its additions in `_depth.md`. The corrections below are already in the MDX files. A second pass over these two sections, covering both the original text and the `_depth.md` additions, is still to come.

### extension (preliminary)

Pages: 10 in `website/content/docs/extension/`, about 400 claims. All 10 pages compiled, and every link and anchor resolved at the time.

Access note: the permission classifier blocked reading these extension files:
- `background/bridge.js`, `background/pairing.js`, `background/state.js`, `background/frames.js`
- `shared/settings.js`, `shared/types.js`, `shared/time.js`, `shared/gen.js`, `shared/iconkey.js`

Claims that live only in those files are listed under "Unverified" below.

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| index.mdx (callout) | A secret "leaves APM only when you fill, copy or reveal it, and APM records that access" | Two exceptions: live one-time codes are sent whenever shown, and opening a login returns its 2FA setup key and custom fields (hidden ones included) unmasked | `CLI/desktop_bridge_items.go:49-50, 571-587, 743-752, 754-774`; `CLI/src/vault.go:98-108` |
| privacy-and-permissions.mdx | Opening an item: "every secret field blanked" | A login's 2FA key, notes and custom fields (hidden included) are not blanked | same |
| privacy-and-permissions.mdx | Showing codes "for each authenticator" | …and for each login with its own key | `desktop_bridge_items.go:402-418, 743-752` |
| privacy-and-permissions.mdx | "records every reveal, copy and fill" | Every reveal, secret copy and fill; opening details and code copies are not recorded | `desktop_bridge_items.go:652-674, 712-741, 642-650, 754-774`; `extension/src/background/index.js:268-274` |
| privacy-and-permissions.mdx | "rejects any request whose origin is a web page. Only browser extension origins are allowed." | Rejects web-page origins; any extension origin, or no Origin at all, goes on to the token check | `CLI/desktop_bridge.go:362-369, 465-475` |
| privacy-and-permissions.mdx | "Every request except pairing must carry the pairing token" | …except pairing and `/api/info` | `CLI/desktop_bridge.go:126-128, 480-487` |
| privacy-and-permissions.mdx | Native host started only by the APM extension ID | …by the IDs in its manifest, including any added with `--id` | `CLI/extension_cmd.go:297-307, 167-179` |
| privacy-and-permissions.mdx | Show website icons off turns logos off | Stops fetching new logos; cached ones still show | `CLI/icons.go:322-354, 613-624`; `extension/src/background/icons.js:42-55` |
| privacy-and-permissions.mdx | Page scripts read "nearby button text" | …nearby button and heading text | `extension/src/content/autofill.js:62-65` |
| options.mdx | Menu off: opens from icon, right-click "or a shortcut" | Icon or right-click only | `extension/src/background/index.js:536-578`; `content/autofill.js:254-261` |
| troubleshooting.mdx | "This APM session is read-only." also means a newer vault | Only the read-only session case. Added a row for the newer-vault message. | `CLI/desktop.go:364-366, 400-411`; `extension/src/ui/common/kit.jsx:176-182` |
| saving-and-updating.mdx | Badge "**Reused**" | "Reused on" + item name (or "N items") | `extension/src/ui/prompt/main.jsx:154` |
| autofill.mdx | Note "…filled this login on this site a moment ago." | Names the host | `extension/src/ui/inline/main.jsx:149` |
| autofill.mdx | "No one-time code is saved for this site…" | Names the host; hint paraphrased | `extension/src/ui/inline/main.jsx:140` |
| autofill.mdx | Authenticator linked "to the login's exact host" | …the exact host of the login's **Website** only | `CLI/desktop_bridge_items.go:431-478` |
| passkeys.mdx | "APM leaves the signature counter at 0" | Creates passkeys at 0 and leaves them there; imported non-zero counters keep counting | `CLI/desktop_bridge_passkeys.go:448, 537-546` |
| passkeys.mdx | New login choice "shows a Space list" | …if you have spaces | `extension/src/ui/prompt/main.jsx:303-305` |

**Findings.** The first is the main issue; the rest are by design or documented.
1. `GET /api/items/:id` returns TOTP seeds and hidden custom fields in clear, unrecorded (`desktop_bridge_items.go:49-50, 571-587, 642-650`).
2. `GET /api/totp` returns codes for every authenticator and keyed login, unrecorded (`:743-752`).
3. The bridge accepts any extension origin and requests with no Origin; the token is the only gate (`desktop_bridge.go:362-369, 465-487`).

**Unverified because the files were blocked:**
- Client name format ("Chrome 129 on macOS").
- The 10-minute no-re-ask after a denied pairing.
- Port range 1024-65535.
- The options and save defaults column.
- Excluded-site rule labels.
- Generator defaults for words (5) and digits (6).
- Vault tab time groups.
- Storage details in privacy-and-permissions.

### getting-started (preliminary)

Pages: index, installation, quickstart, concepts and choose-your-surface; about 150 claims. All 5 pages compiled, and every link and checked anchor resolved.

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| index.mdx | "25 kinds of items, from logins, one-time codes and passkeys…" | Logins (with their passkeys); a passkey is not one of the 25 types | `GUI/renderer/src/lib/types.js:10-114`; `CLI/src/vault.go:105` |
| index.mdx | Master password "is never stored" | "is never written into the vault" | `CLI/src/session.go:20-21, 78-104`; `CLI/lock_policy.go:190-191`; `desktop_handlers.go:222`; Touch ID Keychain copy |
| concepts.mdx | "Your master password is never stored." | Never written into the vault; Touch ID keeps a Keychain copy; a `pm` session keeps it encrypted in a temp file | same |
| concepts.mdx | "Unlocking derives the key and keeps it in memory until the vault locks" | Depends on the surface; the `pm` session file is described | `CLI/src/session.go:54-69, 211-225` |
| concepts.mdx | "APM for Chrome holds nothing" | "holds no keys" (it keeps its pairing token) | `extension/src/shared/settings.js:1` |
| concepts.mdx | File holds "every item, field, passkey and history pointer" | Items, fields, passkeys, item versions and vault-wide settings; lgit and the audit log are in APM's data folder | `CLI/src/lgit.go:28-36`; `src/audit.go:27-28`; `src/items.go:62` |
| concepts.mdx | `legacy` = "PBKDF2, 600,000 iterations" | Argon2id with 600,000 passes and almost no memory (labelled PBKDF2) | `CLI/src/utils.go:71-80, 136-137`; `vault.go:472, 695` |
| concepts.mdx | `standard` "The default" | Used when no profile is set; setup preselects the recommended profile | `CLI/main.go:2295`; `auth.jsx:147`; `vault.go:458-460` |
| concepts.mdx | Sessions link to `/docs/cli/commands` | `/docs/cli/sessions#ephemeral-sessions` | `website/content/docs/cli/sessions.mdx:133` |
| concepts.mdx | MCP token scopes `read`, `secrets`, `write`, `admin` | MCP tools you allow, grouped in the app as Read, Secrets, Write and Admin | `CLI/main.go:6856-6860`; `src/mcp.go:25-70`; `ai.jsx:12-15` |
| choose-your-surface.mdx | `pm` unlocks with the master password | …or Touch ID on a Mac | `CLI/main.go:3797-3805` |
| choose-your-surface.mdx | `pm mcp token` scopes | Pick MCP tools; the app groups them | as above |
| installation.mdx | "All of them are version 12" | App and `pm` share 12; the extension is 1.0.0 | `extension/package.json:4`; `GUI/package.json:4`; `CLI/main.go:3184` |
| installation.mdx | Desktop download `apms-org/apm/releases/latest` | `apms-org/gui/releases` | `GUI/.github/workflows/release.yml`; GUI remote |
| installation.mdx | One macOS zip for Apple silicon and Intel | Separate `darwin_arm64` and `darwin_amd64` zips | `GUI/.github/workflows/release.yml:69` |
| installation.mdx | Windows "APM for Windows … open APM" | `APM-vX.Y.Z-windows_amd64.zip`, open `APM.exe` | `release.yml:77`; `GUI/electron-builder.yml` |
| installation.mdx | Linux "run APM from the extracted folder" | `…linux_amd64.tar.gz`, run `apm-desktop` in `linux-unpacked` | `release.yml:83`; `app-builder-lib/out/linuxPackager.js:15-16` |
| installation.mdx | "Download the `pm` build … put it on your PATH" | Real asset names; rename the binary to `pm` (`pm.exe`) | `CLI/.github/workflows/release.yml:54-77` |
| installation.mdx | `pm mcp token` asks for "the permissions to grant" | Expiry in minutes (0 for never) and the MCP tools; config uses the full path to `pm` | `CLI/main.go:6832, 6856-6860`; `src/mcp.go:78-97` |
| quickstart.mdx | Desktop download `apms-org/apm/releases/latest` | `apms-org/gui/releases` | as above |

**Unresolved:**
- **Canonical CLI repo.** `aaravmaloo/apm` (git remote, install.sh, Homebrew workflow, app Help menu) or `apms-org/apm` (engine updater, build scripts)?
- **`CLI/scripts/install.sh` looks broken.** It asks for `stable-…-mac_<arch>.tar.gz` assets (line 66) that the release workflow no longer produces.
- **App setup copy.** `auth.jsx:220` says the password "is never stored", which is the same inaccuracy the docs had.
- **`paranoid` cipher.** It is AES-256-GCM (24-byte nonce) in the engine (`CLI/src/utils.go:61-69`) but XChaCha20-Poly1305 in the app's picker (`GUI/renderer/src/lib/profiles.js:4`).

---

## cli section

25 pages in `website/content/docs/cli/`, about 1,990 claims (command reference A ≈330, B ≈250, guides A ≈550, guides B ≈500, plus follow-ups).

**The CLI moved four times during this pass**, so each part names the commit it was checked at:
- `013843f` (20:21) removed `pm passkeys`.
- `5c023b7` (20:40) rewrote `pm get`.
- `4ecbf31` (21:01) merged `pm bridge` into `pm extension`.
- `aef9bbf` (21:02) made MCP writes wait for approval in the app and removed the install tools.

At the end, HEAD was `aef9bbf`, and the working tree differed only in `README.md`, `go.mod` and a new `internal/tty/`.

`pm passkeys` and `pm get` UI claims are listed under **Pending CLI change** below, not edited. The depth agent syncs them.

Validation: `node validate.mjs desktop security agents cli reference` reports 0 issues after every part. The only anchor that changed is `#pairing-with-bridge-serve` → `#pairing-with-serve` in `cli/browser-extension.mdx`, and nothing linked to it. `#pm-passkeys-*` was removed, and its index links were fixed.

### cli command reference, part A (commands.mdx, commands-vault.mdx, commands-items.mdx)

**Pages:** `website/content/docs/cli/commands.mdx`, `commands-vault.mdx`, `commands-items.mdx`. About 330 claims checked: command names, aliases, arguments, flags, shorthands, defaults, examples, quoted output, exit statuses and the removed-commands table.

**Sources:**
- `SP/fc/help_tree.txt`, plus a rebuild of the help tree from the HEAD source. The command and flag surface is identical between the two.
- `CLI/main.go`, `cli_helpers.go`, `item_view.go`, `item_edit.go`, `lock_policy.go`, `transfer_cmd.go`, `cmd/inject.go`, `internal/inject/*`, `src/*`, `team/main.go`, `.github/workflows/release.yml`, and git history for the removed commands.

**Runtime checks:** run in a sandbox vault (`SP/fc-cmdref-a`) with a binary built from HEAD:
- `setup`, `unlock`, `lock`, `mode readonly`
- `session issue` / `list`
- `profile list` / `current`
- `cinfo`, `info`
- `add`, `get`, `space create` / `switch` / `list`
- `export --dry-run`
- old command forms, and `--version` after a subcommand

**CLI state:**
- HEAD moved during the pass, from `013843f` to `5c023b7` (2026-10-05 20:40, "update `get` command to support new vault structure and new edit UI"). That commit added `item_view.go` and `item_edit.go` and deleted `login_cmd.go`.
- Everything below was re-checked at `5c023b7`. Line numbers refer to it.

**Validation:** `node SP/validate.mjs desktop security agents cli reference` reports 0 issues.

#### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| commands.mdx | Global flags "work with every command", including `--version` | `-v` and `-h` work everywhere; `--version` works only as `pm --version`. After a subcommand it is an unknown flag (exit 0) | `CLI/main.go:85,88` (`Version` set on the root command only); `pm add --version` prints `Error: unknown flag: --version` |
| commands.mdx | `--vault` overrides `APM_VAULT_PATH` "and the default `~/.apm/vault.dat`" | The default is a `vault.dat` next to `pm` if one exists, otherwise `~/.apm/vault.dat` | `CLI/main.go:57-73` (`init()`), `3178` |
| commands.mdx | Index lists `pm passkeys list`, `rename`, `rm` | Rows removed. Added a removed-commands row: removed; a login's passkeys show in `pm get`, and its edit screen renames or removes them | Commit `013843f` deleted `passkeys_cmd.go`; no `passkeys` command in the help tree; `CLI/item_view.go:371-391`, `CLI/item_edit.go:758-800` |
| commands.mdx | `pm cloud delete`: "Delete the Google Drive copy" | "Delete the vault's cloud copy". It uses `LastCloudProvider` or the argument; the detail page belongs to cmdref-b | `CLI/main.go` `cloudDeleteCmd` (`provider := vault.LastCloudProvider`; `cm.DeleteVault(vault.CloudFileID)`) |
| commands.mdx | `pm update`: "Check for and install updates" | "Check for updates, and install them on Windows" | See commands-vault `pm update` below |
| commands.mdx | Old `pm plugins` subcommands (10 listed) | Added `installed` | `git show fca82c0^:main.go`, `pluginsCmd.AddCommand(pluginsInstalledCmd, …)` |
| commands.mdx | Old commands: "`pm` answers them with `Error: unknown command`, or ignores extra arguments, and still exits with status 0" | "…with an error such as `Error: unknown command`, a not-found message or a usage screen, and still exits with status 0" | Runtime: `pm import json x.json` gives "accepts 1 arg(s)"; `pm policy load ./policies/` gives "not found"; `pm cloud autosync` prints the cloud help; `pm readonly` gives unknown command. All exit 0 (`main.go:3179`, `rootCmd.Execute()` result ignored) |
| commands-vault.mdx | `pm unlock --timeout 8h --inactivity 30m` prints one line | A fresh unlock prints the vault-policy line, then the line for the session actually started. The last one is in force. Output example updated | `CLI/main.go:3857` (`color.Cyan(policy.unlockedLine())` inside `unlockVaultCredentials`), `main.go:908` (`color.Green(... policy.unlockedLine())` after the overrides); runtime output |
| commands-vault.mdx | `pm mode readonly` "Confirms the master password" | Asks only when there's no session; an existing session is reused without asking | `CLI/main.go:926-927` (`src_unlockVault()` returns the live session's password at `main.go:3731-3747`); runtime: no prompt with a live session |
| commands-vault.mdx | Read-only: "commands that would change the vault refuse" | `pm add`, `pm get` edits and deletes, `pm import`, profile and autolock changes refuse. `pm auth change`, `pm session issue`, `pm cloud init`, `pm policy load` and `pm space create` (among others) still work | `CLI/main.go:231`, `4581-4590`, `transfer_cmd.go:400-402`, `lock_policy.go:234-237` refuse; `main.go:973` (session issue), `pm auth change` and `cloud init` (`…, vault, _, err := src_unlockVault()`), `policy load`, and `space create` (`main.go` `spaceCreateCmd`) discard the flag. Runtime: `pm space create Temp` succeeded in a read-only session |
| commands-vault.mdx | `pm autolock` exits 1 "on an invalid value or a read-only session" | Also when the vault can't be unlocked or saved | `CLI/lock_policy.go:224-227, 269-271` |
| commands-vault.mdx | `pm cinfo`: `KDF` reads Argon2id "even for a `legacy` profile vault, which uses PBKDF2" | Legacy is only *labelled* PBKDF2. `pm` derives its keys with Argon2id, 600,000 passes and almost no memory, so the `Argon2id` line is right | `CLI/src/utils.go:71-80` (`KDF: "pbkdf2"`, Time 600000, Memory 0), `utils.go:136-137` (`DeriveKeys` always `argon2.IDKey`), `src/vault.go:472, 695`; `main.go:1083` |
| commands-vault.mdx | `pm update`: "If a plain binary for your OS is attached, downloads it…" | Windows: downloads the release's `.exe` (no CPU-architecture check). macOS/Linux: only takes an asset name with no dot. The release binaries are `apm-v<version>-<os>_<arch>`, so it never finds one there and prints the release page | `CLI/main.go:3237-3248` (`strings.Contains(name, targetOS) && (HasSuffix(".exe") \|\| !Contains("."))`); `CLI/.github/workflows/release.yml` (`BASE="apm-${{ github.ref_name }}-${{ matrix.goos }}_${{ matrix.goarch }}"`, raw binary plus archive uploaded) |
| commands-vault.mdx | `pm compromise` (no mention of authentication) | Added: it doesn't ask for the master password | `CLI/main.go:1462-1483` (only `readInput() != "DESTROY"`) |
| commands-items.mdx | Front matter lists `passkeys` among the commands | Removed; the description now says "and where passkeys fit" | as above |
| commands-items.mdx | `pm passkeys list`, `rename`, `rm` entries (with `-y`, 120-character labels, exit 1) | Replaced by a short note: no passkey commands. `pm get` shows a login's passkeys (no private keys), its edit screen renames or removes them, and import/export carry them | `013843f`, `5c023b7`; `CLI/item_view.go:218-235, 371-391`; `item_edit.go:758-800`; `transfer_cmd.go` (`--no-passkeys`; import Long text) |
| commands-items.mdx | `pm add`: "An active password policy applies to login passwords" | Only when the policy sets a minimum length. No other type, and not `pm get` edits or imports | `CLI/src/vault.go:1472-1477` (`if MinLength > 0 { Validate }`) is the only `pm` call site (`main.go:441`); no policy check in `transfer_cmd.go`, `src/transfer*.go` or `item_edit.go`. The app checks logins and Wi-Fi whenever a policy is active (`CLI/desktop_handlers.go:669-681`) |
| commands-items.mdx | `--show-pass`: "instead of hiding them behind copy prompts" | "Print secret values instead of `********`" | `CLI/item_view.go:271-276` (`masked`), `main.go:3948` |
| commands-items.mdx | `pm space list` "List spaces and their item counts"; example `Work (3 entries)` | Counts only items in the *current* space, so every other space shows 0. Example and summary fixed | `CLI/main.go:2985` (`vault.SearchAll("")`), `src/vault.go:2123-2141` (`SearchAll` filters to the current space); runtime: `* default (1 entries)`, `Work (0 entries)` while Work held 2 items |
| commands-items.mdx | `pm inject` reads `.apminject` from the current folder or nearest parent (no warning) | Added: an `.apminject` can run commands in your shell through its `as:` names; only use trusted files. Links to `/docs/cli/inject#security-notes` | `CLI/cmd/inject.go:54-59`, `internal/inject/shellwriter.go:94-123`, `internal/inject/apminject.go:20-41, 72-83` |
| commands-items.mdx | `pm inject kill` "Prints `unset` lines" | Prints the shell's remove commands (`unset`, `set -e`, `Remove-Item Env:`), `APM_INJECT_SESSION` included | `CLI/internal/inject/session.go:81-85`, `shellwriter.go:64-92` |
| commands-items.mdx | `pm inject setup-shell` writes to "`$PROFILE`, depending on `SHELL`" | Unset or unknown `SHELL` (usual on Windows) gives `~/.bashrc`. PowerShell is chosen only when `SHELL` names it, and then the `PROFILE` *environment* variable is read, which PowerShell doesn't set | `CLI/cmd/inject.go:230-265` (`DetectShellFromEnv(SHELL)`, `shell = inject.Bash` when unknown; `os.Getenv("PROFILE")` at 254) |
| commands-items.mdx | `pm export -o` default `apm-export-<date>.<ext>` | Plus `.cxf.json` for `cxf` and `apm-bitwarden-export-<date>.json` for `bitwarden` | `CLI/transfer_cmd.go:711-717`; runtime `--dry-run` |
| commands-items.mdx | `-f` default "from the file name, else `apm`" | Also `txt` when `--without-password` is given with no `-o` | `CLI/transfer_cmd.go:648-664` |

#### Verified as written (selection)

- **`pm setup`:** 6 steps; creates the vault folder and `policies`; password rules (8+ characters, upper, lower, digit, one of `!@#$%^&*()-_=+`); refuses a read-only session. `--non-interactive` uses the recommended profile with AES-256-GCM and skips the questions. Evidence: `CLI/main.go:2234-2484`, `src/utils.go:210-243`, `src/utils.go:40-80` (every profile defaults to `aes-gcm`).
- **`pm unlock`:** Touch ID first; 3 attempts; an existing session is reused and restarted with its read-only flag. Flag defaults come from the policy (15m and 1h). Evidence: `main.go:875-913`, `3709-3858`, `lock_policy.go:26-32`.
- **`pm lock`:** prints a notice with no session (runtime).
- **`pm autolock`:** flag parsing, `never` / `off` / `none` / `0`, round-up, 30-day cap, on/off synonyms, examples (`lock_policy.go:129-301`).
- **`pm session issue`:** flags and defaults; `eps_` + 24 hex characters; scope validation; host binding is host|user; agent binding. Evidence: `main.go:962-1015`, `src/ephemeral_session.go:44-52, 97-166`.
- **`pm session list` and `revoke`:** the list output layout matches (runtime); revoke needs no unlock.
- **`pm profile`:** list/ls, current/status (output matches exactly), set (built-ins only in a fresh process), and the edit/create prompts and defaults. Evidence: `main.go:2598-2872`, `src/security.go:10-39`.
- **`pm cinfo`:** reads the header; `Memory` is in MB despite its `KB` label (runtime).
- **`pm info`:** version, install folder, vault path, repo, status checks; no unlock (runtime).
- **`pm get`, `pm gen`, `pm totp`:**
  - `pm get` uses only its first argument and searches the current space; without a terminal it shows the single match or a numbered list (`main.go:854-872, 3936-3955`, `src/vault.go:2123`).
  - `pm gen` uses charset `!@#$%^&*()-_=+` and default length 16 (`src/utils.go:189-200`, `main.go:1459`).
  - `pm totp` matching order and login codes (`main.go:4307-4405`, `src/login_totp.go:36-39`).
- **`pm totp link` and `unlink`:** `bridgeHost` strips `www.`; a domain needs a dot or `localhost`; exit 1 through `cliFail` (`cli_helpers.go:15-18, 72-136`; `desktop_bridge_items.go:355-371`).
- **`pm import`:** every flag and default: `--keep-spaces` is on for APM files; `--on-conflict` and `--on-duplicate` take `skip`, `merge`, `replace`, `keep-both` or `ask`; exit 1 on failure (`transfer_cmd.go:269-285, 327-600`).
- **`pm export`:**
  - Every flag matches the help.
  - Overwriting needs `--force` or an interactive yes.
  - Writes with mode 0600.
  - Exits 1 on failure.
  - Evidence: `transfer_cmd.go:608-805`.
- **`pm export compare`:** flags, the four groups, read-only (`transfer_cmd.go:845-895`).
- **Removed-commands table:**
  - `pm-team init <org_name> <admin_username>`, `dept list` and `user promote` exist (`CLI/team/main.go:47, 211, 402`).
  - `pm policy load <name>` reads `policies/` next to the vault (`main.go` `policyLoadCmd`, `filepath.Join(filepath.Dir(vaultPath), "policies")`).
  - `pm cloud auto-sync --true` exists (help tree).
  - Completion is disabled (`main.go:2231`).
  - The old commands are all present in the old docs (`CLI/docs/**`).
  - Plugins were removed in `fca82c0` (2026-09-29, after `v11.2.0`); autocomplete in `44f9e57`.
- **Hidden commands:** `desktop`, `mcp serve --token`, `extension host [origin]`, and the `chrome-extension://` first-argument shortcut (`native_host.go:111-119`, `main.go:77-79`).

#### Documented code issues: verdicts

| Claim (page) | Verdict | Evidence |
|---|---|---|
| `.apminject` `as:` names reach the shell unescaped (commands-items now warns) | **VERIFIED** | `CLI/cmd/inject.go:56-57` copies `as:` (only trimmed, `internal/inject/apminject.go:72-83`) into `EnvVarName`; `internal/inject/shellwriter.go:115-116` writes `export <name>=` raw (also `set -x` at 97-98 and `$env:` at 105-106). The output is meant for `eval` (`setup-shell` snippets, `cmd/inject.go:249-264`). `FindAPMInjectFile` walks every parent up to `/` (`apminject.go:20-41`) |
| Policy enforcement differs between `pm` and the app | **VERIFIED** | `pm`: only `pm add` for logins, and only if `MinLength > 0` (`src/vault.go:1473`). Edits in the new `pm get` editor (`item_edit.go`), imports and other types are unchecked. App: logins and Wi-Fi whenever a policy is active (`desktop_handlers.go:669-681`) |
| Read-only not enforced everywhere (commands-vault now says so) | **VERIFIED** | see the corrections table; runtime `pm space create` in a read-only session |

#### Other findings for the owner (not on the pages, or only partly)

- **`pm update` cannot self-update on macOS or Linux.**
  - The asset filter needs a name without a dot, but release binaries carry the dotted version (`main.go:3239`, `release.yml`).
  - On Windows it doesn't check the architecture, so it takes the first `.exe` whose name contains "windows".
- **`pm space list` shows 0 for every non-current space** (`main.go:2985` uses the current-space-filtered `SearchAll`). The output also says "1 entries".
- **A fresh `pm unlock --timeout/--inactivity` starts two sessions and prints two policy lines** (`main.go:3856-3857` then `906-908`).
- **`pm inject setup-shell` can't target PowerShell in practice.** It reads `$env:PROFILE` (`cmd/inject.go:254`), and on Windows, where `SHELL` is usually unset, it writes `~/.bashrc`.
- **PowerShell values are escaped badly.** `shellwriter.go:104-111, 125-140` uses the POSIX `'\''` form, so a value containing `'` breaks the PowerShell line.
- **`pm compromise` needs no master password,** only the word DESTROY (`main.go:1462-1483`).
- **`pm profile create` reports "applied" even when the save failed.** There is no `return` after `Error saving vault` (`main.go` `profileCreateCmd`). It also doesn't reject zero values, unlike `edit`.
- **`pm gen -l` with a negative number panics** (`make([]byte, length)`, `src/utils.go:191`).
- **`pm profile set` writes the file directly** with `os.WriteFile`, so it makes no lgit commit (`src/security.go:25`).

#### Pages outside my set that need changes

- **`extension/passkeys.mdx:81`** (off-limits now): it still lists `pm passkeys list/rename/rm`.
- **`cli/passkeys.mdx`, `cli/spaces.mdx:40`, `cli/scripting.mdx:126` and `reference/exit-codes.mdx:22-23`** mention `pm passkeys`. These belong to other forks.
- **`cli/inject.mdx` "Skip the eval" table** gives `$PROFILE` for PowerShell, with the same caveat as above (guides-b).
- **`desktop/passkeys.mdx:57`** (the parent edited it earlier) says `pm get` shows "how many passkeys a login has and for which sites" and to rename and remove passkeys "here in the app". At `5c023b7`, `pm get` shows each passkey (site, user, label, dates), and its edit screen can rename and remove them. The page may need updating.

#### Unresolved

- **The CLI is changing under the docs.** Two commits landed during this pass (`013843f`, `5c023b7`). If the owner keeps reshaping `pm get` or passkeys, the passkey notes need another look.
- **Keys on the `pm get` search screen** (for example `e` to edit) were not checked here. They are on `cli/items.mdx` (guides-a).


### cli section: command reference B (commands-security.mdx, commands-sync.mdx)

**Verified at CLI commit `5c023b7`** (2026-10-05 20:40, "update `get` command…"). Every file:line in this log is at that commit, checked against a `git archive` export of it (`SP/fc-cmdref-b/cli-head`).
- **Help surface:** a `pm` built from that export prints a `--help` tree identical to `SP/fc/help_tree.txt`, the one the pages were checked against. That is 106 entries including hidden ones, with none added, removed or changed; 64 of them are in this scope.
- **Code changes since `013843f`:** `git diff 013843f 5c023b7 -- main.go` only touches the `pm get` view and edit functions (`handleInteractiveEntries` … `displayEntry`). None of the code behind these two pages changed. The only effect on them is the `pm get` edit's policy path, which is already in the matrix below.

Pages: `website/content/docs/cli/commands-security.mdx` and `website/content/docs/cli/commands-sync.mdx`. About 250 claims checked: command names, Use lines, positional arguments, flags, shorthands, defaults, quoted output, behaviour and exit statuses. They were checked against:
- `SP/fc/help_tree.txt`, the `--help` dump of every `pm` command
- the cobra definitions and code in `CLI/main.go`, `bridge_cmd.go`, `extension_cmd.go`, `native_host.go`, `desktop_bridge.go`, `item_edit.go`
- `CLI/src/`: security.go, vault.go, recovery_codes.go, quorum_recovery.go, recovery_passkey.go, touchid/, policy.go, trust.go, cleanup.go, lgit.go, cloud.go, cloud_ignore.go, cloud_diff.go, mcp.go

**Runtime checks.** I ran a fresh build in a sandbox with its own HOME, TMPDIR and vault, and nothing touched the network:
- `auth codes generate`/`status` (including `--count 51`)
- `auth level` and `auth alerts`
- `trust`, `health --detailed`, `loaded`
- `policy load`/`show` with a test policy file
- `lgit tree`/`verify`/`undo --steps 2`
- `bridge status`/`token`
- `mcp list`, `extension status`, `auth touchid status`
- `cloud reset`/`delete`/`diff` with nothing configured

**Command coverage.** Every command on both pages exists, and every real command in their scope is documented. The hidden `pm extension host` and `pm desktop` are not listed, which is fine because they are internal.

**Validation.** `node SP/validate.mjs desktop security agents cli reference` reports 0 issues. No `<Command>` was renamed or removed.

#### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| commands-security.mdx (intro) | (implied) commands not marked "Needs write access" are fine in a read-only session | Added: commands marked **Needs write access** refuse a read-only session. `pm auth change`, `auth email`, `auth reset`, `auth alerts`, `auth level`, `policy load` and `policy clear` don't check yet. Links to Known limitations. | `readonly` discarded as `_`: `main.go:6133` (change), `5895` (email), `6108` (reset), `6025` (alerts), `6070` (level), policy load/clear in the `Use: "policy"` block at `main.go:2489ff` |
| commands-security.mdx (`pm auth change`) | (no claim) | Added: doesn't check the new password against `pm setup`'s rules | `main.go:6133-6170` never calls `src.ValidateMasterPassword` (`src/utils.go:210`) |
| commands-security.mdx (`pm auth email`) | "generates a recovery key, stores it protected in the vault, shows it once and emails a notice that recovery was configured" | It generates the key, sends the notice, shows the key once, then saves. If the notice fails, nothing is shown or saved. The vault holds a hash and a sealed data-key copy, and the save also writes a masked copy of the key into the unencrypted header (linked to security/recovery). | `main.go:5895-6023` (notice sent before the key is printed; `return` on send error); `src/vault.go:1065-1093` (`RawRecoveryKey`, `RecoveryHash`, `RecoverySlot`); `src/vault.go:528-532` (`ObfuscatedKey` written to the header) |
| commands-security.mdx (`pm auth email`) | "Running it again replaces the address and the key." | Kept. Added: trustee shares made from the old key stop working; run `pm auth quorum-setup` again. | `SetRecoveryKey` (`src/vault.go:1065-1093`) leaves `RecoveryShare*` alone. `pm auth quorum-recover` combines the shares into the old key and checks it with `CheckRecoveryKey` against the new hash (`main.go:6232ff`). |
| commands-security.mdx (`pm auth recover`) | "Everything must finish within 15 minutes of the email." | The recovery key and the email code must be entered within 15 minutes. Added: it stops with `Recovery record found but key is missing. Manual recovery required.` once the header's masked key is gone (after the next save following a fresh unlock); use the desktop app or `quorum-recover`. | Expiry checks only in the key and code loops (`main.go:5673-5893`); stop at `main.go:5694`; `src/vault.go:409` (`ObfuscatedKey json:"-"`) |
| commands-security.mdx (`pm auth codes generate`) | (no write-access note) | Added: Needs write access | `main.go:5540ff` (`if readonly … Cannot generate recovery codes`) |
| commands-security.mdx (`pm auth passkey disable`) | (no description) | Added: Needs write access | `main.go:5505ff` |
| commands-security.mdx (Touch ID intro) | "elsewhere they report that Touch ID isn't available" | Elsewhere they only report that Touch ID isn't available or isn't set up | `src/touchid/touchid_stub.go:39-41` ("Touch ID is only available on macOS"); `main.go:5643` (remove says "not configured") |
| commands-security.mdx (`pm auth touchid setup`) | "Unlocks the vault, then saves the master password in the login Keychain … Later unlocks try Touch ID first." | Added: asks for your fingerprint first, needs write access, and the Keychain item itself isn't fingerprint-locked (linked to security). | `main.go:5600-5628` (readonly check); `src/touchid/touchid_darwin.go:110-135` (`authenticateWithTouchID`, then `security add-generic-password -w`); `main.go:3799-3807` (Touch ID tried first on unlock) |
| commands-security.mdx (`pm auth alerts`) | (only "prints whether alerts are on") | Added: alerts are recorded only once an alert address is set, and `pm` can't set one (desktop **Settings → Alerts**). Even then they only go to `email.log` in the current folder, and no email is sent. | `src/security.go:60-84` (returns when `AlertEmail == ""`, appends to `email.log`); `AlertEmail` is set only at `desktop_handlers.go:463, 565` (`src/security.go:41` `ConfigureAlerts` is used only by tests). Runtime: `pm auth alerts --enable` then `pm auth level 2` wrote no `email.log`. |
| commands-security.mdx (`pm auth level`) | "`3` also item changes" | "`3` also item changes and exports". Added: a vault that never had a level set shows `0`, which works like `1`. | LevelAll sites: `transfer_cmd.go:797`, `desktop_transfer.go:350`, `desktop_handlers.go:2873` (exports), `main.go:847, 4605`, `item_edit.go:518` (entries); `src/security.go:65-68` (<1 treated as 1); runtime "Current security level: 0" |
| commands-security.mdx (`pm trust`) | summary "List trust scores for every secret"; risk labels `low`, `medium`, `high`, `critical` | "…for the secrets APM tracks". Labels are printed as `LOW`/`MEDIUM`/`HIGH`/`CRITICAL`. Only secrets you have added, changed or opened have a score. | `src/trust.go:129-133` (scores only from `SecretTelemetry`), `src/vault.go:1414-1421` (telemetry touched on ADD/EDIT/GET/VIEW), `src/trust.go:116-127`; `main.go` trust command prints `strings.ToUpper(s.Risk)`; runtime on a new vault: "No trust telemetry available yet." |
| commands-security.mdx (`pm lgit tree`) | (no caveat) | Added: with `--limit`, the oldest commit shown reads `[UNVERIFIED]` when older commits exist; `pm lgit verify` checks the whole chain | `src/lgit.go:121-153` (chain check starts with empty `prevHash` on the truncated list); runtime: `--limit 2` showed `[UNVERIFIED]` while `pm lgit verify` showed 7/7 |
| commands-security.mdx (`pm lgit undo`) | `--steps`: "Repeat the undo this many times" | Kept. Added: each undo reverses the one before, so an even number leaves the vault as it was. Also added: history is shared by all vaults, so check `pm lgit tree` first. | `src/lgit.go:290-308` (always restores the second-newest commit, then records UNDO); runtime: `undo --steps 2` left the vault hash unchanged; `src/lgit.go:28-36` (one `lgit.jsonl` in the config dir) |
| commands-security.mdx (`pm lgit squash`) | "Deletes the snapshots of all but the newest `--keep` commits, re-signs the chain…" | "Removes all but the newest `--keep` commits from the history and deletes their snapshots, re-signs the chain…" | `src/lgit.go:259-288` (`rewriteLGitChain(kept)` drops the older commits) |
| commands-sync.mdx (`pm cloud init`) | "ask for a mode (`APM_PUBLIC` or self-hosted) and whether to store a hash…" | Defaults made explicit: `APM_PUBLIC` unless you choose `2`, and no key hash unless you answer `y` | `main.go:90-117` (setupGDrive: anything but "2" is apm_public); `main.go:5026-5063` (setupDropbox); `main.go:5020-5024` (`[n]` default) |
| commands-sync.mdx (`pm cloud init`) | "Refuses if sync is already set up" | "Refuses if any provider is already set up" | `main.go:1583ff` (refuses when `CloudFileID`, `GitHubToken` or `DropboxToken` is set) |
| commands-sync.mdx (`pm cloud init`) | "Uploads the vault (filtered by `.apmignore`)…" (implied: encrypted with the master password) | Added a warning callout: with `.apmignore` rules, the filtered copy `pm cloud init github` uploads is encrypted with the GitHub token and stays in repo history | `main.go:202` (`PrepareCloudUploadVaultPath(v, pat, …)`); `src/cloud_ignore.go:11-26` (`EncryptVault(filtered, masterPassword)` when the config isn't empty, lines 18-23) |
| commands-sync.mdx (`pm cloud auto-sync`) | "uploads to Google Drive and GitHub after each write, at most every 5 seconds" | A write within 5 seconds of the last upload, or of starting, is skipped rather than queued. Added: with `.apmignore` rules it keeps uploading the vault as it was when the watcher started. | `main.go:1732-1832` (`lastSync := time.Now()`, `if time.Since(lastSync) > 5*time.Second`, the unlocked `vault` is never reloaded); `src/cloud_ignore.go:18-23` (filters the in-memory vault) |
| commands-sync.mdx (`pm cloud get`) | `--auth-mode`: "`pat` or `oauth2`; skips the authentication question" | For GitHub it names the token type. For Google Drive and Dropbox, `oauth2` means your own account and any other value means `APM_PUBLIC`. Added: for GitHub the token and repo are saved into the downloaded vault. | `main.go:1836-2017` (`authMode` handling per provider); `main.go:5184-5203` (`handleDownloadedVault` stores `GitHubToken`/`GitHubRepo`) |
| commands-sync.mdx (`pm cloud diff`) | (no default provider; no caveat) | Added: without a provider it uses the Google Drive or Dropbox setup made last, or GitHub if that's all there is. Items `.apmignore` keeps out of uploads show as `REMOVED`, so "merge all" deletes them locally. | `main.go:5240-5260` (`resolveCloudDiffProvider`; `LastCloudProvider` is only ever gdrive or dropbox, `main.go:157, 5107`, `desktop_cloud.go:187, 194`); `src/cloud_diff.go:151-162, 247-260` (local-only items are REMOVED, and applying deletes them); the upload is filtered by `.apmignore` |
| commands-sync.mdx (`pm cloud delete`) | "Deletes the vault file from Google Drive…" (no limits) | Added: if you set up Dropbox after Google Drive, name `gdrive`, because without it `pm` asks Dropbox to delete the Drive file and fails. Dropbox and GitHub copies can't be deleted with this command. | `main.go:2118-2168` (provider = `LastCloudProvider`, always passes `vault.CloudFileID`); `src/cloud.go:475-484` (Dropbox deletes path "/"+id); `src/cloud.go:646-655` (GitHub needs `owner/repo`, so a Drive ID fails with "invalid repo format") |
| commands-sync.mdx (`pm cloud reset`) | (no caveat) | Added: if Drive is the only provider and you declined the retrieval key, reset says sync isn't set up and changes nothing, while `pm cloud init` still refuses. `pm cloud delete` (deletes the Drive copy, clears the ID) unblocks it. | `main.go:2170ff` (precondition checks `RetrievalKey`, `GitHubToken` and `DropboxToken` only, not `CloudFileID`); `main.go:1583ff` (init refuses on `CloudFileID`); `main.go:90-160` (no key when consent is declined) |
| commands-sync.mdx (`pm extension link`) | "allowed only for the APM extension"; "then waits up to 5 minutes…" | "…and any `--id` you add". It waits only when the app or `pm bridge serve` isn't running, `--no-wait` isn't set and the input is a terminal. | `extension_cmd.go:292-364` (ids list; `appBridgeRunning`; `noWait \|\| !term.IsTerminal`) |
| commands-sync.mdx (`pm extension status`) | "linked, not linked, or linked to a `pm` that no longer exists" | Adds "linked to another `pm`" | `extension_cmd.go:585-612` (`state = "linked to " + path`) |
| commands-sync.mdx (`pm mcp token`) | config "runs `pm mcp serve --token <token>`"; "Tokens are stored in `mcp_auth.json`" | The config runs this `pm` by its full path (`cmd /c` on Windows). Tokens are stored in plain text. | `src/mcp.go:78-99` (`os.Executable()`); `src/mcp.go:160-168, 206-238` (token stored by value), `src/mcp.go:170-177` (`mcp_auth.json` in `os.UserConfigDir()/apm`) |
| commands-sync.mdx (`pm mcp token --auto`) | "Also write the token into Claude, Cursor, VS Code or Cline config files `pm` finds" | It only writes to existing files at fixed paths: Claude's `mcp_config.json`, Cline's settings, and on Windows Cursor's and VS Code's `mcp.json`. It doesn't look at Claude Desktop's `claude_desktop_config.json`. | `src/mcp.go:101-123` (`FindMCPConfigFiles`; `%APPDATA%` paths are empty on macOS/Linux) |
| commands-sync.mdx (`pm mcp list`) | (no explanation of USES) | Added: `USES` counts server starts with the token, not tool calls, and expired tokens are listed too | `src/mcp.go:335-338` (`UsageCount++` in `StartMCPServer`); `src/mcp.go:266-275` (`ListMCPTokens` has no filter) |
| commands-sync.mdx (`pm mcp revoke`) | (no description) | Added: the token is only checked when a server starts, so a running server keeps working until restarted | `src/mcp.go:317-337` |
| commands-sync.mdx (`pm mcp serve`) | "Without `--token` it uses the first stored token" | "…uses one of the stored tokens, picked arbitrarily". Added: it checks the token once, at start. | `main.go:6506-6530` (`for t := range config.Tokens { token = t; break }`, Go map order); `src/mcp.go:317-337` |

#### Documented code issues: verdicts

| Claim (where it touches these pages) | Verdict | Evidence |
|---|---|---|
| `pm cloud init github` encrypts the `.apmignore`-filtered upload with the GitHub token | **VERIFIED**. Now stated on commands-sync.mdx. | `main.go:202`; `src/cloud_ignore.go:11-26` (only when the ignore config is non-empty, lines 18-20) |
| What `pm cloud delete` deletes per provider (security log: "for GitHub it deletes the whole repository") | **Latent, not reachable today.** `GitHubManager.DeleteVault` would delete a whole repository given `owner/repo`. But `pm cloud delete` always passes the Drive file ID (`vault.CloudFileID`, no `/`), so `pm cloud delete github` fails with "invalid repo format". `LastCloudProvider` is never `github`. With Dropbox set up last, the default call fails too. Only the Drive copy can be deleted. | `main.go:2118-2168`; `src/cloud.go:228-234, 475-484, 646-655`; writes to `LastCloudProvider`: `main.go:157, 5107`, `desktop_cloud.go:187, 194` |
| Policy enforcement differences | **VERIFIED; the paths differ.** See the matrix after this table. | |
| Read-only enforcement | **VERIFIED as the security section says.** On these pages, every command marked "Needs write access" does check (`auth codes generate`, `passkey register`/`disable`, `touchid setup`, `quorum-setup`, `cleanup`, `lgit undo`/`checkout`/`squash`/`prune`, `cloud reset`). The unchecked ones are now listed in the intro. `cloud init`, `cloud sync`, `cloud auto-sync` and `cloud delete` also ignore read-only (`main.go:1583ff, 1669ff, 1732ff, 2118ff`). | as cited |
| Alerts only go to `email.log` | **VERIFIED, and narrower than documented.** From `pm` alone nothing is recorded at all, because no alert address can be set. | `src/security.go:60-84`; `desktop_handlers.go:463, 565`; runtime check |
| MCP tokens (plain text, checked only at start, arbitrary token without `--token`, USES = starts) | **VERIFIED** | `src/mcp.go:160-168, 206-238, 317-337`; `main.go:6506-6530` |

Policy enforcement matrix:

| Path | What it checks | Evidence |
|---|---|---|
| `pm add` (login) | `Vault.AddEntry` checks the policy only when `min_length > 0`. A policy with `min_length: 0` and other rules is never enforced there. | `src/vault.go:1472-1477`, called from `main.go:441` |
| MCP `add_entry` | Same `AddEntry` rule | `src/mcp_apply.go:78` |
| `pm add` Wi-Fi | Not checked | `src/vault.go:1665-1674` |
| MCP `edit_entry` | Not checked | agents log, `src/mcp_apply.go:151-190` |
| `pm get` edit (new in `5c023b7`) and the desktop app (add and edit) | Logins and Wi-Fi are checked against any active policy, through `checkPolicy` | `item_edit.go:95` → `desktopServer.updateItem` (`desktop_handlers.go:749`) → `checkPolicy` (`desktop_handlers.go:669-682`); desktop add at `desktop_handlers.go:700` |
| Legacy desktop `data.import` path | Logins that fail the policy are silently dropped | `src/portability.go:193, 243, 315, 431, 445, 501` (`_ = vault.AddEntry`) via `desktop_handlers.go:2898-2902` |
| Policy files | `pm` and the app both read `<vault folder>/policies` | `main.go:2489ff` (`filepath.Join(filepath.Dir(vaultPath), "policies")`), `main.go:3022ff`; `desktop.go:1415-1417` |

#### Other findings for the owner (not on the pages)

- **`pm auth alerts` / `pm health`:** health gives "+10 Alerts enabled" even though `pm` can't make alerts fire without an address set in the desktop app.
- **`.apmignore` and `pm cloud diff`:** with `.apmignore` rules, `pm cloud diff` "Merge all remote changes" deletes local items that were only excluded from the upload. The desktop Compare starts those rows unticked; the CLI's option 1 includes them.
- **`pm cloud auto-sync` with `.apmignore`:** with rules, it uploads a stale in-memory vault.
- **`pm mcp token --auto` paths:**
  - It probes `%APPDATA%` paths on every OS; on macOS and Linux these resolve relative to the current folder.
  - It never checks Claude Desktop's real config file.
- **`pm auth email` and trustee shares:** re-running it silently invalidates existing trustee shares.
- **`--limit` verification badge:** `pm lgit tree --limit N` (default 200) marks the oldest shown commit `[UNVERIFIED]` whenever the history is longer than N.
- **Retrieval keys:** they come from 48 × 48 = 2,304 word pairs (`src/utils.go:274-298`). This is already documented in security/sync-security.
- **Security pages to adjust (parent's section):**
  - security/threat-model.mdx "Security alerts" row: add that nothing is recorded until an alert address is set in the desktop app.
  - Same page: the `pm cloud delete` repository-deletion observation in the security log should be marked latent and unreachable (see the verdict above).

#### Pages outside this set that need changes

- **cli/health-and-audit.mdx** (Security alerts):
  - Level 3 lists "passkey changes", but `pm passkeys` was removed in `013843f` and nothing raises them now.
  - "the desktop app writes them next to the vault" is unverified. The app's `pm desktop` writes `email.log` to its working directory (`src/security.go:78`).
- **cli/commands.mdx** (index, other fork):
  - Row text for `pm cloud delete` ("Delete the Google Drive copy") still matches.
  - Row for `pm trust` ("Per-secret trust scores") is fine.
  - No anchor changes from this fork.

#### In-flight work (uncommitted at 20:52; not reflected on the pages)

The CLI working tree has uncommitted changes that will make parts of commands-sync.mdx wrong once they're committed.
- **`pm bridge` is removed.** Its subcommands move to `pm extension serve`, `pm extension token` and `pm extension rotate`, and `pm extension status` gains `--port` and takes over bridge status (`bridge_cmd.go` → `extension_serve.go`, `extension_cmd.go`, `main.go`).
  - The `#pm-bridge-*` anchors and "pm bridge" mentions on about two dozen published pages across cli, desktop, extension, getting-started, reference and security would need updating.
- **`pm mcp config` changes.** It drops the PowerShell bootstrap and `get.apm.dev/install.ps1`, and prints the tokenized entry with an empty token instead.
- **`src/mcp.go` changes.** `ensureMCPMutationAuthorized` is replaced by `requestMCPApproval`.
- **Recommendation:** re-check the bridge, extension and MCP sections when this is committed. I left the pages matching `5c023b7`.

#### Unresolved

- I didn't run Touch ID, passkey, email or cloud flows (network, Keychain or browser). The claims about them rest on code reading only.
- The PowerShell bootstrap URL `https://get.apm.dev/install.ps1` in `pm mcp config` isn't on the page. I didn't check whether it resolves.
- The CLI is being edited live. `item_edit.go`/`item_view.go` landed in `5c023b7` while I was checking, and later commits may shift `main.go` line numbers again.


#### Fact-checker follow-ups on cli/commands.mdx and cli/commands-sync.mdx

These were made after the `pm bridge` → `pm extension` merge landed. Checked at about 21:10 against the CLI working tree, which was then committed unchanged as `4ecbf31` and `aef9bbf`. The cited files are byte-identical at `aef9bbf`. The working tree build is at `SP/pmbin4/pm`. A sed run by another session had already renamed `pm bridge X` to `pm extension X` across the docs; each file was re-read before editing.

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| commands-sync.mdx | Two `<Command name="pm extension status">` entries: "Show whether a bridge is listening" (address, version, vault, token; exit 1 when nothing or something else listens, or on a token mismatch) and "Show which browsers are linked" | One merged entry: <br>• Browsers: each Chromium browser as linked, linked to another `pm`, linked to a `pm` that no longer exists, or not linked. <br>• Then the linked vault, the linked date and **Right now**. <br>• If a bridge answers: the address, version and bridge API, the vault state, and a 6-character token fingerprint. <br>• Sample output with labels padded to 16 columns. <br>• Exit 1 when nothing listens and no browser is linked, when a non-APM program holds the port, on a token mismatch, or when the status request fails. Otherwise 0. | `CLI/extension_cmd.go:574-716` (`aef9bbf`): `statusLine` `%-16s` at 588-590; exits at 650, 665, 692, 698; `bridgeTokenFingerprint` = first 6 characters (`extension_serve.go:29-34`); `bridgeAPIVersion = 2` (`desktop_bridge.go:28`). Runtime: `pm extension status` with nothing linked printed `Right now:       nothing is listening on 127.0.0.1:<port> and no browser is linked` and exited 1 |
| commands-sync.mdx | `pm extension serve` "Exits with status 1 if there is no vault or the port is taken" | "…if there is no vault, the port is taken or the vault can't be unlocked" | `CLI/extension_serve.go:225-263` (returns 1 on no vault, a bind error, or an unlock error unless `--locked`) |
| commands.mdx | Two index rows for `pm extension status` ("Is a bridge running?", "Which browsers are linked") | One row: "Linked browsers, the running bridge and the pairing token" | as above |
| commands.mdx | "Removed and renamed commands" had no `pm bridge` row | Added: `pm bridge serve/status/token/rotate` → `pm extension serve/status/token/rotate`. `pm bridge` has no alias | `pm bridge` gives `Error: unknown command "bridge" for "pm"` (working-tree build). Help in `SP/fc/help_extension_wt.txt` |

Checked and unchanged: the `pm mcp config` entry the MCP session wrote. With no token, `args` is `["mcp", "serve"]`; on Windows it runs through `cmd /c`; and a hint says to add `--token` (`CLI/src/mcp.go:75-101`, `main.go` `mcpConfigCmd`, `aef9bbf`).

**Status of cmdref-b's "In-flight work" note.** It was written at 20:52, before either change was committed. Both have landed:
- The `pm bridge` → `pm extension` merge is `4ecbf31`. The fixes are in the table above, and the other pages were synced by the cli-change session's sed and checked by the guides-a, guides-b and reference passes.
- The MCP change is `aef9bbf`. The MCP session rewrote the `pm mcp config` entry, and I checked it (above).


### cli guides, part A (cli/index, installation, vault-basics, sessions, items, totp, passkeys, generator, spaces, import-export)

- **Commit:** verified at CLI HEAD `aef9bbf` (2026-10-05 21:02), after `4ecbf31` (bridge merged into `pm extension`) and `5c023b7` (new `pm get`).
- **Line numbers:** `main.go` lines below 6337, and every file except the four below, are identical at `5c023b7` and `aef9bbf`, so the cites come from the `5c023b7` export in `SP/clihead`. `extension_serve.go`, `extension_cmd.go`, `autolock.go` and `src/mcp.go` are cited at `aef9bbf`.
- **Pages and claims:** 10 pages, about 550 claims checked.
- **Validation:** `node SP/validate.mjs cli reference` reports 0 issues, and so does `desktop security agents cli reference`.
- **Anchors:** no `<Command>` anchor was renamed or removed. One heading changed: installation.mdx "Choose Install" became "Choose Install pm" (`#choose-install-pm`), and no page links to it.
- **HEAD:** still `aef9bbf` at the end of the pass.
- **Not edited:** `passkeys.mdx`, and every `pm get` UI claim on `items.mdx`, `totp.mdx` and `spaces.mdx`. Each is logged under "Pending CLI change" below.

#### Corrections
| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| installation.mdx:16, 177, 180 | `pm update` updates a release-archive install: when a plain binary for your OS is attached, it downloads it | `pm update` only accepts an asset whose name contains the OS and has no dot or ends in `.exe`. Release binaries carry the version (`apm-v12.0.0-darwin_arm64`), so on macOS and Linux it finds none and prints the release page. On Windows it takes the first Windows `.exe` whatever its architecture. The methods and update tables now say "download again" and point to the paragraph | main.go:3189-3260 (match at 3239-3240, fallback 3250-3253); .github/workflows/release.yml:54-98 |
| installation.mdx:53 | Each release has one archive per platform, and the binary is inside it | Each platform has a plain binary (`.exe` on Windows) **and** an archive. Both are uploaded | release.yml:54-83 (upload path `apm-…*`), 98 (`files: artifacts/*`) |
| installation.mdx:180 | Keeps the old binary as `pm.old` | `pm.old`, or `pm.exe.old` on Windows. The download goes to `apm.new` next to the binary | main.go:3295-3330 |
| installation.mdx:29, 45 | Buttons are **Install** and **Update** | **Install pm** and **Update pm** | GUI/renderer/src/settings/data.jsx:171, 174 |
| installation.mdx:48 | The app's link opens `~/.apm/vault.dat` because there is no `vault.dat` next to the link | Adds "by default": `--vault` and `APM_VAULT_PATH` still win. "Next to the link" became "next to it", because symlink resolution is untested | main.go:51-75 |
| installation.mdx:156 | The counter can't be kept in `/usr/local/bin` "(including the link the desktop app installs)" | The link part was dropped (untested). It now says "/usr/local/bin on most systems" | src/utils.go:245-275 |
| installation.mdx:111 | The team edition builds with the Go in `go.mod` (1.25) | The team edition needs Go 1.25.5 | team/go.mod |
| vault-basics.mdx:107 | `legacy` is PBKDF2 with 600,000 iterations and no memory | `legacy` is labelled pbkdf2, but it derives the key with Argon2id at 600,000 passes. Memory 0 is raised to Argon2's minimum of 8 KiB | src/utils.go:71-80 (ProfileLegacy), 136-152 (DeriveKeys always calls `argon2.IDKey`); src/vault.go:472, 695; x/crypto/argon2 minimum is 8 KiB per thread |
| vault-basics.mdx:139 | `pm cinfo` says Argon2id, but `legacy` "actually uses PBKDF2" | Argon2id is right for every profile, `legacy` included | same; main.go:1058-1092 |
| vault-basics.mdx:54 | The master-password rules apply (as asked in `pm setup`) | `pm setup` enforces them. `pm auth change`, `pm auth recover` and `pm auth quorum-recover` don't check them | src/utils.go:210-243 (ValidateMasterPassword); main.go:2288 is its only `pm` caller |
| vault-basics.mdx:87 | `.apmignore` sits in the vault folder | A `.apmignore` in the current folder is used first | src/apmignore.go:40-64 |
| sessions.mdx:16-21 | A fresh `pm unlock` prints the "Vault unlocked…" line once | Without a session the line prints twice: once from the unlock, once from the session `pm unlock` starts. Noted under the sample | main.go:3857, 908 |
| sessions.mdx:50 | Only `pm auth touchid setup`, `pm auth change` and recovery rewrite the Keychain password | The desktop app also rewrites it: when you set up a vault, turn on Touch ID, change the password or recover | desktop_handlers.go:481, 1682, 1760, 2419 (storeTouchID 1728) |
| sessions.mdx:90 | A warning only when the vault would stay unlocked indefinitely | A warning whenever a limit is off | lock_policy.go:291-300 |
| sessions.mdx:93 | `pm extension serve` and the native host detect sleep "on every platform" | Softened: they watch for sleep themselves, and that works on macOS and Linux. On Windows, don't rely on it. They compare the wall clock with Go's monotonic clock. On Windows, Go reads `INTERRUPT_TIME`, which keeps counting during sleep, so the gap check likely never fires there. Untested | autolock.go:24-27, 90-104 (aef9bbf); extension_serve.go:236-238, 293 (aef9bbf); native_host.go:153-157; Go runtime/time_windows_amd64.s:12 |
| sessions.mdx:109 | Commands that would write print `Vault is in READ-ONLY mode.` | Messages vary (eight wordings), and reordering codes in `pm totp` still saves. A `pm mode readonly` session lasts exactly its minutes: no idle or sleep lock | main.go:934 (`CreateSession(…, true, 0)`), runInteractiveTOTP 4408+ (reorder saves without a read-only check) |
| sessions.mdx:194 | The count fails "as when it is installed in /usr/local/bin" | Softened to "as is usual for /usr/local/bin". Added: the app doesn't set `APM_STATE_DIR` for its own `pm`, so it usually keeps a separate count | src/utils.go:245-275; GUI/electron/main.js backendEnv |
| sessions.mdx:196 | Warns about unusual activity, "for example" a 2:00-5:59 unlock | That is the only pattern checked | src/anomaly.go:30-52 |
| items.mdx:27 | A login's password must meet any active policy | `pm add` checks only logins, and only when the policy sets a minimum length | src/vault.go:1472-1477 |
| items.mdx:59 | Names must be unique per type within a space | 15 types check. Medical, travel, contact, cloud, k8s, docker, SSH config, CI/CD, license and legal don't, so duplicates are allowed | src/vault.go:1478-1916 (the checks stop after government IDs) |
| totp.mdx:37 | (`pm add totp` takes the base32 key) | Adds: the key isn't checked, so a typo shows up later as wrong codes | main.go:445-463 |
| generator.mdx:61 | Desktop generator link goes to /docs/desktop/items | Now goes to /docs/desktop/generator | website/content/docs/desktop/generator.mdx exists |
| spaces.mdx:18-25, 41 | `pm space list` counts items in every space | It counts only the current space's items. Other spaces show `0 entries`. The sample and row are fixed | main.go:2985-2992 (`SearchAll("")` filters to the current space), 3008-3014 |
| import-export.mdx:134 | CXF holds logins, passkeys, codes, cards, notes, SSH keys, Wi-Fi | Every type except documents, photos, audio and video. Types CXF has no credential for are written as custom fields | src/transfer_cxf.go:38-49 (no `Types` limit), 814-893 (default case `cxfCustomFields`); src/transfer.go:614-623 (media excluded) |
| import-export.mdx:136 | CSV columns: name, url, username, password, note | Also totp, type, space | src/transfer_generic.go:383 |
| import-export.mdx:159 | `login` and `logins` mean `password` | `passwords` too | transfer_cmd.go:699 |
| import-export.mdx:81 | (Asking happens on a terminal) | Added: piped import doesn't ask and imports as with `-y` | transfer_cmd.go:394, 476, 533 |
| import-export.mdx:149 | (Asks to encrypt on a terminal) | Added: piped export doesn't ask, and without `-p` it writes a plain file | transfer_cmd.go:689, 756 |

Checked and left unchanged:
- **Bridge (`4ecbf31` merge):** `index.mdx:20` (`pm extension serve`, browser-started `pm`) is correct at aef9bbf.
- **MCP:** `index.mdx:21` and `totp.mdx:116` (`get_totp` needs the token's permission, src/mcp.go:591-601 at aef9bbf) are correct. None of my pages mention approval, `check_installation` or `install_apm`.

#### Documented code issues: verdicts
| Claim (page) | Verdict | Evidence |
|---|---|---|
| 2. `.apm_lock` next to the binary (sessions.mdx, installation.mdx) | **VERIFIED.** It is next to `os.Executable()` or in `APM_STATE_DIR`, and write errors are ignored. The decoy vault opens from 6 failures, even with the right password. From 9, `pm` refuses. The app's bundled `pm` keeps its own count | src/utils.go:245-275; main.go:3709-3874; desktop_handlers.go:236-268 |
| 4. Policy differences (items.mdx) | **VERIFIED, with more detail.** `pm add` checks logins only, and only if MinLength > 0. The `pm get` editor at 5c023b7 saves through the desktop path, which checks logins and Wi-Fi against any active policy. `pm auth change`, recover and quorum-recover skip the master-password rules | src/vault.go:1472-1477; main.go:4931-4939 → desktop_handlers.go:741-781, 669-682 |
| 1. `.apminject` `as:` and 3. cloud init token | Not on my pages | n/a |

#### Other findings for the owner (not on the pages)
- **Data loss: `pm get` delete crosses spaces.** It deletes by name with no space check, so deleting the `GitHub` login while in `Work` removes the first `GitHub` in the vault. In my test that was the `default` one, and the `Work` one survived. deleteEntryByResult main.go:5374+ → src/vault.go:1498-1502 (DeleteEntry). The other Delete* functions behave the same.
- **Read-only bypasses:**
  - `pm get` bulk edit/delete with marks skips the read-only check (main.go:3936+).
  - `pm totp` reorder saves in read-only.
- **Locking:**
  - `pm mode readonly` sessions ignore the idle and sleep policy (main.go:934).
  - The autolock.go:24-27 comment says Go's monotonic clock stops during sleep on Windows. Go's Windows runtime reads `INTERRUPT_TIME`, which includes sleep, so the sleep lock in serve and the native host likely never fires on Windows.
- **`pm update`:** it can't match release binaries on macOS or Linux, because their names contain the version's dots (main.go:3239-3240). On Windows it ignores the architecture.
- **Output bugs:**
  - A fresh `pm unlock` prints the unlocked line twice (main.go:3857, 908).
  - `pm space list` counts only the current space (main.go:2985).
  - The export summary says "Encrypted with Argon2id and AES-256-GCM" for Bitwarden exports, which use Bitwarden's format (transfer_cmd.go runExport 669-814).
- **Missing validation:**
  - `pm add` allows duplicate names for 10 types (src/vault.go after 1916).
  - `pm add totp` doesn't validate the key.
  - `pm gen -l -1` panics (GeneratePassword src/utils.go:189-200).
- **Legacy profile:** it is labelled PBKDF2 but runs Argon2id with 8 KiB of memory, which is far weaker against GPU guessing than the label suggests.
- **Piped commands don't ask:** a piped `pm import` imports without asking, and a piped `pm export` writes plaintext without asking.
- **Clipboard:** copyToClipboard ignores errors and still reports success. On Windows it passes the secret on PowerShell's command line, where other processes of the same user can see it (main.go:3640-3653).

#### Pages outside my set
- **`pm passkeys`:** `cli/commands.mdx:148` and `cli/commands-items.mdx:114` already say it was removed. No other page mentions it (grep at 21:1x).
- **Old `pm get` UI:** re-check these when the `pm get` UI is synced: `cli/commands-items.mdx` (the `pm get` entry), `cli/scripting.mdx` (the non-TTY `pm get` list format) and `desktop/passkeys.mdx:72`, which says "`pm` has no commands for website passkeys" and that you rename and remove them in the app. At 5c023b7, `pm get`'s edit screen renames and removes them (item_edit.go:758-800).

#### Unresolved
- **Canonical repo:** pages and `releasesURL` use `apms-org/apm` (main.go:3187), but the Go module path is `github.com/aaravmaloo/apm`. I left the pages as they are.
- **"Don't go back to pm 11"** (vault-basics.mdx:160-162) is inferred from history. I didn't run pm 11.
- **The app-installed `/usr/local/bin/pm` link:** I didn't test what `os.Executable()` returns through it on macOS. That decides which folder holds `vault.dat` and `.apm_lock`.
- **Windows (not testable here):** the asset order `pm update` sees, and sleep detection in serve and the native host.


### cli guides, part B (recovery, cloud-sync, history, health-and-audit, policies, inject, scripting, browser-extension, team-edition)

- **Commit verified against:** CLI HEAD `aef9bbf` (2026-10-05 21:02, "remove install tools from mcp and stop agents from approving their own changes"). The working tree matches it for every file cited here; only `README.md` and an untracked `internal/tty/` differ.
- **Line numbers:**
  - `extension_cmd.go` and `extension_serve.go` are cited at `e60d9f4`, unchanged in `aef9bbf`.
  - `src/mcp.go` is cited at `aef9bbf`.
  - Everything else is cited from the read-only export of `5c023b7` (`SP/clihead`). Those files are unchanged since then, or changed only in comments or below the cited lines (`main.go` changed only at 3175 and after 6337).
- **CLI commits during the pass:** `fa4bbc5`, `013843f`, `5c023b7`, `e60d9f4` (the `pm bridge` commands merged into `pm extension`), `aef9bbf` (MCP writes wait for approval in the app). Claims touched by each were re-checked.
- **Pages:** 9. **Claims checked:** about 500.
- **Validation:** `node SP/validate.mjs cli reference` reports 0 issues, and so does `node SP/validate.mjs desktop security agents cli reference`.
- **Runtime checks** used a sandbox at `SP/fc-guides-b`, with HOME, vault and state redirected, port 49984, and no network, Keychain or browser:
  - `pm inject` and `kill` with a hostile `.apminject`.
  - `pm add`, `pm get`, `pm policy`, `pm loaded`, `pm lgit`, `pm health`.
  - `pm extension status`/`token`, and `pm extension serve --locked` against fake browser profile folders inside the sandbox HOME.

#### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| cloud-sync.mdx | GitHub row: "`pm` creates it as a private repository if it does not exist" | "If it doesn't exist, `pm` creates it as a private repository in the token owner's account" | src/cloud.go:573-619 (`Repositories.Create(ctx, "", ...)`, the authenticated user) |
| cloud-sync.mdx | APM_PUBLIC callout said only that safety rests on the master password | Added: "Everyone who runs `pm` has the same access to that storage, so someone else could also delete or replace your copy." | main.go:5123-5182 (`getCloudManagerEx`, shared APM_PUBLIC credentials), src/cloud.go:415-441 (Dropbox overwrite mode) |
| cloud-sync.mdx | Retrieval key: generated keys are "two random words" | Added: generated keys come from 2,304 pairs, so another APM_PUBLIC user can get the same key; on Dropbox the same key gives the same file name and the later upload replaces the earlier one; type a long key of your own | src/cloud.go:37-39, src/utils.go:274-297 (48 x 48 words), src/cloud.go:236-240, 415-441 |
| cloud-sync.mdx | "`pm cloud init` refuses to run again while sync is set up. Run `pm cloud reset` first" | Added: with only Drive set up and no retrieval key, `pm cloud reset` reports sync isn't set up; use `pm cloud delete` | main.go:1597-1606 (init refuses), 2184 (reset precondition `RetrievalKey == "" && GitHubToken == "" && DropboxToken == nil`) |
| cloud-sync.mdx | Auto-sync "uploads whenever the vault file is written, at most once every 5 seconds" | Added: a write within 5 s of the last upload is skipped until the next change; with `.apmignore` in effect it uploads a filtered copy of the vault as it was when the watcher started | main.go:1772-1812 (debounce drops events), main.go:1730-1833 (uses the in-memory `vault` captured at start) |
| cloud-sync.mdx | Diff sample order: ADDED Netflix, MODIFIED GitHub, REMOVED old-key | REMOVED API Key old-key, MODIFIED GitHub, ADDED Netflix | src/cloud_diff.go:42-83 (sorted by type, space, identifier, kind, lowercased) |
| cloud-sync.mdx | GitHub `.apmignore` callout: the token-encrypted first upload "can't be restored with the master password. Run `pm cloud sync github` straight after setup to replace it" | Anyone with the token can open that copy and the vault's data key, which also opens later copies; a later sync replaces the file but the first version stays in the repository history; set up GitHub with no `.apmignore` in effect, then add the file; link to the threat model's data-key section. Kept "with rules" | main.go:202 (`pat` passed as the password), src/cloud_ignore.go:11-26, src/vault.go:477-497 (`EncryptVault` reuses `vault.DEK`), src/apmignore.go:40-65 (CWD first, then next to the vault) |
| cloud-sync.mdx | Delete "clears the Drive settings in the vault" | "forgets its file ID and retrieval key"; added: after setting up Dropbox after Drive (for example `pm cloud init all`), name the provider: `pm cloud delete gdrive` | main.go:2133 (provider = `LastCloudProvider`), 5107 (Dropbox setup sets it to `dropbox`), 2150-2160 |
| cloud-sync.mdx | Troubleshooting: "Names are lowercase: `gdrive`, `github`, `dropbox`" | "The names are `gdrive`, `github`, `dropbox` and `all`" (input is lowercased, so case doesn't matter) | main.go:1611, 1647, 1680, 1856 (`strings.ToLower(args[0])`) |
| history.mdx | "Every time `pm` (or the desktop app) writes the vault, it also keeps a copy" | "Almost every time" | src/storage.go:8-19 (only `SaveVault` records), exceptions below |
| history.mdx | (none) | Added: "Some writes skip the history: changing the encryption profile with `pm profile set`, changes an AI agent makes over MCP without asking you (to spaces, the encryption profile or cloud settings), and the desktop app's bookkeeping saves, such as an item's last-used time or a passkey's sign-in counter." The MCP clause first read "changes an AI agent commits itself through MCP"; it was rewritten after `aef9bbf` | main.go:2600-2621 + src/security.go:10-29 (`ChangeProfile` writes without lgit); desktop.go:433-471 (`saveQuiet`) called at desktop_handlers.go:863, desktop_bridge_items.go:617, desktop_bridge_passkeys.go:561, desktop_cloud.go:380; src/mcp.go:799, 846, 865, 911, 1022 + 1122-1128 (`saveVault` = `os.WriteFile`, no approval) at aef9bbf. Approved add/edit/delete requests are recorded: desktop_handlers.go:2780 `s.save(note)` |
| history.mdx | `lgit show` sample: Data Hash and Chain Hash truncated with "..." | Full 64-hex Data Hash and Chain Hash; Prev Hash truncated to 24 characters | main.go:1322-1324 (`DataHash` and `Hash` in full, `truncateText(PrevHash, 24)`); sandbox run |
| history.mdx | `modified (differs from HEAD)`: the file changed outside `pm`, or the latest commit is another vault's | Added "or by a write that skips the history" | as the skip-list row above |
| history.mdx | "A commit that was edited, removed or reordered fails the check." | "...edited, reordered or removed from the middle of the chain fails the check. Deleting the newest commits from the end isn't detected." | src/lgit.go:120-151 (verifies the chain links only; no stored head to compare) |
| history.mdx | "`pm logs` prints three logs side by side" | "unlocks the vault and prints three logs one after another" | main.go:1166-1232 |
| history.mdx | "The audit log never contains secret values." | "doesn't record item values, but `pm cloud get` writes the retrieval key or file ID you gave it." | main.go:1907, 1911, 2003, 2010, 2015 (`LogAction` with the key or ID), src/audit.go:46-80 |
| inject.mdx | Names match items "in the current space" | Added: in the Default space, items of most types in other spaces match too; only cloud credentials, Docker registries and SSH configs must be in Default | src/vault.go:1488-1495 (`CurrentSpace == ""` matches every space), internal/inject/resolver.go:130-167 (`matchSpace` only for cloud, docker, sshconfig) |
| inject.mdx | PowerShell setup-shell file: "`$PROFILE`" | "The file in the `PROFILE` environment variable" | cmd/inject.go:230-289 (`os.Getenv("PROFILE")`) |
| inject.mdx | "The shell is detected from `SHELL` (and `PSModulePath` on Windows). If it isn't recognized, `pm` warns and uses bash syntax." | inject and kill use `SHELL`, then PowerShell when `SHELL` is empty and `PSModulePath` is set; unknown shells get bash syntax; setup-shell reads only `SHELL`, so in PowerShell it warns and writes the bash function to `~/.bashrc`; with `SHELL` naming pwsh it writes to the `PROFILE` env var's file, which PowerShell doesn't set; otherwise paste into `$PROFILE` yourself | cmd/inject.go:68-81, 230-289, 268 (dedupe kept); internal/inject/shellwriter.go:19-28 |
| inject.mdx | Tip "Multi-line values in bash": bash joins lines | "...in bash and zsh": both helpers use unquoted `eval $(...)`, joining lines and squeezing spaces. Added: in PowerShell a value containing `'` is quoted the bash way (`'\''`), which PowerShell can't parse | cmd/inject.go:249, 252 (bash and zsh snippets); internal/inject/shellwriter.go:104-111, 125-140 |
| inject.mdx | Danger callout: a crafted `as` runs commands "when you `eval` the output" | Added "and again when you `eval` the output of `pm inject kill`" | cmd/inject.go:56-57, 132-162 (kill re-reads `.apminject` and writes the same unescaped names); sandbox demo: `as: "GH_TOKEN; echo INJECTED-BY-APMINJECT >&2; X"` in a parent folder ran on both evals |
| scripting.mdx | Ephemeral session (no location or binding note) | Added: sessions are stored in the APM config folder and bound to this computer by default, so the job must run on the same computer, as you | main.go:1013 (`--bind-host` default true), src/ephemeral_session.go:97-122 |
| scripting.mdx | "A `read` ephemeral session or a read-only session lets commands read but refuses changes." | "...lets commands read, and most commands refuse changes. Not all of them check" (link to Known limitations) | cli_helpers.go:28-36 (`unlockForWrite`); main.go:2498, 2570 (`pm policy load`/`clear` discard the read-only flag and save) |
| scripting.mdx | Exit-1 list: "`pm totp link`, `pm autolock`, `pm bridge` and `pm extension link`" (`pm passkeys` also listed; see Pending CLI change) | "`pm totp link` and `unlink`, `pm autolock` and most `pm extension` commands" (the coordinator's sed had turned the tail into "and `pm extension`") | cli_helpers.go:15-18, 72-137; extension_serve.go:214, 313, 334; extension_cmd.go:283, 581 (os.Exit); extension_cmd.go:534-572 (`unlink` always exits 0) |
| scripting.mdx | "`pm lgit undo` ... restores the previous snapshot of whichever vault was saved last" | "writes the second-newest history snapshot over the current vault, whichever vault that snapshot came from" | src/lgit.go:290-308 (checks out `commits[n-2]` of the global history) |
| scripting.mdx | Serve row (after sed): "Denies pairing requests, unless you pass `--prompt-stdin`" (I had added the clause) | "Denies pairing requests" | extension_serve.go:220-221 (`--prompt-stdin` exists but is hidden, as it was in bridge_cmd.go:230-231); 178-180 (deny message) |
| scripting.mdx | Locked-vault table (after sed): "`pm extension token`, `pm extension status`, `pm extension status`" / "The pairing token and the running bridge" | "`pm extension token`, `pm extension status`" / "The pairing token, the linked browsers and the running bridge" | extension_serve.go:304-325 (no unlock), extension_cmd.go:595-716 (no unlock) |
| recovery.mdx | `pm auth email` "stores a protected copy in the vault" | "stores what it needs to check the key in the vault" | main.go:5896-6010; src/vault.go:528-531 |
| recovery.mdx | (none) | Added: the save also writes the key, masked with a fixed value from the source, into the vault's unencrypted header until the next save after a fresh unlock; link to security/recovery | src/vault.go:528-531 (`ObfuscatedKey` in header), 915, 1001-1017 (loaded only by `DecryptVaultWithDEK`) |
| recovery.mdx | "Sending email needs an internet connection; `pm` sends from APM's own mail service." | Added: if the notice can't be sent, `pm` stops before showing the key and saves nothing | main.go:5896-6010 (returns on the alert error before printing or saving) |
| recovery.mdx | "Recovery always needs your email and the recovery key." | "Recovery with the recovery key always needs your email and the key. ... Recovery with trustee shares skips both." | main.go:5673-5880 vs 6232-6320 (quorum-recover needs only shares) |
| recovery.mdx | "The whole recovery must finish within 15 minutes of the email." | "The recovery key and the emailed code must both be entered within 15 minutes of the email." | main.go:5719 (15-minute window checked at key and code entry); the new-password prompt has no deadline |
| recovery.mdx | `pm auth reset` (no confirmation note) | Added "It doesn't ask for confirmation." | main.go:6108-6131 |
| recovery.mdx | "After six wrong master passwords, the vault refuses password unlocks" | After six, `pm` opens a read-only decoy instead of the real vault; after nine it refuses | main.go:3675-3714 |
| recovery.mdx | (none) | Added warning callout "If pm auth recover says the key is missing": it stops with "Recovery record found but key is missing. Manual recovery required." once the vault was saved after a fresh unlock, which every interactive `pm` unlock does; use the desktop app's Forgot master password or `pm auth quorum-recover` | main.go:5694; src/vault.go:915, 1001-1017; main.go:3675-3714 (successful interactive unlock re-saves the vault) |
| health-and-audit.mdx | Score table had no row for alerts on | Added "Security alerts on: listed as `+10`; it only makes up for the `legacy` deduction, because the score can't go above 100" | src/health.go:7-79 |
| health-and-audit.mdx | "Each login whose password is shorter than 8 characters: -5" | Added "(an empty password counts)" | src/health.go (`len(password) < 8`, empty included) |
| health-and-audit.mdx | Trust sample: `[LOW]    APIKEY ...` | `[LOW] APIKEY ...` | main.go trust print (about 1095-1165); sandbox run |
| health-and-audit.mdx | "`pm` keeps three records of its own activity. None contains a secret value." | "None of them holds item values, though `pm cloud get` writes the retrieval key or file ID you used into the audit log." | main.go:1907, 1911, 2003, 2010, 2015 |
| policies.mdx | Enforcement table had no rows for `pm add wifi` or MCP edits | Added "`pm add wifi`: Not checked" and "AI agents editing a login over MCP: Not checked" | main.go:523 + src/vault.go:1665-1673 (`AddWiFi`, no check); src/mcp_apply.go:151-168 (`ApplyMCPEditEntry` sets the password directly), applied on approval via desktop_handlers.go:2764 |
| policies.mdx | "at least `min_length` characters" | "counted in bytes (an accented letter or an emoji counts as 2 to 4)" | src/policy.go:37 (`len(password)`) |
| policies.mdx | "`pm` checks only when `min_length` is greater than 0, while the desktop app checks whenever a policy is active" | "`pm add password` and logins added over MCP are checked only when `min_length` is greater than 0, while the desktop app checks whenever a policy is active" | src/vault.go:1472-1477; src/mcp_apply.go:78; desktop_handlers.go:669-682 (`checkPolicy`: `pol.Name != ""`, password and Wi-Fi types). The old wording was wrong for `pm get` edits, which use the desktop check (item_edit.go:95) |
| browser-extension.mdx | "The APM browser extension never opens your vault file and never sees your master password." | "never opens your vault file ... if you unlock the vault from the extension, the master password you type there goes to APM the same way" | extension/src/background/index.js:123 (`post("/api/unlock", { password })`); CLI desktop_bridge.go:130, 830-847 |
| browser-extension.mdx | Link and serve samples: client "Google Chrome on macOS" / "Chrome on macOS" | "Chrome 141 on macOS" | extension/src/background/bridge.js:45-60 (`clientName`: strips "Google ", adds the major version) |
| browser-extension.mdx | Link step 3: "then waits up to 5 minutes for the extension to connect" | Added: if the desktop app or `pm extension serve` is running, it doesn't wait; the extension uses that for now and you approve a new pairing there | extension_cmd.go:351-358 |
| browser-extension.mdx | Status sample: `Vault:` and `Linked:` lines, no token line | `Linked vault:`, `Linked on:`, plus `Token: e6555a (fingerprint)` (labels padded to 16) | extension_cmd.go:588-590, 630-633, 667-671; sandbox run of `SP/pmbin4/pm extension status` |
| browser-extension.mdx | Heading "### Pairing with bridge serve" | "### Pairing with serve" (anchor `#pairing-with-serve`; nothing linked to the old one) | `pm bridge serve` no longer exists (main.go:3175 at e60d9f4) |
| browser-extension.mdx | "Every request except pairing must carry the pairing token." | "Every request except pairing and the version check (`/api/info`)" | desktop_bridge.go:126-128 (public routes), 481-487 |
| browser-extension.mdx | "Check what is running": separate bridge-status sample (`Listening:  127.0.0.1:41417` ...) and "With nothing listening, it prints `Nothing is listening on 127.0.0.1:41417. Open the APM app or run 'pm extension serve'.` and exits with status 1." | `pm extension status` also probes the port; sample now starts `Right now: the extension uses the APM app` with 16-column labels. Exit 1 when nothing is listening and no browser is linked, when a non-APM program holds the port, or when the bridge rejects the token or the status request fails | extension_cmd.go:595-716 (exit 1 at 650, 665, 692, 698); sandbox runs with nothing listening (exit 1), linked (exit 0) and `serve --locked` (exit 0) |
| team-edition.mdx | Intro: "a second command-line tool in the same repository" | Added "It isn't part of `pm` and APM's releases don't include it, so you build it yourself." | team/go.mod:1 (`module pm-team`, its own module); .github/workflows/release.yml:63 (builds only the root module); ci.yml:35-40 (team built and tested in CI only) |
| team-edition.mdx | "a user added with `pm-team user add` may not be able to log in" | "can't log in" | team/main.go:320-323 (derives from a new salt it never stores, and wraps the adding admin's session key), 141 (login derives from the vault salt); team/team_vault.go:110-117 (no per-user salt field) |
| team-edition.mdx | `pm-team export`: "(admin only; no secret values)" | "(admin only; no item values, but it includes every user's wrapped department keys)" | team/main.go:1058-1069 (`"users": tv.Users`), team/team_vault.go:110-117 (`WrappedKeys`) |

#### Documented code issues: verdicts

| Claim (page) | Verdict | Evidence |
|---|---|---|
| `.apminject` `as:` command injection (inject.mdx) | VERIFIED, and broader than the brief: the payload also runs when you `eval "$(pm inject kill)"`. The name is unescaped for bash, zsh, fish and PowerShell, and the file is found in any parent folder. Demonstrated in the sandbox | cmd/inject.go:56-57, 132-162; internal/inject/apminject.go:20-41, 72-83; internal/inject/shellwriter.go:94-123 |
| PowerShell values escaped the POSIX way (inject.mdx) | VERIFIED from code. Not run, because pwsh isn't installed | internal/inject/shellwriter.go:104-111, 125-140 |
| `.apm_lock` next to the binary | Code confirmed (`APM_STATE_DIR` or next to the executable). My pages make no claim about it | src/utils.go:245-275 |
| `pm cloud init github` encrypts with the GitHub token when `.apmignore` has rules (cloud-sync.mdx) | VERIFIED, and worse than the page said. Because `EncryptVault` reuses the vault's data key, the token can open that copy's data key, which also opens later copies. GitHub keeps the first upload in history. Page rewritten | main.go:202; src/cloud_ignore.go:11-26 (only when the ignore config is non-empty, `IsEmpty` includes `[misc]`); src/vault.go:477-497 |
| Policy enforcement differences (policies.mdx) | VERIFIED; page fixed (except the `pm get` row, see Pending CLI change) | see breakdown below |

**Policy enforcement, by path:**

| Path | When the password is checked | Evidence |
|---|---|---|
| `pm add password` | Only if `min_length` > 0 | main.go:441, src/vault.go:1472-1477 |
| `pm add wifi` | Never | main.go:523, src/vault.go:1665-1673 |
| `pm get` edit | Desktop rules: logins and Wi-Fi, whenever a policy is active, if the password is in the patch | item_edit.go:95, desktop_handlers.go:749, 669-682 |
| Desktop app add and edit | Same desktop rules | desktop_handlers.go:700, 749 |
| MCP `add_entry`, now applied when you approve in the app | Only if `min_length` > 0 | src/mcp_apply.go:78, desktop_handlers.go:2764 |
| MCP `edit_entry` | Never | src/mcp_apply.go:151-168 |
| `pm import` (transfer engine) | Never | no `AddEntry` or `Validate` in src/transfer_*.go |
| `pm auth change` | Not a policy path | no `ActivePolicy` use, main.go:6133-6170 |
| Legacy desktop RPC `data.import` | Calls `AddEntry` and ignores the error, so it silently drops logins that fail a policy with `min_length` | src/portability.go:193, 243, 315, 431, 445, 501. The GUI defines `importData` but never calls it (GUI renderer/src/lib/store.js:410) |

**Policy folder:** `pm` and the app both read `policies/` next to the vault (main.go:2505, 3029; desktop.go:1415-1417). `pm setup` and desktop vault creation make the folder (main.go:2260; desktop_handlers.go:433).

**Rotation and classification:** read and stored, never enforced. The app only shows `rotate_every_days` (desktop.go:1429; GUI renderer/src/settings/security.jsx:99, 106). Unknown YAML keys are ignored (src/policy.go:79-102, yaml.v3 default).

#### Other findings for the owner (not on the pages unless noted)

**Cloud sync**
- Generated retrieval keys come from 48 x 48 words. In APM_PUBLIC Dropbox, a colliding key overwrites another user's vault file (src/cloud.go:415-441, overwrite mode). Partly on the page.
- Google Drive `DownloadVault` always uses the unauthenticated `uc?export=download` URL (src/cloud.go:128-130, 195-211). `pm cloud get` and `diff` on a self-hosted private Drive file probably fail. Not run (network).
- `pm cloud delete` with no argument fails when Dropbox was the last provider set up (main.go:2133, 5107). The workaround is on the page.
- `pm cloud reset` can't reset Drive-only sync without a retrieval key (main.go:2184). The workaround is on the page.
- Auto-sync drops writes inside its 5-second window and uploads the start-time vault when `.apmignore` is in effect (main.go:1772-1812). Now on the page.

**History, audit and alerts**
- `pm lgit undo` checks out `commits[n-2]`, so running it twice toggles between two states, and `--steps 2` behaves like `undo` (src/lgit.go:290-308). Truncating commits from the tail of `lgit.jsonl` isn't detected (src/lgit.go:120-151).
- `pm cloud get` writes the retrieval key or file ID into the audit log (main.go:1907-2015). Now on the pages.
- SMTP credentials are embedded in the binary (main.go:3521-3527).

**Recovery and unlock**
- If the alert email fails, `pm auth email` returns before showing or saving the key (main.go:5896-6010). Now on the page.
- Typo in a prompt: "enter new master passwod:" (main.go:5855).
- Mojibake in a prompt: "ΓÜá SECURITY WARNING" (main.go:3761).

**Inject**
- The fish helper (cmd/inject.go:259) probably sets function-local variables, so injected values may not reach the shell. Not tested, because fish isn't installed.
- In practice `pm inject setup-shell` never reaches its PowerShell branch, because PowerShell doesn't set `SHELL`. Now on the page.

**MCP (aef9bbf)**
- `manage_spaces`, `manage_profiles`, `cloud_config` and `cloud_sync` still act without approval. They write the vault with `os.WriteFile`, skipping lgit (src/mcp.go:799, 846, 865, 911, 1022, 1122-1128).
- `cloud_config` lets an agent replace the GitHub token and repo or the Drive token, and `cloud_sync` then uploads the encrypted vault there. An agent holding both permissions can send the encrypted vault to an account it controls without approval.

**Browser extension**
- `pm extension link` says "approve it in the app" even when `pm extension serve` is what's running (extension_cmd.go:357).
- `pm extension unlink` exits 0 even when a manifest can't be removed (extension_cmd.go:549-566).
- `pm extension status --port N` reports "the APM app is closed, so the browser starts pm" whenever nothing answers on N (extension_cmd.go:660-661).

**Commands that skip the read-only check**
- `pm policy load` and `pm policy clear` ignore the read-only flag (main.go:2498, 2570).

**Team edition**
- The per-type `add` commands ignore permission overrides (team/main.go:1198, `CanAddEntry(nil)`).
- `pm-team dept switch` doesn't give the user the new department's key, so they can't log in afterwards (team/main.go:546-552, 141-147). Already on the page.

#### Pages outside my set that need changes

- **desktop/settings.mdx (Alerts):** the desktop app writes `email.log` next to the vault, because the app changes into the vault's folder (desktop.go:188), not "the folder `pm` was started from".
- **extension/passkeys.mdx:81** still mentions `pm passkeys`, which was removed in 013843f.
- **Other pages saying the extension "never sees your master password":** check them against extension/src/background/index.js:123. My grep found no exact match outside my page, but the extension pages may phrase it differently.
- **Security fork's citations:** its `main.go` line numbers above about 4900 are from before 5c023b7, which shifted later lines by about -445.

#### Anchors

- No `<Command name=...>` anchors renamed or removed.
- One heading changed: browser-extension.mdx "Pairing with bridge serve" is now "Pairing with serve", so `#pairing-with-bridge-serve` became `#pairing-with-serve`. Nothing linked to the old anchor; validation passes.

#### Unresolved

- **fish:** the inject helper's variable scope. fish isn't installed.
- **PowerShell:** parsing of `'\''`. pwsh isn't installed; the claim rests on the code.
- **Self-hosted Google Drive:** whether `pm cloud get` and `diff` download works. Needs the network.
- **Desktop app samples:** the `pm extension status` lines when the desktop app (not `serve`) answers. Only the `serve` variant was run; the code path differs only in the mode string (extension_cmd.go:656-659).



---

## reference section

10 pages in `website/content/docs/reference/` (index, vault-settings, exit-codes, apminject, apmignore, policies, environment-variables, file-locations, faq, glossary), about 420 claims. Checked at `5c023b7`, then re-checked at `aef9bbf`. Validation: 0 issues.

### reference (index, vault-settings, exit-codes, apminject, apmignore, policies, environment-variables, file-locations, faq, glossary)

Verified against CLI **5c023b7** (20:40), then re-checked at **aef9bbf** (21:02), which is HEAD at finish. aef9bbf adds 4ecbf31 (the `pm bridge` → `pm extension` merge) and the MCP approval change.

How line numbers are cited:
- Line numbers are identical in both commits for every file cited below, except `main.go` below line 6336 and `src/mcp.go`, `extension_cmd.go` and `extension_serve.go`. Those are cited at aef9bbf.
- GUI citations are `GUI/` on disk.
- The design-system citation is `design-system/components/bundle.js`.

Scope: about 420 claims across the 10 content pages, plus `_section.json` untouched. `node SP/validate.mjs desktop security agents cli reference` → **issues 0**.

#### Corrections

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| exit-codes.mdx | `pm import` exits 1 when "The file can't be read or recognised, its password is wrong, the session is read-only (except with `--dry-run`), or the vault can't be saved" | Adds: an invalid `--on-conflict`/`--on-duplicate` value, and the vault can't be unlocked | transfer_cmd.go:386-392, 396-398, 400-401, 403-405, 553; cli_helpers.go:16-18 (cliFail = exit 1) |
| exit-codes.mdx | `pm export`: "the output file exists and there is no terminal to confirm overwriting it (without `--force`)" | "…`pm` can't ask before overwriting it (there is no terminal, or you used `--json`) and you didn't pass `--force`" | transfer_cmd.go:689, 745-747 |
| exit-codes.mdx | `pm export compare`: "…or the file can't be read" | "…or the file can't be read, recognised or decrypted" | transfer_cmd.go:853-861 |
| exit-codes.mdx | `pm totp link/unlink`: "…the entry or site isn't found…" | "…no authenticator entry matches the name (or several do), the site isn't a valid name (`link`)…; `pm totp unlink` for a site that isn't linked exits with `0`" | cli_helpers.go:40-71, 79-80, 82/110 → 29-36, 93/132, 120-127 |
| exit-codes.mdx | `pm mcp serve`: "The MCP server stops with an error" | "The token is invalid or expired, or the server stops with an error. With no saved token at all it prints a message and exits with `0`" | aef9bbf main.go:6510 (exit 0, no tokens), 6519 (exit 1); src/mcp.go:302 (invalid), 307 (expired) |
| exit-codes.mdx | "Other commands open such a vault read-only and refuse to write with status `0`." | "…`pm import`, `pm totp link`, `pm totp unlink` and a change with `pm autolock` then exit with `1`, as for any read-only session; the rest refuse to write and exit with `0`." | main.go:3675-3682 (newer vault → readonly); transfer_cmd.go:400-401; cli_helpers.go:33-34; lock_policy.go:224, 234-236 |
| exit-codes.mdx | Script example treated output containing `Error`/`failed`/`Failed` as failure | Treats anything without `Vault synced to cloud.` as failure | main.go:1694 ("Cloud sync not initialized…" matches none of the old words, nor do unlock errors), 1724 (success line). Also matches the page's own advice |
| exit-codes.mdx | `pm extension serve`: "…the port is in use…" (text from the sed) | "…the bridge can't start (usually because the port is in use)…" | extension_serve.go:225-263 (233 no vault, 239-247 start error incl. port in use, 257/263 unlock) |
| exit-codes.mdx | `pm extension status`: "Nothing is listening, something other than APM is, or the pairing token doesn't match" (text from the sed, describing old `pm bridge status`) | "Nothing is listening and no browser is linked, something other than APM is listening, the pairing token doesn't match, or the status request fails" | extension_cmd.go:647-651, 660-666, 688-693, 694-699; exits 0 otherwise (671, 683, 715) |
| exit-codes.mdx | `pm extension link`: "There is no vault, an `--id` is invalid, no browser could be linked, the link settings or token can't be written, or the pairing answer can't be recorded" | Adds: a bad `--browser`, no Chromium browser found, `pm` can't find its own path, and Ctrl C or closed input at the code prompt (request denied) | extension_cmd.go:292-345 (295, 302, 311, 316, 337, 341, 345), 460-472, 487-488 |
| exit-codes.mdx | Exit-0 list: "`pm extension status` and `pm extension unlink`, which always exit `0`" (contradicted the table after the merge) | "`pm extension unlink`, which always exits `0`" | extension_cmd.go:534-572 (no exit), 595-716 (status exits 1 in four cases) |
| exit-codes.mdx | "`pm unlock` with a wrong password, and every command whose unlock fails" | "…every **other** command whose unlock fails" (the table lists commands that exit 1 on unlock failure) | as above |
| vault-settings.mdx | "A vault that has never been opened in the app has none of these stored, and every part of APM uses the defaults above." | "A setting that isn't stored, for example in a vault that has never been opened in the app, uses the default above. `pm autolock` stores only the three lock settings." | lock_policy.go:34-62; desktop.go:1489-1500 |
| vault-settings.mdx | `copyOnClick`, `confirmDelete`: app "Yes" | "Stored and shown in **Settings**, but in 12.0.0 the app always copies on click and always asks before deleting" | Only references: GUI/renderer/src/settings/general.jsx:36-37 and lib/store.js:11. design-system SecretField value: `onClick: copy`, title "Click to copy". Delete always opens the confirm dialog: screens/detail.jsx:60, screens/authenticator.jsx:93 → screens/dialogs.jsx:84-96 |
| vault-settings.mdx | Auto-lock is used by `pm` "for sessions started by `pm unlock` and for `pm extension serve`" | "for every session `pm` starts, by `pm unlock` or by any command that asks for your master password, and for `pm extension serve` and the native host" | main.go:875-899, 3855-3856; lock_policy.go:189-192; autolock.go:29-31, 62, 115; native_host.go:150 |
| environment-variables.mdx | App vault order: config → APM_VAULT_PATH → `vault.dat` next to `pm` on PATH → `~/.apm/vault.dat` | Adds "then `~/Desktop/apm/vault.dat` if it exists (`pm` itself never looks there)" | GUI/electron/paths.js:58-79 (76-77) |
| environment-variables.mdx | "The MCP server honours it too." (APM_EPHEMERAL_ID) | "The MCP server uses it too, but only when no regular session is open." | src/mcp.go:1203-1223 |
| environment-variables.mdx | APM_BRIDGE_PORT paragraph duplicated `pm extension status` (from the sed) | De-duplicated. Readers are the app, `serve`, `status`, and `link`'s check for a running bridge. Adds "other values are ignored" | desktop_bridge.go:153, 156-163; extension_cmd.go:243-246, 351, 595-598; flags extension_serve.go:217, extension_cmd.go:584 |
| environment-variables.mdx | "An actor containing `ai` marks new items as created by AI. … which is always your account name." | "An actor name that contains `ai` in any letter case, such as `AI` or `Craig`, marks new items as created by AI. … which is always the name of your home folder." | src/trust.go:61, 83-92; src/audit.go:55-57 |
| environment-variables.mdx | APM_STATE_DIR set by "The desktop engine and the bridge" | "The desktop engine, `pm extension serve` and the native host" | desktop.go:184-186, 208-209; extension_serve.go:225-226; native_host.go:147 |
| environment-variables.mdx | APM_DESKTOP_TOUCHID=app: "The app shows its own Touch ID prompt instead of the system dialog" | "The app runs the Touch ID check itself, so macOS shows the prompt as coming from APM rather than from `osascript`" | desktop.go:543-548 |
| environment-variables.mdx | `TEMP` (Windows) | `TMP` or `TEMP` (Windows) | Go `os.TempDir` uses GetTempPath (TMP, then TEMP) |
| environment-variables.mdx | USER/USERNAME: ephemeral bindings only | Adds "and the device hash in `apm_audit.log`" | src/anomaly.go:18-28 |
| file-locations.mdx | `lgit_notes.json`: "Notes you add to history entries in the desktop app" | "Short descriptions the desktop app records for its history entries, such as `Restored …`" | desktop.go:443-446; desktop_handlers.go:2456, 2490, 2522; GUI screens/history.jsx:80 |
| file-locations.mdx | `audit.json`: "Never contains secret values" | "It never records item secrets, but `pm cloud get` writes the retrieval key or file ID it was given into it" | main.go:1907, 1911, 2003, 2010, 2015 |
| file-locations.mdx | Snapshots "are no less protected than the vault itself" | After a master-password change, older snapshots still open with the old password | src/lgit.go:196-203 (a snapshot is the vault file as saved) |
| file-locations.mdx | `mcp_transactions.json`: "…a receipt once applied or rejected" | The tool, its arguments in plain text (incl. any password or key), a preview and the status. Only approved requests get a receipt; rejected ones are `aborted`. Removed on the first read after expiry (15 min), whatever the status | src/mcp_transactions.go:15-26, 55-64, 126-148; src/mcp.go:280-290; desktop_handlers.go:2744-2783 |
| file-locations.mdx | `apm_audit.log`: "One line per unlock attempt and unlock" | "One line each time `pm` asks for the master password, and one per successful unlock and per wrong password" | main.go:3758 (ATTEMPT), 3840 (UNLOCK), 3862 (FAIL); desktop_handlers.go:201, 251 |
| file-locations.mdx | Session file "Removed by `pm lock` or when the session expires" | "Removed by `pm lock`, by locking the desktop app, or the next time `pm` finds it expired" | src/session.go:117-160 (the expiry timer goroutine dies with the `pm` process); desktop_handlers.go:364-372 |
| file-locations.mdx | `apm_mcp_*.enc` "Removed after 5 minutes" | "Removed once the agent decrypts it, or after 5 minutes" | src/mcp.go:473-480, 585 |
| file-locations.mdx | Callout: credentials are only in `mcp_auth.json` and `ephemeral_sessions.json` | Adds `bridge_token`, and notes `mcp_transactions.json` can hold an agent-supplied password or key | desktop_bridge.go:165-172, 203, 214 (plain, 0600); src/mcp_transactions.go:15-26 |
| file-locations.mdx | `email.log` "For the desktop app that is the folder it was started from." | "For the desktop app, that is the vault's folder: its engine switches to it when it starts." | desktop.go:187 (`os.Chdir`); src/security.go:76-78 (relative `email.log`) |
| file-locations.mdx | "Every copy is encrypted with your master password before it leaves your computer." | Adds the bug exception: `pm cloud init github` / `pm setup` with an active `.apmignore` encrypts the first GitHub copy with the token; run `pm cloud sync github` | main.go:172-202, callers 1637, 1644, 2442, 2453; src/cloud_ignore.go:11-26; src/apmignore.go:34-36; sync re-encrypts with the master password, main.go:1712 |
| apmignore.mdx | Intro: the filtered copy is "encrypted with your master password" | Adds the same GitHub exception | as above |
| apmignore.mdx | "The desktop app's engine runs in the folder the app was started from, usually `/`…" | "The desktop app's engine switches to the vault's folder when it starts, so the app always uses the file next to the vault." | desktop.go:187; src/apmignore.go:40-65 |
| apmignore.mdx | `[misc]` has no effect | Adds: they still count as rules, so the upload uses a filtered copy | src/apmignore.go:34-36; src/cloud_ignore.go:18 |
| apmignore.mdx | "APM removes their usage records and their entries in the vault's item history" | Usage records yes. History is filtered only by rules whose space part matches `default`; history for items left out by `[spaces]` or by another space's rule is uploaded as is | src/apmignore.go:281-301 (history checked with space ""), 376-382; src/vault.go:260-268 (HistoryEntry has no space) |
| apmignore.mdx | Callout: only the Trash and earlier versions are unfiltered | Adds the site links of authenticator codes (`pm totp link`) | src/vault.go:348 (`TOTPDomainLinks`), untouched by FilterVaultForProvider (src/apmignore.go:186-305) |
| apmignore.mdx | Old docs used "a `drive` provider … the provider is `gdrive`" | Removed; no evidence. Old docs list `gdrive`, `github`, `dropbox` | CLI/docs/guides/apmignore.md:67; CLI/docs/reference/apmignore.md:81; `git log -S` finds no `drive:` rule. The rest of the callout is verified: docs/reference/apmignore.md:9-14, docs/guides/apmignore.md:52, 102; commit 588ff05 (`[vocab]`) |
| apminject.mdx | "Items are looked up in the current space only." | In the default space, nine types (logins … certificates) match in any space, first match wins; cloud credentials, Docker registries and SSH configs only in the default space | src/vault.go:1488-1496, 1520-1528, 1552-1556, 1583-1587, 1614-1618, 1645-1649, 1676-1680, 1707-1714, 1738-1745 (`CurrentSpace == "" \|\| …`); internal/inject/resolver.go:118-167 (matchSpace) |
| policies.mdx | Generated passwords are "occasionally refused" | Adds: `pm add` always generates 16 characters, so a `min_length` above 16 always refuses it | main.go:437-441; src/vault.go:1472-1477 |
| policies.mdx | "AI agents adding a login \| Yes"; no other agent or Wi-Fi rows | "Adding a Wi-Fi item with `pm add` \| No"; "AI agents adding a login, once you approve the request \| Yes, if the policy sets `min_length`"; "AI agents changing a login's password, once you approve the request \| No" | main.go:523 + src/vault.go:1665-1673; desktop_handlers.go:2764 → src/mcp_apply.go:69-78 → vault.go:1472-1477; src/mcp_apply.go:151-170 (165 sets the password directly) |
| faq.mdx | "Check what is listening with `pm extension status` and which browsers are linked with `pm extension status`" (sed duplicate) | "Run `pm extension status`. It shows which browsers are linked, what the extension is using right now, and whether the pairing token matches the running bridge." | extension_cmd.go:595-716 |
| glossary.mdx | Permission: "…such as reading items or adding one" | "…or asking to add one" | src/mcp.go:701, 721, 751 (requestMCPApproval), 1179 (hasPermission) |
| glossary.mdx | Transaction: "…that waits for approval before it touches the vault" | "…It touches the vault only after you approve it in the desktop app, and expires after 15 minutes." | src/mcp.go:280-290; desktop_handlers.go:2744-2783 |
| glossary.mdx | Audit log "without secret values" | "without item secrets" (the retrieval key is logged) | main.go:1907-1911, 2003-2015 |
| glossary.mdx | Watchtower: "weak, reused and old passwords" | "weak, reused, old and exposed passwords, and of items that expire soon" | GUI/renderer/src/lib/health.js:67-72 |
| index.mdx | "Generated password \| 16 characters" | "16 characters with `pm gen`, 20 in the app's generator" | help tree (`pm gen -l` default 16); GUI/renderer/src/screens/generator.jsx:8 |

Verified and unchanged, by page:
- index:
  - auto-lock 15 min / 1 h / sleep (desktop.go:711-720)
  - bridge port 41417 (desktop_bridge.go:26)
  - ephemeral session 15 min, read scope (help tree)
  - TOTP 6 digits / 30 s / SHA-1 (src/totp.go:10-18)
  - 10 recovery codes (help tree; GUI recovery.jsx:142)
  - 2 of 3 shares (help tree; GUI recovery.jsx:186-187)
  - `standard` profile fallback (src/vault.go:460)
- vault-settings: keys, defaults, labels and offered values (GUI settings/sessions.jsx:11-12, 34-36; security.jsx:54; general.jsx:35-37; appearance.jsx:99)
- policies:
  - schema, byte-length check and Unicode classes (src/policy.go:12-102)
  - same folder for `pm` and the app (main.go:2505, 3029; desktop.go:1415-1417)
  - desktop checkPolicy (desktop_handlers.go:669-682)
  - example policy file
- apmignore:
  - parser, aliases, path.Match and name fields (src/apmignore.go:75-466, 186-267)
  - all upload paths apply it (main.go:142, 202, 1712, 1795, 5092; desktop_cloud.go:46; src/mcp.go:1007, 1025)
  - desktop provider IDs (desktop_cloud.go:42)
  - `pm loaded` format (main.go:3049-3059)
- apminject:
  - parse layouts, sanitize, derived names (internal/inject/apminject.go, resolver.go:48-75)
  - errors (cmd/inject.go:200-225; resolver.go:40-42)
- file-locations:
  - config dir, 0600 files / 0700 dirs (src/*.go WriteFile/MkdirAll)
  - lgit fields and snapshots (src/lgit.go:16-26, 196-203)
  - icons limits (icons.go:28-40, 52-57, 193-195, 290-312)
  - native host files and browser paths (native_host.go:51-73, 391-398; extension_cmd.go:38-121, 534-570)
  - conflict file name (main.go:5215)
  - `pm update` files (main.go:3308, 3321)
  - Drive credentials override (main.go:5155-5170)
  - Keychain names (src/touchid/touchid.go:10-16)
  - cloud file names (src/cloud.go:87-96, 415-430, 598-612)
  - team files (team/main.go:36, team/session.go:26)
- faq:
  - old docs said `./vault.dat` (CLI/docs/reference/storage.md:11)
  - decoy at 6 / refuse at 9 (main.go:3767-3793; desktop_handlers.go:244-245)
  - app unlock/lock shares the `pm` session (desktop_handlers.go:222, 364-372)
  - completion disabled (main.go:2231)
  - `pm export` takes no args (transfer_cmd.go:621)
  - install scripts (scripts/install.sh:4, 49; scripts/install.ps1)
  - go.mod 1.25
  - removal commits fca82c0 (plugins), 20d6178 (autofill), 1a3d66d (audit → logs)
  - Drive APM_PUBLIC files get an anyone-reader permission (src/cloud.go:113-119)
  - `pm info` output (main.go info Run)
- glossary:
  - DEK and recovery slot (src/vault.go:302, 405, 435-489)
  - 25 item types (src/items.go)
  - recovery code format (src/recovery_codes.go:34-38)
  - retrieval key words (src/cloud.go:37-39; src/utils.go:276-297)
  - key-hash consent (main.go:121-126, 5071-5076)
  - roles and departments (team/team_vault.go:12-25)
  - trust and health clamps (src/trust.go:142-183; src/health.go)

#### Documented code issues: verdicts

| Claim (page) | Verdict | Evidence |
|---|---|---|
| `.apminject` `as:` command injection (apminject.mdx callout) | **Confirmed.** `as` is only trimmed, then written unescaped as the variable name in the `export` / `set -x` / `$env:` lines the shell `eval`s. The file is found by walking up every parent folder | cmd/inject.go:54-58; internal/inject/apminject.go:72-83; internal/inject/shellwriter.go:94-123; apminject.go:20-41 |
| `.apm_lock` next to the binary (environment-variables, file-locations) | **Confirmed.** The state folder is APM_STATE_DIR, else the executable's folder. Write errors are ignored, so in an unwritable folder (e.g. `/usr/local/bin`) failures are never counted. The app, `pm extension serve` and the native host use the vault folder, so the app and a terminal `pm` keep separate counts by default | src/utils.go:245-272; src/anomaly.go:30-40; desktop.go:184-186 |
| `pm cloud init github` encrypts with the GitHub token when `.apmignore` is active (file-locations, apmignore) | **Confirmed, and fixed on both pages.** Also reached from `pm setup`'s cloud step. "Active" means any rule in any section, `[misc]` included | main.go:172-202, 1637, 1644, 2442, 2453; src/cloud_ignore.go:11-26; src/apmignore.go:34-36 |
| Policy enforcement differences (policies.mdx) | **Confirmed.** `min_length > 0` gate applies to `pm add` (logins) and agent adds. No check for `pm add` Wi-Fi, agent edits or `pm import`. The app checks any named policy for logins and Wi-Fi. The policy folder is the same for `pm` and the app. **At 5c023b7 the `pm get` editor behaves like the app** (see Pending) | src/vault.go:1472-1477; main.go:441, 523; src/mcp_apply.go:69-78, 151-170; desktop_handlers.go:669-682, 741-751; item_edit.go:80-95 |
| Side note: PowerShell escaping | **Confirmed by reading; not run** (no pwsh). Single quotes in values are escaped POSIX-style (`'\''`) instead of PowerShell's `''`, so a value containing `'` produces invalid PowerShell. Belongs to cli/inject | internal/inject/shellwriter.go:104-111, 125-140 |
| Side note: `inject` shell function | `setup-shell` installs `eval $(pm inject "$@")` with the substitution unquoted, which collapses newlines and runs of spaces in values. Tested in bash and zsh. Breaks SSH keys, notes and recovery codes. Belongs to cli/inject | cmd/inject.go:246-264 |

#### Other findings for the owner (not on my pages)

1. `pm mcp serve` without `--token` picks an arbitrary saved token, because it ranges over a Go map. The agent's permissions can therefore change between runs (aef9bbf main.go:6512-6515). Agents pages.
2. With a read-only `pm` session, the MCP server serves the **decoy vault** (made-up items) instead of failing (src/mcp.go:1231-1233). Agents pages.
3. Failure counts are kept per state folder. The app and a terminal `pm` count separately by default, and a `pm` in an unwritable folder never counts, so the decoy never triggers there. cli/sessions ("Failed attempts").
4. The `inject` shell function's unquoted `eval` mangles multi-line values, and PowerShell escaping is broken. cli/inject.
5. Agent-supplied secrets sit in plain text in `mcp_transactions.json` until the first read after expiry. Now on file-locations; agents/security pages may want it.
6. Runtime env vars not on the page: `OS` only (src/cloud.go:526, used to open the browser for Drive OAuth on Windows; minor). GUI build-time variables are not user-facing: APM_NODE_INCLUDE, APM_DESIGN_SYSTEM, APM_WEB_BRIDGE_DIR, PORT, APM_CLI_REPO, APM_CLI_REF, APM_SRC, GOOS, GOARCH, CGO_ENABLED.
7. No `<Command>` anchors renamed or removed. The reference pages have none.

#### Unresolved

1. **faq.mdx, "I forgot my master password":** "Then `pm auth recover` or `pm auth quorum-recover` sets a new master password". security/recovery.mdx and security/threat-model.mdx say `pm auth recover` almost always stops with "Recovery record found but key is missing."
   - Reading 5c023b7/aef9bbf, I could not confirm that. The header's ObfuscatedKey is reloaded on every v4 decrypt (src/vault.go:824-827, 913-915; CurrentVersion = 4 at vault.go:25), written back on save (vault.go:528-532), and cleared only by ClearRecoveryInfo (vault.go:1001-1010, `pm auth reset`).
   - Not run, because it needs a real recovery email. The FAQ is left as is. The FAQ and the security pages disagree, and a run should settle it.
2. **environment-variables.mdx:** "Change the extension's port to match". The extension source was not checked; the extension section belongs to the depth agent.
3. The PowerShell behaviour was not run (no pwsh on this machine).


#### Fact-checker follow-up on reference/

The reference pass left one question unresolved: does `pm auth recover` really stop with "key is missing"? It does.

The masked key in the header is written only from `RawRecoveryKey` or `ObfuscatedKey` (`CLI/src/vault.go:528-532` at `aef9bbf`).
- A normal unlock goes through `decryptNewVault` (`vault.go:612-834`). That function reads only the alert fields from the header (`vault.go:824-827`) and never sets either key field.
- Only `DecryptVaultWithDEK`, the recovery path, reloads `ObfuscatedKey` (`vault.go:915`).
- So the first save after a normal unlock drops the masked key, and `pm auth recover` then stops at `CLI/main.go:5692-5694`.

The reference pass had read `vault.go:824-827` as reloading the key. Those lines load only `AlertsEnabled`, `SecurityLevel` and `AlertEmail`. The security verdict stands.

| File | Original claim | Corrected claim | Evidence |
|---|---|---|---|
| faq.mdx | "Then `pm auth recover` or `pm auth quorum-recover` sets a new master password." | It now names the app's **Forgot master password**, `pm auth quorum-recover` and `pm auth recover`. It adds that `pm auth recover` usually stops with "Recovery record found but key is missing", because `pm` drops the copy of the key it needs the next time it saves after an unlock. | `CLI/src/vault.go:528-532, 612-834 (824-827), 915`; `CLI/main.go:5683-5694` (`aef9bbf`). Matches `cli/recovery.mdx:150-151` and `security/recovery.mdx` |



---

## getting-started: second pass

All 6 pages, including the new `getting-help.mdx`, and every `_depth.md` row under "## getting-started" (68 rows), about 300 claims. Validation: 0 issues.

### getting-started, second pass (index, installation, quickstart, concepts, choose-your-surface, getting-help)

Code base: CLI committed HEAD `5c023b7` (read from the export `SP/clihead/`; `CLI/...:N` line numbers below are at `5c023b7` unless marked "working tree"). Bridge (`pm extension serve/token/rotate/status`) and MCP-approval claims were checked against the CLI **working tree** (build `SP/pmbin4/pm`), as instructed. Those changes were then committed as `4ecbf31` (21:01, bridge merge) and `aef9bbf` (21:02, MCP approval). Every file cited as "working tree" below is byte-identical to `aef9bbf` (checked with `git diff --quiet aef9bbf -- <file>` for `src/mcp.go`, `extension_serve.go`, `extension_cmd.go`, `desktop_bridge.go`, `autolock.go`, `native_host.go` and `desktop_handlers.go`), so "working tree" line numbers are also `aef9bbf` line numbers. GUI and extension: current working copies. Live checks (curl, GitHub API) noted as "live".

#### Corrections

| File | Source | Original claim | Corrected claim | Evidence |
|---|---|---|---|---|
| index.mdx | original | "APM is free and open source under the GPL-3.0 license" | "APM is free, with no paid tier and no trial, and its source code is public on GitHub. `pm` is licensed under GPL-3.0." | `CLI/LICENSE` (GPL-3.0); `GUI/` and `extension/` have no LICENSE file and no `license` field in package.json; live GitHub API: apms-org/gui and apms-org/extension report no license, apms-org/cli reports GPL-3.0; the app's own About page says "License: MIT" (`GUI/renderer/src/settings/general.jsx:157`) |
| index.mdx | original | "so nobody without it can open the vault, including the people who make APM" | "so without it, or a recovery method you set up, nobody can open the vault, including the people who make APM" | recovery key opens the vault without the master password: `CLI/src/vault.go` `CheckRecoveryKey` / `DecryptVaultWithDEK` (see security log) |
| index.mdx | original | "There is no APM account, server or subscription. Sync ... uses your own Google Drive, GitHub or Dropbox" | No account or subscription; sync uploads only the encrypted file to your own GitHub/Drive/Dropbox, or to APM's shared storage on Drive or Dropbox, which `pm cloud init` picks unless you choose your own account | `CLI/main.go:90-116` (Drive: option 1 `APM_PUBLIC`, anything but "2" → `apm_public` with built-in credentials), `CLI/main.go:5026-5045` (Dropbox, same prompt); `CLI/src/cloud.go:330-347` (built-in credentials) |
| installation.mdx, quickstart.mdx | original | Node.js "20.19 or newer (or 22.12 or newer)" / "20.19 or newer" | "Node.js 20.19 or a later 20.x release, or 22.12 or newer" (21.x and 22.0-22.11 are outside the supported range) | `extension/package.json` `"engines": { "node": "^20.19.0 \|\| >=22.12.0" }` |
| installation.mdx | depth (_depth.md:25) | Canary example `apm-can-12-darwin_arm64.tar.gz` | `apm-can-v10.2.0-darwin_arm64.tar.gz` for the tag `can-v10.2.0` (the real canary tag pattern) | `CLI/.github/workflows/release.yml:4-7, 51-54` (`apm-${{ github.ref_name }}-...`); live: release `can-v10.2.0` assets `apm-can-v10.2.0-darwin_arm64.tar.gz` etc. |
| installation.mdx | depth (_depth.md:25) | "a vault saved by a newer `pm` opens read-only in an older one" | "... opens read-only in an older one when the newer version changed the vault format" | `CLI/src/vault.go:27-31` (`VaultFormatRevision`, bumped only when the format changes), `:427-429` (`IsNewerFormat`: revision > known revision) |
| installation.mdx | original | APM data folder holds "sessions" | It holds "the key that protects `pm` sessions"; the `pm` session itself is a file in the temporary folder | `CLI/src/session.go:17, 54-70` (`pm_session_*.json` in `os.TempDir()`), `:211-230` (`session.key` in the config folder) |
| installation.mdx | depth (_depth.md:29) | `pm update` on Windows "downloads the new `.exe`" | "downloads the first `.exe` in the release, without checking your processor type" | `CLI/main.go:3237-3248` (first asset whose name contains `windows` and ends in `.exe`; no architecture check); release has `windows_amd64.exe` and `windows_arm64.exe` |
| quickstart.mdx | depth (_depth.md:40) | Blank password: `pm` prints "Generated password created and saved." **instead** of "Entry saved." | It prints "Generated password created and saved." **before** "Entry saved." (both lines appear) | `CLI/main.go:436-440` (prints the line right after generating), `:847-848` ("Entry saved." after the save) |

Quickstart, verified as written: the app's setup steps and labels (`GUI/renderer/src/screens/auth.jsx:336-342, 357, 364, 399`); password rules, identical in app and `pm` (`GUI/renderer/src/lib/profiles.js:13-19`, `CLI/src/utils.go:209-243`); recommendation thresholds (`CLI/src/system_profile.go:36-51`, `profiles.js:11`); **New login** fields, **Save login** with ⌘↵ / Ctrl+↵ (`GUI/renderer/src/lib/types.js:11-14`, `screens/dialogs.jsx:71-72`), the generator in the password field (`screens/fields.jsx:165`); the `pm unlock` transcript, printed twice (`CLI/main.go:3811, 3855-3857, 908`) and the unlocked line (`CLI/lock_policy.go:68-89, 195-201`; no "on sleep" on Windows: `CLI/src/session.go:33-36`, `src/session_sleep_other.go`); the app adopting an existing `pm` session (`GUI/renderer/src/lib/store.js:173-174`, `CLI/desktop_handlers.go:333-362`); `pm totp <name>` copies a code from a login's own key or an Authenticator item (`CLI/main.go:1553-1567`, `src/login_totp.go:36-39`); `pm lock` → "Vault locked." (`CLI/main.go:942-953`); the pairing dialog "Connect … to APM?", the XXX-XXX code and **Connect** (`GUI/renderer/src/screens/pair.jsx:9-18, 45`); focusing a username field opens the menu (`extension/src/content/autofill.js:508, 532-541`); Alt+Shift+F (`extension/scripts/build.mjs:84`); the full `pm setup` transcript strings (`CLI/main.go:2242-2483`), `--non-interactive` (`:2238, 2298, 2314, 2358, 2382, 2426`), cipher names (`main.go:3408-3424`, `src/utils.go:101-110`); the `pm add login` prompts and the 16-character generated password (`main.go:245, 428-443`); "Vault not found. Run 'pm setup'." (`main.go:3710-3711`); "APM isn't connected" (`extension/src/ui/popup/gate.jsx:134`); **Use a saved login on** + host (`ui/popup/tabs.jsx:66`).

##### concepts.mdx

| File | Source | Original claim | Corrected claim | Evidence |
|---|---|---|---|---|
| concepts.mdx | original | "There is no APM account and no server" | "There is no APM account" (Drive and Dropbox can store the vault in APM's shared storage, and recovery codes are mailed through APM's own mail account) | `CLI/main.go:90-116, 5026-5045` (APM_PUBLIC), `CLI/main.go:3521-3527` + `CLI/desktop_cloud.go:20-28` (APM's SMTP account) |
| concepts.mdx | original | Newer-`pm` vault "opens read-only in an older one" | "... a newer `pm` that changed the vault format ..." | `CLI/src/vault.go:27-31, 427-429` |
| concepts.mdx | depth (_depth.md:54) | Bridge requests carry "the pairing token on every request" | "... on every request except pairing and the version check" | working tree `CLI/desktop_bridge.go:126-128` (`/api/info`, `/api/pair/start`, `/api/pair/poll` are `public`), `:481` |
| concepts.mdx | original | Where the master password is kept: Keychain (Touch ID) and the encrypted session file | Adds: an ephemeral session from `pm session issue` keeps it in plain text in APM's data folder until it expires | `CLI/src/ephemeral_session.go:15-41, 87-93` (`MasterPassword` stored in `ephemeral_sessions.json` under `os.UserConfigDir()/apm`) |
| concepts.mdx | original | Cipher "chosen when you create the vault" | "You choose it when you create the vault, and can change it later." | app **Settings → Security → Cipher** re-encrypts (`GUI/renderer/src/settings/security.jsx`, desktop log); `pm profile edit` asks "Encryption method" (`CLI/main.go:2718`) |
| concepts.mdx | original | "Every change to the vault is saved as a commit" | "Changes to the vault are saved as commits" | not every write records a commit: `CLI/desktop.go:465-471` (`saveQuiet`, no commit), `CLI/src/mcp.go:1279-1285` at HEAD (MCP `saveVault` writes the file directly; used by `manage_spaces`, `manage_profiles`, `cloud_config`, `cloud_sync`, still so in the working tree `src/mcp.go:799, 846, 865, 911, 1022`) |
| concepts.mdx | original | Sync "on Google Drive, GitHub or Dropbox. It uploads only the encrypted file, so the provider never sees your secrets." | Adds "in your own account or, for Drive and Dropbox, in APM's shared storage", and links the GitHub/.apmignore exception (`/docs/security/sync-security#what-gets-uploaded`) | `CLI/main.go:90-116, 5026-5045`; `CLI/main.go:202` + `CLI/src/cloud_ignore.go:11-26` (first `pm cloud init github` upload with `.apmignore` rules is encrypted with the GitHub token) |
| concepts.mdx | original | MCP tools "grouped in the app as Read, Secrets, Write and Admin"; "Adds, edits and deletes wait as requests" | "Read, Secrets, Write, Admin and Utility"; item adds/edits/deletes wait for approval in the app; tools that change spaces, profiles or cloud settings, or start a sync, act at once | `GUI/renderer/src/settings/ai.jsx:11-17` (5 groups); working tree `CLI/src/mcp.go:280-290` (`requestMCPApproval`), `:701, 721, 751` (only add/delete/edit), `:799, 846, 865, 911, 1022` (`manage_profiles`, `manage_spaces`, `cloud_config`, `cloud_sync` save directly) |

Concepts, verified as written:
- Vault path order (`CLI/main.go:51-73`). lgit and the audit log live in the config folder: `CLI/src/lgit.go:28-36`, `src/audit.go:27-29`, `src/log_signing.go:9-18`.
- Diagram and table: `pm desktop` over stdio (`GUI/electron/main.js:65-71`); native host `dev.apm.bridge` (`CLI/native_host.go`); `pm mcp serve` over stdio.
- **`pm extension serve`**: holds its own memory, stops on Ctrl+C with "Bridge stopped. The vault key was dropped from memory.", and locks on the vault's policy (working tree `CLI/extension_serve.go:207, 280-300`). Sleep detection by clock gap also works on Windows (working tree `CLI/autolock.go:24-27, 94-104`), while a `pm unlock` session can't detect sleep there (`CLI/src/session_sleep_other.go`).
- 25 types (`GUI/renderer/src/lib/types.js`). Login fields (`types.js:11-14`) plus `Passkeys` (`CLI/src/vault.go:105`).
- Three Argon2id-derived keys (`CLI/src/utils.go:136-152`). Profile parameters and legacy (`CLI/src/utils.go:41-80`; `pm cinfo` prints "Argon2id" for every profile, `CLI/main.go:1083`; the app's PBKDF2 label is `GUI/renderer/src/lib/profiles.js:12`).
- Session file names and `APM_SESSION_ID` (`CLI/src/session.go:54-70`). The app unlocks from an existing CLI session (`GUI/renderer/src/lib/store.js:173-174`, `CLI/desktop_handlers.go:333-362`).
- Every interactive unlock starts a session (`CLI/main.go:3855-3857`). Default policy 15 min / 1 h / sleep (`CLI/lock_policy.go:26-32`). The `pm autolock` output (`CLI/lock_policy.go:286-290`).
- Failed attempts: in the app and over the bridge, a pause every 3rd wrong password and a refusal after 6 (`CLI/desktop_handlers.go:236-268`). The bridge unlock goes through the same handler (working tree `CLI/desktop_bridge.go:830-842`), and `pm extension serve` and the native host run the same server (working tree `extension_serve.go:226`, `native_host.go:147`).
- `pm session issue` bindings (`SP/fc/help_tree.txt`). Spaces, history, recovery and pairing claims.

##### choose-your-surface.mdx

| File | Source | Original claim | Corrected claim | Evidence |
|---|---|---|---|---|
| choose-your-surface.mdx | original | The surfaces "never disagree" | Removed "and they never disagree" (they can disagree, e.g. `pm lock` does not lock the app, and the app and `pm` can open different vault paths) | `CLI/main.go:942-953` (`pm lock` only removes the session file), security log `sessions-and-locking` row |
| choose-your-surface.mdx | original | AI tools need "`pm` and an unlocked vault" | "`pm`, an unlocked vault, and the desktop app to approve changes" | working tree `CLI/src/mcp.go:280-290` (only the app's **Approve** commits), `CLI/desktop_handlers.go` `hMCPTxApprove`; `pm` has no approve command (`SP/fc/help_tree.txt`, working-tree `pm mcp --help`) |
| choose-your-surface.mdx | original | Extension fills "Logins, one-time codes and passwords" | "Logins, one-time codes and suggested new passwords" | `extension/src/content/autofill.js:20` (`suggestPasswords`), `extension/scripts/build.mjs:85` (Alt+Shift+G "Generate and fill a strong password") |
| choose-your-surface.mdx | original (Read clause already amended by another agent at 21:03) | MCP groups "Read …, Secrets …, Write (add, edit and delete) and Admin …"; "Every add, edit or delete waits until you approve it" | Write is "add, edit and delete items, manage spaces, sync"; adds **Utility** (password generation and pending requests); only item adds/edits/deletes wait for approval, the other Write and Admin tools act at once | `GUI/renderer/src/settings/ai.jsx:11-17`; working tree `CLI/src/mcp.go:701, 721, 751` vs `:799, 846, 865, 911, 1022` |

Choose-your-surface, verified as written:
- `pm add` covers all 25 types (`CLI/main.go:245-293`).
- The extension can't create a vault: "Create a vault in the APM app first" (`extension/src/ui/popup/gate.jsx:149`).
- **Move to trash** (`ui/popup/views.jsx:120`).
- Popup passkeys list, **Rename** and **Remove** (`ui/popup/views.jsx:294-345`, `background/index.js:234-235`).
- **Codes** tab (`ui/popup/main.jsx:84`).
- Weak and reused callouts (`ui/popup/tabs.jsx:16-53`).
- **Lock APM when Chrome closes** (`ui/options/main.jsx:310`).
- The app's Saved passkeys menu (`GUI/renderer/src/settings/passkeys.jsx:88-104`).
- `pm session issue` bindings (`help_tree.txt`).
- `pm extension serve` exists (working tree, `SP/fc/help_extension_wt.txt`).

##### getting-help.mdx (new page)

No corrections needed. Verified as written:
- **`pm --help` and `pm extension link --help`** outputs match the working-tree build `SP/pmbin4/pm` line for line. The vault path was replaced, and `pm bridge` is gone.
- **Unknown commands:** `pm help`, `pm completion` and `pm bogus` (with the "Did you mean this? logs" suggestion) all exit 0. Confirmed by running in a private sandbox.
- **Desktop Help menu:** labels and ⌘/ (`GUI/electron/menu.js:41-45, 110-116`).
- **Settings → About:** Version and Vault format (`GUI/renderer/src/settings/general.jsx:155-156`).
- **Extension:**
  - **More → Extension settings** (`extension/src/ui/popup/main.jsx:120-122`).
  - The About rows Extension, APM app and This browser (`ui/options/main.jsx:434-438`).
  - The Connection page shows "pm" or "APM app" (`ui/options/main.jsx:174-190`).
- **`pm cinfo`:** reads only the header, and the output block matches a `pm setup` paranoid vault. The value with the `KB` label is MiB (`CLI/main.go:1064-1090`, `src/utils.go:61-70`).
- **`pm autolock`:** prompts when there is no session (`CLI/lock_policy.go:224`).
- **`pm extension status`:** browsers, linked vault, "Right now", token match (working tree `CLI/extension_cmd.go:631-697`).
- **`pm extension token --show`** (working tree `CLI/extension_serve.go:310, 323`).
- **`pm info`:** prints the support address (`CLI/main.go:1527`).
- **Issue trackers:** all three URLs answer 200 (live). `apms-org/apm/issues` redirects to `apms-org/cli/issues`.

#### Depth-log citations that don't support their fact

| _depth.md line | Fact | Problem |
|---|---|---|
| 41 | "pm has no command that sets a login's website" | Out of date at `5c023b7`: the `pm get` editor edits every field of the type (`CLI/item_edit.go:115-137`). Only `pm add` lacks it. |
| 29 | `pm update` "Windows replaces exe" | The fact is fine, but it misses that the first `.exe` in the release is taken whatever the processor (`main.go:3237-3248`). The page is fixed. |
| 25 | Canary example `apm-can-12-…` | Real canary tags look like `can-v10.2.0`. The page is fixed. |
| 55, 59 | Cite `extension/src/background/bridge.js:106,107,180-200` and `background/state.js:131` | Not read (on the blocked list). The facts (5-second re-probe, port released about 30 s after the last request while locked) are confirmed independently by `extension/test/bridge.test.mjs:118-144`. |
| 76 | Cites `extension/src/shared/settings.js:16` | Not read (on the blocked list). The label "Lock APM when Chrome closes" is confirmed at `extension/src/ui/options/main.jsx:310`. |
| 48, 49, 50, 53 | Line numbers such as `main.go:1528` (support), `main.go:1057-1092` (cinfo), `general.jsx:154-156`, `options/main.jsx:435-440` | Off by one or two lines at `5c023b7` (`main.go:1527`, `1064-1090`, `general.jsx:155-156`, `options/main.jsx:434-438`). The facts are right. |
| 54, 58 | Cite `CLI/bridge_cmd.go:210-218, 302-311` | That file was renamed in the working tree; the code is now at working tree `CLI/extension_serve.go:207-300`. The facts are still right. |

#### Other findings for the owner (not on the pages)

1. **The CLI repository was renamed.** `github.com/apms-org/apm` and `github.com/aaravmaloo/apm` both answer `301` → `github.com/apms-org/cli` (live). The code still says `apms-org/apm`:
   - `CLI/main.go:1526` (`pm info` "Repo:")
   - `CLI/main.go:3187` (`pm update` API URL, which still works through the redirect)
   - the build scripts

   The docs keep `apms-org/apm`, which works through the redirect. The canonical name now looks like `apms-org/cli`. Other names in use:
   - `aaravmaloo/apm`: the Help menu, the Settings → About "Source" row, `install.sh`, the Homebrew formula
   - `github.com/aaravmaloo/apm`: the Go module path in `CLI/go.mod`
2. **Releases:**
   - The latest `pm` release is **v11.2.0** (2026-08-05, live), so the v12 file names on the pages describe a release that doesn't exist yet.
   - `apms-org/gui` has **no releases** (live), so the desktop download links lead to an empty releases page today.
   - `apms-org/extension` has no releases, which matches the build-from-source instructions.
3. **The documentation URL is a 404.** The app's Help → **APM Documentation**, the Welcome screen's **Documentation** link and Settings → About all open `https://aaravmaloo.github.io/apm` (`GUI/electron/menu.js:3`, `GUI/renderer/src/screens/auth.jsx:77`, `settings/general.jsx:159`), which returns **404** (live).
4. **License mismatch.** The app's About page says **License: MIT** (`GUI/renderer/src/settings/general.jsx:157`). The GUI and extension repositories have no license file, and `pm` is GPL-3.0.
5. **The extension's About hard-codes "Vault encryption: XChaCha20-Poly1305 · Argon2id"** (`extension/src/ui/options/main.jsx:439`). A vault made by `pm setup` uses AES-256-GCM by default (`CLI/main.go:2315`, `src/utils.go:41-70`).
6. **Recovery and alert email go out through an SMTP account whose obfuscated credentials ship inside every `pm`** (`CLI/main.go:3521-3527`, used by `desktop_cloud.go:20-28`). Anyone with the binary can recover them. I didn't decode them.
7. **The Homebrew mismatch.** The app's **pm command** row treats a Homebrew `pm` as its own state and tells you to run `brew upgrade pm` (`GUI/renderer/src/settings/data.jsx:175-177`, `GUI/electron/cli-install.js:201, 263`). The tap's formula is named `apm` and installs `apm` (live `Formula/apm.rb`), so that command would fail.
8. **`pm update` on a canary-tagged latest release.** Bare canary asset names such as `apm-can-v10.2.0-darwin_arm64` contain a dot, so they're skipped too. A canary is published as a full release unless it's marked prerelease by hand (the workflow doesn't).

#### Unresolved

- I didn't check that the example client name "Chrome 129 on macOS" is exact; it is built in `extension/src/background/bridge.js` (blocked list). The pages say "such as" or "for example".
- "Help → APM Documentation opens the documentation in your browser" (getting-help.mdx) is true of the code, but the URL 404s today (finding 3). I left the page as is.
- "pm 11 and older … would drop it when saving" (installation.mdx callout): `pm` 11 source isn't available locally (no `v11.*` tags in the checkout). This rests on `VaultFormatRevision`'s own comment (`CLI/src/vault.go:27-31`) and the login migration (`src/vault.go:603-604`, `src/login_totp.go:53-57`).



---

## extension: second pass

All 10 pages and every `_depth.md` row under "## extension" (93 rows), about 835 claims. The extension repo is at `b092cd0`.

The permission classifier no longer blocked any extension source this time. Every claim the preliminary pass had listed as unverified is now verified: option defaults, the 10-minute re-pair delay, the port range, the client name, the rule labels, the generator defaults, the time groups and the storage keys. Validation: 0 issues.

### extension, part A (index, install, pairing, popup, options)

Task: fact-check extension/index, install, pairing, popup and options (original text, earlier fixes, depth additions) and every `_depth.md` row for them.

Commits verified:
- CLI `aef9bbf` (21:02:45). It includes `4ecbf31` (21:02:43), the `pm bridge` to `pm extension` merge (`bridge_cmd.go` renamed to `extension_serve.go`). The working tree differs from it only in README.md, so the Go code I read in the working tree is this commit.
  - `desktop_bridge.go` and `autolock.go` changed from `5c023b7` only in one-line comments, so line numbers are the same at both commits.
- Extension `b092cd0` (21:02:44). Since `35701b2` it changed one line each in `src/ui/popup/gate.jsx:68` and `src/ui/options/main.jsx:245` (the token hint now says `pm extension token --show`), plus README.md. Every other extension line number is the same at both commits.
- GUI `f77cd64` (21:02:46) for `renderer/src/screens/pair.jsx` and `renderer/src/settings/passkeys.jsx`.

The previously blocked extension files (`bridge.js`, `pairing.js`, `state.js`, `frames.js`, `settings.js`, `types.js`, `time.js`, `gen.js`, `iconkey.js`) were readable this time. Nothing was blocked, so no claim is left unverified for that reason.

Pages: extension/index.mdx, install.mdx, pairing.mdx, popup.mdx, options.mdx. About 435 claims, plus the 31 `_depth.md` rows for these pages (80-110, 142-155 and 191). Validation: see the end of this log.

#### Corrections
| File | Original claim | Corrected claim | Evidence | Source |
|---|---|---|---|---|
| extension/index.mdx:10 | "It never holds your master password or a passkey's private key." | It never keeps your master password: unlocking from the popup passes the password straight to APM. A passkey's private key never leaves APM. | extension src/background/index.js:122-123 (POST /api/unlock with the password); src/ui/popup/gate.jsx:173, 201 ("The extension never keeps it."); CLI desktop_bridge_passkeys.go:414-461 (APM generates and stores the key), 530-553 (APM signs) | original |
| extension/index.mdx:33 | "Node.js 20.19 or newer (or 22.12 or newer)" | Node.js 20.19 or a later 20.x release, or 22.12 or newer. 21.x and 22.0-22.11 are outside the range. | extension/package.json:20-21 (engines `^20.19.0 \|\| >=22.12.0`) | depth (_depth.md:80) |
| extension/index.mdx:81 | "APM copies it to the clipboard ... for the next 3 minutes, offers it" (in a walkthrough where "APM" means the app or pm) | The background copies the code and offers it for 3 minutes. The app does not touch the clipboard in this step. | extension src/background/autofill.js:88-95 (pendingOtp 180000 ms; copy() only if fillTotpAfterLogin); src/background/clipboard.js:1-48 | depth (_depth.md:83) |
| extension/install.mdx:16 | "Node.js 20.19 or newer, or 22.12 or newer" | Node.js 20.19 or a later 20.x release, or 22.12 or newer | extension/package.json:20-21 | original |
| extension/install.mdx:123 | "The build needs Node.js 20.19 or newer, or 22.12 or newer" | Same range fix as line 16 | extension/package.json:20-21 | depth (_depth.md:93 added this table; the Node row itself is not logged) |
| extension/install.mdx:105 | `npm test` runs "the unit tests for site matching, the generator, settings and encoding" | Also covers the strength meter, other shared helpers (passkey site check, page gates, time, item types, icon keys) and how the extension reaches the app or `pm` | extension/package.json:15 (`node --test "test/*.test.mjs"`); test/shared.test.mjs:10-121; test/bridge.test.mjs:41-132 | original |
| extension/pairing.mdx:56 | "a new request cancels the one still waiting" (said of every route) | True for the app and `pm extension serve`. With `pm extension link`, a new request from the same browser gets back the code already waiting (a request from another origin overwrites it). | CLI desktop_bridge.go:634 (5 a minute), 643-647 (startPair cancels the pending pair); native_host.go:453-455 (startLinkPair returns the pending same-origin request), 464-465 (writeLinkRequest replaces the file) | depth (_depth.md:98) |
| extension/popup.mdx:30 | "Otherwise it lists the steps to connect and the `pm extension link` command" (as if the steps show only when APM is not running) | If APM is not running, the popup says "APM isn't connected. Open the app, or link this browser once." Until a code is on screen, the steps and the `pm extension link` command show either way. | extension src/ui/popup/gate.jsx:96-108 (steps under `!compact`, not tied to `reachable`), 99; src/background/index.js:86-90 (popup open starts pairing and waits up to 2.5 s) | original |
| extension/options.mdx:105 | "The description shows how many you have" | Only while the vault is unlocked. While locked, the count is left out. | extension src/ui/options/main.jsx:284-287 (count fetched only when `st.unlocked`), 292 | original |

Bridge claims rewritten by the earlier sed (`pm bridge X` to `pm extension X`). I re-read each one and checked it against the code above. All are correct, so I made no edits:
- index.mdx:18
- install.mdx:133
- popup.mdx:36
- pairing.mdx: 3, 15, 60, 70-122 (serve), 165, 173, 278-324 (merged status), 329-358 (token, rotate), 371, 376-377

Evidence: CLI extension_serve.go:22-34, 76-111, 139-144, 175-191, 217-221, 228-246, 283-300, 304-345; extension_cmd.go:241-258, 345-358, 574-716. None of my pages had a `<Command>` anchor renamed or removed.

#### Previously unverified claims, now verified
- **Option defaults:** extension src/shared/settings.js:3-17.
  - On: inlineMenu, fieldIcon, suggestPasswords, fillTotpAfterLogin, offerSave, offerUpdate, passkeys, passkeysInMenu, neverHttp.
  - saveSpace is "" and matchMode is "domain".
  - Off: crossFrames, lockOnClose.
  - Also tested in test/shared.test.mjs:86.
- **Re-pair delay:** 10 minutes after a denial, and 45 s between automatic asks. A forced Connect skips both.
  - src/background/pairing.js:79; the denial is recorded at 54; index.js:212 sends `pair:start` with force.
- **Port range and fallback:** 1024-65535 is accepted. Anything else falls back to 41417, and the stored key is removed.
  - src/background/bridge.js:24, 31-38; settings.js:21; options main.jsx:166-170, 209.
- **Client name:** "<Browser> <version> on <platform>", cut to 80 characters.
  - src/background/bridge.js:45-61.
  - CLI desktop_bridge.go:376-388 strips control characters and caps the name at 80 runes.
- **Excluded-site rule labels:** "Never fill", "Never save", "Never fill or save".
  - src/shared/settings.js:19.
- **Generator defaults:** Random, length 20, all four sets, look-alikes off; passphrase of 5 words, capitalized, with a number; PIN of 6 digits.
  - src/shared/gen.js:60. Ranges are in src/ui/common/kit.jsx:148, 158, 164 (8-64, 3-10, 4-12). There are 355 words.
- **Vault tab time groups:** Today; This week (6 days before today); This month (30 days); Earlier.
  - src/shared/time.js:28-38.
- **Storage:**
  - Keys: src/shared/settings.js:1.
  - Token, paired time and port in `chrome.storage.local`: src/background/bridge.js:7-22, 31-38.
  - Settings, excluded sites, generator and space in `chrome.storage.local`: src/background/state.js:17-36, 68-86.
  - Up to 500 rp hints: state.js:89-97.
  - Pending pairing in `chrome.storage.session` "apm.pairing": pairing.js:3, 12-17.
  - Clipboard clear record in `chrome.storage.session` "apm.clip": clipboard.js:2, 33-45.
  - Removing the extension deletes this storage. That is browser behaviour and can't be checked in the code.

#### Documented code issues: verdicts
| Claim (page) | Verdict | Evidence |
|---|---|---|
| The **Avoid look-alikes** description mentions quote marks, but no character set contains any (popup.mdx:133) | Confirmed | extension src/ui/common/kit.jsx:155; src/shared/gen.js:3-4 (AMBIG also lists `\|`, backtick, `'` and `"`, none of which are in SETS) |
| **Vault encryption** in Settings, About is a fixed "XChaCha20-Poly1305 · Argon2id" label, though a vault can use AES-256-GCM. `pm cinfo` shows the real cipher (options.mdx:165) | Confirmed | extension src/ui/options/main.jsx:439 (also the popup lock screen, gate.jsx:202); CLI src/utils.go:36, 103; main.go:1058 (`cinfo`) |

#### Depth-log rows for these pages
Rows 80-110, 142-155 and 191 (31 rows). All 31 facts are true. Every citation supports its fact except those listed below.

The rows that cited the removed `bridge_cmd.go` (101-103, 107, 109) and the old status format (105) have been repointed to `extension_serve.go` and the merged `runExtensionStatus`. The new citations support their facts at aef9bbf.

#### Depth-log citations that don't support their fact
| Row | Problem | Correct evidence |
|---|---|---|
| _depth.md:96 (client name format) | Cites CLI/desktop_bridge.go:328-339. Those lines are the end of `rotate`, `currentToken` and `bridgeJSON`, not the client name. | extension src/background/bridge.js:45-61; CLI desktop_bridge.go:376-388 (`bridgeClientName`) |
| _depth.md:100 (audit events) | Cites CLI/desktop_bridge.go:707-722 for BRIDGE_PAIRED / BRIDGE_PAIR_DENIED. Those lines are the end of `respondPair`. The log calls are later. | desktop_bridge.go:736, 738 (in `hBridgePairRespond`, 719-742). The other cited lines (extension_cmd.go:347, 476, 490, 567; extension_serve.go:340; desktop_handlers.go:3000-3008) are correct. |
| _depth.md:98 (code alphabet) | Minor. Cites desktop_bridge.go:30-36, but the alphabet is on line 38. | desktop_bridge.go:38; 594-605 (6 characters); 615-656 |
| _depth.md:99 (2 min grace) | Minor. Cites desktop_bridge.go:32, which is the 2-minute TTL. The grace constant is on line 34. | desktop_bridge.go:34, 679; native_host.go:486 (same grace for link pairing) |
| _depth.md:80 (What you need) | Weak. native_host.go:111-119 only shows that native messaging accepts `chrome-extension://`. The loopback bridge also accepts `moz-extension://` and `safari-web-extension://` (desktop_bridge.go:362-369). "APM 12" has no citation. | Chromium-only comes from the extension itself: scripts/build.mjs:69 (minimum_chrome_version 116) and the `chrome.*` APIs. APM 12: CLI main.go:3184 (`Version = "12.0.0"`). |

Small notes on supported rows:
- _depth.md:99: while the popup shows a code, it also polls every second (src/ui/popup/gate.jsx:29-37, through `pair:poll` at index.js:213). So "every second and a half" describes the background loop only. I left the page as is.

#### Other findings for the owner (not on the pages)
1. `pm extension link` prints "If the extension is not paired yet, approve it in the app." even when `pm extension serve` is the one answering. In that case the approval happens at the serve prompt (CLI extension_cmd.go:351-357).
2. Any excluded-site rule makes the popup act paused. Even "Never save" alone shows "APM is paused on this site" and the "Paused on this site" callout ("APM won't fill or offer to save here"), and the More menu offers **Resume APM on**. The rule check is `paused = !!init.rule` (src/ui/popup/main.jsx:105-108; tabs.jsx:33, 39-40).
3. `pm extension serve` has a hidden `--prompt-stdin` flag (CLI extension_serve.go:220-221). It is not documented, which is fine if it is meant to stay internal.
4. The loopback bridge accepts `moz-extension://` and `safari-web-extension://` origins (CLI desktop_bridge.go:362-369), though only a Chromium extension exists. Native messaging accepts only `chrome-extension://` (native_host.go:111-119).
5. The **Avoid look-alikes** description says it leaves out quote marks, but the sets have none (kit.jsx:155). The docs already say so.
6. With every set unticked, the lowercase fallback is not filtered for look-alikes, so `l` and `o` can still appear when **Avoid look-alikes** is on (src/shared/gen.js:18).
7. The app's install card says "Chrome, Edge, Arc and Brave" (GUI renderer/src/settings/passkeys.jsx:80). The docs and `pm extension link` also cover Vivaldi and Chromium.
8. Resolved since the last pass: the token hints in the popup and settings page now say `pm extension token --show` (extension b092cd0: gate.jsx:68, options main.jsx:245).

#### Unresolved
- Chrome's own UI is outside the code. These can't be checked here:
  - extension-page addresses such as `edge://extensions`
  - "Developer mode" and "Load unpacked"
  - the puzzle-icon menu
  - that removing an extension deletes its storage
- Build output sizes ("54ms, 553 KB", "301 KB") come from the depth agent's scratch build. The format matches scripts/build.mjs:162 and 165-170. I did not rebuild to recheck the numbers.

#### Validation
- `node SP/validate.mjs getting-started extension`: issues 0.
- `node SP/validate.mjs desktop security agents cli reference getting-started extension`: issues 0.
- The anchors `/docs/cli/commands-sync#pm-extension-serve` and `/docs/extension/privacy-and-permissions#permissions` resolve.


### extension, part B (autofill, passkeys, saving-and-updating, privacy-and-permissions, troubleshooting)

Commits verified:
- CLI: HEAD `aef9bbf` (2026-10-05 21:02). It includes the bridge-to-extension merge `4ecbf31` (21:02). The working tree differs from HEAD only in `README.md`, so every CLI line cited here is the same in the working tree and at HEAD. The bridge-command claims were checked against the working tree before `4ecbf31` was committed; the lines did not move.
- Files cited from the `SP/clihead/` export (`5c023b7`) are unchanged at HEAD: `desktop_bridge_items.go`, `desktop_bridge_passkeys.go`, `item_edit.go`, `item_view.go`, `desktop_handlers.go`, `desktop.go`, `icons.go`, `native_host.go`, `src/*`. `main.go:4043` and `main.go:4931-4937` are the same at both.
- Extension: HEAD `b092cd0` (2026-10-05 21:02), clean working tree. Paths below are relative to `extension/src/` unless they start with `CLI/`.
- Formerly blocked files (`background/bridge.js`, `pairing.js`, `state.js`, `frames.js`, `shared/settings.js`, `time.js`, `gen.js`) opened normally this pass and were read directly. No bundles, history or copies were used.

Pages: extension/autofill.mdx, passkeys.mdx, saving-and-updating.mdx, privacy-and-permissions.mdx, troubleshooting.mdx. About 400 claims checked, plus 62 `_depth.md` rows (111-141, 156-180, 186-190, 198). 12 corrections on 4 pages (passkeys.mdx untouched). No `<Command>` anchors or headings renamed or removed. Validation: `node SP/validate.mjs getting-started extension` and `node SP/validate.mjs desktop security agents cli reference getting-started extension` both report `issues 0`.

#### Corrections: autofill.mdx

| File | Original claim | Corrected claim | Evidence | Source |
|---|---|---|---|---|
| extension/autofill.mdx | Username fields include a field marked `autocomplete="username"`, `email` or `webauthn` | `username` or `webauthn` always count; `autocomplete="email"` counts only when the form also has a password field | `content/autofill.js:97-100` (`ac.includes("email") && hasPw`) | original |
| extension/autofill.mdx | "APM looks at the page again about a third of a second after its fields change, and once more about a second after it first looks." | "…about a third of a second after anything on the page changes, and once more about a second and a half after it first looks." The observer watches the whole document (child lists and `type`/`style`/`class`/`hidden`/`autocomplete` attributes), not only fields. The second look is `setTimeout(rescan(false), 1200)` plus the 350 ms debounce, so about 1.55 s after the first scan | `content/autofill.js:139-154` (350 ms debounce, 0 ms when forced), `:614-618` (observer, `rescan(true)`, 1200 ms) | depth (_depth.md:114) |
| extension/autofill.mdx | Menu **Options** opens the generator "with the same settings as the popup's **Generator** tab" | Same saved settings, but the menu's compact panel hides **Avoid look-alikes**; change it in the popup. The saved value still applies | `ui/common/kit.jsx:155` (`!compact &&`), `ui/inline/main.jsx:181` (`GenPanel compact`), `ui/popup/tabs.jsx:222` (full panel) | original |

Checked and true (autofill.mdx): menu rows and limits, field-type rules other than the one above, word lists, fill events, target-frame order, matching examples, base-domain list, port rule, prefix mode, code timing, shortcut notices, "Not filling here" reasons, the `crypto.getRandomValues` generator and Alt+Shift+G text. Depth rows 111-113, 115-121 support their facts.

#### Corrections: saving-and-updating.mdx

| File | Original claim | Corrected claim | Evidence | Source |
|---|---|---|---|---|
| extension/saving-and-updating.mdx | "About a second later it decides what to offer." | It decides right away and shows the prompt just under a second later (900 ms). The 2.5 s branch for `msg.navigating` is dead: nothing sends that flag | `background/save.js:42-79` (decision in `onSubmitted`, `setTimeout(show, msg.navigating ? 2500 : 900)` at :78); no `navigating` in `content/*.js` | original |
| extension/saving-and-updating.mdx | "APM says when the saved password was set" | It shows how long ago the login last changed; any edit to the login resets it. The UI wording ("The saved password was set 3 days ago.") is kept as a quote | `background/save.js:107` (`modified: it.modified`); `ui/prompt/main.jsx:162`; `CLI/desktop_bridge_items.go:565` (`modified` = `tel.UpdatedAt`); `CLI/src/vault.go:1414-1418` and `CLI/src/trust.go:52-73` (only ADD/EDIT set `UpdatedAt`) | original (depth row _depth.md:130 quotes the string correctly) |

Checked and true (saving-and-updating.mdx): triggers, the no-offer list, which password is captured, username capture, 1.5 s repeat guard, two-page sign-ins, Save/Update/Not now, name-taken and error texts, saved website and name rules, Reused on / Weak badges, strength labels, history note, read-only and newer-vault refusals, offer dropped on tab close. Depth rows 122-132 support their facts.

#### Corrections: privacy-and-permissions.mdx

| File | Original claim | Corrected claim | Evidence | Source |
|---|---|---|---|---|
| extension/privacy-and-permissions.mdx | `clipboardRead`: checks the clipboard still holds what APM copied, "so it never wipes something you copied since" | It leaves alone something you copied since, but if the check can't read the clipboard, APM clears it anyway | `offscreen/offscreen.js` `clear` handler: `if (cur === null \|\| cur === msg.expect) write("")` | original |
| extension/privacy-and-permissions.mdx | The item list is dropped "the moment the vault locks" | Dropped as soon as the extension sees the lock: at once over native messaging (the host pushes `vault.locked`), otherwise at the next status check, within a minute (status cached 2.5 s, alarm every minute) | `background/state.js:133-136` (host events), `:138-151` (2.5 s cache, `items = null` when locked); `background/bridge.js:130` (events only on the native port); `background/index.js:599` (1-minute alarm); `CLI/native_host.go:329-330` | original |
| extension/privacy-and-permissions.mdx | The save/update check "asks APM for the saved password … and compares the two" (silent on recording) | Added: that check counts as a use of the login, like a reveal | `background/save.js:37-40,66-68` (`/reveal`, key `password`); `CLI/desktop_bridge_items.go:652-674` (`bridgeRecordAccess`), `:612-622` | original |
| extension/privacy-and-permissions.mdx | Endpoint table: `GET /api/items/:id` returns "one item with its secrets blanked" | Added: a login's two-factor key, notes and custom fields are not blanked (matches the exchange table) | `CLI/desktop_bridge_items.go:49-50` (`"password": {"password"}` only), `:571-586`, `:642-650` | depth (_depth.md:162) |
| extension/privacy-and-permissions.mdx | "when APM locks, from any surface, … the extension is locked" | From the app or the browser, on auto-lock, or on sleep. `pm lock` in a terminal ends only the terminal session; it doesn't lock the app or a running bridge | `CLI/main.go:943-954` (`pm lock` = `KillSession` only); no engine locks when the session file goes: `PeekSession` is read only to adopt or display a session (`CLI/native_host.go:300-320`, `extension_serve.go:53`, `desktop.go:1408`, `desktop_handlers.go:182`, `lock_policy.go:274`); app/browser lock: `CLI/desktop_handlers.go:364-381`, `desktop_bridge.go:862-871` | original |

Checked and true (privacy-and-permissions.mdx): the two destinations (`pm extension serve` and `pm extension link` exist at HEAD), no analytics, logo fetching rules (`CLI/icons.go:29,86-89,322-354,610-623`), the exchange table including the preliminary-pass caveat that a login's TOTP key, notes and hidden custom fields come back unmasked, the "not recorded" sentence, the audit table, the session-on-unlock sentence, the page-reading list, closed shadow roots (`content/autofill.js:179,237`), storage lists and the key table, the 15 s item cache (`background/state.js:170`), bridge defenses, `/api/info` output and modes, refusal JSON, headers, 1 MiB limit, native framing, endpoint table, error status table, the permissions table (`scripts/build.mjs:60-91`), Chrome 116, the web-accessible callout, passive routes.

#### Corrections: troubleshooting.mdx

The page had already been rewritten for the merged `pm extension status` by the cli-change sync (depth rows 186-190). I re-read it and checked every line of the sample and both tables against `CLI/extension_cmd.go:574-716` at HEAD `aef9bbf` (the merge is commit `4ecbf31`; same lines as the working tree). The 16-column padding of all 14 sample and table lines was checked with `%-16s`.

| File | Original claim | Corrected claim | Evidence | Source |
|---|---|---|---|---|
| extension/troubleshooting.mdx | `Token: none yet …` means "No browser has paired on this computer yet" | Your APM config folder has no `bridge_token`. Every bridge creates one when it starts, so the bridge that answered keeps its token elsewhere (another user), or the file was deleted after it started. The line only appears when a bridge answers | `CLI/extension_cmd.go:654,680-683` (`readBridgeToken(bridgeTokenFile())`, printed only when listening); `CLI/desktop_bridge.go:250-253` (`start()` calls `loadToken()` before listening), `:217-233` (creates the file when missing), `:165-173` (`os.UserConfigDir()/apm/bridge_token`); `CLI/native_host.go:150` | depth (_depth.md:188; first added at _depth.md:166) |
| extension/troubleshooting.mdx | "Locking from any surface locks them all, including **Lock APM when Chrome closes**." | Locking in the app or from the browser (including Lock APM when Chrome closes) locks the vault everywhere and ends the terminal `pm` session. `pm lock` only ends the terminal session; the app and the browser stay unlocked | `CLI/desktop_handlers.go:364-381` (`hVaultLock`: drop key, `KillSession`); `CLI/desktop_bridge.go:862-871` (browser lock); `CLI/main.go:943-954,3157` (`pm lock` = `KillSession`); engines never lock on a missing session: `CLI/native_host.go:300-320` (adopts only) | original |

Checked and true (troubleshooting.mdx):
- The sample output, the row rules, Linked vault/on, `--port` and `APM_BRIDGE_PORT`, the Right now table, the other Vault/Token lines and the exit codes: `CLI/extension_cmd.go:574-716`. Fingerprint = first 6 characters: `CLI/extension_serve.go:29-34`. The sample's `/Users/you/.apm/vault.dat` matches the fallback at `CLI/main.go:59-65`.
- Popup offline texts: `ui/popup/gate.jsx:128-142`. "Not running. Another app may be using port …": `GUI/renderer/src/settings/passkeys.jsx:51`.
- Native host error table (Chrome's own strings), `--id`, `--browser brave` (`CLI/extension_cmd.go:44`), the temp-build warning, and the linked vault path (`CLI/native_host.go:135-136`).
- Pairing: 2-minute requests, serve without a TTY denies, native pairing through a running `pm extension link` (`CLI/native_host.go:431-470`), 10-minute and 5-per-minute limits.
- Field-menu list: labels in `ui/options/main.jsx:260-312,355`, `ui/popup/tabs.jsx:39,66`, Esc (`content/autofill.js:581-584`), no `scripting` permission.
- Matching labels (`ui/options/main.jsx:272-274`). The fill messages. `pm totp link <entry> <domain>` (`CLI/cli_helpers.go:72-76`, `main.go:3176`). The 3-minute code window (`background/autofill.js:90`).
- Save prompt timing, passkey fallbacks, the unlock and Touch ID messages, `pm mode readonly` (`CLI/main.go:914-916,2229`). One failed-attempt counter for the app and the browser engines (`CLI/desktop.go:183-186`).
- The copy error. The restart table: `ui/common/rpc.js:1-12` (`send`, used by popup and options), `:30-36` (`framePort`, used by the inline menu and prompts), `ui/popup/main.jsx:14,29`.
- Logos. Shortcuts (`copy-code` has no `suggested_key`, `scripts/build.mjs:82-87`). Auto-lock defaults of 15 min, 60 min and sleep (`CLI/lock_policy.go:26-32`, `desktop.go:712-714`), `pm autolock`, Settings → Sessions.
- Platform tabs: `CLI/extension_cmd.go:37-47` browser table; the Windows `reg` path; `src/session_sleep_other.go` is `!darwin && !linux`, so only Windows terminal sessions ignore sleep; Linux uses `os.UserConfigDir`.
- Extension issue link: the `extension` remote is `github.com/apms-org/extension`.

#### Corrections: passkeys.mdx

No edits. Everything outside the Terminal bullet checks out against `content/main-world.js`, `content/relay.js`, `background/passkeys.js`, `background/state.js`, `ui/prompt/main.jsx`, `ui/popup/views.jsx` and `CLI/desktop_bridge_passkeys.go`. That covers:
- ES256 only and "none" attestation. Flags 0x41 on create and 0x01 on assert, plus UV unless "discouraged".
- The 32-byte credential ID, with `platform` attachment and `internal`/`hybrid` transports.
- The counter is created at 0 and kept there (`desktop_bridge_passkeys.go:462,537-546`). LastUsedAt is not saved when read-only (`:553-561`).
- RP and origin checks on both sides (`:180-224`, publicsuffix). The 1.5 s handshake fallback.
- Up to 500 hints in `apm.rpHints` (`background/state.js:88-98`). Labels are capped at 120 characters (`ui/popup/views.jsx:319`).
- Audit events. The sheet messages. "Saved passkeys" in the app (`GUI/renderer/src/settings/passkeys.jsx:88`, under "Browser extension", `settings.jsx:31`).

Depth rows 133-141 support their facts.

#### Documented code issues: verdicts

| Claim (page) | Verdict | Evidence |
|---|---|---|
| `GET /api/items/:id` returns a login's TOTP key, notes and custom fields (hidden ones too) unmasked; only `password` is blanked for logins; the call is not recorded (privacy-and-permissions, exchange table and endpoint table) | VERIFIED | `CLI/desktop_bridge_items.go:49-50` (`"password": {"password"}`), `:571-586` (`bridgeDetail` blanks only the listed keys), `:642-650` (`bridgeItemGet`, no `bridgeRecordAccess`) |
| `GET /api/totp` and `/api/totp/:id` are not recorded as a use (privacy-and-permissions) | VERIFIED | `CLI/desktop_bridge_items.go:743-774` (no `bridgeRecordAccess`); contrast `/reveal` `:652-674` and fill |
| Origin check gaps: any `chrome-extension://`, `moz-extension://` or `safari-web-extension://` origin, or no `Origin` at all, passes on to the token check (privacy-and-permissions) | VERIFIED | `CLI/desktop_bridge.go:362-369` (`bridgeOriginAllowed`, prefix only), `:465-475` (empty origin skips the check), `:482` (token) |
| `/api/info` needs no token (privacy-and-permissions) | VERIFIED: it returns name, version, API version, unlocked and mode to any local caller that passes the host/origin checks | `CLI/desktop_bridge.go:126` (`public: true`), `:744-746` |

#### Depth-log citations that don't support their fact

| _depth.md line | Fact | Problem | Correct evidence (HEAD `aef9bbf`) |
|---|---|---|---|
| 114 | "Rescan 350 ms after DOM changes and 1.2 s after first scan" | The citation is right, but the fact misreads it. The 1.2 s timer calls `rescan(false)`, which waits another 350 ms, so the second scan runs about 1.55 s after the first. The observer also fires on any DOM change, not only fields | `content/autofill.js:139-154,614-618` |
| 156 | Audit events from the browser | `CLI/desktop_bridge.go:707-722,846-855` don't hold these events. `UNLOCK_FAILED` is at `desktop_handlers.go:253` (cited 249-252) | `BRIDGE_PAIRED`/`BRIDGE_PAIR_DENIED` `desktop_bridge.go:736-738`; "Locked from the browser" `:862-871` (`:864`) |
| 159 | `/api/info` output and modes | `desktop_bridge.go:725-727` is the pair-respond handler, and `:485-500` is request dispatch | Info route `desktop_bridge.go:744-746`; `ok: true` is added at `:509` |
| 161 | Headers `x-apm-token`/`x-apm-client`, 1 MiB body | `desktop_bridge.go:397-418` is route pattern matching | Headers `:473,482,486,492`; body reader `:425`; limit `:30` |
| 163 | Error JSON shape and HTTP status mapping | `desktop_bridge.go:282-299` is `info()` for the app's settings screen | Shape: `bridgeFail` `:344-357`; status map `:40-59` |
| 100 (pairing page, ext-a's) | Audit `BRIDGE_PAIRED`/`DENIED` | Same stale `desktop_bridge.go:707-722` as row 156 | `:736-738` |

Rows 166-168 and 186-190 now cite `CLI/extension_cmd.go` and `extension_serve.go`, and those lines match HEAD.

#### Other findings for the owner (not on the pages)

1. **The app and browser engines set `APM_STATE_DIR` and change directory to the vault folder** (`CLI/desktop.go:184-188`, since `d306752`, 2026-09-29).
   - The failed-attempt counter `.apm_lock` is therefore shared by the app and the browser engines in the vault folder. Terminal `pm` keeps its own next to the binary unless `APM_STATE_DIR` is set (`CLI/src/utils.go:245-275`).
   - App alerts written to the relative `email.log` also land in the vault folder.
   - Any page saying the app writes `email.log` "in the folder pm was started from", or that the app doesn't set `APM_STATE_DIR`, is wrong for the app. This was raised for desktop/settings and the security log in the earlier pass.
   - `security/sessions-and-locking.mdx:20` already says `pm lock` only ends the terminal session, which matches the code.
2. **Extension About label: "Vault encryption: XChaCha20-Poly1305 · Argon2id"** (`ui/options/main.jsx:439`). This is wrong for every built-in profile.
   - standard, hardened, paranoid and legacy all use AES-GCM, and legacy uses PBKDF2 (`CLI/src/utils.go:38-80`).
   - XChaCha20 is used only when a custom profile names it (`src/utils.go:102-109`, `src/vault.go:78-95`).
   - `extension/options.mdx:165` (ext-a) says "a vault can also use AES-256-GCM", which understates it: built-in profiles always use AES-256-GCM.
3. **Clipboard clear wipes on a failed read** (`offscreen/offscreen.js`, `clear` handler). If the paste-read fails, APM clears the clipboard even if you copied something else since. The page now says so; the code may want `cur !== null && cur === msg.expect`.
4. **Dead branch** in `background/save.js:78`: nothing sends `msg.navigating`, so the 2.5 s delay never applies.
5. **Lock scope.** `pm lock` (`CLI/main.go:943-954`) only deletes the session file. A running app, `pm extension serve` or browser-started `pm` stays unlocked: no engine watches the session file.
   - `agents/setup.mdx:308` and `agents/index.mdx:69` tell readers to run `pm lock` "to cut off vault access at once" for a running MCP client.
   - I did not check whether `pm mcp serve` holds its own key. It's off-limits for me, so it's worth a look by whoever owns agents.
6. The extension's old `pm bridge token --show` hint is gone at extension `b092cd0`. There are no `pm bridge` strings left in `extension/src`.

#### Unresolved

- **Issue tracker for `pm` and the app.** `troubleshooting.mdx` links `github.com/apms-org/apm/issues`. That matches `pm info` ("Repo: github.com/apms-org/apm", `CLI/main.go:1526`) and the updater (`CLI/main.go:3187`). But the CLI git remote, `go.mod`, `README.md` and the app's Help menu (`GUI/electron/menu.js:4`) use `github.com/aaravmaloo/apm`. I did not check over the network which one is canonical, and left the link as is. The extension link matches its git remote.
- **The three native-messaging errors** in troubleshooting ("Specified native messaging host not found." and so on) are Chrome's own strings, not in this repo. They match Chromium's wording as I know it; not checked against Chromium source.
- **Blocked files: none.** Every formerly blocked file opened normally, so no claim is left unverified for that reason.



---

## Pending CLI change

These claims are logged, not edited, as the coordinator asked. They concern `pm passkeys`, removed in `013843f`, and the `pm get` list, view and edit screens, rewritten in `5c023b7`. The depth agent syncs these pages. Edits made before the rule arrived are listed, not reverted. The bridge and MCP items that were pending earlier have landed and were fixed (see the cli and reference sections).

**Also needed in sections that are off-limits right now** (desktop, security, agents):
- `desktop/passkeys.mdx`, "In the terminal": my earlier text says `pm get` only shows a passkey count, and to rename or remove passkeys in the app. At `5c023b7` `pm get` lists each passkey (`CLI/item_view.go:218-235, 371-391`), and its edit screen renames (`CLI/item_edit.go:758-782`) and removes them (`:784-800`).
- `desktop/settings.mdx`, Alerts: the app writes `email.log` next to the vault, not in "the folder `pm` was started from" (`CLI/desktop.go:184-188`).
- `desktop/troubleshooting.mdx`, pm install table: "Run `brew upgrade pm`". The gs2 pass reports the live Homebrew formula is named `apm`, and the app's own message has the same text (`GUI/renderer/src/settings/data.jsx:175-177`).
- `agents/setup.mdx` and `agents/index.mdx` say `pm lock` cuts off a running MCP client at once. This is unverified; the ext-b pass flagged it.

### From cli: guides A

| Page | Claim on the page | What HEAD (5c023b7 = aef9bbf for these files) does |
|---|---|---|
| passkeys.mdx (whole page except the recovery callout and export table) | `pm passkeys list/rename/rm/remove`, its columns, sample output, `--yes`, exit status 1 | The command was removed in 013843f, and unknown commands exit 0. `pm get`'s item card lists a login's passkeys (item_view.go:265-283, 301-391). In the edit screen you rename one (item_edit.go:758-782) and remove one (784-800); `s` saves (commit 488-520, logs PASSKEY_DELETED). The export table and the recovery callout are accurate (transfer_cxf.go:39-49) |
| spaces.mdx:40 | `pm passkeys list` shows passkeys from every space | The command is gone, so the row should be removed |
| spaces.mdx:67 | `pm` can't move an item between spaces | The `pm get` edit screen can (item_edit.go:118-137 rows, 522-549 editRow) |
| items.mdx:104 | Search matches item names only | Interactive search also matches usernames and sites (item_view.go:163-182; ranking main.go:3885-3934) |
| items.mdx:108-134 | Search and list keys | Re-check against handleInteractiveEntries (main.go:3936+). Quick look (<Kbd>Space</Kbd>) on non-media types now shows the item card (main.go:4618+) |
| items.mdx:136-168 | View shows fields with "press Enter to copy" prompts | View shows an item card (item_view.go:301-391) with a copy menu (482-515) |
| items.mdx:167 | "On Linux, install `xclip` or nothing is copied" | True, but `pm` still prints that it copied: copyToClipboard ignores errors (main.go:3640-3653). Add when the section is rewritten |
| items.mdx:172-178 | Non-TTY list prints `[1] GitHub (Password)` | It prints resultIndex + resultLine (item_view.go:536-543, 562-566) |
| items.mdx:184-204 | Edit asks field by field. Photos, audio and video can't be edited | A full-screen editor (item_edit.go:317-360; hint `↑↓ move · Enter edit[ · x remove] · s save · Esc done`; 362-486). It can replace files and change the space. Renaming to a name that exists fails with the duplicate-name error. Policy is checked as described in issue 4 |
| items.mdx:208-213 | Delete asks `Are you sure…? (y/n)` | A deleteWarning shows first (item_view.go:545-560). Delete matches by **name across spaces**: see the first finding below |
| totp.mdx:19-23 | The "2FA setup key or otpauth:// link […]" prompt | That is now a row in the edit screen (item_edit.go:551-648 promptField) |
| totp.mdx:114 | `pm get` shows a login's 2FA code behind a copy prompt | The code is on the card, and you copy it from the copy menu (item_view.go:301-391, 482-515) |

### From cli: guides B

**`pm passkeys` and `pm get` UI claims (log only).** Per the coordinator's rule, these were not edited after the rule arrived. Edits I made before it are listed, not reverted.

| Page | Claim | Status | What HEAD aef9bbf does |
|---|---|---|---|
| scripting.mdx:17 | Non-terminal `pm get` with several matches | EDITED before the rule: "prints `[n] name (type)` lines" became "prints a numbered list of names and types" | main.go:3936-3956; item_view.go:488-494 (`resultLine` `%-28s %s`), 517-520 (`resultIndex`) |
| scripting.mdx:81-87 | Read-secrets sample output | EDITED before the rule: `---` / `Type: API Key` / `Label: OpenAI` / `Service: openai` / `Key: sk-test-123` / `---` became `OpenAI` / `API key · space: default` / blank / `  Service   openai` / `  Key       sk-test-123` | item_view.go:254-397 (`itemCard`), 375-382 (title, then "Label · space: X"); sandbox run |
| scripting.mdx:128 | Failure-check example | EDITED before the rule: `grep -q '^---$'` became `grep -q ' · space: '` | item_view.go:375-382 |
| scripting.mdx:125 | Exit-1 list included `pm passkeys` | EDITED before the rule: removed | `pm passkeys` was deleted in 013843f (passkeys_cmd.go) |
| recovery.mdx:92 | "unrelated to the website passkeys in [`pm passkeys`](/docs/cli/passkeys)" | EDITED before the rule: now "the website passkeys stored on your logins (see [Passkeys](/docs/cli/passkeys))" | no `pm passkeys` command since 013843f; passkeys are shown and removable in `pm get` (item_edit.go:495-518) |
| health-and-audit.mdx:142 | Alert level 3: "adds, edits, deletes, passkey changes, exports" | EDITED before the rule: now "adds, edits (removing a passkey with `pm get` counts as one), deletes, exports" | item_edit.go:495-518 (passkey removal logs `PASSKEY_DELETED` and sends the "ENTRY MODIFIED" `LevelAll` alert) |
| health-and-audit.mdx:77 | "The **i** key in `pm get` shows one item's telemetry and trust score." | NOT edited; accurate at HEAD | main.go:4578-4579, `displayEntryMetadata` 4790-4924 |
| policies.mdx:66 | "Editing a login in `pm get`: The password, if you changed it" | NOT edited. Right for logins, but incomplete: Wi-Fi edits in `pm get` are also checked, under the desktop rules (any active policy, not only with `min_length`) | item_edit.go:76-105, desktop_handlers.go:741-750, 669-682 |

**Bridge and MCP items, resolved after they landed.** These were log-only earlier and are now fixed on the pages (rows above):
- **e60d9f4:** scripting.mdx serve row (my earlier `--prompt-stdin` addition removed), the duplicate status entry, and the exit-1 list; browser-extension.mdx status sample, bridge-status section, exit codes and heading. No `check_installation` or `install_apm` mentions on my pages.
- **aef9bbf:** history.mdx MCP clause ("changes an AI agent commits itself through MCP" became "changes an AI agent makes over MCP without asking you (to spaces, the encryption profile or cloud settings)").
- **Still accurate:** health-and-audit.mdx:77 "recorded with the actor `AI`" (src/mcp.go:316-317; desktop_handlers.go:2762-2769 also sets it for approved requests). The policies.mdx MCP rows hold under the approval flow.

### From reference

Log-only per the coordinator. "HEAD" = 5c023b7 / aef9bbf (`pm get` code is identical in both).

| Page | Claim | What HEAD does |
|---|---|---|
| exit-codes.mdx | **Edited before the rule; not reverted.** Removed rows: "`pm passkeys list` \| The vault can't be unlocked" and "`pm passkeys rename`, `pm passkeys rm` \| The vault can't be unlocked, the session is read-only, the passkey isn't found or isn't unique, the label is empty, or the vault can't be saved" | `pm passkeys` was removed in 013843f (passkeys_cmd.go deleted); the help tree has no such command |
| exit-codes.mdx | "`pm get` with no match" exits 0 | Run → handleInteractiveEntries, returns normally (main.go:854-870). Correct |
| exit-codes.mdx | Ctrl C in the `pm get`/`pm totp` interactive views exits 0 | main.go:4093 (list: break), 4499-4500 (totp: return), item_edit.go:229-230 (editor: keyCtrlC). Correct |
| environment-variables.mdx | Telemetry "shown by the **i** key in `pm get`" | main.go:4210, 4578, 4894-4906. Correct |
| file-locations.mdx | Document/media temp file from `pm get`, removed about 5 s after the viewer starts | main.go:4972-4976, 4992, 4995-5017. Correct |
| vault-settings.mdx, faq.mdx | `pm` never clears the clipboard; on Linux it reports a copy that didn't happen | main.go:3632-3651 (no clearing; xclip error ignored); item_view.go:461-463. Correct |
| faq.mdx, glossary.mdx | "In `pm`, a delete is immediate"; Trash: "`pm` deletes immediately" | `pm get` asks `Delete <name> (<type>)? (y/n)`, then deletes at once with no Trash (main.go:4586-4611). Correct |
| policies.mdx | Row "Changing a login's password in `pm get` \| Yes" and callout "`pm` only checks a policy whose `min_length` is greater than `0`… enforced by the desktop app but not by `pm`" | **Out of date at HEAD.** The `pm get` editor saves through `desktopServer.updateItem` → checkPolicy (item_edit.go:80-95; desktop_handlers.go:741-751, 669-682). It enforces any named policy, including `require_*`-only ones, for logins **and Wi-Fi** when the password changes. The `min_length > 0` gate now covers only `pm add` and agent adds. Edit when `pm get` claims are unlocked |

### From getting-started, second pass

These are `pm get` UI and passkey claims. They are left as the page has them; behaviour is given at HEAD `5c023b7`.

| Page | Claim | What `5c023b7` does |
|---|---|---|
| quickstart.mdx:77-80 | "`pm get` opens an interactive search with `github` already typed. Pick the login to see its fields, and copy its password, username or one-time code from there." Another agent rewrote this; it was not me. | Matches. In a terminal it opens "APM Search & Manage" with the query prefilled (`CLI/main.go:3936-4000`). The keys are Enter/v View, i Metadata, e Edit, d Delete (`:4043`). The item card has a numbered copy menu (`CLI/item_view.go:254-290, 433-445`). With no terminal it prints the single match, or a numbered list (`main.go:3941-3956`). |
| quickstart.mdx:178-180 (callout) | "`pm add login` asks for a name, a username and a password only." Website is set from the extension popup or the desktop app. | True for `pm add` (`main.go:428-443`, `src/vault.go` `AddEntry`). At `5c023b7`, `pm get`'s edit screen builds a row for every field of the item's type, which should include a login's **Website** (`CLI/item_edit.go:115-137`), so `pm` can now set it too. Not stated on the page. |
| choose-your-surface.mdx:28 | "`pm get`, then <Kbd>e</Kbd> to edit or <Kbd>d</Kbd> to delete" | Matches (`main.go:4043, 4156-4198`). |
| choose-your-surface.mdx:30 | "`pm get` lists a login's passkeys; its editor (<Kbd>e</Kbd>) renames or removes them" | Matches. The list is at `item_view.go:371-391`, rename at `item_edit.go:758-782`, and remove with a confirmation at `:784-800`. |

### From extension A, second pass

None remain on these pages. They make no claims about `pm passkeys`, the `pm get` passkey UI or MCP. The bridge merge landed in `4ecbf31`, and the sed-rewritten lines above match it.

### From extension B, second pass

| Page | Claim | What HEAD does | Evidence |
|---|---|---|---|
| extension/passkeys.mdx:97 (Terminal bullet, rewritten by the cli-change sync, _depth.md:198) | "`pm get` shows a login's passkeys under **Passkeys**. Press e to edit the login, pick a passkey with the arrow keys, then press ↵ to rename it or x to remove it, and s to save. `pm` can't create a website passkey or sign in with one." | Matches HEAD `aef9bbf`. These files are unchanged since `5c023b7`, so the lines are the same at both. The view prints a bold "Passkeys" block. `e` from the `pm get` list opens the editor. In the editor, Enter on a passkey row renames it (labels clipped to 120 characters), `x` asks "Remove the … passkey? …" and removes it, `s` saves and Esc finishes. Wording nit: "`pm` can't create a website passkey or sign in with one" is true of terminal commands only. `pm extension serve` and the browser-started `pm` create passkeys and sign in for the extension | `CLI/item_view.go:164-230,371-391,506-507`; `CLI/main.go:4043` (list keys "Enter/v: View \| i: Metadata \| e: Edit \| d: Delete"), `:4156-4168`, `:4931-4937` (`editEntryInVault` → `editItemInteractive`); `CLI/item_edit.go:408-412` (key hints), `:418`, `:529-530` (Enter → `renamePasskey`), `:758-782`, `:784-800`; create/assert in every bridge mode: `CLI/desktop_bridge_passkeys.go:370-500,502-580` |

No page in my set mentions MCP, `check_installation` or `install_apm` (grep), so the MCP update needed no changes here. `pm passkeys` appears nowhere in my five pages any more.
