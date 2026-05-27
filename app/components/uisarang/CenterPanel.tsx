import { AudioLines, Pause } from "lucide-react";
import { currentPatient } from "./data";
import { SoapView } from "./SoapView";
import { MedicalHistorySummary } from "./MedicalHistorySummary";

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

function RecordingStatus() {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-[var(--gray-800)] bg-[var(--gray-900)] px-6 py-3 text-white">
      <span className="flex items-center gap-2 text-[13px] font-medium">
        <AudioLines className="h-4 w-4" />
        녹음 중
        <span className="tabular-nums text-[var(--gray-200)]">3:57</span>
      </span>
      <button className="flex items-center gap-1.5 text-[13px] text-[var(--gray-200)] hover:text-white">
        <Pause className="h-4 w-4" />
        일시정지
      </button>
    </div>
  );
}

export function CenterPanel() {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[var(--bg-subtle)]">
      <div className="bg-[var(--bg-base)]">
        <PatientHeader />
      </div>

      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <div className="flex w-[480px] shrink-0 min-w-0 flex-col">
          <MedicalHistorySummary />
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto">
          <SoapView />
        </div>
      </div>
    </main>
  );
}
