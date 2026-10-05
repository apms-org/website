"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "../../app/theme-script.js";

export default function ThemeToggle() {
  const [dark, setDark] = useState(null);

  useEffect(() => {
    const read = () => {
      const t = document.documentElement.getAttribute("data-theme");
      setDark(t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    setDark(!dark);
  };

  return (
    <button type="button" className="dx-iconbtn" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Light theme" : "Dark theme"}>
      {dark === null ? <span style={{ width: 16 }} /> : dark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
    </button>
  );
}
