"use client";

import dynamic from "next/dynamic";

// The homepage reads window at module load (scroll hooks, the design-system bundle), so it renders on the client only.
const Page = dynamic(() => import("../../components/home/main.jsx"), { ssr: false });

export default function Home() {
  return <Page />;
}
