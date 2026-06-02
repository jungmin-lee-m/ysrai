import { useState, useEffect, useRef } from "react";
import { PanelLeft, Mic, X, UserRound } from "lucide-react";
import { TitleBar } from "./TitleBar";
import { LeftSidebar, type MainView } from "./LeftSidebar";
import { CenterPanel } from "./CenterPanel";
import { Landing } from "./Landing";
import { ChatView, DockedChat, FloatingChat, type ChatMsg } from "./ChatPanel";
import { fmtTime, outpatients, type RecState, type QueuePatient } from "./data";

type View = "landing" | "clinic" | "chat";

const MOCK_REPLY =
  "현재 암로디핀 5mg 단독으로 혈압 조절이 불량하므로, 용량 증량보다는 ACE 억제제 또는 이뇨제 병용을 우선 고려할 수 있습니다. 신기능·전해질 수치를 함께 확인하세요.";

export function UisarangScreen() {
  const [view, setView] = useState<View>("landing");
  const [leftOpen, setLeftOpen] = useState(true);
  const [linked, setLinked] = useState(true);
  const [clinicRunning, setClinicRunning] = useState(true);
  const [rec, setRec] = useState<RecState>("idle");
  const [secs, setSecs] = useState(0);
  const [viewed, setViewed] = useState<QueuePatient | null>(null); // 보고 있는 환자
  const [recPatient, setRecPatient] = useState<QueuePatient | null>(null); // 녹음 중인 환자
  const [pickerOpen, setPickerOpen] = useState(false); // 녹음 시작 시 환자 선택 팝업

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const idRef = useRef(1);

  useEffect(() => {
    if (rec !== "recording") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [rec]);

  const queueAvailable = linked && clinicRunning;

  // 프로토타입 상태 토글 → 세션 초기화
  const resetSession = () => {
    setViewed(null);
    setRecPatient(null);
    setRec("idle");
    setSecs(0);
    setPickerOpen(false);
  };
  const toggleLinked = () => {
    setLinked((v) => !v);
    resetSession();
  };
  const toggleClinic = () => {
    setClinicRunning((v) => !v);
    resetSession();
  };

  // 환자 클릭(보기만): 녹음은 그대로 진행 (녹음 대상 환자 유지)
  const viewPatient = (p: QueuePatient) => setViewed(p);

  // 특정 환자로 녹음 시작 (기존 녹음은 끊고 새로 시작)
  const startRecording = (p: QueuePatient | null) => {
    setViewed(p);
    setRecPatient(p);
    setSecs(0);
    setRec("recording");
    setPickerOpen(false);
  };

  // 호출하기 = 해당 환자로 바로 녹음
  const callPatient = (p: QueuePatient) => startRecording(p);

  // 녹음 시작 요청: 대기 환자 있으면 선택 팝업, 없으면 환자 미지정으로 시작
  const requestStart = () => {
    if (queueAvailable && outpatients.length > 0) setPickerOpen(true);
    else startRecording(null);
  };

  // 중앙 바: 보고 있는 환자로 녹음 시작
  const recordViewed = () => startRecording(viewed);

  // 좌측 바: 녹음 중인 환자 화면으로 전환
  const jumpToRecording = () => setViewed(recPatient);

  // 중지: 녹음 완료 + 해당 환자 화면으로 전환(SOAP 바로 보기)
  const stopRec = () => {
    setRec("done");
    setViewed(recPatient);
  };

  const pushChat = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { id: idRef.current++, role: "user", text: t },
      { id: idRef.current++, role: "ai", text: MOCK_REPLY },
    ]);
  };
  const sendChat = () => {
    pushChat(draft);
    setDraft("");
  };

  const chatProps = {
    messages,
    draft,
    setDraft,
    onSend: sendChat,
    onQuick: pushChat,
    linked,
  };

  const sidebarProps = {
    rec,
    secs,
    linked,
    clinicRunning,
    view: view === "chat" ? ("chat" as MainView) : ("clinic" as MainView),
    onChangeView: (v: MainView) => setView(v),
    onViewPatient: viewPatient,
    onCallPatient: callPatient,
    onRequestStart: requestStart,
    onJumpToRecording: jumpToRecording,
    recordingChartNo: rec === "recording" ? recPatient?.chartNo ?? null : null,
    recPatientName: recPatient?.name,
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-subtle)] text-[var(--text-main)]">
      <TitleBar
        linked={linked}
        onToggleLinked={toggleLinked}
        clinicRunning={clinicRunning}
        onToggleClinic={toggleClinic}
        onHome={() => setView("landing")}
      />

      {view === "landing" ? (
        <Landing
          linked={linked}
          clinicRunning={clinicRunning}
          onSelect={(v) => setView(v)}
        />
      ) : (
        <div className="relative flex min-h-0 flex-1">
          {leftOpen ? (
            <LeftSidebar onClose={() => setLeftOpen(false)} {...sidebarProps} />
          ) : (
            <div className="group relative z-20 flex w-11 shrink-0 flex-col items-center border-r border-[var(--line-subtle)] bg-[var(--bg-base)]">
              {/* 펼치기 */}
              <button
                onClick={() => setLeftOpen(true)}
                aria-label="패널 열기"
                className="mt-3 rounded-[var(--radius-md)] p-1.5 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
              >
                <PanelLeft className="h-[18px] w-[18px]" />
              </button>

              {/* 접힌 상태에서도 녹음 상태 표시 (녹음 중 / 녹음 대기) */}
              <div className="mt-3 flex flex-col items-center gap-1">
                {rec === "recording" ? (
                  <div className="flex flex-col items-center gap-1 text-[var(--red-500)]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--red-500)]" />
                    <Mic className="h-4 w-4" />
                    <span className="text-[9px] font-medium tabular-nums [writing-mode:vertical-rl]">
                      {fmtTime(secs)}
                    </span>
                  </div>
                ) : (
                  <Mic className="h-4 w-4 text-[var(--text-tertiary)]" />
                )}
              </div>

              {/* 호버 시 펼쳐지는 오버레이 패널 (콘텐츠 위로) */}
              <div className="invisible absolute left-0 top-0 z-30 flex h-full -translate-x-1 opacity-0 shadow-2xl transition-all duration-150 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100">
                <LeftSidebar onClose={() => setLeftOpen(true)} {...sidebarProps} />
              </div>
            </div>
          )}

          {view === "clinic" ? (
            <>
              <CenterPanel
                rec={rec}
                secs={secs}
                onStartViewed={recordViewed}
                onStop={stopRec}
                onRequestStart={requestStart}
                onJump={jumpToRecording}
                linked={linked}
                viewed={viewed}
                recPatient={recPatient}
              />
              {/* 넓은 화면: 우측 대화 패널 / 좁은 화면: 플로팅 (현재 환자 컨텍스트) */}
              <DockedChat {...chatProps} hint="현재 진료 중인 환자 정보를 바탕으로 답변해 드려요." />
              <FloatingChat
                {...chatProps}
                hint="현재 진료 중인 환자 정보를 바탕으로 답변해 드려요."
              />
            </>
          ) : (
            <ChatView
              {...chatProps}
              hint="일반 의학 질문이나 의사랑 데이터 기반 통계·분석을 물어보세요."
            />
          )}
        </div>
      )}

      {/* 녹음 시작 시 환자 선택 팝업 */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-[min(360px,100%)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line-default)] bg-[var(--bg-base)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-3">
              <span className="text-[14px] font-semibold text-[var(--text-main)]">
                녹음할 환자 선택
              </span>
              <button
                onClick={() => setPickerOpen(false)}
                aria-label="닫기"
                className="rounded-[var(--radius-md)] p-1 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
              {outpatients.map((p) => (
                <button
                  key={p.chartNo}
                  onClick={() => startRecording(p)}
                  className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <span className="shrink-0 rounded-[var(--radius-xs)] border border-[var(--line-default)] px-1 text-[10px] tabular-nums text-[var(--text-tertiary)]">
                    {p.chartNo}
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--text-main)]">
                    {p.name}
                  </span>
                  <span className="text-[11px] tabular-nums text-[var(--text-tertiary)]">
                    {p.sex}/{p.age}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-[var(--line-subtle)] p-2">
              <button
                onClick={() => startRecording(null)}
                className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-[13px] font-medium text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]"
              >
                <UserRound className="h-4 w-4" />
                환자 미지정으로 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
