import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  SendHorizontal,
  Mic,
  Square,
  Check,
  Copy,
  Send,
  RotateCcw,
  ChevronDown,
  AudioLines,
} from "lucide-react";
import { cn } from "../ui/utils";
import {
  transcript,
  soap,
  diagnoses,
  prescriptions,
  fmtTime,
  type RecState,
} from "./data";
import { MedicalHistorySummary } from "./MedicalHistorySummary";

const MOCK_REPLY =
  "현재 암로디핀 5mg 단독으로 혈압 조절이 불량하므로, 용량 증량보다는 ACE 억제제 또는 이뇨제 병용을 우선 고려할 수 있습니다. 신기능·전해질 수치를 함께 확인하세요.";

/* ── 공통 ── */
function AiCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-service-subtle)]">
        <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
      </span>
      <div className="min-w-0 flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
        {children}
      </div>
    </div>
  );
}

/* ── 음성기록 (녹음 중/완료) ── */
function RecordBubble({
  rec,
  secs,
  onStop,
}: {
  rec: RecState;
  secs: number;
  onStop: () => void;
}) {
  const visible =
    rec === "recording"
      ? transcript.slice(0, Math.min(transcript.length, Math.floor(secs / 2) + 1))
      : transcript;

  return (
    <AiCard>
      <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-2">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-main)]">
          <AudioLines className="h-4 w-4 text-[var(--text-service-primary)]" />
          음성기록
          {rec === "recording" ? (
            <span className="flex items-center gap-1 text-[var(--red-500)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--red-500)]" />
              <span className="tabular-nums">{fmtTime(secs)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[var(--status-success-text-main)]">
              <Check className="h-3.5 w-3.5" />
              <span className="tabular-nums">{fmtTime(secs)}</span>
            </span>
          )}
        </span>
        {rec === "recording" && (
          <button
            onClick={onStop}
            className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--gray-900)] px-2.5 py-1 text-[12px] font-medium text-white"
          >
            <Square className="h-3 w-3" />
            정지
          </button>
        )}
      </div>
      <div className="max-h-[220px] space-y-2.5 overflow-y-auto px-4 py-3">
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
    </AiCard>
  );
}

/* ── SOAP ── */
function SoapBubble({ rec }: { rec: RecState }) {
  const [regen, setRegen] = useState(false);
  const generating = rec === "recording" || regen;

  const regenerate = () => {
    setRegen(true);
    setTimeout(() => setRegen(false), 1500);
  };

  return (
    <AiCard>
      <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-2">
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--text-main)]">
          SOAP
          {generating && (
            <span className="text-[12px] font-normal text-[var(--text-service-primary)]">
              생성 중…
            </span>
          )}
        </span>
        {!generating && (
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
        )}
      </div>
      <div className="px-4 py-3">
        {generating ? (
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
        ) : (
          <>
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
          </>
        )}
      </div>
    </AiCard>
  );
}

/* ── 상병 / 처방 (각각 별도 버블) ── */
type CodeItem = {
  id: string;
  userCode: string;
  name: string;
  ai?: boolean;
  dose?: string;
  perDay?: string;
  days?: string;
};

function CodeBubble({
  title,
  rec,
  items,
  meta,
}: {
  title: string;
  rec: RecState;
  items: CodeItem[];
  meta?: boolean;
}) {
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(true);
  const generating = rec === "recording";

  const toggleSent = (id: string) =>
    setSent((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <AiCard>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 border-b border-[var(--line-subtle)] px-3 py-2"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--icon-sub)] transition-transform",
            !open && "-rotate-90",
          )}
        />
        <span className="text-[14px] font-semibold text-[var(--text-main)]">{title}</span>
        {generating ? (
          <span className="text-[12px] font-normal text-[var(--text-service-primary)]">
            분석 중…
          </span>
        ) : (
          <span className="ml-auto text-[11px] tabular-nums text-[var(--text-tertiary)]">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="px-3 py-2">
          {generating ? (
            <p className="px-1 py-3 text-center text-[13px] text-[var(--text-sub)]">
              음성녹음이 완료되면 확인할 수 있어요.
            </p>
          ) : (
            items.map((it) => (
              <Row
                key={it.id}
                code={it.userCode}
                name={it.name}
                ai={it.ai}
                meta={meta ? `${it.dose} · ${it.perDay} · ${it.days}` : undefined}
                sent={sent.has(it.id)}
                onClick={() => toggleSent(it.id)}
              />
            ))
          )}
        </div>
      )}
    </AiCard>
  );
}

