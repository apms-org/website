// Copies the design system into vendor/design-system so the site builds without the sibling repo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ds = path.join(root, "..", "design-system");
const out = path.join(root, "vendor", "design-system");

if (!fs.existsSync(ds)) {
  console.error("design-system not found at " + ds);
  process.exit(1);
}

const files = [
  ["tokens.css", "tokens.css"],
  ["components/bundle.css", "bundle.css"],
  ["components/bundle.js", "bundle.js"],
  ["patterns/extension.css", "extension.css"],
  ["fonts/Geist-Variable.woff2", "fonts/Geist-Variable.woff2"],
  ["fonts/GeistMono-Variable.woff2", "fonts/GeistMono-Variable.woff2"]
];
for (const [from, to] of files) {
  const dest = path.join(out, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ds, from), dest);
}
console.log("synced design system to " + path.relative(process.cwd(), out));
