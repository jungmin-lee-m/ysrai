import { useState } from "react";
import { Copy, Send, RotateCcw, Check, Lock } from "lucide-react";
import { cn } from "../ui/utils";
import { soap } from "./data";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
      {children}
    </div>
  );
}

/* ── SOAP ── */
export function SoapCard({ linked }: { linked: boolean }) {
  const [regen, setRegen] = useState(false);

  const regenerate = () => {
    setRegen(true);
    setTimeout(() => setRegen(false), 1500);
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-2">
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--text-main)]">
          SOAP
          {regen && (
            <span className="text-[12px] font-normal text-[var(--text-service-primary)]">
              생성 중…
            </span>
          )}
        </span>
        {!regen && (
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
            <button
              disabled={!linked}
              title={linked ? undefined : "의사랑 연동 시 사용 가능"}
              className={cn(
                "flex items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-1 text-[12px] font-medium",
                linked
                  ? "bg-[var(--bg-service)] text-white"
                  : "cursor-not-allowed bg-[var(--bg-disabled)] text-[var(--text-disabled)]",
              )}
            >
              <Send className="h-3 w-3" />
              의사랑에 전송
            </button>
          </div>
        )}
      </div>
      <div className="px-4 py-2">
        {regen ? (
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
          (
            [
              ["S", soap.s],
              ["O", soap.o],
              ["A", soap.a],
              ["P", soap.p],
            ] as [string, string][]
          ).map(([letter, text]) => (
            <div key={letter} className="flex gap-2 py-1">
              <span className="mt-px w-3 shrink-0 text-[12px] font-semibold text-[var(--text-service-primary)]">
                {letter}
              </span>
              <p className="min-w-0 flex-1 whitespace-pre-line text-[12.5px] leading-[1.45] text-[var(--text-main)]">
                {text}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

/* ── 상병 / 처방 ── */
export type CodeItem = {
  id: string;
  userCode: string;
  name: string;
  chartDate: string;
  dose?: string;
  perDay?: string;
  days?: string;
};

function Row({
  code,
  name,
  chartDate,
  meta,
  sent,
  onClick,
  linked,
}: {
  code: string;
  name: string;
  chartDate: string;
  meta?: string;
  sent: boolean;
  onClick: () => void;
  linked: boolean;
}) {
  const Info = (
    <>
      <span className="shrink-0 rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 py-px text-[10.5px] font-medium tabular-nums text-[var(--text-tertiary)]">
        {code}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--text-main)]">{name}</span>
      {meta && (
        <span className="shrink-0 text-[10.5px] tabular-nums text-[var(--text-tertiary)]">
          {meta}
        </span>
      )}
      <span className="shrink-0 rounded-[var(--radius-xs)] bg-[var(--bg-subtle)] px-1.5 py-px text-[10px] tabular-nums text-[var(--text-tertiary)]">
        {chartDate}
      </span>
    </>
  );

  if (!linked) {
    return <div className="flex w-full items-center gap-1.5 px-2 py-1">{Info}</div>;
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-left transition-colors",
        sent ? "bg-[var(--status-success-bg-subtle)]" : "hover:bg-[var(--bg-subtle)]",
      )}
    >
      {Info}
      {sent ? (
        <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[var(--status-success-text-main)]">
          <Check className="h-3 w-3" />
          전송됨
        </span>
      ) : (
        <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[var(--text-service-primary)] opacity-0 transition-opacity group-hover:opacity-100">
          <Send className="h-3 w-3" />
          전송
        </span>
      )}
    </button>
  );
}

export function CodeCard({
  title,
  items,
  meta,
  linked,
}: {
  title: string;
  items: CodeItem[];
  meta?: boolean;
  linked: boolean;
}) {
  const [sent, setSent] = useState<Set<string>>(new Set());

  const toggleSent = (id: string) =>
    setSent((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <Card>
      <div className="flex items-center gap-1.5 border-b border-[var(--line-subtle)] px-3 py-1.5">
        <span className="text-[13px] font-semibold text-[var(--text-main)]">{title}</span>
        {!linked ? (
          <Lock className="ml-auto h-3.5 w-3.5 text-[var(--text-disabled)]" />
        ) : (
          <span className="ml-auto text-[11px] tabular-nums text-[var(--text-tertiary)]">
            {items.length}
          </span>
        )}
      </div>
      {!linked ? (
        <div className="flex items-center justify-center gap-1.5 px-1 py-3 text-[13px] text-[var(--text-tertiary)]">
          <Lock className="h-3.5 w-3.5" />
          의사랑 연동 시 사용 가능합니다.
        </div>
      ) : (
        <div className="px-1.5 py-1">
          {items.map((it) => (
            <Row
              key={it.id}
              code={it.userCode}
              name={it.name}
              chartDate={it.chartDate}
              meta={meta ? `${it.dose} · ${it.perDay} · ${it.days}` : undefined}
              sent={sent.has(it.id)}
              onClick={() => toggleSent(it.id)}
              linked={linked}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
