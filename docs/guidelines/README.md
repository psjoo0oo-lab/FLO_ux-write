# 라이팅 지침 시스템 (Writing Guidelines System)

> **최종 업데이트**: 2025-12-23  
> **버전**: 2.0 (계층적 룰 시스템)

---

## 📋 개요

FLO의 라이팅 지침은 **계층적 구조**로 설계되어 있습니다.
- **마스터 룰**: 모든 카테고리에 공통으로 적용되는 최상위 원칙
- **카테고리별 룰**: 각 컨텍스트(프로덕트/마케팅/브랜딩/비즈니스)에 특화된 상세 지침

카테고리별 룰이 없는 경우, 자동으로 마스터 룰만 적용됩니다 (폴백).

---

## 📁 파일 구조

```
docs/guidelines/
├── README.md              (이 파일)
├── master-rules.md        (마스터 룰 - 모든 카테고리 공통)
├── product-rules.md       (프로덕트 UI 상세 룰)
├── marketing-rules.md     (마케팅 상세 룰)
├── branding-rules.md      (브랜딩/크리에이티브 상세 룰)
└── business-rules.md      (비즈니스 상세 룰)
```

---

## 🎯 카테고리별 적용 범위

### 1. 프로덕트 UI (`PRODUCT_UI`)
**적용 대상**: 앱/웹 내 모든 인터페이스 요소
- 타이틀, 서브텍스트
- 버튼명 (CTA)
- 토스트 메시지
- 에러 메시지
- 툴팁
- 플레이스홀더
- 라벨/태그

**핵심 특성**: 명확성, 간결함, 일관성

### 2. 마케팅 (`MARKETING`)
**적용 대상**: 사용자 유입 및 전환을 위한 커뮤니케이션
- 푸시 알림 (타이틀 + 본문)
- 배너 (타이틀 + 서브텍스트)
- 이벤트/프로모션 문구
- 광고 슬로건

**핵심 특성**: 흥미 유발, 명확한 혜택, FLO다움 유지

### 3. 브랜딩/크리에이티브 (`CREATIVE`)
**적용 대상**: 브랜드 경험을 형성하는 핵심 접점
- 온보딩 (타이틀 + 설명)
- 엠티 스테이트 (빈 화면)
- 브랜드 슬로건
- 로딩 문구

**핵심 특성**: 브랜드 페르소나, 감성 연결, 차별화

### 4. 비즈니스 (`BUSINESS`)
**적용 대상**: 공식적이고 신뢰감 있는 커뮤니케이션
- 공지사항 (제목 + 본문)
- 정책/약관
- 비즈니스 메일
- FAQ 답변
- 시스템 알림

**핵심 특성**: 정확성, 투명성, 전문성

---

## 🔧 시스템 작동 방식

### 1. 기본 원리

```typescript
// llmService.ts 내부 로직
function buildSystemInstruction(context: WritingContext): string {
  const categoryRule = CATEGORY_RULES[context];
  
  if (categoryRule) {
    // 카테고리별 룰이 있으면: 마스터 룰 + 카테고리 룰 조합
    return `${MASTER_RULES}\n\n${categoryRule}`;
  } else {
    // 카테고리별 룰이 없으면: 마스터 룰만 사용 (폴백)
    return MASTER_RULES;
  }
}
```

### 2. 실행 흐름

```
사용자 요청
    ↓
컨텍스트 선택 (PRODUCT_UI / MARKETING / CREATIVE / BUSINESS)
    ↓
buildSystemInstruction(context) 호출
    ↓
마스터 룰 + 카테고리별 룰 조합
    ↓
LLM에 전달
    ↓
카테고리 특화 답변 생성
```

---

## 📝 룰 추가/수정 가이드

### 새로운 카테고리 추가하기

