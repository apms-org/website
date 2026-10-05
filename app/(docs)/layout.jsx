import Link from "next/link";
import "../../vendor/design-system/tokens.css";
import "../../vendor/design-system/bundle.css";
import "./docs.css";
import { THEME_SCRIPT } from "../theme-script.js";
import { getNav } from "../../lib/docs.js";
import Mark from "../../components/docs/Mark.jsx";
import GitHub from "../../components/docs/GitHub.jsx";
import MobileNav from "../../components/docs/MobileNav.jsx";
import Search from "../../components/docs/Search.jsx";
import ThemeToggle from "../../components/docs/ThemeToggle.jsx";

export const metadata = {
  title: { default: "APM Docs", template: "%s · APM Docs" },
  description: "Documentation for APM, the open source password manager: the desktop app, the pm command line, the Chrome extension and the MCP server."
};

const REPO = "https://github.com/apms-org/cli";

export default function DocsLayout({ children }) {
  const nav = getNav();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="dx">
        <a className="dx-skip" href="#dx-main">Skip to content</a>
        <header className="dx-header">
          <div className="dx-header-in">
            <MobileNav nav={nav} />
            <Link href="/docs" className="dx-brand" aria-label="APM documentation">
              <Mark size={26} id="hdr" />
              <span className="dx-brand-word">APM</span>
              <span className="dx-brand-slash" aria-hidden="true">/</span>
              <span className="dx-brand-docs">Docs</span>
            </Link>
            <div className="dx-header-search"><Search /></div>
            <nav className="dx-header-links" aria-label="Site">
              <a href="/">Home</a>
              <a href="/#download">Download</a>
            </nav>
            <div className="dx-header-end">
              <a className="dx-iconbtn" href={REPO} target="_blank" rel="noreferrer" aria-label="APM on GitHub" title="GitHub"><GitHub size={16} /></a>
              <ThemeToggle />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
