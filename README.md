# 의사랑 AI

진료 보조 AI 데스크톱 앱 프로토타입.

- 배포: https://jungmin-lee-m.github.io/ysrai/
- `main` 브랜치에 푸시하면 GitHub Pages로 자동 배포된다.

## 실행

```
npm i        # 의존성 설치
npm run dev  # 개발 서버
npm run build
```

## 구성

- 좌측: 환자 현황 큐 (외래/예약/완료 탭, 상태 배지)
- 중앙: 환자 정보 · 과거 기록 요약 · SOAP · 녹음 상태
- 우측: 상병·처방 추천(원클릭 전송) + AI 질문 패널 (좁은 화면에서는 플로팅 버튼)
