import { AudioLines, MessageSquare, ArrowRight, Lock, Check, Circle } from "lucide-react";
import { cn } from "../ui/utils";

type View = "clinic" | "chat";

function StatusPill({
  on,
  label,
  off,
}: {
  on: boolean;
  label: string;
  off: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-2.5 py-1 text-[12px] font-medium",
        on
          ? "border-[var(--violet-200)] bg-[var(--bg-service-subtle)] text-[var(--text-service-primary)]"
          : "border-[var(--line-default)] bg-[var(--bg-base)] text-[var(--text-tertiary)]",
      )}
    >
      {on ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
      {on ? label : off}
    </span>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  note,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  note?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full max-w-[320px] flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--line-default)] bg-[var(--bg-base)] p-6 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--violet-200)] hover:shadow-lg"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--bg-service-subtle)] text-[var(--text-service-primary)]">
        {icon}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[18px] font-semibold text-[var(--text-main)]">{title}</span>
        <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-service-primary)]" />
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--text-sub)]">{desc}</p>
      {note && (
        <span className="mt-1 inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] px-2 py-1 text-[11px] font-medium text-[var(--text-tertiary)]">
          <Lock className="h-3 w-3" />
          {note}
        </span>
      )}
    </button>
  );
}

export function Landing({
  linked,
  clinicRunning,
  onSelect,
}: {
  linked: boolean;
  clinicRunning: boolean;
  onSelect: (v: View) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto bg-[var(--bg-subtle)] px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-[13px] font-medium text-[var(--text-service-primary)]">의사랑 AI</span>
        <h1 className="text-[26px] font-bold text-[var(--text-main)]">무엇을 도와드릴까요?</h1>
        <p className="text-[14px] text-[var(--text-sub)]">
          AI 진료로 음성을 기록하거나, AI와 대화를 시작하세요.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <StatusPill on={linked} label="의사랑 연동됨" off="의사랑 미연동" />
          {linked && (
            <StatusPill on={clinicRunning} label="진료실 실행 중" off="진료실 미실행" />
          )}
        </div>
      </div>

      <div className="flex w-full max-w-[680px] flex-col items-center justify-center gap-4 sm:flex-row sm:items-stretch">
        <ActionCard
          icon={<AudioLines className="h-6 w-6" />}
          title="AI 진료"
          desc="진료 대화를 녹음하면 음성을 자동 전사하고 SOAP 기록·상병·처방을 정리해 드려요."
          note={linked ? undefined : "미연동: STT·SOAP만 사용 가능"}
          onClick={() => onSelect("clinic")}
        />
        <ActionCard
          icon={<MessageSquare className="h-6 w-6" />}
          title="대화"
          desc="환자 정보와 진료 내용을 바탕으로 AI에게 자유롭게 질문하고 자료를 생성하세요."
          note={linked ? undefined : "미연동: 사용 불가"}
          onClick={() => onSelect("chat")}
        />
      </div>
    </div>
  );
}
