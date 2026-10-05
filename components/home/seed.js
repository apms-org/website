export const LINKS = {
  repo: "https://github.com/apms-org/cli",
  releases: "https://github.com/apms-org/cli/releases/latest",
  changelog: "/releases",
  gui: "https://github.com/apms-org/gui",
  extension: "https://github.com/apms-org/extension",
  designSystem: "https://github.com/apms-org/design-system",
  docs: "/docs",
  install: "/docs/getting-started/installation",
  license: "https://github.com/apms-org/cli/blob/master/LICENSE",
  issues: "https://github.com/apms-org/cli/issues"
};

export const OS_LABEL = { macos: "macOS", windows: "Windows", linux: "Linux" };



export const DOWNLOADS = [
  { os: "macos", icon: "laptop", title: "macOS", sub: "Apple silicon and Intel", file: "APM for macOS, zipped app" },
  { os: "windows", icon: "monitor", title: "Windows", sub: "x64", file: "APM for Windows, zipped app" },
  { os: "linux", icon: "terminal-square", title: "Linux", sub: "x64", file: "APM for Linux, tar.gz" }
];

export const CHAPTERS = [
  { id: "unlock", title: "Unlock", sub: "Argon2id turns your master password into keys", dur: 6000, win: "app" },
  { id: "copy", title: "Copy", sub: "One click, and the clipboard clears itself", dur: 2700, win: "app" },
  { id: "fill", title: "Autofill", sub: "APM for Chrome offers the login on github.com", dur: 3700, win: "browser" },
  { id: "term", title: "Terminal", sub: "pm reads the same vault from your shell", dur: 2900, win: "term" }
];

export const COMPAT = [
  { label: "Runs on", names: ["macOS", "Windows", "Linux"], note: "Desktop app and pm" },
  { label: "Fills in", names: ["Chrome", "Edge", "Brave", "Arc", "Vivaldi", "Chromium"], note: "APM for Chrome" },
  { label: "Answers", names: ["Claude Desktop", "Cursor", "VS Code", "Cline"], note: "Over MCP, with scoped tokens" },
  { label: "Moves in from", names: ["Bitwarden", "1Password", "KeePassXC", "KeePass", "Chrome CSV"], note: "Passkeys included" },
  { label: "Syncs through", names: ["Google Drive", "GitHub", "Dropbox"], note: "Encrypted file only" }
];

export const TERMINAL = [
  { cmd: "pm unlock" },
  { out: "Master Password (attempt 1/3): ••••••••••••••••", dim: true },
  { out: "Vault unlocked. It locks after 15 minutes idle.", tone: "success" }
];

export const TOTP_CMD = "pm totp github";
export const TOTP_OUT = "Copied TOTP for GitHub (github.com) to clipboard.";
export const DEMO_PASSWORD = "correct-horse-battery";
export const DEMO_USER = "maya@example.com";

const LOGIN = "Login";

