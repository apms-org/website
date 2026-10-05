"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar.jsx";

export default function MobileNav({ nav }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.classList.toggle("dx-locked", open);
    if (!open) return undefined;
    const key = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);

  return (
    <>
      <button type="button" className="dx-iconbtn dx-burger" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
      </button>
      <div className={"dx-drawer" + (open ? " is-open" : "")} inert={!open}>
        <div className="dx-drawer-scrim" onClick={() => setOpen(false)} />
        <div className="dx-drawer-panel">
          <Sidebar nav={nav} onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}
