import { useState } from "react";
import {
  Plus,
  Mic,
  PanelLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Power,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "../ui/utils";
import {
  outpatients,
  reservations,
  completed,
  conversations,
  groupByDate,
  fmtTime,
  type QueuePatient,
  type RecState,
} from "./data";


export type MainView = "chat" | "clinic";

/* 녹음 중 파형 (중앙 녹음바와 동일 언어) */
function MiniWave() {
  const bars = [0.5, 0.9, 0.6, 1, 0.7];
  return (
    <span className="flex h-3.5 items-center gap-[2px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="ysrai-wave-bar w-[2px] rounded-full bg-current"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  );
}

const statusStyle: Record<string, string> = {
  진료중: "bg-[var(--brand-primary)] text-white",
  응급: "bg-[var(--red-500)] text-white",
  검사: "bg-[var(--bg-primary-subtle)] text-[var(--text-link)]",
  보류: "bg-[var(--bg-neutral)] text-[var(--text-sub)]",
  시술: "bg-[var(--bg-service-subtle)] text-[var(--text-service-primary)]",
  수납대기: "bg-[var(--status-warning-bg-subtle)] text-[var(--status-warning-text-main)]",
  수납완료: "bg-[var(--status-success-bg-subtle)] text-[var(--status-success-text-main)]",
};

function StatusBadge({
  status,
  fade,
  compact,
}: {
  status: string;
  fade?: boolean;
  compact?: boolean;
}) {
  const isPayment = status === "수납대기" || status === "수납완료";
  const colorClass = isPayment
    ? "bg-[var(--bg-subtle)] text-[var(--text-tertiary)]"
    : statusStyle[status] ?? "bg-[var(--bg-neutral)] text-[var(--text-sub)]";

  if (compact) {
    // 좁은 폭: 뱃지 첫 글자만
    return (
      <span
        title={status}
        className={cn(
          "ml-auto flex h-[16px] min-w-[16px] shrink-0 items-center justify-center rounded-[var(--radius-xs)] px-0.5 text-[10px] font-semibold",
          colorClass,
          fade && "transition-opacity group-hover/row:opacity-0",
        )}
      >
        {status.charAt(0)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "ml-auto shrink-0",
        isPayment
          ? "rounded-[var(--radius-xs)] bg-[var(--bg-subtle)] px-1 py-px text-[9px] font-medium text-[var(--text-tertiary)]"
          : cn(
              "rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold",
              statusStyle[status] ?? "bg-[var(--bg-neutral)] text-[var(--text-sub)]",
            ),
        fade && "transition-opacity group-hover/row:opacity-0",
      )}
    >
      {status}
    </span>
  );
}

function PatientRow({
  p,
  status,
  callable,
  onCall,
  onView,
  linked = true,
  compact = false,
}: {
  p: QueuePatient;
  status?: string;
  callable?: boolean;
  onCall?: (p: QueuePatient) => void;
  onView?: (p: QueuePatient) => void;
  linked?: boolean;
  compact?: boolean;
}) {
  const active = status === "진료중";
  const showCall = callable && !active;

  return (
    <div
      onClick={() => onView?.(p)}
      className={cn(
        "group/row relative flex w-full cursor-pointer flex-col gap-1 rounded-[var(--radius-md)] px-3 py-2 transition-colors",
        active ? "bg-[var(--bg-primary-subtle)]" : "hover:bg-[var(--bg-subtle)]",
      )}
    >
      {/* 차트번호 · 이름 · 나이/성별 · 신환 · 상태 */}
      <div className="flex items-center gap-1.5">
        <span className="shrink-0 rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 text-[10px] tabular-nums text-[var(--text-tertiary)]">
          {p.chartNo}
        </span>
        <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-[var(--text-main)]">
          {p.name}
        </span>
        <span className="min-w-0 overflow-hidden whitespace-nowrap text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {p.sex}/{p.age}
        </span>
        {p.isNew && !compact && (
          <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--violet-200)] text-[10px] font-semibold text-[var(--text-service-primary)]">
            N
          </span>
        )}
        {status && <StatusBadge status={status} fade={showCall} compact={compact} />}
      </div>

      {/* 접수시간 | (보험구분) | 특기사항 */}
      <div className="flex items-center gap-1 text-[11px]">
        <span className="shrink-0 tabular-nums text-[var(--text-tertiary)]">{p.time}</span>
        {!compact && (
          <>
            <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />
            <span className="shrink-0 text-[var(--text-tertiary)]">{p.insurance}</span>
          </>
        )}
        <span className="h-2.5 w-px shrink-0 bg-[var(--line-default)]" />
        <span className="min-w-0 flex-1 truncate text-[var(--text-sub)]">{p.memo}</span>
      </div>

      {/* 호버 시 호출 버튼 (미연동 시 비활성 표시) */}
      {showCall && (
        <button
          onClick={
            linked
              ? (e) => {
                  e.stopPropagation();
                  onCall?.(p);
                }
              : (e) => e.stopPropagation()
          }
          disabled={!linked}
          title={linked ? undefined : "의사랑 연동 시 사용 가능"}
          className={cn(
            "absolute right-2 top-1.5 rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover/row:opacity-100",
            linked
              ? "bg-[var(--bg-service)] text-white"
              : "cursor-not-allowed bg-[var(--bg-neutral)] text-[var(--text-disabled)]",
          )}
        >
          호출하기
        </button>
      )}
    </div>
  );
}

