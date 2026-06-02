import { useState, useRef, useEffect } from "react";
import { Sparkles, SendHorizontal, Plus, MessageSquare, X } from "lucide-react";
import { cn } from "../ui/utils";
import { quickActions } from "./data";

export type ChatMsg = { id: number; role: "user" | "ai"; text: string };

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-[var(--radius-lg)] rounded-tr-sm bg-[var(--bg-service)] px-3 py-2 text-[13px] leading-relaxed text-white">
        {text}
      </div>
    </div>
  );
}

function AiBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-service-subtle)]">
        <Sparkles className="h-3.5 w-3.5 text-[var(--text-service-primary)]" />
      </span>
      <div className="min-w-0 flex-1 rounded-[var(--radius-lg)] rounded-tl-sm border border-[var(--line-default)] bg-[var(--bg-base)] px-3 py-2 text-[13px] leading-relaxed text-[var(--text-main)]">
        {text}
      </div>
    </div>
  );
}

function Conversation({ messages, hint }: { messages: ChatMsg[]; hint?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-service-subtle)]">
            <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
          </span>
          <div className="text-[13px] font-medium text-[var(--text-main)]">무엇이든 물어보세요</div>
          <p className="max-w-[260px] text-[12px] leading-relaxed text-[var(--text-tertiary)]">
            {hint ?? "일반 의학 질문이나 의사랑 데이터 기반 통계·분석을 물어보세요."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) =>
            m.role === "user" ? (
              <UserBubble key={m.id} text={m.text} />
            ) : (
              <AiBubble key={m.id} text={m.text} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function Composer({
  draft,
  setDraft,
  onSend,
  onQuick,
  linked,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onQuick: (q: string) => void;
  linked: boolean;
}) {
  return (
    <div className="shrink-0 border-t border-[var(--line-subtle)] p-3">
      {/* 추천 질문 빠른 실행 */}
      {linked && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickActions.map((q) => (
            <button
              key={q}
              onClick={() => onQuick(q)}
              className="flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--line-default)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-sub)] transition-colors hover:border-[var(--violet-200)] hover:bg-[var(--bg-service-subtle)] hover:text-[var(--text-service-primary)]"
            >
              <Sparkles className="h-3 w-3 text-[var(--text-service-primary)]" />
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (linked && e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          disabled={!linked}
          placeholder={
            linked ? "환자 관련 질문을 해보세요." : "의사랑 연동 시 AI 어시스턴트 사용 가능"
          }
          className={cn(
            "w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-[13px] leading-relaxed outline-none placeholder:text-[var(--text-placeholder)]",
            linked ? "text-[var(--text-main)]" : "cursor-not-allowed text-[var(--text-disabled)]",
          )}
        />
        <div className="flex items-center gap-2 px-2 pb-2">
          <button
            type="button"
            aria-label="추가"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={linked ? onSend : undefined}
            disabled={!linked}
            title={linked ? undefined : "의사랑 연동 시 사용 가능"}
            className={cn(
              "ml-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]",
              linked
                ? "bg-[var(--bg-service-subtle)] text-[var(--text-service-primary)] hover:bg-[var(--violet-100)]"
                : "cursor-not-allowed bg-[var(--bg-subtle)] text-[var(--text-disabled)]",
            )}
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-[var(--line-subtle)] px-3 py-2.5">
      <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
      <span className="text-[14px] font-semibold text-[var(--text-main)]">AI 어시스턴트</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="대화창 닫기"
          className="ml-auto rounded-[var(--radius-md)] p-1 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

type ChatProps = {
  messages: ChatMsg[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onQuick: (q: string) => void;
  linked: boolean;
  hint?: string;
  raised?: boolean; // 하단 녹음바와 겹치지 않게 위로 올림
};

/* 넓은 화면: 우측 도킹 패널 */
export function DockedChat(props: ChatProps) {
  return (
    <aside className="hidden w-[360px] shrink-0 flex-col border-l border-[var(--line-subtle)] bg-[var(--bg-base)] min-[1280px]:flex">
      <Header />
      <Conversation messages={props.messages} hint={props.hint} />
      <Composer
        draft={props.draft}
        setDraft={props.setDraft}
        onSend={props.onSend}
        onQuick={props.onQuick}
        linked={props.linked}
      />
    </aside>
  );
}

/* 대화 모드: 메인 영역 전체 채팅 */
export function ChatView(props: ChatProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[var(--bg-subtle)]">
      <div className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col">
        <Conversation messages={props.messages} hint={props.hint} />
        <Composer
          draft={props.draft}
          setDraft={props.setDraft}
          onSend={props.onSend}
          onQuick={props.onQuick}
          linked={props.linked}
        />
      </div>
    </main>
  );
}

/* 좁은 화면: 플로팅 버튼 + 팝오버 */
export function FloatingChat(props: ChatProps) {
  const [open, setOpen] = useState(false);

  // 녹음바가 보일 때(raised) 하단 여백을 더 줘서 종료 버튼을 가리지 않게
  const bottomClass = props.raised ? "bottom-[64px]" : "bottom-5";

  return (
    <div className="min-[1280px]:hidden">
      {open ? (
        <div
          className={cn(
            "fixed right-5 z-40 flex h-[min(520px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line-default)] bg-[var(--bg-base)] shadow-2xl",
            bottomClass,
          )}
        >
          <Header onClose={() => setOpen(false)} />
          <Conversation messages={props.messages} hint={props.hint} />
          <Composer
            draft={props.draft}
            setDraft={props.setDraft}
            onSend={props.onSend}
            onQuick={props.onQuick}
            linked={props.linked}
          />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="AI 어시스턴트 열기"
          className={cn(
            "fixed right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-service)] text-white shadow-xl transition-transform hover:scale-105",
            bottomClass,
          )}
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
