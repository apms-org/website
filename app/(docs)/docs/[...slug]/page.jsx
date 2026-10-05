import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDocs, getNav, getPage } from "../../../../lib/docs.js";
import { renderMDX } from "../../../../lib/mdx.js";
import Sidebar from "../../../../components/docs/Sidebar.jsx";
import Toc from "../../../../components/docs/Toc.jsx";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocs().flatMap((s) => s.pages.map((p) => ({ slug: p.index ? [s.slug] : [s.slug, p.slug] })));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = getPage(slug);
  if (!doc || doc.redirect) return {};
  return { title: doc.page.index ? doc.section.title : doc.page.title, description: doc.page.description };
}

export default async function DocPage({ params }) {
  const { slug } = await params;
  const doc = getPage(slug);
  if (!doc) notFound();
  if (doc.redirect) redirect(doc.redirect);
  const { section, page, prev, next, toc } = doc;
  const content = await renderMDX(page.body);

  return (
    <div className="dx-shell">
      <aside className="dx-aside">
        <div className="dx-aside-scroll">
          <Sidebar nav={getNav()} />
        </div>
      </aside>
      <main id="dx-main" className="dx-main">
        <div className="dx-page">
          <article className="dx-article">
            <p className="dx-kicker">
              {page.index ? <span>{section.title}</span> : <Link href={section.href}>{section.title}</Link>}
              {page.group && <><span aria-hidden="true">/</span><span>{page.group}</span></>}
            </p>
            <header className="dx-title">
              <h1>{page.title}</h1>
              {page.description && <p className="dx-lede">{page.description}</p>}
            </header>
            <div className="dx-prose">{content}</div>
            <nav className="dx-pager" aria-label="Pages">
              {prev ? (
                <Link href={prev.href} className="dx-pager-link is-prev">
                  <span className="dx-pager-dir"><ArrowLeft size={13} strokeWidth={2} /> Previous</span>
                  <span className="dx-pager-title">{prev.title}</span>
                </Link>
              ) : <span />}
              {next ? (
                <Link href={next.href} className="dx-pager-link is-next">
                  <span className="dx-pager-dir">Next <ArrowRight size={13} strokeWidth={2} /></span>
                  <span className="dx-pager-title">{next.title}</span>
                </Link>
              ) : <span />}
            </nav>
          </article>
          <aside className="dx-rail">
            <div className="dx-rail-in">
              <Toc items={toc} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