function Section({
  label,
  count,
  open,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--bg-subtle)]"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--icon-sub)] transition-transform",
            !open && "-rotate-90",
          )}
        />
        <span className="text-[13px] font-semibold text-[var(--text-main)]">{label}</span>
        <span className="ml-auto text-[11px] tabular-nums text-[var(--text-tertiary)]">{count}</span>
      </button>
      {open && <div className="mb-1 mt-0.5 space-y-0.5">{children}</div>}
    </div>
  );
}

function DateHeader({ label }: { label: string }) {
  return (
    <div className="px-2 pb-0.5 pt-1 text-[11px] font-semibold text-[var(--text-tertiary)]">
      {label}
    </div>
  );
}

/* ── 진료 날짜 + 달력 ── */
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtDateLabel(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd} (${WEEKDAYS[d.getDay()]})`;
}

function fmtDateShort(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}.${dd} (${WEEKDAYS[d.getDay()]})`;
}

function MiniCalendar({
  value,
  today,
  onSelect,
}: {
  value: Date;
  today: Date;
  onSelect: (d: Date) => void;
}) {
  const [vm, setVm] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const year = vm.getFullYear();
  const month = vm.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="absolute left-2 right-2 top-full z-30 mt-1 rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)] p-2 shadow-xl">
      <div className="flex items-center justify-between px-1 pb-1.5">
        <button
          onClick={() => setVm(new Date(year, month - 1, 1))}
          className="rounded-[var(--radius-sm)] p-1 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] font-semibold text-[var(--text-main)] tabular-nums">
          {year}.{String(month + 1).padStart(2, "0")}
        </span>
        <button
          onClick={() => setVm(new Date(year, month + 1, 1))}
          className="rounded-[var(--radius-sm)] p-1 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-0.5 text-[10px] text-[var(--text-tertiary)]">
            {w}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={i} />
          ) : (
            (() => {
              const date = new Date(year, month, d);
              const selected = sameDay(date, value);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={i}
                  onClick={() => onSelect(date)}
                  className={cn(
                    "mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] tabular-nums transition-colors",
                    selected
                      ? "bg-[var(--bg-service)] font-semibold text-white"
                      : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]",
                    !selected && isToday && "ring-1 ring-[var(--violet-200)]",
                  )}
                >
                  {d}
                </button>
              );
            })()
          ),
        )}
      </div>
    </div>
  );
}

