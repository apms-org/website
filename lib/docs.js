import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const ROOT = path.join(process.cwd(), "content", "docs");

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

const titleCase = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Markdown inline syntax a heading or excerpt may carry, reduced to its text.
// Code spans and escaped brackets are set aside first, so `tx_list`, `<name>` or \<name\> survive as written, the way rehype-slug sees them.
// Underscores only mark emphasis at word edges, so snake_case words keep theirs.
export function plain(md) {
  const kept = [];
  const keep = (s) => "\u0000" + (kept.push(s) - 1) + "\u0000";
  return md
    .replace(/`([^`]*)`/g, (_, c) => keep(c))
    .replace(/\\([{}<>])/g, (_, c) => keep(c))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/(\*\*|\*|~~)(.+?)\1/g, "$2")
    .replace(/(^|[^\p{L}\p{N}_])(__|_)(?=\S)(.+?)(?<=\S)\2(?![\p{L}\p{N}_])/gu, "$1$3")
    .replace(/\u0000(\d+)\u0000/g, (_, i) => kept[i])
    .trim();
}

// ## and ### headings outside code fences, slugged the same way rehype-slug slugs them.
export function headings(body) {
  const slugger = new GithubSlugger();
  const out = [];
  let fence = null;
  for (const line of body.split("\n")) {
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1];
      else if (f[1].startsWith(fence[0]) && f[1].length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = plain(m[2]);
    out.push({ depth: m[1].length, text, id: slugger.slug(text) });
  }
  return out;
}

function readPage(section, file) {
  const raw = fs.readFileSync(path.join(ROOT, section, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx?$/, "");
  const index = slug === "index";
  return {
    section,
    slug,
    index,
    href: "/docs/" + section + (index ? "" : "/" + slug),
    title: data.title || titleCase(index ? section : slug),
    sidebarTitle: data.sidebarTitle || (index ? "Overview" : data.title || titleCase(slug)),
    description: data.description || "",
    group: data.group || null,
    order: index ? -1 : Number.isFinite(data.order) ? data.order : 999,
    body: content
  };
}

export const getDocs = cache(() => {
  if (!fs.existsSync(ROOT)) return [];
  const sections = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
    .map((d) => {
      const meta = readJSON(path.join(ROOT, d.name, "_section.json"), {});
      const pages = fs
        .readdirSync(path.join(ROOT, d.name))
        .filter((f) => /\.mdx?$/.test(f))
        .map((f) => readPage(d.name, f))
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
      return {
        slug: d.name,
        title: meta.title || titleCase(d.name),
        description: meta.description || "",
        icon: meta.icon || "file-text",
        order: Number.isFinite(meta.order) ? meta.order : 999,
        href: "/docs/" + d.name,
        pages
      };
    })
    .filter((s) => s.pages.length)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return sections;
});

// Every page in reading order, for previous and next links.
export const getFlat = cache(() => getDocs().flatMap((s) => s.pages));

export function getPage(slug = []) {
  const [section, page = "index"] = slug;
  if (!section || slug.length > 2) return null;
  const s = getDocs().find((x) => x.slug === section);
  if (!s) return null;
  const p = s.pages.find((x) => x.slug === page);
  if (!p) {
    // A section without an index.mdx opens on its first page.
    if (page === "index") return { redirect: s.pages[0].href };
    return null;
  }
  const flat = getFlat();
  const i = flat.indexOf(p);
  return { section: s, page: p, prev: flat[i - 1] || null, next: flat[i + 1] || null, toc: headings(p.body) };
}

export function getNav() {
  return getDocs().map((s) => ({
    slug: s.slug,
    title: s.title,
    icon: s.icon,
    href: s.href,
    pages: s.pages.map((p) => ({ title: p.sidebarTitle, href: p.href, index: p.index, group: p.group }))
  }));
}

// What the search dialog needs: titles, headings and a plain-text body per page.
export function getSearchIndex() {
  return getDocs().flatMap((s) =>
    s.pages.map((p) => {
      const text = p.body
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*.*\n?/g, " "))
        .replace(/^#+\s+/gm, "")
        .replace(/^\s*[|:-]+\s*$/gm, " ")
        .replace(/\|/g, " ");
      return {
        href: p.href,
        title: p.title,
        section: s.title,
        description: p.description,
        headings: headings(p.body).map((h) => ({ text: h.text, id: h.id })),
        text: plain(text).replace(/\s+/g, " ").slice(0, 6000)
      };
    })
  );
}

// Every <Command name="..."> in the command line section, for the docs home.
export function getCommands() {
  const cli = getDocs().find((s) => s.slug === "cli");
  if (!cli) return [];
  const slugger = new GithubSlugger();
  return cli.pages.flatMap((p) =>
    [...p.body.matchAll(/<Command\s+name="([^"]+)"/g)].map((m) => ({ name: m[1], href: p.href + "#" + slugger.slug(m[1]) }))
  );
}
