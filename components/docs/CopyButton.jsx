"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

// Copies the text of the <pre> next to it, minus shell prompts so a pasted command runs as is.
export default function CopyButton({ label = "Copy code" }) {
  const ref = useRef(null);
  const [done, setDone] = useState(false);
  const copy = async () => {
    const pre = ref.current?.closest(".dx-code")?.querySelector("pre");
    if (!pre) return;
    const text = pre.innerText.replace(/\n$/, "");
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {}
  };
  return (
    <button ref={ref} type="button" className={"dx-copy" + (done ? " is-done" : "")} onClick={copy} aria-label={done ? "Copied" : label}>
      {done ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.75} />}
      <span>{done ? "Copied" : "Copy"}</span>
    </button>
  );
}
