import { useState, useEffect } from "react";
import { PanelLeft } from "lucide-react";
import { TitleBar } from "./TitleBar";
import { LeftSidebar } from "./LeftSidebar";
import { CenterPanel } from "./CenterPanel";
import type { RecState } from "./data";

export function UisarangScreen() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rec, setRec] = useState<RecState>("idle");
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (rec !== "recording") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [rec]);

  const startRec = () => {
    setSecs(0);
    setRec("recording");
  };
  const stopRec = () => setRec("done");

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-subtle)] text-[var(--text-main)]">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          <LeftSidebar onClose={() => setLeftOpen(false)} rec={rec} secs={secs} />
        ) : (
          <button
            onClick={() => setLeftOpen(true)}
            aria-label="패널 열기"
            className="flex w-10 shrink-0 items-start justify-center border-r border-[var(--line-subtle)] bg-[var(--bg-base)] pt-3 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}
        <CenterPanel rec={rec} secs={secs} onStart={startRec} onStop={stopRec} />
      </div>
    </div>
  );
}
