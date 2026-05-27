# 환자 진료이력 요약 — 기능 기획서

> 구현 파일: [`app/components/uisarang/MedicalHistorySummary.tsx`](../app/components/uisarang/MedicalHistorySummary.tsx)
> 배치 위치: [`app/components/uisarang/CenterPanel.tsx`](../app/components/uisarang/CenterPanel.tsx) — CenterPanel 좌측 (480px), SOAP과 좌우 분할

---

## 1. 개요

진료 중 환자의 핵심 의료 이력을 한눈에 보기 위한 위젯형 요약 패널. 임상메모·상병·바이탈·검사·처치·예방접종을 카테고리별 카드로 묶어 표시한다.

## 2. 레이아웃

위젯 그리드 (`grid-cols-2 gap-[6px]`, `grid-auto-flow: dense`)

| 위젯 | span | 위치 |
|---|---|---|
| 임상메모 요약 | 2 | 1행 전체 |
| 상병별 처방·관찰 | 2 | 2행 전체 |
| Vital | 1 | 3행 좌 |
| 검사 | 1 | 3행 우 |
| 처치 / 주사 | 1 | 4행 좌 |
| 예방접종 | 1 | 4행 우 |

헤더: `환자 진료이력 요약` 타이틀 + 우측 위젯 관리 버튼(⊞)

---

## 3. 전역 정책

### 3.1 빈 데이터 처리

**원칙: 데이터가 없으면 항목 자체를 표시하지 않는다.** "X 없음" 같은 안내 텍스트는 사용하지 않는다.

- **항목 단위**: `content`가 비어있거나 `null`인 항목은 DOM에서 제외
- **위젯 카드 단위**: 위젯이 추적하는 항목이 0개이면 카드 자체를 렌더링하지 않음 (사용자가 위젯 관리에서 켜놨더라도 표시할 데이터가 0이면 숨김)

### 3.2 오버플로우 / 데이터 길이

**원칙: 위젯 내부에서 자체 스크롤.** 그리드 컨테이너 자체는 `overflow-hidden`이고, 각 위젯 카드 body가 `maxHeight` + `overflow-y: auto`로 자체 스크롤한다.

- 위젯 그리드 컨테이너: 고정 높이 (CenterPanel 좌측 영역 전체), `overflow-hidden`
- 각 위젯 카드 body: 위젯별 `maxBodyHeight` (px) 지정 + `overflow-y: auto`
- 현재 적용값:
  - 임상메모 100px, 상병별 260px, Vital 140px, Lab 180px, 처치 140px, 예방접종 140px
- 상병별 처방·관찰은 `showCount=3` 고정 (상위 3개만 표시, "더보기" 없음). 콘텐츠가 카드 max 높이를 넘으면 카드 내부 스크롤

### 3.3 디자인 시스템

[`styles/tokens.css`](../styles/tokens.css)의 MediAI Design System v2.4 토큰만 사용. 하드코딩된 색상값 금지. 자세한 매핑은 §6 참조.

---

## 4. 위젯별 사양

### 4.1 임상메모 요약 (`note`)

목적: 흡연·음주·운동·체중·가족력 등 환자 라이프스타일/배경 요약

- **카테고리: 고정**
  - 흡연, 음주, 운동, 체중, 가족력, 직업력 (6종 고정 set, 진료에서 정해진 카테고리)
  - 의사가 자유롭게 새 카테고리 추가는 **불가**
- **표시 규칙**: `content`가 비어있는 카테고리는 표시 안 함 (예: 직업력 미입력 시 노출 X)
- **레이아웃**: 인라인 wrap (가로로 흐르다 자연스럽게 줄바꿈)
- **UI 요소**: violet 배지(카테고리명) + 본문 텍스트

### 4.2 상병별 처방·관찰 (`dxMedsObs`)

목적: 만성/장기 상병별 복용약과 AI 추출 관찰사항을 묶어 표시

- **상병 표시 개수**: `showCount=3` 고정 (상위 3개만 표시). "더보기" 없음
- **각 상병**:
  - 헤더: 상병명 + 기간 (`6년째` 같은 메타)
  - 본문: 약물 리스트 + AI 관찰 리스트
  - **약/관찰이 모두 없는 상병**은 상병 자체를 표시 안 함 (3.1 원칙 적용)
- **약물 행**: 청록 배지("약") + 약명 dose + tapering 칩(옵션) + since 메타
- **관찰 행**: violet 배지("관찰") + 텍스트 + context (시작/종결 시점, 사유)
- **들여쓰기**: 상병명 아래 약/관찰은 들여쓰기 없이 좌측 정렬

### 4.3 Vital + 검사 (공통 `SeriesRow` 템플릿)

목적: 추적 중인 수치의 추세 표시

- **공통 템플릿** `SeriesRow`:
  - `grid-template-columns: 52px repeat(3, minmax(0, 1fr))`
  - 키 컬럼(좌): 항목명 (BP, TSH 등)
  - 값 컬럼(우): 시계열 값 3개, 균등 분배
  - 정상범위 초과/미달 시 색상 (high → 빨강, low → 파랑) — DS 토큰 `--status-error-text-main` / `--text-link`
- **추세 길이**: 항목별 최근 3회로 통일 (Vital/Lab 모두)
- **단위**: 표시 안 함 (수치만)
- **날짜**: 마우스 오버 시 Radix Tooltip(`delayDuration=0`)으로 노출

**Vital 추적 항목** (정상범위는 정보용):
- BP (< 130/80 mmHg)
- BW (개별 기준)
- HR (60–100 bpm)

