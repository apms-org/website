import Link from "next/link";
import { slug } from "github-slugger";
import { Children, isValidElement } from "react";
import Icon from "./Icon.jsx";
import CopyButton from "./CopyButton.jsx";
import { Tabs, Tab } from "./Tabs.jsx";

const CALLOUT = {
  note: { icon: "info", label: "Note" },
  tip: { icon: "lightbulb", label: "Tip" },
  warning: { icon: "triangle-alert", label: "Warning" },
  danger: { icon: "octagon-alert", label: "Danger" }
};

function Callout({ type = "note", title, children }) {
  const c = CALLOUT[type] || CALLOUT.note;
  return (
    <aside className={"dx-callout is-" + (CALLOUT[type] ? type : "note")}>
      <span className="dx-callout-icon"><Icon name={c.icon} size={16} /></span>
      <div className="dx-callout-body">
        {title && <p className="dx-callout-title">{title}</p>}
        {children}
      </div>
    </aside>
  );
}

function Steps({ children }) {
  return <div className="dx-steps">{children}</div>;
}

function Cards({ children, cols }) {
  return <div className="dx-cards" style={cols ? { "--cols": cols } : undefined}>{children}</div>;
}

function Card({ title, href, icon, children }) {
  const body = (
    <>
      {icon && <span className="dx-card-icon"><Icon name={icon} size={18} /></span>}
      <span className="dx-card-title">
        {title}
        {href && <Icon name="arrow-right" size={14} className="dx-card-arrow" />}
      </span>
      {children && <span className="dx-card-body">{children}</span>}
    </>
  );
  if (!href) return <div className="dx-card">{body}</div>;
  const external = /^https?:/.test(href);
  return external
    ? <a className="dx-card" href={href} target="_blank" rel="noreferrer">{body}</a>
    : <Link className="dx-card" href={href}>{body}</Link>;
}

function Kbd({ children }) {
  return <span className="apm-kbd"><kbd>{children}</kbd></span>;
}

function Badge({ tone = "neutral", children }) {
  return <span className={"apm-badge" + (tone !== "neutral" ? " apm-badge-" + tone : "")}>{children}</span>;
}

function Command({ name, summary, children }) {
  return (
    <section className="dx-command" id={slug(name || "")}>
      <header className="dx-command-head">
        <code className="dx-command-name"><span aria-hidden="true">$</span>{name}</code>
        {summary && <span className="dx-command-summary">{summary}</span>}
      </header>
      <div className="dx-command-body">{children}</div>
    </section>
  );
}

function heading(Tag) {
  return function H({ id, children, ...rest }) {
    return (
      <Tag id={id} {...rest}>
        {id && <a className="dx-anchor" href={"#" + id} aria-label="Link to this section">#</a>}
        {children}
      </Tag>
    );
  };
}

function A({ href = "", children, ...rest }) {
  if (href.startsWith("/")) return <Link href={href} {...rest}>{children}</Link>;
  if (href.startsWith("#")) return <a href={href} {...rest}>{children}</a>;
  return <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>;
}

function Table(props) {
  return <div className="dx-table"><table {...props} /></div>;
}

// rehype-pretty-code wraps each block in a figure; give it a header with the title or language and a copy button.
function Figure({ children, ...rest }) {
  if (!("data-rehype-pretty-code-figure" in rest)) return <figure {...rest}>{children}</figure>;
  const kids = Children.toArray(children).filter(isValidElement);
  const caption = kids.find((k) => k.props && "data-rehype-pretty-code-title" in k.props);
  const pre = kids.find((k) => k !== caption && k.props && "data-language" in k.props);
  const lang = pre?.props["data-language"];
  const label = caption ? caption.props.children : LANG[lang] || lang;
  return (
    <div className="dx-code">
      <div className="dx-code-head">
        <span className="dx-code-title">
          {caption ? <Icon name="file" size={13} /> : (lang === "sh" || lang === "bash" || lang === "shell") ? <Icon name="terminal" size={13} /> : <Icon name="code" size={13} />}
          {label}
        </span>
        <CopyButton />
      </div>
      {pre}
    </div>
  );
}

const LANG = { sh: "Terminal", bash: "Terminal", shell: "Terminal", zsh: "Terminal", powershell: "PowerShell", ps1: "PowerShell", json: "JSON", jsonc: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML", go: "Go", ts: "TypeScript", js: "JavaScript", text: "Output", txt: "Output", plaintext: "Output", ini: "INI", diff: "Diff", xml: "XML", html: "HTML" };

export const components = {
  Callout, Steps, Tabs, Tab, Cards, Card, Kbd, Badge, Command,
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  a: A,
  table: Table,
  figure: Figure
};
