import { Mic, Square, Check, Pause, UserRound } from "lucide-react";
import { fmtTime, type RecState } from "./data";

/* 녹음 중 파형 */
function Waveform() {
  const bars = [0.5, 0.8, 1, 0.65, 0.9, 0.45, 0.75, 1, 0.6];
  return (
    <span className="flex h-4 items-center gap-[2px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="ysrai-wave-bar w-[2.5px] rounded-full bg-current"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  );
}

/* 녹음 대상 환자 칩 */
function PatientChip({ name, dark }: { name?: string; dark?: boolean }) {
  return (
    <span
      className={
        "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-[var(--radius-full)] px-2 py-0.5 text-[12px] font-semibold " +
        (dark ? "bg-white/15 text-white" : "bg-[var(--bg-base)] text-[var(--text-main)]")
      }
    >
      <UserRound className="h-3 w-3 shrink-0" />
      {name ?? "환자 미지정"}
    </span>
  );
}

export function RecordBar({
  rec,
  secs,
  onStart,
  onStop,
  patientName,
  otherPatient,
  onJump,
}: {
  rec: RecState;
  secs: number;
  onStart: () => void;
  onStop: () => void;
  patientName?: string;
  otherPatient?: boolean; // 보고 있는 환자가 녹음 대상과 다를 때
  onJump?: () => void; // 녹음 중인 환자 화면으로 이동
}) {
  return (
    <div className="shrink-0 border-b border-[var(--line-subtle)] bg-[var(--bg-base)] px-4 py-2">
      {rec === "idle" && (
        <button
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--gray-900)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--gray-800)]"
        >
          <Mic className="h-4 w-4" />
          녹음 시작
        </button>
      )}

      {rec === "recording" && (
        <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--gray-900)] px-4 py-2 text-white">
          {otherPatient ? (
            <button
              onClick={onJump}
              title="녹음 중인 환자 화면으로 이동"
              className="flex min-w-0 items-center gap-2.5 text-left text-[13px] font-medium"
            >
              <span className="shrink-0 text-[var(--red-200)]">
                <Waveform />
              </span>
              <span className="shrink-0">다른 환자 녹음 중</span>
              <PatientChip name={patientName} dark />
              <span className="shrink-0 tabular-nums text-[var(--gray-200)]">{fmtTime(secs)}</span>
            </button>
          ) : (
            <span className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium">
              <span className="shrink-0 text-[var(--red-200)]">
                <Waveform />
              </span>
              <span className="shrink-0">녹음 중</span>
              <PatientChip name={patientName} dark />
              <span className="shrink-0 tabular-nums text-[var(--gray-200)]">{fmtTime(secs)}</span>
            </span>
          )}
          <div className="flex shrink-0 items-center gap-2">
            {!otherPatient && (
              <button className="flex items-center gap-1 text-[12px] text-[var(--gray-200)] hover:text-white">
                <Pause className="h-3.5 w-3.5" />
                일시정지
              </button>
            )}
            <button
              onClick={onStop}
              aria-label="녹음 정지"
              className="flex h-7 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--red-500)] px-2.5 text-[12px] font-medium text-white hover:bg-[var(--red-700)]"
            >
              <Square className="h-3 w-3 fill-current" />
              {otherPatient ? "중지" : "종료"}
            </button>
          </div>
        </div>
      )}

      {rec === "done" && (
        <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-subtle)] px-4 py-2">
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-[var(--text-main)]">
            <Check className="h-4 w-4 shrink-0 text-[var(--status-success-text-main)]" />
            <span className="shrink-0">녹음 완료</span>
            <PatientChip name={patientName} />
            <span className="shrink-0 tabular-nums text-[var(--text-tertiary)]">
              {fmtTime(secs)}
            </span>
          </span>
          <button
            onClick={onStart}
            className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-service-primary)] hover:bg-[var(--bg-service-subtle)]"
          >
            <Mic className="h-3.5 w-3.5" />
            다시 녹음
          </button>
        </div>
      )}
    </div>
  );
}