function Row({
  code,
  name,
  ai,
  meta,
  sent,
  onClick,
}: {
  code: string;
  name: string;
  ai?: boolean;
  meta?: string;
  sent: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors",
        sent ? "bg-[var(--status-success-bg-subtle)]" : "hover:bg-[var(--bg-subtle)]",
      )}
    >
      <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--line-default)] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[var(--text-tertiary)]">
        {code}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-1 text-[13px] text-[var(--text-main)]">
        {ai && <Sparkles className="h-3 w-3 shrink-0 text-[var(--text-service-primary)]" />}
        <span className="truncate">{name}</span>
      </span>
      {meta && (
        <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-tertiary)]">{meta}</span>
      )}
      {sent ? (
        <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-[var(--status-success-text-main)]">
          <Check className="h-3.5 w-3.5" />
          전송됨
        </span>
      ) : (
        <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-[var(--text-service-primary)] opacity-0 transition-opacity group-hover:opacity-100">
          <Send className="h-3 w-3" />
          전송
        </span>
      )}
    </button>
  );
}

/* ── 사용자/AI 텍스트 말풍선 ── */
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-[var(--radius-lg)] rounded-tr-sm bg-[var(--bg-service)] px-3 py-2 text-[13px] leading-relaxed text-white">
        {text}
      </div>
    </div>
  );
}

function AiTextBubble({ text }: { text: string }) {
  return (
    <AiCard>
      <p className="px-4 py-3 text-[13px] leading-relaxed text-[var(--text-main)]">{text}</p>
    </AiCard>
  );
}

/* ── 하단 입력 바 ── */
function InputBar({
  rec,
  draft,
  setDraft,
  onSend,
  onStartRec,
}: {
  rec: RecState;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onStartRec: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-[var(--line-subtle)] bg-[var(--bg-base)] px-5 py-3">
      <div className="mx-auto flex max-w-[820px] items-end gap-2">
        {rec === "idle" && (
          <button
            onClick={onStartRec}
            className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--bg-service)] px-3 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[var(--violet-600)]"
          >
            <Mic className="h-4 w-4" />
            녹음 시작
          </button>
        )}
        <div className="flex min-w-0 flex-1 items-end gap-2 rounded-[var(--radius-xl)] border border-[var(--line-default)] bg-[var(--bg-base)] px-3 py-2 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="무엇이든 질문하세요."
            className="min-h-[24px] w-full resize-none bg-transparent py-1 text-[14px] leading-relaxed text-[var(--text-main)] outline-none placeholder:text-[var(--text-placeholder)]"
          />
          <button
            onClick={onSend}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-service)] text-white"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 메인 ── */
type Item =
  | { id: number; type: "summary" | "recStart" | "record" | "soap" | "dx" | "rx" }
  | { id: number; type: "user" | "ai"; text: string };

export function ConversationView({
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
  const idRef = useRef(1);
  const nid = () => idRef.current++;
  const [feed, setFeed] = useState<Item[]>([{ id: 0, type: "summary" }]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [feed.length, rec]);

  const startRecording = () => {
    setFeed((f) => [
      ...f,
      { id: nid(), type: "recStart" },
      { id: nid(), type: "record" },
      { id: nid(), type: "soap" },
      { id: nid(), type: "dx" },
      { id: nid(), type: "rx" },
    ]);
    onStart();
  };
  const stopRecording = () => {
    onStop();
  };
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setFeed((f) => [
      ...f,
      { id: nid(), type: "user", text: t },
      { id: nid(), type: "ai", text: MOCK_REPLY },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4 px-5 py-5">
          {feed.map((it) => {
            switch (it.type) {
              case "summary":
                return (
                  <div key={it.id} className="flex gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-service-subtle)]">
                      <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
                    </span>
                    <div className="h-[600px] min-w-0 flex-1">
                      <MedicalHistorySummary />
                    </div>
                  </div>
                );
              case "recStart":
                return (
                  <UserBubble key={it.id} text="🎙 진료 녹음 시작" />
                );
              case "record":
                return (
                  <RecordBubble key={it.id} rec={rec} secs={secs} onStop={stopRecording} />
                );
              case "soap":
                return <SoapBubble key={it.id} rec={rec} />;
              case "dx":
                return <CodeBubble key={it.id} title="상병" rec={rec} items={diagnoses} />;
              case "rx":
                return (
                  <CodeBubble key={it.id} title="처방" rec={rec} items={prescriptions} meta />
                );
              case "user":
                return <UserBubble key={it.id} text={it.text} />;
              case "ai":
                return <AiTextBubble key={it.id} text={it.text} />;
            }
          })}
        </div>
      </div>
      <InputBar
        rec={rec}
        draft={draft}
        setDraft={setDraft}
        onSend={send}
        onStartRec={startRecording}
      />
    </div>
  );
}
