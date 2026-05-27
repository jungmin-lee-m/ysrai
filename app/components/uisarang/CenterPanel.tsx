import { currentPatient, type RecState } from "./data";
import { ConversationView } from "./ConversationView";

function Divider() {
  return <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />;
}

function PatientHeader() {
  const p = currentPatient;
  return (
    <div className="shrink-0 border-b border-[var(--line-subtle)] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
        <span className="rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 py-0.5 text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {p.chartNo}
        </span>
        <span className="text-[14px] font-semibold text-[var(--text-main)]">{p.name}</span>
        <Divider />
        <span className="tabular-nums text-[var(--text-sub)]">{p.ssn}</span>
        <Divider />
        <span className="text-[var(--text-sub)]">
          {p.age}세/{p.sex}
        </span>
        <Divider />
        <span className="rounded-[var(--radius-sm)] bg-[var(--status-warning-bg-subtle)] px-1 py-0.5 text-[11px] font-medium text-[var(--status-warning-text-main)]">
          {p.insurance}
        </span>
        <Divider />
        <span className="tabular-nums text-[var(--text-sub)]">{p.phone}</span>
      </div>

      <div className="mt-1.5 truncate text-[12px] text-[var(--text-sub)]">{p.memo}</div>
    </div>
  );
}

export function CenterPanel({
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
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[var(--bg-subtle)]">
      <PatientHeader />
      <div className="min-h-0 flex-1">
        <ConversationView rec={rec} secs={secs} onStart={onStart} onStop={onStop} />
      </div>
    </main>
  );
}
