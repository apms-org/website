# Writing APM docs

Every page is an `.mdx` file under `content/docs/<section>/`. The URL is `/docs/<section>/<slug>`; `index.mdx` is the section's landing page at `/docs/<section>`.

## Sections

| Folder            | Title            | Covers |
|-------------------|------------------|--------|
| `getting-started` | Get started      | What APM is, install every surface, first vault, core ideas |
| `desktop`         | Desktop app      | The Electron app (GUI) screen by screen |
| `cli`             | Command line     | `pm`, task guides and the full command reference |
| `extension`       | Browser extension| The Chrome extension: pairing, autofill, saving, passkeys |
| `agents`          | AI agents (MCP)  | The MCP server, client setup, scopes, tool reference |
| `security`        | Security         | Encryption, vault format, profiles, recovery, threat model |
| `reference`       | Reference        | Env vars, file locations, policies, .apmignore, FAQ, glossary |

Each section folder has a `_section.json`: `{ "title": "Desktop app", "order": 2, "icon": "monitor" }` (icon is a lucide name, kebab-case).

## Frontmatter

```yaml
---
title: Passkeys            # page h1 and sidebar label
description: One sentence shown under the title and in search.
order: 4                   # sort order inside the section (index is 0)
sidebarTitle: Passkeys     # optional shorter sidebar label
group: Guides              # sidebar group label; pages in a group must be consecutive by order
---
```

Use `group` to split a long section into a few labelled runs, for example `Get started`, `Guides`, `Reference`. The index page has no group.

Do not repeat the title as a `#` heading. Start the body with a short paragraph, then `##` sections. `##` and `###` appear in the "On this page" rail.

## Components (no imports needed)

- `<Callout type="note|tip|warning|danger" title="Optional">Markdown body</Callout>`
- `<Steps>` … `</Steps>` wrapping a sequence of `### Step title` headings with content; they render as a numbered timeline.
- `<Tabs items={["macOS", "Windows", "Linux"]}>` with one `<Tab>` per item, in order.
- `<Cards>` holding `<Card title="Install" href="/docs/getting-started/installation" icon="download">One line.</Card>`
- `<Kbd>⌘</Kbd><Kbd>K</Kbd>` for keys.
- `<Badge tone="neutral|accent|success|warning|danger">Beta</Badge>`
- `<Command name="pm add" summary="Add an item">` … `</Command>`: a reference block for one command; put usage, flags table and examples inside as markdown.

Code fences take a language and an optional title: ```` ```sh title="Terminal" ````. Use `sh` for shell, `json`, `yaml`, `go`, `ts`. Tables use GFM pipes. Links are absolute: `/docs/cli/sessions#unlock`.

## Voice

Plain, direct, second person ("you"). Short sentences. Describe what the product actually does today, checked against the source; never invent flags, menus or behaviour. If something is platform-specific, say which platform. The product is **APM**; the command is **`pm`**.

In JSX attribute values and outside code, escape `{`, `}` and `<` (MDX treats them as code). Inside fenced or inline code they are fine.