export const ITEMS = [
  {
    id: "github", group: "Today", title: "GitHub", sub: "maya@example.com", letter: "G", time: "2m", fav: true, kind: LOGIN, edited: "2 minutes ago",
    fields: [
      { label: "Username", icon: "user", value: "maya@example.com" },
      { label: "Password", icon: "key-round", value: "t7#Rq9!vLm2&Wx4zK8", secret: true, strength: { score: 4, bits: 112 } },
      { label: "One-time code", icon: "timer", totp: "JBSWY3DPEHPK3PXP" },
      { label: "Website", icon: "globe", value: "github.com", mono: true, href: "https://github.com" }
    ]
  },
  {
    id: "postmark", group: "Today", title: "Postmark server token", sub: "a3f8…9b37", icon: "key-round", mono: true, time: "1h", kind: "API key", edited: "1 hour ago",
    fields: [
      { label: "Token", icon: "key-round", value: "a3f8c2d1-7e4b-4f9a-b6c5-2d8e1f0a9b37", secret: true, mono: true },
      { label: "Service", icon: "server", value: "Postmark" },
      { label: "Environment", icon: "layers", value: "Production", copyable: false }
    ]
  },
  {
    id: "aws", group: "Today", title: "AWS production", sub: "AKIA…MPLE", icon: "cloud", mono: true, time: "3h", alert: "warning", kind: "Cloud credentials", edited: "214 days ago",
    fields: [
      { label: "Access key ID", icon: "key", value: "AKIAIOSFODNN7EXAMPLE", mono: true },
      { label: "Secret key", icon: "key-round", value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", secret: true, mono: true, strength: { score: 4, bits: 238, detail: "Changed 214 days ago" } },
      { label: "Region", icon: "globe", value: "eu-west-1", mono: true }
    ]
  },
  {
    id: "linear", group: "This week", title: "Linear", sub: "maya@example.com", letter: "L", time: "Tue", kind: LOGIN, edited: "Tuesday",
    fields: [
      { label: "Username", icon: "user", value: "maya@example.com" },
      { label: "Password", icon: "key-round", value: "orbit-lantern-quarry-91", secret: true, strength: { score: 3, bits: 71 } },
      { label: "Website", icon: "globe", value: "linear.app", mono: true, href: "https://linear.app" }
    ]
  },
  {
    id: "deploy", group: "This week", title: "Deploy key", sub: "SHA256:Xk2p…L9fQ", icon: "key-square", mono: true, time: "Mon", kind: "SSH key", edited: "Monday",
    fields: [
      { label: "Host", icon: "server", value: "deploy@prod-1.internal", mono: true },
      { label: "Fingerprint", icon: "fingerprint", value: "SHA256:Xk2pV7nQm4Rz8tYw1cJ0hBd5sE3uLa6gK9oF2iTL9fQ", mono: true },
      { label: "Private key", icon: "file-key", value: "b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAAB", secret: true, mono: true }
    ]
  },
  {
    id: "notion", group: "This week", title: "Notion", sub: "maya@example.com", letter: "N", time: "Mon", alert: "warning", kind: LOGIN, edited: "Monday",
    fields: [
      { label: "Username", icon: "user", value: "maya@example.com" },
      { label: "Password", icon: "key-round", value: "Sunflower2019!", secret: true, strength: { score: 2, bits: 48, detail: "Reused in Spotify" } },
      { label: "Website", icon: "globe", value: "notion.so", mono: true, href: "https://notion.so" }
    ]
  },
  {
    id: "wifi", group: "Earlier", title: "Home Wi-Fi", sub: "Halden-5G", icon: "wifi", time: "Sep 12", kind: "Wi-Fi network", edited: "Sep 12",
    fields: [
      { label: "Network", icon: "wifi", value: "Halden-5G" },
      { label: "Password", icon: "key-round", value: "pine-harbor-7713-copper", secret: true, strength: { score: 3, bits: 77 } },
      { label: "Security", icon: "shield", value: "WPA3", copyable: false }
    ]
  },
  {
    id: "amex", group: "Earlier", title: "Amex Gold", sub: "•••• 0005", icon: "credit-card", mono: true, time: "Aug 30", kind: "Card or account", edited: "Aug 30",
    fields: [
      { label: "Cardholder", icon: "user", value: "Maya Lindqvist" },
      { label: "Number", icon: "credit-card", value: "3782 822463 10005", secret: true, mono: true },
      { label: "Expires", icon: "calendar", value: "08/28", mono: true },
      { label: "Security code", icon: "lock", value: "4021", secret: true, mono: true }
    ]
  }
];

export const NAV = {
  library: [
    { icon: "layers", label: "All items", count: 48, id: "all" },
    { icon: "star", label: "Favorites", count: 9 },
    { icon: "timer", label: "Authenticator", count: 12 },
    { icon: "radar", label: "Watchtower", badge: { tone: "warning", text: "2" } },
    { icon: "history", label: "History" }
  ],
  types: [
    { icon: "globe", label: "Logins", count: 31 },
    { icon: "key-round", label: "API keys", count: 6 },
    { icon: "key-square", label: "SSH keys", count: 3 },
    { icon: "cloud", label: "Cloud credentials", count: 2 },
    { icon: "credit-card", label: "Cards and accounts", count: 3 },
    { icon: "wifi", label: "Wi-Fi networks", count: 3 }
  ]
};

export const SURFACES = [
  {
    id: "desktop", anchor: "desktop", icon: "monitor", kicker: "Desktop app",
    title: "A calm app for every secret you keep.",
    body: "Unlock with Touch ID, find anything with ⌘K and copy it with a shortcut. The app reads and writes the same vault, history and audit log as pm.",
    points: ["All 25 item types, with Quick Look", "Watchtower for reused, weak and aging passwords", "History with undo, Spaces and Trash"]
  },
  {
    id: "browser", anchor: "browser", icon: "globe", kicker: "APM for Chrome",
    title: "Autofill that never touches the vault file.",
    body: "APM for Chrome fills logins and one-time codes, creates and signs in with passkeys and offers to save what you type. It pairs with the app over 127.0.0.1 using a 6-character code.",
    points: ["Chrome, Edge, Brave, Arc, Vivaldi and Chromium", "Never opens vault.dat or stores your master password", "Menus render in closed shadow roots on every page"]
  },
  {
    id: "shell", anchor: "shell", icon: "terminal", kicker: "pm",
    title: "The whole vault, in your shell.",
    body: "pm is the engine under everything. Read a secret, inject environment variables into a session, rewind history or sync the encrypted file, all without leaving the terminal.",
    points: ["Fuzzy search with pm get", "Ephemeral, scoped sessions for scripts and agents", "Signed lgit history you can verify"]
  },
  {
    id: "ai", anchor: "ai", icon: "bot", kicker: "AI agents",
    title: "Agents get a token, not your vault.",
    body: "APM runs an MCP server for Claude Desktop, Cursor, VS Code and other clients. Each one gets its own token with the scopes you pick, and every add, edit or delete starts as a preview.",
    points: ["Tokens are scoped and can expire", "Edits start as a previewed transaction", "Revoke a client with pm mcp revoke"]
  }
];

export const PALETTE = {
  recent: [
    { title: "GitHub", sub: "maya@example.com", letter: "G" },
    { title: "AWS production", sub: "Cloud credentials", icon: "cloud" },
    { title: "Home Wi-Fi", sub: "Halden-5G", icon: "wifi" }
  ],
  items: [
    { title: "GitHub", sub: "maya@example.com", letter: "G" },
    { title: "GitHub recovery codes", sub: "Recovery codes · 8 left", icon: "life-buoy" },
    { title: "GitHub Actions deploy", sub: "CI/CD secret", icon: "workflow" }
  ],
  actions: [
    { title: "Copy password", icon: "copy", kbd: ["⌘", "C"] },
    { title: "Copy one-time code", icon: "timer", kbd: ["⌘", "⇧", "C"] },
    { title: "Open github.com", icon: "external-link", kbd: ["⌘", "O"] }
  ]
};

export const SHELL_SCRIPT = [
  { cmd: "pm inject --inject postmark,aws-prod" },
  { out: "✓ Injected 2 vars into session", tone: "success" },
  { cmd: "pm session issue --scope read --ttl 1h --agent ci" },
  { out: "Ephemeral session issued.", tone: "success" },
  { k: "Scope:      ", out: "read" },
  { k: "Expires:    ", out: "2026-10-05T16:04:05Z" },
  { k: "Agent bind: ", out: "ci" },
  { cmd: "pm lgit verify" },
  { out: "Verified commits: 214/214" },
  { out: "LGit chain integrity is valid.", tone: "success" }
];

export const CLIENTS = [
  { name: "Claude Desktop", icon: "bot", last: "Used 2 minutes ago", scopes: ["read", "secrets"] },
  { name: "Cursor", icon: "mouse-pointer-click", last: "Used today", scopes: ["read", "write"] },
  { name: "VS Code", icon: "panel-left", last: "Expires in 6 days", scopes: ["read"] }
];

export const CODES = [
  { name: "GitHub", sub: "maya@example.com", letter: "G", secret: "JBSWY3DPEHPK3PXP", link: "github.com" },
  { name: "AWS production", sub: "maya.lindqvist", icon: "cloud", secret: "KRUGS4ZANFZSAYJA" },
  { name: "Linear", sub: "maya@example.com", letter: "L", secret: "GEZDGNBVGY3TQOJQ", link: "linear.app" },
  { name: "Proton", sub: "maya@proton.me", letter: "P", secret: "MFRGGZDFMZTWQ2LK" },
  { name: "Cloudflare", sub: "maya@example.com", letter: "C", secret: "ONSWG4TFOQYTEMZU" }
];

export const WATCH = {
  stats: [
    { label: "Reused", value: "2", tone: "warning" },
    { label: "Easy to guess", value: "1", tone: "danger" },
    { label: "Not rotated", value: "3" }
  ],
  rows: [
    { title: "Notion", letter: "N", why: "Same password as Spotify", badge: "Reused", tone: "warning" },
    { title: "AWS production", icon: "cloud", why: "Not rotated in 7 months", badge: "Old", tone: "neutral" },
    { title: "Old router", icon: "wifi", why: "Easy to guess", badge: "Weak", tone: "danger" }
  ]
};

export const COMMITS = {
  undoHash: "c81e7a2",
  list: [
    { hash: "a41f2c9", msg: "Import 312 items from Bitwarden", when: "2m", icon: "file-up" },
    { hash: "9e07b14", msg: "Change password for GitHub", when: "1h", icon: "pencil" },
    { hash: "5c2d88e", msg: "Move Old router to Trash", when: "Tue", icon: "trash-2" },
    { hash: "17ab0f3", msg: "Add Postmark server token", when: "Mon", icon: "plus" }
  ]
};

export const PASSKEYS = [
  { site: "github.com", user: "maya", letter: "G" },
  { site: "vercel.com", user: "maya", letter: "V" },
  { site: "google.com", user: "maya.lindqvist", letter: "G" }
];

export const SPACES = [
  { id: "personal", label: "Personal", items: [
    { title: "GitHub", sub: "maya@example.com", letter: "G" },
    { title: "Home Wi-Fi", sub: "Halden-5G", icon: "wifi" },
    { title: "Amex Gold", sub: "•••• 0005", icon: "credit-card" }
  ] },
  { id: "work", label: "Work", items: [
    { title: "AWS production", sub: "eu-west-1", icon: "cloud" },
    { title: "Deploy key", sub: "deploy@prod-1.internal", icon: "key-square" },
    { title: "Postmark server token", sub: "API key", icon: "key-round" }
  ] },
  { id: "family", label: "Family", items: [
    { title: "Netflix", sub: "family@example.com", letter: "N" },
    { title: "Passport, Maya", sub: "Government ID", icon: "id-card" },
    { title: "Pediatrician", sub: "Contact", icon: "contact" }
  ] }
];

export const TYPES = [
  { label: "Login", icon: "globe" },
  { label: "Authenticator", icon: "timer" },
  { label: "Secure note", icon: "sticky-note" },
  { label: "Wi-Fi network", icon: "wifi" },
  { label: "Government ID", icon: "id-card" },
  { label: "Medical record", icon: "heart-pulse" },
  { label: "Travel", icon: "plane" },
  { label: "Contact", icon: "contact" },
  { label: "Recovery codes", icon: "life-buoy" },
  { label: "Card or account", icon: "credit-card" },
  { label: "Software license", icon: "award" },
  { label: "Legal contract", icon: "scale" },
  { label: "Document", icon: "file-lock-2" },
  { label: "API key", icon: "key-round" },
  { label: "Token", icon: "ticket" },
  { label: "SSH key", icon: "key-square" },
  { label: "SSH host", icon: "server" },
  { label: "Cloud credentials", icon: "cloud" },
  { label: "Kubernetes", icon: "ship-wheel" },
  { label: "Docker registry", icon: "container" },
  { label: "CI/CD secret", icon: "workflow" },
  { label: "Certificate", icon: "file-key" },
  { label: "Photo", icon: "image" },
  { label: "Audio", icon: "music" },
  { label: "Video", icon: "video" }
];

export const LAYERS = [
  { id: "header", n: "01", title: "Header", tag: "APMVAULT · v4", body: "Magic bytes and the format version, so any build of pm knows what it's reading." },
  { id: "profile", n: "02", title: "Profile", tag: "argon2id · aes-256-gcm", body: "The key derivation and cipher settings. Public by design, they hold no secrets." },
  { id: "recovery", n: "03", title: "Recovery", tag: "recovery settings", body: "Recovery settings and a second key slot your recovery key can open, kept outside the encrypted body so recovery can start before unlock." },
  { id: "salt", n: "04", title: "Salt and validator", tag: "new salt on every save", body: "A fresh random salt on every save, and a validator that rejects a wrong password before any decryption." },
  { id: "slot", n: "05", title: "Key slot", tag: "256-bit data key", body: "A random data key, sealed with the key derived from your master password." },
  { id: "body", n: "06", title: "Encrypted vault", tag: "aead ciphertext", body: "Every item, field, passkey and history pointer, sealed with the data key." },
  { id: "hmac", n: "07", title: "Signature", tag: "hmac-sha256", body: "Signs every byte above with a separate key. A changed file is refused before it's opened." }
];

export const PROFILES = [
  { id: "standard", label: "Standard", memory: "64", time: "3", threads: "2", salt: "16", nonce: "12", fit: "The default on most computers." },
  { id: "hardened", label: "Hardened", memory: "256", time: "5", threads: "4", salt: "32", nonce: "12", fit: "Suggested with 8 GB of memory and 4 cores." },
  { id: "paranoid", label: "Paranoid", memory: "512", time: "6", threads: "4", salt: "32", nonce: "24", fit: "Suggested with 16 GB of memory and 8 cores." }
];

export const KEYS = [
  { name: "Encryption key", bytes: "0 to 31", body: "Seals the data key slot" },
  { name: "Auth key", bytes: "32 to 63", body: "Signs the file with HMAC-SHA256" },
  { name: "Validator", bytes: "64 to 95", body: "Checks the password first" }
];

export const GUARDS = [
  { icon: "hard-drive", title: "Nothing to sign up for", body: "There's no APM account. The vault stays on your computer unless you turn on sync, and sync uploads only the encrypted file." },
  { icon: "shield-check", title: "Tamper evident", body: "HMAC-SHA256 covers every byte of vault.dat, and lgit history is signed. pm lgit verify checks the whole chain." },
  { icon: "timer", title: "Locks itself", body: "After 15 minutes idle, after an hour at most, and when your computer sleeps. Change each one with pm autolock." },
  { icon: "life-buoy", title: "Five ways back in", body: "A recovery key with an emailed code, one-time codes, a passkey, or shares split between people you trust. Set them up before you need them." }
];

export const SCOPES = [
  { id: "read", title: "read", tools: "list_vault · search_vault", body: "Names and metadata. Never a secret value." },
  { id: "secrets", title: "secrets", tools: "get_entry · decrypt_entry · get_totp", body: "Secret values and codes, one entry per call." },
  { id: "write", title: "write", tools: "add_entry · edit_entry · delete_entry", body: "Adds, edits and deletes start as a preview and a pending transaction." },
  { id: "admin", title: "admin", tools: "manage_profiles · get_audit_logs", body: "Profiles, cloud settings, history and the audit log." }
];

export const MCP_CONFIG = [
  { t: "{" },
  { t: "  ", k: "\"mcpServers\"", r: ": {" },
  { t: "    ", k: "\"apm\"", r: ": {" },
  { t: "      ", k: "\"command\"", r: ": ", v: "\"pm\"", e: "," },
  { t: "      ", k: "\"args\"", r: ": [" },
  { t: "        ", v: "\"mcp\"", e: "," },
  { t: "        ", v: "\"serve\"", e: "," },
  { t: "        ", v: "\"--token\"", e: "," },
  { t: "        ", v: "\"apm_mcp_3f9c…e21a\"" },
  { t: "      ]" },
  { t: "    }" },
  { t: "  }" },
  { t: "}" }
];

export const AGENT_FLOW = [
  { id: "ask", n: "01", title: "The agent asks", body: "Cursor calls edit_entry to rotate a token. APM replies with a preview and a transaction ID, and writes nothing yet." },
  { id: "approve", n: "02", title: "It commits on purpose", body: "The change lands only when the call comes back with that ID and approve set. Pending ones show up in the app, and expire after 15 minutes." },
  { id: "receipt", n: "03", title: "It's on the record", body: "The save becomes an lgit commit, and the audit log names the token that made it." }
];

export const COMMANDS = [
  {
    group: "Everyday",
    items: [
      { cmd: "pm totp github", note: "Copy a one-time code", out: [{ out: "Copied TOTP for GitHub (github.com) to clipboard.", tone: "success" }] },
      { cmd: "pm gen -l 24", note: "Generate a password", out: [{ pw: "t7#Rq9!vLm2&Wx4zK8pNe3Ya" }] },
      { cmd: "pm inject --inject postmark,aws-prod", note: "Secrets as env vars", out: [{ out: "✓ Injected 2 vars into session", tone: "success" }] }
    ]
  },
  {
    group: "Sessions",
    items: [
      { cmd: "pm unlock", note: "Unlock this shell", out: [
        { out: "Master Password (attempt 1/3): ••••••••••••••••", dim: true },
        { out: "Vault unlocked. It locks after 15 minutes idle.", tone: "success" }
      ] },
      { cmd: "pm session issue --scope read --ttl 1h --agent ci", note: "Scoped, short-lived access", out: [
        { out: "Ephemeral session issued.", tone: "success" },
        { k: "Scope:      ", out: "read" },
        { k: "Expires:    ", out: "2026-10-05T16:04:05Z" },
        { k: "Agent bind: ", out: "ci" }
      ] },
      { cmd: "pm autolock --idle 15m --max 1h", note: "When the vault locks", out: [
        { out: "Auto-lock updated.", tone: "success" },
        { k: "Lock after inactivity:  ", out: "15 minutes" },
        { k: "Maximum session:        ", out: "1 hour" },
        { k: "Lock on sleep:          ", out: "on" },
        { out: "Applies to the desktop app, pm sessions and the browser extension.", dim: true }
      ] }
    ]
  },
  {
    group: "History",
    items: [
      { cmd: "pm lgit verify", note: "Check every signature", out: [
        { out: "Verified commits: 214/214" },
        { out: "LGit chain integrity is valid.", tone: "success" }
      ] },
      { cmd: "pm lgit undo", note: "Take the last change back", out: [{ out: "Restored vault from lgit commit '1759673331109412000-a41f2c91d0e3'.", tone: "success" }] }
    ]
  },
  {
    group: "Move and sync",
    items: [
      { cmd: "pm import bitwarden.json --dry-run", note: "Review before importing", out: [
        { out: "bitwarden.json · Bitwarden JSON · 356 items · 4 passkeys" },
        { out: " " },
        { k: "  Login              ", out: "312  4 passkeys" },
        { k: "  Secure note        ", out: " 28" },
        { k: "  Card or account    ", out: " 16" },
        { out: " " },
        { k: "  + ", out: "309 new", tone: "success" },
        { k: "  = ", out: "41 already in your vault       skipped", dim: true },
        { k: "  ~ ", out: "3 conflicts                    same name, different contents", tone: "warning" },
        { k: "  ? ", out: "2 possible duplicates          same login, key or passkey under another name", tone: "warning" },
        { k: "  x ", out: "1 can't be imported", tone: "danger" },
        { out: " " },
        { out: "Dry run. Nothing was imported. Run without --dry-run to import.", dim: true }
      ] },
      { cmd: "pm cloud sync github", note: "Push the encrypted file", out: [{ out: "[github] Vault synced to cloud.", tone: "success" }] },
      { cmd: "pm extension link", note: "Connect your browsers", out: [
        { out: "Linked Chrome, Edge and Brave.", tone: "success" },
        { out: "If the extension is not paired yet, approve it in the app.", dim: true }
      ] }
    ]
  }
];

export const IMPORTS = [
  { name: "Bitwarden", ext: ".json · .zip", letter: "B" },
  { name: "1Password", ext: ".1pux · .csv", letter: "1" },
  { name: "KeePassXC", ext: ".xml", letter: "K" },
  { name: "KeePass", ext: ".xml · .csv", letter: "K" },
  { name: "FIDO CXF 1.0", ext: "credential exchange", icon: "file-key" },
  { name: "Browser CSV", ext: "Chrome, Edge, Firefox, Safari", icon: "globe" },
  { name: "otpauth", ext: "authenticator links", icon: "qr-code" },
  { name: "APM", ext: "vault.dat", icon: "file-lock-2" }
];

export const REVIEW = [
  { title: "GitHub", sub: "maya@example.com", letter: "G", badge: { tone: "warning", text: "Conflict" }, action: "Merge" },
  { title: "Linear", sub: "maya@example.com", letter: "L", badge: { tone: "accent", text: "New" }, action: "Import" },
  { title: "Notion", sub: "maya@example.com", letter: "N", badge: { tone: "neutral", text: "Existing" }, action: "Skip" },
  { title: "Notion (old)", sub: "maya@example.com", letter: "N", badge: { tone: "warning", text: "Possible duplicate" }, action: "Keep both" },
  { title: "Bank PIN card", sub: "Unsupported field type", icon: "credit-card", badge: { tone: "danger", text: "Can't import" }, action: "Skip" }
];

export const EXPORTS = ["APM", "Credential Exchange", "Bitwarden", "CSV", "Text"];

export const SYNC = [
  { name: "Google Drive", icon: "cloud", when: "Synced 2 minutes ago" },
  { name: "GitHub", icon: "git-branch", when: "Synced 1 hour ago" },
  { name: "Dropbox", icon: "folder", when: "Off" }
];

export const REPOS = [
  { name: "apms-org/cli", lang: "Go", body: "The vault engine and pm. Encryption, history, import and export, sync and the MCP server.", href: LINKS.repo },
  { name: "apms-org/gui", lang: "Electron", body: "The desktop app for macOS, Windows and Linux. It talks to the engine over JSON-RPC.", href: LINKS.gui },
  { name: "apms-org/extension", lang: "JavaScript", body: "APM for Chrome. Fills logins, codes and passkeys through the app or pm.", href: LINKS.extension },
  { name: "apms-org/design-system", lang: "CSS and React", body: "The tokens, icons and components every surface is built from.", href: LINKS.designSystem }
];

export const FAQ = [
  { q: "Is APM really free?", a: "Yes. APM is free and open source under the GPL-3.0 license. There's no paid tier, no trial and no account to create." },
  { q: "Where is my data stored?", a: "In one encrypted file, ~/.apm/vault.dat, on your computer. Copy it, back it up or sync it with Google Drive, GitHub or Dropbox. Sync only ever moves the encrypted file." },
  { q: "What happens if I forget my master password?", a: "Nobody can reset it for you. Set up recovery ahead of time: a recovery key with an emailed code, one-time recovery codes, a passkey, or shares split between people you trust." },
  { q: "Can the browser extension read my vault?", a: "No. APM for Chrome never opens vault.dat and never stores your master password. It asks the APM app, or pm when the app is closed, for what a page needs, after you pair it with a 6-character code." },
  { q: "How do AI agents get access?", a: "Through APM's MCP server, with a token you create for each client. A token carries only the scopes you grant, can expire and can be revoked with pm mcp revoke. Adds, edits and deletes start as a preview and only commit on a second, explicit call." },
  { q: "Can I bring my passwords from another manager?", a: "Yes. APM imports from Bitwarden, 1Password, KeePass and KeePassXC, FIDO Credential Exchange, browser CSV files and otpauth links, passkeys included. You review every item first, and the whole import can be undone." },
  { q: "Which platforms does APM run on?", a: "The desktop app and pm run on macOS, Windows and Linux. APM for Chrome works in Chrome, Edge, Brave, Arc, Vivaldi and Chromium." }
];

export const POLICY = [
  { k: "name", v: "engineering" },
  { k: "password_policy", v: "" },
  { i: 1, k: "min_length", v: "16", n: true },
  { i: 1, k: "require_uppercase", v: "true" },
  { i: 1, k: "require_numbers", v: "true" },
  { i: 1, k: "require_symbols", v: "true" }
];

export const FOOTER = [
  { title: "Product", links: [
    { label: "Desktop app", href: "#desktop" },
    { label: "APM for Chrome", href: "#browser" },
    { label: "pm for the terminal", href: "#cli" },
    { label: "AI agents", href: "#agents" },
    { label: "Download", href: "#download" }
  ] },
  { title: "Security", links: [
    { label: "Encryption", href: "/docs/security/encryption" },
    { label: "Vault format", href: "/docs/security/vault-format" },
    { label: "Recovery", href: "/docs/security/recovery" },
    { label: "Report an issue", href: LINKS.issues, external: true }
  ] },
  { title: "Developers", links: [
    { label: "Documentation", href: LINKS.docs },
    { label: "Installation", href: LINKS.install },
    { label: "Command line", href: "/docs/cli" },
    { label: "MCP server", href: "/docs/agents" }
  ] },
  { title: "Open source", links: [
    { label: "apm", href: LINKS.repo, external: true },
    { label: "gui", href: LINKS.gui, external: true },
    { label: "extension", href: LINKS.extension, external: true },
    { label: "design-system", href: LINKS.designSystem, external: true },
    { label: "GPL-3.0 license", href: LINKS.license, external: true }
  ] }
];

export const STATS = [
  { value: "25", unit: "item types", body: "Logins and codes, keys and certificates, cards, IDs and files." },
  { value: "3", unit: "keys", body: "From one Argon2id run. One encrypts, one signs, one checks your password." },
  { value: "1", unit: "vault file", body: "Everything lives in ~/.apm/vault.dat. Copy it, back it up, carry it." },
  { value: "0", unit: "accounts", body: "Nothing to sign up for. Your vault is a file you own." }
];