export function LeftSidebar({
  onClose,
  rec,
  secs,
  linked,
  clinicRunning,
  view,
  onChangeView,
  onViewPatient,
  onCallPatient,
  onRequestStart,
  onJumpToRecording,
  recordingChartNo,
  recPatientName,
}: {
  onClose: () => void;
  rec: RecState;
  secs: number;
  linked: boolean;
  clinicRunning: boolean;
  view: MainView;
  onChangeView: (v: MainView) => void;
  onViewPatient: (p: QueuePatient) => void;
  onCallPatient: (p: QueuePatient) => void;
  onRequestStart: () => void;
  onJumpToRecording: () => void;
  recordingChartNo: string | null;
  recPatientName?: string;
}) {
  const [width, setWidth] = useState(240);
  const queueAvailable = linked && clinicRunning;
  const compact = width < 212;

  // 진료 날짜 + 달력
  const TODAY = new Date(2026, 5, 2);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [calOpen, setCalOpen] = useState(false);
  const isToday = sameDay(selectedDate, TODAY);
  // 오늘 = 대기 / 과거 = 완료 / 미래 = 예약 (기본 펼침)
  const [sections, setSections] = useState({ wait: true, reserve: false, done: false });
  const toggleSection = (key: "wait" | "reserve" | "done") =>
    setSections((s) => ({ ...s, [key]: !s[key] }));
  const pickDate = (d: Date) => {
    setSelectedDate(d);
    setCalOpen(false);
    if (sameDay(d, TODAY)) setSections({ wait: true, reserve: false, done: false });
    else if (d.getTime() < TODAY.getTime()) setSections({ wait: false, reserve: false, done: true });
    else setSections({ wait: false, reserve: true, done: false });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => setWidth(Math.min(460, Math.max(184, ev.clientX)));
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
  };


  return (
    <aside
      style={{ width }}
      className="relative flex shrink-0 flex-col border-r border-[var(--line-subtle)] bg-[var(--bg-base)]"
    >
      {/* 최상단: 녹음 시작 버튼 / 녹음 중(환자명 클릭 시 해당 환자 녹음 화면으로) + 패널 닫기 */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        {rec === "recording" ? (
          <button
            onClick={onJumpToRecording}
            title="녹음 중인 환자 화면으로 이동"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--gray-900)] px-3 py-1.5 text-left text-white transition-colors hover:bg-[var(--gray-800)]"
          >
            <span className="shrink-0 text-[var(--red-200)]">
              <MiniWave />
            </span>
            {!compact && (
              <span className="truncate text-[13px] font-semibold">
                {recPatientName ?? "환자 미지정"}
              </span>
            )}
            <span className="ml-auto shrink-0 tabular-nums text-[12px] text-[var(--gray-200)]">
              {fmtTime(secs)}
            </span>
          </button>
        ) : (
          <button
            onClick={onRequestStart}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--gray-900)] px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--gray-800)]"
          >
            <Mic className="h-4 w-4 shrink-0" />
            {!compact && "녹음 시작"}
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="패널 닫기"
          className="shrink-0 rounded-[var(--radius-md)] p-1.5 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* 상위 탭: 대화 / AI 진료 */}
      <div className="px-3 pb-2">
        <div className="flex rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-1">
          {(
            [
              ["chat", "대화"],
              ["clinic", "AI 진료"],
            ] as [MainView, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onChangeView(key)}
              className={cn(
                "flex-1 rounded-[var(--radius-sm)] py-1.5 text-[13px] font-medium transition-colors",
                view === key
                  ? "bg-[var(--bg-base)] text-[var(--text-service-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 새 대화 (대화 탭에서만) */}
      {view === "chat" && (
        <div className="px-3 pb-2">
          <button className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[14px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            <Plus className="h-4 w-4 text-[var(--text-service-primary)]" />새 대화
          </button>
        </div>
      )}

      {/* 내용 */}
      <div className="flex min-h-0 flex-1 flex-col">
        {view === "chat" ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
            {groupByDate(conversations).map((group) => (
              <div key={group.label}>
                <DateHeader label={group.label} />
                <div className="space-y-0.5">
                  {group.items.map((c, i) => (
                    <button
                      key={c.title + i}
                      className="flex w-full items-center rounded-[var(--radius-md)] px-3 py-1.5 text-left transition-colors hover:bg-[var(--bg-subtle)]"
                    >
                      <span className="truncate text-[13px] text-[var(--text-main)]">{c.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : queueAvailable ? (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* 진료 날짜 + 달력 */}
            <div className="relative shrink-0 px-2 pb-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCalOpen((v) => !v)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--bg-subtle)]"
                >
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-[var(--icon-sub)]" />
                  <span className="min-w-0 truncate text-[13px] font-semibold text-[var(--text-main)] tabular-nums">
                    {compact ? fmtDateShort(selectedDate) : fmtDateLabel(selectedDate)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-3.5 w-3.5 shrink-0 text-[var(--icon-sub)] transition-transform",
                      calOpen && "rotate-180",
                    )}
                  />
                </button>
                {!isToday && (
                  <button
                    onClick={() => pickDate(TODAY)}
                    className="shrink-0 whitespace-nowrap rounded-[var(--radius-md)] bg-[var(--bg-service-subtle)] px-2 py-1 text-[11px] font-medium text-[var(--text-service-primary)] hover:bg-[var(--violet-100)]"
                  >
                    오늘
                  </button>
                )}
              </div>
              {calOpen && <MiniCalendar value={selectedDate} today={TODAY} onSelect={pickDate} />}
            </div>

            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
              <Section
                label="대기"
                count={outpatients.length}
                open={sections.wait}
                onToggle={() => toggleSection("wait")}
              >
                {outpatients.map((p) => (
                  <PatientRow
                    key={p.chartNo}
                    p={p}
                    status={recordingChartNo === p.chartNo ? "진료중" : p.status}
                    callable
                    onCall={onCallPatient}
                    onView={onViewPatient}
                    linked={linked}
                    compact={compact}
                  />
                ))}
              </Section>
              <Section
                label="예약"
                count={reservations.length}
                open={sections.reserve}
                onToggle={() => toggleSection("reserve")}
              >
                {reservations.map((p) => (
                  <PatientRow key={p.chartNo} p={p} onView={onViewPatient} compact={compact} />
                ))}
              </Section>
              <Section
                label="완료"
                count={completed.length}
                open={sections.done}
                onToggle={() => toggleSection("done")}
              >
                {completed.map((p) => (
                  <PatientRow
                    key={p.chartNo}
                    p={p}
                    status={p.payment}
                    onView={onViewPatient}
                    compact={compact}
                  />
                ))}
              </Section>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-neutral)] text-[var(--text-tertiary)]">
              <Power className="h-4 w-4" />
            </span>
            <p className="text-[12.5px] leading-relaxed text-[var(--text-tertiary)]">
              {linked
                ? "진료실을 실행하면 대기 환자 목록이 표시됩니다. 상단 녹음 시작으로 환자 미지정 STT도 가능해요."
                : "의사랑 미연동 상태입니다. 상단 녹음 시작으로 환자 미지정 STT·SOAP를 사용할 수 있어요."}
            </p>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2 border-t border-[var(--line-subtle)] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-service-subtle)] text-[12px] font-semibold text-[var(--text-service-primary)]">
          김
        </span>
        <span className="text-[13px] font-medium text-[var(--text-main)]">김유비</span>
        <span className="text-[12px] text-[var(--text-tertiary)]">메디아이의원</span>
      </div>

      {/* 리사이즈 핸들 */}
      <div
        onMouseDown={startResize}
        className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize hover:bg-[var(--bg-service)]/30"
      />
    </aside>
  );
}