**Lab — 그룹 접기 지원**:
- `entries: LabEntry[]`로 모델링
- `kind: "item"`: 단독 항목 (TSH, Free T4)
- `kind: "group"`: 그룹 (CBC = WBC/Hb/PLT, LFT = AST/ALT)
- 그룹은 chevron(▶) 클릭으로 펼침/접기. **기본 접힘 상태**
- 펼치면 같은 grid template으로 정렬 (들여쓰기는 키 셀 내부 `pl-[14px]`로 처리 — 값 컬럼 정렬 유지)

### 4.4 처치 / 주사 (`proc`)

목적: 시술/주사 이력을 약제별 → 부위별로 표시

- **2단계 계층**:
  - 1단계: 약제명 (예: `트리암시놀론 40mg`, `인플루엔자 IM`)
  - 2단계: `└` 들여쓴 부위 행 — 부위명 · 연간 횟수(`3/4회`) · 날짜 리스트
- **연간 횟수**: 관절 부위마다 연간 한도가 있는 약제(스테로이드 등)에 `N/한도` 표기. 한도가 없는 항목은 생략
- **IA(관절강내) / IM(근주)** 약어를 부위명에 명시
- 추적 카테고리(`injection`, `procedure`, `iv`)로 필터링

### 4.5 예방접종 (`vac`)

목적: 백신 접종 상태를 칩으로 한눈에 표시

- **표시 정책**: 권장(빨강) + 완료(회색)만 표시. **`not-applicable`(해당없음) 항목은 숨김**
- **레이아웃**: `grid-cols-2 gap-[4px]` (2단 그리드)
- **칩 변형**:
  - `recommended`: `--status-error-bg-subtle` 배경 + `--status-error-line` 테두리 + `--status-error-text-main` 굵은 텍스트. 시리즈(예: `1/2`)가 있으면 우측에 칩 안 칩
  - `completed`: `--bg-neutral` 배경, 회색 텍스트, 날짜만 메타로
- **칩 크기**: 작게 (`px-[5px] py-[1px]`, 이름 10px, 메타 8.5px)

---

## 5. 인터랙션

| 동작 | 트리거 | 결과 |
|---|---|---|
| 날짜 확인 | Vital/Lab 수치 hover | Radix Tooltip 즉시 노출 (delayDuration=0) |
| 그룹 펼침/접기 | Lab의 CBC/LFT chevron 클릭 | 하위 항목 렌더링 토글, 같은 grid 정렬 유지 |
| 행 호버 | 모든 데이터 행 | `bg-[var(--bg-subtle)]` 강조 |

---

## 6. 디자인 시스템 매핑

모든 색/반경/간격 → DS 토큰 사용. 직접 hex/rgba 사용 금지.

| 의미 | DS 토큰 |
|---|---|
| 카드 배경 / 테두리 | `--bg-base` / `--line-default` |
| 카드 헤더 텍스트 | `--text-main` |
| 본문 메인 텍스트 | `--text-main` / `--text-sub` |
| 메타 / 보조 | `--text-tertiary` |
| 호버 배경 | `--bg-subtle` |
| 임상메모 배지 | `--bg-service-subtle` + `--text-service-bold` (violet 톤) |
| "약" 배지 | `--status-info-bg-subtle` + `--status-info-text-main` (blue 톤) |
| "관찰" 배지 | `--bg-service-subtle` + `--text-service-primary` (violet 톤) |
| tapering 칩 | `--bg-service-subtle` + `--text-service-primary` |
| Lab high (정상 초과) | `--status-error-text-main` |
| Lab low (정상 미달) | `--text-link` (blue) |
| 백신 권장 | `--status-error-*` 패밀리 |
| 백신 완료 | `--bg-neutral` + `--text-sub` |
| 반경 | `--radius-xs/sm/md/full` |

---

## 7. TBD (추후 결정)

다음 항목은 placeholder UI만 있고 동작은 미정. 구현 단계에서 별도 기획 필요.

- **위젯 관리 버튼** (헤더 우측 ⊞): 전체 위젯 on/off 모달 또는 패널
- **위젯 설정 버튼** (각 카드 우상단 ⚙): 카드별 추적 항목 on/off
- **카드별 `maxBodyHeight` 튜닝**: 현재 추정값 적용. 실데이터 들어오면 조정 필요
- **편집/입력 진입점**: 현재는 표시 전용. 항목 클릭 시 편집 모달로 진입할지

---

## 8. 데이터 모델 요약

샘플 데이터(`PATIENT_B`)는 컴포넌트 파일 안에 인라인. 실제 연동 시에는 별도 데이터 레이어로 이동 권장.

```ts
// 임상메모
type NoteItem = { id; badge; content; updated };

// 상병별 처방·관찰
type MedItem = { id; name; dose; since; history; isTapering? };
type ObsItem = { id; text; context; quote; confidence };
type Diagnosis = { id; name; meta; since; visits; lastVisit; meds; observations };

// Vital / Lab 공통
type SeriesItem = { id; key; unit; dates[]; vals[]; colors[]; normal };

// Lab 그룹 지원
type LabEntry =
  | { kind: "item"; data: SeriesItem }
  | { kind: "group"; id; name; items: SeriesItem[] };

// 처치
type ProcSite = { site; count?; dates[] };
type ProcGroup = { id; name; category; sites: ProcSite[] };

// 예방접종
type VacItem = { id; name; date|null; series?; status: "recommended"|"completed"|"not-applicable"; reason; schedule; history };
```
