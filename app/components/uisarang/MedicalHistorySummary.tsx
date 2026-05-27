import { useState } from "react";
import { ChevronRight, LayoutGrid, Settings2 } from "lucide-react";
import { cn } from "../ui/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type NoteItem = { id: string; badge: string; content: string; updated: string | null };
type MedItem = {
  id: string;
  name: string;
  dose: string;
  since: string;
  history: string;
  isTapering?: boolean;
};
type ObsItem = {
  id: string;
  text: string;
  context: string;
  quote: string;
  confidence: number;
};
type Diagnosis = {
  id: string;
  name: string;
  meta: string;
  since: string;
  visits: number;
  lastVisit: string;
  meds: MedItem[];
  observations: ObsItem[];
};
type SeriesItem = {
  id: string;
  key: string;
  unit: string;
  dates: string[];
  vals: string[];
  colors: ("" | "high" | "low")[];
  normal: string;
};
type LabEntry =
  | { kind: "item"; data: SeriesItem }
  | { kind: "group"; id: string; name: string; items: SeriesItem[] };
type ProcSite = { site: string; count?: string; dates: string[] };
type ProcGroup = {
  id: string;
  name: string;
  category: string;
  sites: ProcSite[];
};
type VacItem = {
  id: string;
  name: string;
  date: string | null;
  series?: string;
  status: "recommended" | "completed" | "not-applicable";
  reason: string;
  schedule: string;
  history: { date: string; label?: string }[];
};

