import { useState } from "react";
import { Mic, Square, Check, RotateCcw, Copy, Send, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";
import { soap, transcript, fmtTime, type RecState } from "./data";

type PanelTab = "stt" | "soap";

function Waveform() {
  const heights = [40, 80, 55, 100, 65, 85, 45];
  return (
    <span className="flex h-4 items-center gap-[2px]">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2px] animate-pulse rounded-full bg-[var(--red-500)]"
          style={{ height: `${h}%`, animationDelay: `${i * 110}ms` }}
        />
      ))}
    </span>
  );
}

function TranscriptBody({ rec, secs }: { rec: RecState; secs: number }) {
  if (rec === "idle") return null;
  const visible =
    rec === "done"
      ? transcript
      : transcript.slice(0, Math.min(transcript.length, Math.floor(secs / 2) + 1));

  return (
    <div className="space-y-3">
      {visible.map((line, i) => (
        <div key={i} className="flex gap-3">
          <span className="w-9 shrink-0 pt-0.5 text-[12px] tabular-nums text-[var(--text-tertiary)]">
            {line.time}
          </span>
          <p
            className={cn(
              "text-[13px] leading-relaxed",
              line.speaker === "doctor"
                ? "font-medium text-[var(--text-main)]"
                : "text-[var(--text-sub)]",
            )}
          >
            {line.text}
          </p>
        </div>
      ))}
      {rec === "recording" && (
        <div className="flex items-center gap-2 pt-1 text-[12px] font-medium text-[var(--text-service-primary)]">
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-service-primary)]"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </span>
          듣는 중…
        </div>
      )}
    </div>
  );
}

function SoapBody({ rec }: { rec: RecState }) {
  const [mode, setMode] = useState<"summary" | "detail">("summary");
  const [regenerating, setRegenerating] = useState(false);

  if (rec === "idle") return null;

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => setRegenerating(false), 1500);
  };

  if (rec === "recording" || regenerating) {
    return (
      <div>
        <p className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-service-primary)]">
          <Sparkles className="h-3.5 w-3.5" />
          SOAP 생성 중…
        </p>
        <div className="space-y-4">
          {["S", "O", "A", "P"].map((l) => (
            <div key={l}>
              <div className="mb-1.5 h-3 w-3 animate-pulse rounded bg-[var(--bg-neutral)]" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-[92%] animate-pulse rounded bg-[var(--bg-subtle)]" />
                <div className="h-2.5 w-[68%] animate-pulse rounded bg-[var(--bg-subtle)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-0.5">
          {(
            [
              ["summary", "요약"],
              ["detail", "상세"],
            ] as ["summary" | "detail", string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={cn(
                "rounded-[var(--radius-sm)] px-3 py-1 text-[12px] font-medium transition-colors",
                mode === k
                  ? "bg-[var(--bg-base)] text-[var(--text-main)] shadow-sm"
                  : "text-[var(--text-tertiary)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[var(--icon-sub)]">
          <button
            onClick={regenerate}
            className="flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-1 text-[12px] font-medium hover:bg-[var(--bg-subtle)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 생성
          </button>
          <button className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--bg-subtle)]">
            <Copy className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--bg-service)] px-2.5 py-1 text-[12px] font-medium text-white">
            <Send className="h-3 w-3" />
            의사랑에 전송
          </button>
        </div>
      </div>
      {(
        [
          ["S", soap.s],
          ["O", soap.o],
          ["A", soap.a],
          ["P", soap.p],
        ] as [string, string][]
      ).map(([letter, text]) => (
        <div key={letter} className="mb-4 last:mb-0">
          <div className="mb-1 text-[13px] font-semibold text-[var(--text-service-primary)]">
            {letter}
          </div>
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[var(--text-main)]">
            {text}
          </p>
        </div>
      ))}
    </div>
  );
}

export function RecordPanel({
  rec,
  secs,
  onStart,
  onStop,
}: {
  rec: RecState;
  secs: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const [tab, setTab] = useState<PanelTab>("stt");

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
      {/* 헤더: 탭 + 녹음 컨트롤 */}
      <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-3 py-2">
        <div className="flex">
          {(
            [
              ["stt", "음성기록"],
              ["soap", "SOAP"],
            ] as [PanelTab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "relative px-3 py-1.5 text-[14px] font-medium transition-colors",
                tab === k ? "text-[var(--text-main)]" : "text-[var(--text-tertiary)]",
              )}
            >
              {label}
              {tab === k && (
                <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-[var(--bg-service)]" />
              )}
            </button>
          ))}
        </div>

        {/* 녹음 컨트롤 */}
        {rec === "recording" && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--red-500)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--red-500)]" />
              <span className="tabular-nums">{fmtTime(secs)}</span>
              <Waveform />
            </span>
            <button
              onClick={onStop}
              className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--gray-900)] px-2.5 py-1 text-[12px] font-medium text-white"
            >
              <Square className="h-3 w-3" />
              정지
            </button>
          </div>
        )}
        {rec === "done" && (
          <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--status-success-text-main)]">
            <Check className="h-3.5 w-3.5" />
            녹음 {fmtTime(secs)}
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="px-4 py-3">
        {rec === "idle" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-service-subtle)]">
              <Mic className="h-6 w-6 text-[var(--text-service-primary)]" />
            </span>
            <p className="text-[13px] leading-relaxed text-[var(--text-sub)]">
              녹음을 시작하면 실시간으로 대화가 기록되고
              <br />
              종료 시 SOAP 노트가 자동으로 작성됩니다.
            </p>
            <button
              onClick={onStart}
              className="mt-1 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-service)] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[var(--violet-600)]"
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              녹음 시작
            </button>
          </div>
        ) : tab === "stt" ? (
          <TranscriptBody rec={rec} secs={secs} />
        ) : (
          <SoapBody rec={rec} />
        )}
      </div>
    </section>
  );
}
