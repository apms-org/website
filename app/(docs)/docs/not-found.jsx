import Link from "next/link";

export default function NotFound() {
  return (
    <main id="dx-main" className="dx-missing">
      <p className="dx-eyebrow">404</p>
      <h1>This page isn’t in the docs</h1>
      <p>It may have moved. Search with <span className="apm-kbd"><kbd>⌘</kbd><kbd>K</kbd></span>, or start from the overview.</p>
      <Link href="/docs" className="dx-btn">Back to the docs</Link>
    </main>
  );
}