const PATIENT_B = {
  note: {
    tracked: ["smoke", "alcohol", "exercise", "weight", "family"],
    available: [
      { id: "smoke", badge: "흡연", content: "비흡연", updated: "25.04.10" },
      { id: "alcohol", badge: "음주", content: "주 1회 와인 1잔", updated: "25.04.10" },
      { id: "exercise", badge: "운동", content: "주 2~3회 요가", updated: "25.03.20" },
      { id: "weight", badge: "체중", content: "25년 들어 점진 증가 (~3kg)", updated: "25.04.10" },
      { id: "family", badge: "가족력", content: "HTN (부), lung ca. (모)", updated: "24.05.20" },
      { id: "job", badge: "직업력", content: "", updated: null },
    ] as NoteItem[],
  },
  dxMedsObs: {
    showCount: 3,
    aiObsOn: true,
    diagnoses: [
      {
        id: "hypo",
        name: "갑상선기능저하증",
        meta: "6년째",
        since: "2020년",
        visits: 18,
        lastVisit: "25.04.10",
        meds: [
          { id: "levo", name: "레보티록신", dose: "100mcg → 75mcg", since: "25.01~ 용량 조정", history: "50mcg → 100mcg 증량 (22.06), 100mcg → 75mcg 감량 (25.01)" },
        ],
        observations: [
          {
            id: "tremor",
            text: "손떨림 호소 증가",
            context: "24.11~25.02 · TSH 과다억제 → 용량 조정 후 호전",
            quote: '"손떨림 증상 심해짐, 글씨 쓰기 어려움 호소" — 24.11.20 진료기록',
            confidence: 0.82,
          },
          {
            id: "fatigue",
            text: "전신 피로감 호소 → 호전",
            context: "25.03~",
            quote: '"오후만 되면 기운 없고 졸리다, 최근 호전" — 25.03.18 진료기록',
            confidence: 0.71,
          },
        ],
      },
      {
        id: "ra",
        name: "류마티스 관절염",
        meta: "3년째",
        since: "2023년",
        visits: 12,
        lastVisit: "25.03.20",
        meds: [
          { id: "pred", name: "프레드니솔론", dose: "5mg → 2.5mg", since: "25년 4월~", history: "tapering 중 (5mg → 2.5mg, 25.04)", isTapering: true },
          { id: "mtx", name: "메토트렉세이트", dose: "7.5mg/week", since: "23년~", history: "7.5mg/week 유지" },
          { id: "folic", name: "엽산", dose: "5mg/week", since: "23년~ (MTX 동반)", history: "MTX 부작용 예방용 동반 처방" },
        ],
        observations: [],
      },
      {
        id: "gerd",
        name: "위식도역류병",
        meta: "2년째",
        since: "2024년",
        visits: 5,
        lastVisit: "25.02.14",
        meds: [
          { id: "rabe", name: "라베프라졸", dose: "10mg 1T/day", since: "23년~", history: "유지 처방" },
        ],
        observations: [],
      },
    ] as Diagnosis[],
  },
  vital: {
    tracked: ["bp", "bw", "hr"],
    available: [
      { id: "bp", key: "BP", unit: "", dates: ["25.03", "25.04", "25.05"], vals: ["120/78", "124/82", "120/76"], colors: ["", "", ""], normal: "< 130/80 mmHg" },
      { id: "bw", key: "BW", unit: "kg", dates: ["24.10", "25.03", "25.05"], vals: ["58.4", "59.3", "61.2"], colors: ["", "", ""], normal: "개별 기준" },
      { id: "hr", key: "HR", unit: "bpm", dates: ["25.01", "25.04", "25.05"], vals: ["72", "76", "74"], colors: ["", "", ""], normal: "60 - 100 bpm" },
    ] as SeriesItem[],
  },
  lab: {
    entries: [
      { kind: "item", data: { id: "tsh", key: "TSH", unit: "mIU/L", dates: ["24.04", "24.10", "25.04"], vals: ["0.05", "0.12", "0.45"], colors: ["low", "low", ""], normal: "0.4 - 4.0 mIU/L" } },
      { kind: "item", data: { id: "t4", key: "Free T4", unit: "ng/dL", dates: ["24.04", "24.10", "25.04"], vals: ["1.8", "1.5", "1.3"], colors: ["", "", ""], normal: "0.8 - 1.8 ng/dL" } },
      {
        kind: "group", id: "cbc", name: "CBC",
        items: [
          { id: "wbc", key: "WBC", unit: "10³/μL", dates: ["24.04", "24.10", "25.04"], vals: ["5.6", "5.7", "5.8"], colors: ["", "", ""], normal: "4.0 - 10.0" },
          { id: "hb", key: "Hb", unit: "g/dL", dates: ["24.04", "24.10", "25.04"], vals: ["12.6", "12.5", "12.4"], colors: ["", "", ""], normal: "12.0 - 16.0" },
          { id: "plt", key: "PLT", unit: "10³/μL", dates: ["24.04", "24.10", "25.04"], vals: ["238", "242", "245"], colors: ["", "", ""], normal: "150 - 400" },
        ],
      },
      {
        kind: "group", id: "lft", name: "LFT",
        items: [
          { id: "ast", key: "AST", unit: "U/L", dates: ["24.04", "24.10", "25.04"], vals: ["20", "21", "22"], colors: ["", "", ""], normal: "0 - 40" },
          { id: "alt", key: "ALT", unit: "U/L", dates: ["24.04", "24.10", "25.04"], vals: ["18", "19", "19"], colors: ["", "", ""], normal: "0 - 40" },
        ],
      },
    ] as LabEntry[],
  },
  proc: {
    trackedCategories: ["injection", "procedure", "iv"],
    groups: [
      {
        id: "tri",
        name: "트리암시놀론 40mg",
        category: "procedure",
        sites: [
          { site: "우측 무릎 IA", count: "3/4회", dates: ["25.03", "24.09", "24.03"] },
          { site: "좌측 손목 IA", count: "1/4회", dates: ["24.06"] },
        ],
      },
      {
        id: "flu",
        name: "인플루엔자 IM",
        category: "injection",
        sites: [{ site: "좌측 삼각근", dates: ["24.10", "23.10"] }],
      },
    ] as ProcGroup[],
  },
  vac: {
    tracked: ["flu", "pcv13", "ppsv23", "zoster", "covid", "tdap"],
    available: [
      { id: "flu", name: "인플루엔자", date: "24.10", status: "recommended", reason: "매년 갱신 시점 지남", schedule: "매 시즌 1회 (가을~겨울)", history: [{ date: "24.10" }, { date: "23.10" }, { date: "22.10" }] },
      { id: "pcv13", name: "PCV13", date: "23.05", status: "completed", reason: "시리즈 완료", schedule: "65세 이상 1회", history: [{ date: "23.05" }] },
      { id: "ppsv23", name: "PPSV23", date: null, status: "recommended", reason: "미접종", schedule: "PCV13 접종 후 1년 경과 시", history: [] },
      { id: "zoster", name: "대상포진", date: "24.04", series: "1/2", status: "recommended", reason: "시리즈 진행 중 (2/2 잔여)", schedule: "1차 접종 후 2-6개월 사이 2차", history: [{ date: "24.04", label: "1/2" }] },
      { id: "covid", name: "COVID-19", date: "23.09", status: "recommended", reason: "최신 갱신 시점 지남", schedule: "매 시즌 갱신 권장", history: [{ date: "23.09" }, { date: "22.12" }, { date: "21.11" }] },
      { id: "tdap", name: "Tdap", date: null, status: "recommended", reason: "미접종", schedule: "10년마다 1회", history: [] },
    ] as VacItem[],
  },
};

