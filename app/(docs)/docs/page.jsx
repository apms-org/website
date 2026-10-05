import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCommands, getDocs, getPage } from "../../../lib/docs.js";
import GridHero from "../../../components/docs/GridHero.jsx";

export const metadata = { title: { absolute: "APM Docs" } };

const BLURB = {
  "getting-started": "What APM is, how to install it, and your first vault in a few minutes.",
  desktop: "The app for macOS, Windows and Linux, screen by screen.",
  cli: "pm, the whole vault in your shell. Guides and every command with its flags.",
  extension: "APM for Chrome. Pair it, then fill logins, codes and passkeys on any site.",
  agents: "The MCP server. Give your AI tools scoped, revocable access to the vault.",
  security: "How the vault is encrypted, where keys live, and how recovery works.",
  reference: "Environment variables, file locations, policies, FAQ and glossary."
};

function steps(slug) {
  const doc = getPage(slug);
  if (!doc || doc.redirect) return null;
  return { href: doc.page.href, title: doc.page.title, description: doc.page.description, toc: doc.toc };
}

function groups(pages) {
  const out = [];
  for (const p of pages) {
    const last = out[out.length - 1];
    if (last && last.label === (p.group || null)) last.pages.push(p);
    else out.push({ label: p.group || null, pages: [p] });
  }
  return out;
}

export default function DocsHome() {
  const docs = getDocs();
  const quick = steps(["getting-started", "quickstart"]);
  const install = steps(["getting-started", "installation"]);
  const commands = getCommands();
  const quickSteps = quick?.toc.filter((h) => h.depth === 3).slice(0, 4) || [];
  const installRows = install?.toc.filter((h) => h.depth === 2).slice(0, 4) || [];

  return (
    <main id="dx-main" className="dx-home">
      <GridHero>
        <h1>Documentation</h1>
      </GridHero>

      <div className="dx-starts">
        {quick && (
          <Link href={quick.href} className="dx-start">
            <ol className="dx-start-visual dx-start-steps">
              {quickSteps.map((h, i) => (
                <li key={h.id}><span>{i + 1}</span>{h.text}</li>
              ))}
            </ol>
            <span className="dx-start-title">{quick.title}</span>
            <span className="dx-start-body">{quick.description}</span>
          </Link>
        )}
        {install && (
          <Link href={install.href} className="dx-start">
            <ul className="dx-start-visual dx-start-rows">
              {installRows.map((h) => <li key={h.id}>{h.text}</li>)}
            </ul>
            <span className="dx-start-title">{install.title}</span>
            <span className="dx-start-body">{install.description}</span>
          </Link>
        )}
        {commands.length > 0 && (
          <Link href={commands[0].href.split("#")[0]} className="dx-start">
            <ul className="dx-start-visual dx-start-cmds">
              {commands.slice(0, 8).map((c) => <li key={c.href}>{c.name}</li>)}
            </ul>
            <span className="dx-start-title">Command reference</span>
            <span className="dx-start-body">Every pm command and flag, in one place.</span>
          </Link>
        )}
      </div>

      <div className="dx-index">
        {docs.map((s) => (
          <section key={s.slug} className="dx-index-sec">
            <div className="dx-index-head">
              <h2><Link href={s.href}>{s.title}</Link></h2>
              <p>{BLURB[s.slug] || s.description}</p>
              <Link href={s.href} className="dx-index-start">Start reading <ArrowRight size={14} strokeWidth={2} /></Link>
            </div>
            <div className="dx-index-groups">
              {groups(s.pages.filter((p) => !p.index)).map((g, i) => (
                <div key={i} className="dx-index-group">
                  {g.label && <p className="dx-tree-label">{g.label}</p>}
                  <ul>
                    {g.pages.map((p) => <li key={p.href}><Link href={p.href}>{p.sidebarTitle}</Link></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="dx-foot">
        <span>APM is free and open source under GPL-3.0.</span>
        <span className="dx-foot-links">
          <a href="https://github.com/apms-org/cli" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://github.com/apms-org/cli/issues" target="_blank" rel="noreferrer">Report an issue</a>
          <a href="https://github.com/apms-org/cli/releases/latest" target="_blank" rel="noreferrer">Releases</a>
        </span>
      </footer>
    </main>
  );
}
