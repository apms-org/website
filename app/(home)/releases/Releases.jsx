"use client";

import dynamic from "next/dynamic";

// Like the homepage, the page reads window at module load, so it renders on the client only.
const Page = dynamic(() => import("../../../components/home/releases.jsx"), { ssr: false });

export default function Releases() {
  return <Page />;
}