function colorClass(c: "" | "high" | "low") {
  if (c === "high") return "text-[var(--status-error-text-main)] font-semibold";
  if (c === "low") return "text-[var(--text-link)] font-semibold";
  return "";
}

function WidgetCard({
  children,
  span = 1,
  ai = false,
  maxBodyHeight,
}: {
  children: React.ReactNode;
  span?: 1 | 2;
  ai?: boolean;
  maxBodyHeight?: number;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-default)] bg-[var(--bg-base)] min-w-0",
        span === 2 && "col-span-2",
        ai && "border-l-2 border-l-[var(--violet-300)] bg-gradient-to-b from-[var(--bg-service-subtle)] to-[var(--bg-base)]",
      )}
    >
      <button
        className="absolute right-[3px] top-[3px] z-[2] flex h-[18px] w-[18px] items-center justify-center rounded-[var(--radius-xs)] border-none bg-transparent text-[var(--gray-300)] opacity-60 hover:bg-[var(--bg-subtle)] hover:text-[var(--icon-sub)] hover:opacity-100"
        title="위젯 설정"
        type="button"
      >
        <Settings2 className="h-[11px] w-[11px]" />
      </button>
      <div
        className="overflow-y-auto px-[10px] py-[7px] pr-[24px] pb-[8px]"
        style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

function NoteWidget() {
  const items = PATIENT_B.note.tracked
    .map((tid) => PATIENT_B.note.available.find((a) => a.id === tid))
    .filter((it): it is NoteItem => Boolean(it && it.content));
  if (!items.length) return null;
  return (
    <WidgetCard span={2} maxBodyHeight={100}>
      <div className="flex flex-wrap gap-x-3 gap-y-[3px]">
        {items.map((it) => (
          <span
            key={it.id}
            className="inline-flex items-baseline gap-1 rounded-[var(--radius-xs)] px-[3px] py-[1px] text-[11px] leading-[1.5] hover:bg-[var(--bg-subtle)]"
          >
            <span className="inline-block rounded-[var(--radius-full)] bg-[var(--bg-service-subtle)] px-[7px] py-[1px] text-[9.5px] font-semibold leading-[1.4] text-[var(--text-service-bold)] tracking-[0.02em]">
              {it.badge}
            </span>
            <span className="text-[var(--text-sub)]">{it.content}</span>
          </span>
        ))}
      </div>
    </WidgetCard>
  );
}