1. **타입 정의 추가** (`types.ts`)
```typescript
export enum WritingContext {
  PRODUCT_UI = 'PRODUCT_UI',
  MARKETING = 'MARKETING',
  CREATIVE = 'CREATIVE',
  BUSINESS = 'BUSINESS',
  NEW_CATEGORY = 'NEW_CATEGORY'  // 새 카테고리 추가
}
```

2. **상세 룰 파일 생성** (`docs/guidelines/new-category-rules.md`)
```markdown
# 새 카테고리 상세 지침

> **카테고리**: New Category  
> **최종 업데이트**: YYYY-MM-DD  
> **상위 룰**: master-rules.md

## 개요
...

## 적용 범위
...

## 핵심 특성
...
```

3. **llmService.ts에 룰 추가**
```typescript
const CATEGORY_RULES: Record<WritingContext, string> = {
  // ... 기존 룰들
  [WritingContext.NEW_CATEGORY]: `
[새 카테고리 상세 지침]

적용 범위: ...
핵심 특성: ...
컴포넌트별 가이드: ...
`
};
```

### 기존 룰 수정하기

1. **마스터 룰 수정**: `docs/guidelines/master-rules.md` 편집
   - 모든 카테고리에 영향을 미치므로 신중하게 수정
   - 수정 후 `llmService.ts`의 `MASTER_RULES` 상수도 동기화

2. **카테고리별 룰 수정**: 해당 카테고리 파일 편집
   - 예: `docs/guidelines/product-rules.md`
   - 수정 후 `llmService.ts`의 `CATEGORY_RULES[해당카테고리]` 동기화

---

## 🎨 톤 레벨 시스템

모든 카테고리에서 공통으로 사용하는 톤 레벨:

| 레벨 | 이름 | 정보성 | 감정성 | 주요 사용 상황 |
|------|------|--------|--------|----------------|
| Lv.1 | DRY | 100% | 0% | 시스템 상태, 법적 고지 |
| Lv.2 | NEUTRAL | 80% | 20% | 일반 피드백, 설정 안내 |
| Lv.3 | FRIENDLY | 60% | 40% | 일상적 상호작용 |
| Lv.4 | EMOTIONAL | 40% | 60% | 성공 메시지, 긍정적 피드백 |
| Lv.5 | EXPRESSIVE | 30% | 70% | 온보딩, 특별한 성취 |

---

## ✅ 체크리스트

### 룰 작성 시
- [ ] 마스터 룰과 충돌하지 않는가?
- [ ] 구체적인 예시가 포함되어 있는가?
- [ ] 좋은 예시(✅)와 나쁜 예시(❌)가 모두 있는가?
- [ ] 카테고리의 핵심 특성을 반영하는가?

### 룰 수정 시
- [ ] 변경 사항을 문서와 코드 모두에 반영했는가?
- [ ] 기존 문구에 미치는 영향을 검토했는가?
- [ ] 최종 업데이트 날짜를 갱신했는가?

---

## 🚀 향후 계획

### Phase 1 (현재)
- ✅ 마스터 룰 정의
- ✅ 4개 카테고리별 기본 룰 작성
- ✅ 계층적 시스템 구현

### Phase 2 (예정)
- [ ] 각 카테고리별 상세 사례 추가
- [ ] A/B 테스트 결과 기반 Best Practice 문서화
- [ ] 사용자 피드백 기반 룰 개선

### Phase 3 (예정)
- [ ] 다국어 지원 가이드
- [ ] 접근성(Accessibility) 지침 추가
- [ ] 브랜드 보이스 진화에 따른 룰 업데이트

---

## 📞 문의

라이팅 지침에 대한 문의사항이나 개선 제안은:
- **담당**: FLO UX Writing Team
- **이메일**: [담당자 이메일]
- **Slack**: #ux-writing

---

## 📚 참고 자료

- [FLO 브랜드 가이드라인](링크)
- [UX Writing Best Practices](링크)
- [마이크로카피 작성 가이드](링크)
