// The pm (CLI) entries are the real releases from github.com/apms-org/cli/releases, pre-releases left out.
// `tag` is the GitHub tag when it is not "v" + version.
// The desktop app and extension entries are still DEMO DATA: neither has shipped yet.

export const PRODUCTS = [
  { id: "gui", name: "Desktop app", short: "GUI", icon: "monitor", repo: "apms-org/gui", blurb: "macOS, Windows and Linux" },
  { id: "cli", name: "pm", short: "CLI", icon: "terminal", repo: "apms-org/cli", blurb: "The engine and the command line" },
  { id: "extension", name: "APM for Chrome", short: "Extension", icon: "globe", repo: "apms-org/extension", blurb: "Chrome, Edge, Brave, Arc and Vivaldi" }
];

export const TYPES = [
  { id: "new", label: "New", tone: "success" },
  { id: "improved", label: "Improved", tone: "accent" },
  { id: "fixed", label: "Fixed", tone: "warning" },
  { id: "security", label: "Security", tone: "danger" }
];

export const RELEASES = {
  gui: [
    {
      version: "12.0.0", date: "2026-09-28", kind: "major",
      title: "The desktop app is here",
      summary: "A demo entry for the first desktop release. The real notes will describe what shipped and why.",
      changes: [
        { type: "new", text: "Demo: a three-pane window for spaces, items and details." },
        { type: "new", text: "Demo: unlock with Touch ID after the first password unlock.", tag: "macOS" },
        { type: "new", text: "Demo: import from another manager with a review step before anything is saved." },
        { type: "improved", text: "Demo: search covers titles, usernames, URLs and notes." },
        { type: "security", text: "Demo: the vault locks when the computer sleeps." }
      ]
    },
    {
      version: "11.4.0", date: "2026-08-19", kind: "minor",
      title: "Watchtower and history",
      summary: "Demo text. A minor release that adds a feature and polishes a few screens.",
      changes: [
        { type: "new", text: "Demo: Watchtower lists weak, reused and old passwords." },
        { type: "new", text: "Demo: History shows every change with one-click undo." },
        { type: "improved", text: "Demo: the item list keeps its scroll position after an edit." },
        { type: "fixed", text: "Demo: a crash when closing the window during a sync.", tag: "Windows" }
      ]
    },
    {
      version: "11.3.2", date: "2026-07-30", kind: "patch",
      title: "Fixes for passkeys and sync",
      summary: "Demo text for a patch release.",
      changes: [
        { type: "fixed", text: "Demo: passkeys with long user names were cut off in the details pane." },
        { type: "fixed", text: "Demo: sync status could stay on Syncing after the upload finished." },
        { type: "security", text: "Demo: updated Electron to pick up upstream security fixes." }
      ]
    },
    {
      version: "11.3.0", date: "2026-07-08", kind: "minor",
      title: "Spaces",
      summary: "Demo text. Keep work and personal items apart in one vault.",
      changes: [
        { type: "new", text: "Demo: create spaces and move items between them." },
        { type: "improved", text: "Demo: the sidebar remembers which spaces are collapsed." },
        { type: "fixed", text: "Demo: dark theme contrast in the generator.", tag: "Linux" }
      ]
    },
    {
      version: "11.2.1", date: "2026-06-17", kind: "patch",
      title: "Small fixes",
      summary: "Demo text for a patch release.",
      changes: [
        { type: "fixed", text: "Demo: the window opened off screen after unplugging a display." },
        { type: "improved", text: "Demo: faster start when the vault holds thousands of items." }
      ]
    }
  ],
  cli: [
    {
      version: "11.2.0", date: "2026-08-05", kind: "minor",
      title: "A new note editor",
      summary: "The note editor is rebuilt as a full-screen terminal editor, replacing the old single-line input loop.",
      changes: [
        { type: "new", text: "A full-screen note editor with line numbers, soft word wrap and smooth scrolling, without the old full-screen flicker." },
        { type: "new", text: "A header with the note name and space, and a status bar with line, column, character and word counts and an unsaved-changes marker." },
        { type: "new", text: "Undo and redo with Ctrl+Z and Ctrl+Y, which put the cursor back where the edit happened." },
        { type: "new", text: "Standard editing keys: Home and End, Ctrl+A and Ctrl+E, delete to start or end of line, delete word, transpose, word case with Alt+U, Alt+L and Alt+C, and paste with Ctrl+V." },
        { type: "improved", text: "Esc or Ctrl+C with unsaved changes asks before discarding instead of throwing the note away." },
        { type: "improved", text: "Piped and scripted input still works: plain line input until an empty line." },
        { type: "improved", text: "The old autocorrect and automatic bracket pairing are gone, so nothing rewrites words while you type." },
        { type: "fixed", text: "The CLI smoke tests build the whole package instead of only main.go." }
      ]
    },
    {
      version: "11.1.0", date: "2026-07-30", kind: "minor",
      title: "Encryption fixes",
      summary: "A security release that fixes several problems in vault encryption and recovery, and removes the autofill system.",
      changes: [
        { type: "security", text: "Recovery key encryption used an all-zero AES-GCM nonce. It now uses a random nonce; older vaults still open." },
        { type: "security", text: "The master key slot used an all-zero nonce, so every save produced the same encrypted slot. Each save now gets a unique nonce." },
        { type: "security", text: "History signatures were keyed with the vault salt, which is public. They now use a key derived from your master password." },
        { type: "security", text: "Recovery keys are derived with Argon2id instead of a single SHA-256, and the stored recovery hash uses HMAC-SHA256." },
        { type: "security", text: "Standalone encrypt and decrypt now add an HMAC, matching the vault format." },
        { type: "security", text: "Wiping secrets from memory could be optimised away by the compiler, and string zeroing only cleared a copy. Both now clear the real memory." },
        { type: "fixed", text: "Errors in recovery key setup were ignored and an invalid key could crash pm." },
        { type: "fixed", text: "Corrupted data could decrypt to garbage instead of returning an error." },
        { type: "fixed", text: "Vaults opened with the recovery key lost their crypto profile, so a later save could use the wrong settings." },
        { type: "fixed", text: "Importing JSON with the wrong password gave a confusing parse error instead of a decryption error." },
        { type: "fixed", text: "A corrupted session key was silently replaced, which broke every open session. pm now reports the bad key file." },
        { type: "fixed", text: "Background cleanup left orphan shell processes behind after a crash.", tag: "macOS and Linux" },
        { type: "fixed", text: "The MCP server ignored several errors, including malformed arguments and a failed random key, and left temp files on disk. Temp files are now removed after five minutes." },
        { type: "improved", text: "Removed the autofill daemon, the autocomplete commands and the Gmail one-time code reader." }
      ]
    },
    {
      version: "11.0.0", date: "2026-07-28", kind: "major",
      title: "Touch ID, cleanup and lgit",
      summary: "A release that declutters pm: FaceID, vocab, brutetest and audit are removed, and Touch ID, vault cleanup and lgit are added.",
      changes: [
        { type: "new", text: "Unlock with Touch ID.", tag: "macOS" },
        { type: "new", text: "pm cleanup finds unused, deprecated and unrecognised sections in your vault and removes them after asking." },
        { type: "new", text: "When a vault fails to open because it is outdated or has unrecognised entries, pm offers to fix it." },
        { type: "new", text: "pm lgit replaces audit: a git-style history with tree, log, status, show, verify, checkout, undo, squash and prune." },
        { type: "new", text: "pm logs shows vault history, audit events and lgit commits, each marked verified or unverified." },
        { type: "security", text: "History entries are chained and signed, and pm lgit verify checks the whole chain." },
        { type: "improved", text: "Removed the FaceID framework in favour of the operating system's own biometrics." },
        { type: "improved", text: "Removed the vocab, brutetest and audit commands." }
      ]
    },
    {
      version: "10.1.1", date: "2026-04-24", kind: "patch",
      title: "Arrow keys in pm get",
      summary: "A fix for list navigation on Windows terminals.",
      changes: [
        { type: "fixed", text: "Up and down arrows did not work in pm get in PowerShell.", tag: "Windows" },
        { type: "improved", text: "pm get accepts both ESC [ and ESC O arrow key sequences." }
      ]
    },
    {
      version: "10.1.0", date: "2026-04-14", kind: "minor",
      title: "inject, cloud diff and XChaCha20",
      summary: "Adds secret injection for shells, merging cloud changes across devices, a second cipher and FaceID unlock.",
      changes: [
        { type: "new", text: "pm inject reads a .apminject file and sets your secrets as environment variables in the shell, replacing .env files." },
        { type: "new", text: "pm cloud diff compares the cloud vault with your local one and lets you abort, merge everything or merge selected changes." },
        { type: "new", text: "Vaults can be encrypted with XChaCha20-Poly1305." },
        { type: "new", text: "Unlock with FaceID using a local model. Builds need the faceid tag and OpenCV." },
        { type: "new", text: "pm autocomplete mail fills one-time codes from Gmail with Ctrl+Shift+P." },
        { type: "improved", text: "pm autocomplete no longer needs the vault to be unlocked." },
        { type: "fixed", text: "pm autocomplete autostart." }
      ]
    },
    {
      version: "10.0.0", date: "2026-03-11", kind: "major",
      title: "Autofill, recovery and .apmignore",
      summary: "pm moves from storing secrets to automating with them: system autofill, layered account recovery, sync filtering and plugin permissions.",
      changes: [
        { type: "new", text: "A system autofill daemon with a global hotkey, Ctrl+Shift+L by default, that types credentials without the clipboard.", tag: "Windows" },
        { type: "new", text: "pm autocomplete controls autostart, start, stop, status and popup hints for the daemon." },
        { type: "new", text: "Link TOTP entries to domains for better one-time code matching." },
        { type: "new", text: "Account recovery with email tokens, recovery keys, WebAuthn passkeys, one-time recovery codes and quorum recovery with trustee shares." },
        { type: "new", text: ".apmignore keeps spaces, entries or vocabulary out of cloud uploads, per provider." },
        { type: "new", text: "Plugin Access Control: plugins declare permissions, pm enforces them at runtime and pm plugins access lets you turn them off." },
        { type: "new", text: "A vocabulary index for secure notes with aliases, ranking and reindexing." },
        { type: "security", text: "The autofill daemon talks over loopback with a token and only runs while the vault is unlocked." }
      ]
    },
    {
      version: "9.1.0", date: "2026-02-23", kind: "minor", tag: "v9.1-release",
      title: "MCP setup removed",
      summary: "A small release.",
      changes: [
        { type: "improved", text: "Removed pm mcp setup and the apm_install tool for the MCP agent." }
      ]
    },
    {
      version: "9.0.0", date: "2026-02-21", kind: "major",
      title: "MCP, more clouds and recovery",
      summary: "A large expansion of pm: an MCP server for AI agents, GitHub and Dropbox sync, account recovery and spaces.",
      changes: [
        { type: "new", text: "pm mcp serve, with config, token, list and revoke for agent access." },
        { type: "new", text: "Cloud sync with GitHub and Dropbox alongside Google Drive, using your own account for Drive and Dropbox." },
        { type: "new", text: "pm auth for account recovery: email, alerts, level, recover, reset and change." },
        { type: "new", text: "pm init all sets up the vault and cloud sync in one step." },
        { type: "new", text: "pm update updates pm in place." },
        { type: "new", text: "Spaces split one vault into separate areas." },
        { type: "new", text: "Store audio, video and photo files." },
        { type: "new", text: "pm plugins search and pm plugins local." },
        { type: "improved", text: "pm profile now manages security profiles, and the old namespace commands moved to pm space." },
        { type: "improved", text: "Set the vault location with APM_VAULT_PATH." },
        { type: "improved", text: "pm-team get takes an optional query, and pm-team health is new." },
        { type: "improved", text: "Removed adup, scan, sec_profile, vsettings, del and plugins push." }
      ]
    },
    {
      version: "8.1.0", date: "2026-01-23", kind: "minor", tag: "v8.1",
      title: "Automatic lock",
      summary: "The vault locks itself after inactivity or a fixed time.",
      changes: [
        { type: "security", text: "The vault locks after 15 minutes of inactivity or after 1 hour, both configurable." }
      ]
    },
    {
      version: "8.0.0", date: "2026-01-21", kind: "major", tag: "v8",
      title: "Policies and security profiles",
      summary: "Adds a policy engine, custom Argon2id profiles, namespaces, a setup wizard and 22 secret categories.",
      changes: [
        { type: "new", text: "A YAML policy engine for password rules, managed with pm policy." },
        { type: "new", text: "Custom security profiles with your own Argon2id memory, iterations and parallelism." },
        { type: "new", text: "Profiles keep work, personal and project secrets apart in one vault." },
        { type: "new", text: "pm setup walks through vault creation, cloud sync and profiles." },
        { type: "new", text: "Plugins can install from a marketplace and add their own commands." },
        { type: "new", text: "22 secret categories, including Kubernetes secrets, Docker registries, CI/CD secrets, API keys, licences, medical records, IDs and travel documents." },
        { type: "improved", text: "unlock, lock and readonly are top-level commands again." },
        { type: "improved", text: "pm-team keeps sessions across shells and reads passwords from piped input." },
        { type: "security", text: "Saves are atomic, so a crash or power loss cannot corrupt the vault." }
      ]
    },
    {
      version: "7.0.0", date: "2026-01-11", kind: "major",
      title: "pm-team",
      summary: "A separate team binary with roles, departments and a hash-chained audit trail.",
      changes: [
        { type: "new", text: "pm-team, a standalone multi-user vault with five roles and per-department isolation." },
        { type: "new", text: "21 team commands, including user and department management, shared credentials, TOTP and an audit viewer." },
        { type: "new", text: "Google Drive sync no longer needs credentials.json or token.json, and you can pick your own retrieval key." },
        { type: "new", text: "pm cloud reset clears local sync state without touching the remote file." },
        { type: "security", text: "Department keys are wrapped on the client, and TOTP follows RFC 6238." },
        { type: "improved", text: "unlock, readonly, lock, completion and help moved under pm mode." },
        { type: "improved", text: "Removed pm cloud list." }
      ]
    },
    {
      version: "6.0.0", date: "2026-01-07", kind: "major", tag: "v6",
      title: "Better get and edit",
      summary: "Reworks how you find and edit entries.",
      changes: [
        { type: "new", text: "pm get with no arguments opens a category menu." },
        { type: "improved", text: "pm get only fuzzy searches when you pass a query, and opens a single match straight away." },
        { type: "improved", text: "pm edit picks the secret type from a menu and can edit every field, including tokens, SSH keys, Wi-Fi, recovery codes and notes." },
        { type: "improved", text: "Copying is immediate again: the blocking clipboard auto-clear is removed." },
        { type: "new", text: "pm info is back, showing version, install folder and support details." }
      ]
    },
    {
      version: "5.0.0", date: "2026-01-06", kind: "major", tag: "v5-stable",
      title: "More than passwords",
      summary: "pm grows from a password and TOTP store into a secrets manager.",
      changes: [
        { type: "new", text: "Store personal access tokens for GitHub, GitLab, PyPI and others." },
        { type: "improved", text: "Green success and red error messages." },
        { type: "improved", text: "add and edit guide you through each secret type." },
        { type: "fixed", text: "TOTP secrets with spaces failed with Invalid Secret. Secrets are now cleaned up and uppercased." },
        { type: "fixed", text: "The CLI could hang waiting for a second key press." },
        { type: "fixed", text: "Better errors when unlocking fails." }
      ]
    },
    {
      version: "4.0.0", date: "2026-01-04", kind: "major", tag: "v4",
      title: "Command overhaul",
      summary: "A new command structure, new secret types and vault modes.",
      changes: [
        { type: "new", text: "Store SSH keys, tokens, Wi-Fi passwords and recovery codes." },
        { type: "new", text: "pm edit, pm info and pm vhistory." },
        { type: "new", text: "Lock, open and compromise modes. Compromise deletes the vault and its traces." },
        { type: "improved", text: "Every command has help with -h." },
        { type: "security", text: "Layered encryption." }
      ]
    },
    {
      version: "2.0.0", date: "2026-01-03", kind: "major", tag: "v2",
      title: "TOTP and import",
      summary: "Adds TOTP and moving data in and out of pm.",
      changes: [
        { type: "new", text: "TOTP codes from a secret." },
        { type: "new", text: "Import from and export to other password managers." },
        { type: "improved", text: "Documented the encryption and security standards pm uses." }
      ]
    },
    {
      version: "1.0.0", date: "2025-12-21", kind: "major",
      title: "First release",
      summary: "The first release of apm, a small command-line password manager.",
      changes: [
        { type: "new", text: "Add and remove passwords, encrypted locally. Nothing leaves your computer." },
        { type: "new", text: "sudo mode for temporary password-less access." },
        { type: "new", text: "A Windows build. macOS and Linux build from source." }
      ]
    }
  ],
  extension: [
    {
      version: "12.0.0", date: "2026-09-28", kind: "major",
      title: "APM for Chrome",
      summary: "A demo entry for the first public release of the extension.",
      changes: [
        { type: "new", text: "Demo: pair with the desktop app or pm using a 6-character code." },
        { type: "new", text: "Demo: fill logins and one-time codes from the field menu." },
        { type: "new", text: "Demo: save and update prompts after you sign in." },
        { type: "security", text: "Demo: the extension never reads the vault file or stores your master password." }
      ]
    },
    {
      version: "0.9.0", date: "2026-09-01", kind: "minor",
      title: "Passkeys",
      summary: "Demo text for a beta release.",
      changes: [
        { type: "new", text: "Demo: create and use passkeys stored in your vault." },
        { type: "improved", text: "Demo: the popup opens on the item for the current site." },
        { type: "fixed", text: "Demo: the field menu covered inputs inside iframes." }
      ]
    },
    {
      version: "0.8.1", date: "2026-08-14", kind: "patch",
      title: "Matching fixes",
      summary: "Demo text for a patch release.",
      changes: [
        { type: "fixed", text: "Demo: logins for subdomains were not offered on the parent domain." },
        { type: "improved", text: "Demo: fewer prompts on sites that sign in with a single field." }
      ]
    },
    {
      version: "0.8.0", date: "2026-07-25", kind: "minor",
      title: "Options page",
      summary: "Demo text for a beta release.",
      changes: [
        { type: "new", text: "Demo: an options page for autofill and save prompts." },
        { type: "fixed", text: "Demo: the toolbar icon showed locked after unlocking.", tag: "Edge" }
      ]
    }
  ]
};