function DxMedsObsWidget() {
  const dmo = PATIENT_B.dxMedsObs;
  const diagnoses = dmo.diagnoses
    .slice(0, dmo.showCount)
    .filter((dx) => dx.meds.length > 0 || (dmo.aiObsOn && dx.observations.length > 0));
  if (!diagnoses.length) return null;
  return (
    <WidgetCard span={2} maxBodyHeight={260}>
      {diagnoses.map((dx, idx) => (
        <div
          key={dx.id}
          className={cn(
            "py-[4px] px-[2px]",
            idx > 0 && "mt-1 border-t border-[var(--line-default)] pt-[6px]",
          )}
        >
          <div className="flex items-baseline gap-1 rounded-[var(--radius-xs)] px-1 py-[1px] text-[11px] hover:bg-[var(--bg-subtle)]">
            <span className="font-semibold text-[var(--text-main)]">{dx.name}</span>
            <span className="text-[10px] text-[var(--text-sub)]">· {dx.meta}</span>
          </div>
          <div className="mt-[2px] flex flex-col gap-[1px]">
            {dx.meds.map((m) => (
              <div
                key={m.id}
                className="flex items-baseline gap-1 rounded-[var(--radius-xs)] px-1 py-[1px] text-[10.5px] leading-[1.45] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]"
              >
                <span className="inline-block h-[13px] shrink-0 rounded-[var(--radius-xs)] bg-[var(--status-info-bg-subtle)] px-1 text-[9px] font-bold leading-[13px] text-[var(--status-info-text-main)] tracking-[0.03em]">
                  약
                </span>
                <span className="font-medium text-[var(--text-main)]">
                  {m.name} {m.dose}
                </span>
                {m.isTapering && (
                  <span className="ml-1 rounded-[var(--radius-xs)] bg-[var(--bg-service-subtle)] px-1 text-[9px] font-bold text-[var(--text-service-primary)]">
                    tapering
                  </span>
                )}
                <span className="text-[9.5px] text-[var(--text-tertiary)]">· {m.since}</span>
              </div>
            ))}
            {dmo.aiObsOn &&
              dx.observations.map((ob) => (
                <div
                  key={ob.id}
                  className="flex items-baseline gap-1 rounded-[var(--radius-xs)] px-1 py-[1px] text-[10.5px] leading-[1.45] hover:bg-[var(--bg-service-subtle)]"
                >
                  <span className="inline-block h-[13px] shrink-0 rounded-[var(--radius-xs)] bg-[var(--bg-service-subtle)] px-1 text-[9px] font-bold leading-[13px] text-[var(--text-service-primary)] tracking-[0.03em]">
                    관찰
                  </span>
                  <span className="font-medium text-[var(--text-service-bold)]">
                    {ob.text}
                  </span>
                  <span className="text-[9.5px] text-[var(--text-tertiary)]">· {ob.context}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </WidgetCard>
  );
}

function SeriesRow({ item, indent = false }: { item: SeriesItem; indent?: boolean }) {
  return (
    <div
      className="grid items-baseline gap-x-[8px] rounded-[var(--radius-xs)] px-1 py-[1px] hover:bg-[var(--bg-subtle)]"
      style={{ gridTemplateColumns: "52px repeat(3, minmax(0, 1fr))" }}
    >
      <span
        className={cn(
          "truncate text-[10.5px] font-semibold text-[var(--text-main)]",
          indent && "pl-[14px]",
        )}
      >
        {item.key}
      </span>
      {item.vals.map((v, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "cursor-default whitespace-nowrap text-center text-[11px] font-medium text-[var(--text-main)]",
                colorClass(item.colors[i]),
              )}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {v}
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>{item.dates[i]}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

function VitalWidget() {
  const items = PATIENT_B.vital.tracked
    .map((tid) => PATIENT_B.vital.available.find((a) => a.id === tid))
    .filter((it): it is SeriesItem => Boolean(it));
  if (!items.length) return null;
  return (
    <WidgetCard span={1} maxBodyHeight={140}>
      <div className="flex flex-col gap-[1px]">
        {items.map((it) => (
          <SeriesRow key={it.id} item={it} />
        ))}
      </div>
    </WidgetCard>
  );
}

function LabWidget() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((s) => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  const entries = PATIENT_B.lab.entries.filter((e) =>
    e.kind === "item" ? true : e.items.length > 0,
  );
  if (!entries.length) return null;
  return (
    <WidgetCard span={1} maxBodyHeight={180}>
      <div className="flex flex-col gap-[1px]">
        {entries.map((e) => {
          if (e.kind === "item") {
            return <SeriesRow key={e.data.id} item={e.data} />;
          }
          const isOpen = expanded.has(e.id);
          return (
            <div key={e.id}>
              <button
                type="button"
                onClick={() => toggle(e.id)}
                className="flex w-full items-baseline gap-[3px] rounded-[var(--radius-xs)] px-1 py-[1px] text-left text-[10.5px] font-semibold text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >
                <ChevronRight
                  className={cn(
                    "h-[10px] w-[10px] shrink-0 self-center text-[var(--text-tertiary)] transition-transform",
                    isOpen && "rotate-90",
                  )}
                />
                {e.name}
                <span className="text-[9px] font-normal text-[var(--text-tertiary)]">
                  ({e.items.length})
                </span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-[1px]">
                  {e.items.map((it) => (
                    <SeriesRow key={it.id} item={it} indent />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

function ProcWidget() {
  const rows = PATIENT_B.proc.groups.filter(
    (g) => PATIENT_B.proc.trackedCategories.includes(g.category) && g.sites.length > 0,
  );
  if (!rows.length) return null;
  return (
    <WidgetCard span={1} maxBodyHeight={140}>
      <div className="flex flex-col gap-[2px]">
        {rows.map((g) => (
          <div key={g.id}>
            <div className="rounded-[var(--radius-xs)] px-1 py-[1px] text-[11px] font-medium leading-[1.4] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
              {g.name}
            </div>
            {g.sites.map((s, i) => (
              <div
                key={i}
                className="flex items-baseline gap-[4px] rounded-[var(--radius-xs)] pl-3 pr-1 py-[1px] text-[10.5px] leading-[1.4] text-[var(--text-sub)] hover:bg-[var(--bg-subtle)]"
              >
                <span className="shrink-0 text-[var(--text-tertiary)]">└</span>
                <span className="min-w-0 truncate">{s.site}</span>
                {s.count && (
                  <>
                    <span className="shrink-0 text-[var(--text-tertiary)]">·</span>
                    <span className="shrink-0 font-medium text-[var(--text-main)]">{s.count}</span>
                  </>
                )}
                <span className="shrink-0 text-[var(--text-tertiary)]">·</span>
                <span className="shrink-0 text-[9.5px] text-[var(--text-tertiary)]">
                  {s.dates.join(", ")}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function VacWidget() {
  const visible = PATIENT_B.vac.tracked
    .map((tid) => PATIENT_B.vac.available.find((a) => a.id === tid))
    .filter(
      (it): it is VacItem =>
        Boolean(it) && (it!.status === "recommended" || it!.status === "completed"),
    );
  if (!visible.length) return null;
  return (
    <WidgetCard span={1} maxBodyHeight={140}>
      <div className="grid grid-cols-2 gap-[4px]">
        {visible.map((it) => {
          const tid = it.id;
          if (it.status === "recommended") {
          return (
            <span
              key={tid}
              className="inline-flex min-w-0 items-baseline gap-[4px] rounded-[var(--radius-xs)] border border-[var(--status-error-line)] bg-[var(--status-error-bg-subtle)] px-[5px] py-[1px]"
            >
              <span className="truncate text-[10px] font-bold text-[var(--status-error-text-main)]">
                {it.name}
              </span>
              {it.series && (
                <span className="inline-block shrink-0 rounded-[var(--radius-xs)] bg-[var(--red-100)] px-[3px] text-[8.5px] font-bold text-[var(--status-error-text-main)]">
                  {it.series}
                </span>
              )}
              {it.date && (
                <span className="ml-auto shrink-0 text-[8.5px] font-medium text-[var(--red-700)] opacity-85">
                  {it.date}
                </span>
              )}
            </span>
          );
        }
        if (it.status === "completed") {
          return (
            <span
              key={tid}
              className="inline-flex min-w-0 items-baseline gap-[4px] rounded-[var(--radius-xs)] border border-transparent bg-[var(--bg-neutral)] px-[5px] py-[1px]"
            >
              <span className="truncate text-[10px] font-medium text-[var(--text-sub)]">
                {it.name}
              </span>
              {it.date && (
                <span className="ml-auto shrink-0 text-[8.5px] text-[var(--text-tertiary)] opacity-85">
                  {it.date}
                </span>
              )}
            </span>
          );
        }
          return null;
        })}
      </div>
    </WidgetCard>
  );
}

export function MedicalHistorySummary() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line-default)] bg-[var(--bg-base)]">
      <div className="flex items-center gap-2 border-b border-[var(--line-subtle)] px-3 py-[8px]">
        <span className="text-[14px] font-semibold text-[var(--text-main)]">
          환자 진료이력 요약
        </span>
        <button
          className="ml-auto flex h-[26px] w-[26px] items-center justify-center rounded-[var(--radius-sm)] border border-transparent bg-transparent text-[var(--icon-sub)] hover:border-[var(--line-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--icon-default)]"
          title="위젯 관리"
          type="button"
        >
          <LayoutGrid className="h-[13px] w-[13px]" />
        </button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-[6px] overflow-hidden p-[6px]" style={{ gridAutoFlow: "dense", alignContent: "start" }}>
        <NoteWidget />
        <DxMedsObsWidget />
        <VitalWidget />
        <LabWidget />
        <ProcWidget />
        <VacWidget />
      </div>
    </section>
  );
}
