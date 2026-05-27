import { useState } from "react";
import { Sparkles, SendHorizontal, X } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const MOCK_REPLY =
  "현재 암로디핀 5mg 단독으로 혈압 조절이 불량하므로, 용량 증량(10mg)보다는 ACE 억제제 또는 이뇨제 병용을 우선 고려할 수 있습니다. 신기능과 전해질 수치를 함께 확인하세요.";

function ChatInput({
  draft,
  setDraft,
  onSend,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--line-default)] bg-[var(--bg-base)] p-3 shadow-sm">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={1}
        placeholder="무엇이든 질문하세요."
        className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-[var(--text-main)] outline-none placeholder:text-[var(--text-placeholder)]"
      />
      <div className="mt-2 flex items-center">
        <span className="flex items-center gap-1.5 rounded-[var(--radius-full)] bg-[var(--bg-service-subtle)] px-2.5 py-1 text-[13px] font-medium text-[var(--text-service-primary)]">
          <Sparkles className="h-3.5 w-3.5" />
          AI 어시스턴트
        </span>
        <button
          onClick={onSend}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-service)] text-white"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ChatContent() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }, { role: "ai", text: MOCK_REPLY }]);
    setDraft("");
  };

  // 대화 전: 입력창 중앙
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-5">
        <h2 className="flex items-center gap-2 text-center text-[18px] font-semibold text-[var(--text-main)]">
          <Sparkles className="h-5 w-5 text-[var(--text-service-primary)]" />
          AI에게 질문해보세요.
        </h2>
        <div className="w-full">
          <ChatInput draft={draft} setDraft={setDraft} onSend={send} />
        </div>
      </div>
    );
  }

  // 대화 중: 메시지 위 + 입력창 하단
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-[var(--radius-lg)] rounded-tr-sm bg-[var(--bg-service)] px-3 py-2 text-[13px] leading-relaxed text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[92%] rounded-[var(--radius-lg)] rounded-tl-sm bg-[var(--bg-subtle)] px-3 py-2 text-[13px] leading-relaxed text-[var(--text-main)]">
                {m.text}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="shrink-0 border-t border-[var(--line-subtle)] px-3 py-3">
        <ChatInput draft={draft} setDraft={setDraft} onSend={send} />
      </div>
    </div>
  );
}

/** 넓은 화면: 우측 — 대화창 */
export function ChatPanelDocked() {
  return (
    <aside className="hidden w-[380px] shrink-0 flex-col border-l border-[var(--line-subtle)] bg-[var(--bg-base)] min-[1200px]:flex">
      <ChatContent />
    </aside>
  );
}

/** 좁은 화면: 대화창을 플로팅 버튼으로 접기 */
export function ChatFloating() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-[1200px]:hidden">
      {open && (
        <div className="fixed bottom-[5.5rem] right-5 z-50 flex h-[520px] max-h-[72vh] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line-default)] bg-[var(--bg-base)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--line-subtle)] px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--text-main)]">
              <Sparkles className="h-4 w-4 text-[var(--text-service-primary)]" />
              AI 어시스턴트
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] p-1 text-[var(--icon-sub)] hover:bg-[var(--bg-subtle)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <ChatContent />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI 어시스턴트"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-service)] text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>
    </div>
  );
}
