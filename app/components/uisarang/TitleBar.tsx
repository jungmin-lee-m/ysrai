import { Minus, Square, X } from "lucide-react";
import { cn } from "../ui/utils";

function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2.5 17.5 16H2.5L10 2.5Z"
        stroke="var(--bg-service)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Toggle({
  on,
  onLabel,
  offLabel,
  onToggle,
  disabled,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={on}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 text-[12px] font-medium",
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-[var(--bg-subtle)]",
      )}
    >
      <span className={cn(on ? "text-[var(--text-main)]" : "text-[var(--text-tertiary)]")}>
        {on ? onLabel : offLabel}
      </span>
      <span
        className={cn(
          "flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
          on ? "bg-[var(--bg-service)]" : "bg-[var(--bg-neutral)]",
        )}
      >
        <span
          className={cn(
            "h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
            on ? "translate-x-3" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

export function TitleBar({
  linked,
  onToggleLinked,
  clinicRunning,
  onToggleClinic,
  onHome,
}: {
  linked: boolean;
  onToggleLinked: () => void;
  clinicRunning: boolean;
  onToggleClinic: () => void;
  onHome: () => void;
}) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line-subtle)] bg-[var(--bg-base)] pl-3 pr-2">
      <button
        onClick={onHome}
        aria-label="처음으로"
        className="flex items-center gap-2 rounded-[var(--radius-md)] px-1.5 py-1 hover:bg-[var(--bg-subtle)]"
      >
        <Logo />
        <span className="text-[14px] font-semibold text-[var(--text-main)]">의사랑 AI</span>
      </button>

      {/* 프로토타입 상태 전환 */}
      <div className="flex items-center gap-1">
        <span className="mr-1 hidden text-[10px] font-medium uppercase tracking-wide text-[var(--text-disabled)] sm:inline">
          상태
        </span>
        <Toggle
          on={linked}
          onLabel="의사랑 연동"
          offLabel="의사랑 미연동"
          onToggle={onToggleLinked}
        />
        <Toggle
          on={clinicRunning}
          onLabel="진료실 실행"
          offLabel="진료실 미실행"
          onToggle={onToggleClinic}
          disabled={!linked}
        />
      </div>

      <div className="flex items-center text-[var(--icon-sub)]">
        <button className="flex h-9 w-11 items-center justify-center hover:bg-[var(--bg-subtle)]">
          <Minus className="h-4 w-4" />
        </button>
        <button className="flex h-9 w-11 items-center justify-center hover:bg-[var(--bg-subtle)]">
          <Square className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-9 w-11 items-center justify-center hover:bg-[var(--red-500)] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
