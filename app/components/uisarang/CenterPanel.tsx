import { AudioLines, Mic } from "lucide-react";
import { diagnoses, prescriptions, type QueuePatient, type RecState } from "./data";
import { MedicalHistorySummary } from "./MedicalHistorySummary";
import { SoapCard, CodeCard } from "./ResultCards";
import { RecordBar } from "./RecordBar";

function Divider() {
  return <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />;
}

function PatientHeader({ p }: { p: QueuePatient }) {
  return (
    <div className="shrink-0 border-b border-[var(--line-subtle)] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
        <span className="rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 py-0.5 text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {p.chartNo}
        </span>
        <span className="text-[14px] font-semibold text-[var(--text-main)]">{p.name}</span>
        <Divider />
        <span className="text-[var(--text-sub)]">
          {p.age}세/{p.sex}
        </span>
        <Divider />
        <span className="rounded-[var(--radius-sm)] bg-[var(--status-warning-bg-subtle)] px-1 py-0.5 text-[11px] font-medium text-[var(--status-warning-text-main)]">
          {p.insurance}
        </span>
        {p.isNew && (
          <span className="rounded-[var(--radius-sm)] border border-[var(--violet-200)] px-1 py-0.5 text-[11px] font-medium text-[var(--text-service-primary)]">
            신환
          </span>
        )}
      </div>
      <div className="mt-1.5 truncate text-[12px] text-[var(--text-sub)]">{p.memo}</div>
    </div>
  );
}

function SummaryBlock() {
  return <MedicalHistorySummary />;
}

export function CenterPanel({
  rec,
  secs,
  onStartViewed,
  onStop,
  onRequestStart,
  onJump,
  linked,
  viewed,
  recPatient,
}: {
  rec: RecState;
  secs: number;
  onStartViewed: () => void;
  onStop: () => void;
  onRequestStart: () => void;
  onJump: () => void;
  linked: boolean;
  viewed: QueuePatient | null;
  recPatient: QueuePatient | null;
}) {
  const sameRecorded = (viewed?.chartNo ?? null) === (recPatient?.chartNo ?? null);
  const recordingNow = rec === "recording";
  // 녹음 중이면 항상 녹음 세션을 표시(다른 환자 보는 중이어도). 완료는 그 환자 볼 때만.
  const cRec: RecState = recordingNow ? "recording" : rec === "done" && sameRecorded ? "done" : "idle";
  const otherPatient = recordingNow && !sameRecorded;

  const showResult = rec === "done" && sameRecorded;
  const showSummary = !!viewed && linked;
  const empty = !viewed && cRec === "idle";

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[var(--bg-subtle)]">
      {/* 중앙 녹음 바: 보는 환자 녹음(시작/파형/중지) · 다른 환자 녹음 중이면 알림+이동+중지 */}
      {!empty && (
        <RecordBar
          rec={cRec}
          secs={secs}
          onStart={onStartViewed}
          onStop={onStop}
          patientName={recPatient?.name}
          otherPatient={otherPatient}
          onJump={onJump}
        />
      )}

      {viewed && <PatientHeader p={viewed} />}

      {empty ? (
        // 환자 미지정/미선택 진입 → 중앙에 녹음 시작
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-service-subtle)]">
            <AudioLines className="h-7 w-7 text-[var(--text-service-primary)]" />
          </span>
          <div className="text-[15px] font-semibold text-[var(--text-main)]">AI 진료</div>
          <p className="max-w-[360px] text-[13px] leading-relaxed text-[var(--text-tertiary)]">
            {linked
              ? "왼쪽 목록에서 환자를 선택하거나, 녹음 시작으로 진료를 기록하세요."
              : "환자 선택 없이도 음성기록(STT)과 SOAP 생성을 사용할 수 있습니다."}
          </p>
          <button
            onClick={onRequestStart}
            className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--gray-900)] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[var(--gray-800)]"
          >
            <Mic className="h-4 w-4" />
            녹음 시작
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
          {showSummary && <SummaryBlock />}

          {!viewed && cRec !== "idle" && (
            <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--line-subtle)] bg-[var(--bg-base)] px-4 py-2.5 text-[13px] text-[var(--text-sub)]">
              <AudioLines className="h-4 w-4 text-[var(--text-service-primary)]" />
              환자 미지정 진료 — 음성기록으로 SOAP를 생성합니다.
            </div>
          )}

          {showResult && (
            <>
              <SoapCard linked={linked} />
              {/* 상병/처방 추천은 과거 차트 기반 → 환자 지정된 경우에만 */}
              {recPatient && <CodeCard title="상병" items={diagnoses} linked={linked} />}
              {recPatient && (
                <CodeCard title="처방" items={prescriptions} meta linked={linked} />
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
