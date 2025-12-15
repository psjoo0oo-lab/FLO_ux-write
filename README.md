# Tone & FLO

UX Writing 도우미 - AI 기반 UX 라이팅 제안, 검토, 의사결정 지원 서비스

## 주요 기능

- **제안받기**: 상황에 맞는 UX 문구 제안
- **검토하기**: 작성한 문구 분석 및 개선안 제공
- **결정하기**: 여러 문구 옵션 비교 및 추천
- **관리자 설정**: 전사 가이드라인 및 사례 관리

## UX 라이팅 지침

FLO의 모든 UX 문구는 **[Master Rules](/docs/guidelines/master-rules.md)**를 따릅니다.

- **위치**: `docs/guidelines/master-rules.md`
- **역할**: AI 프롬프트에 자동 포함되는 최상위 UX 라이팅 가이드라인
- **3대 원칙**:
  1. 쉽고 명확하게
  2. 친절하지만 담백하게
  3. 대화하듯 공감하며
- **상황별 톤 조절**: 결제/오류, 일반 안내, 온보딩/추천
- **언어 스타일**: 해요체, 용어 사전, 컴포넌트별 작성 가이드


## 기술 스택

- **Frontend**: React + TypeScript + Vite
- **AI Model**: 
  - 1순위: 사내 GPT OSS 120b (`http://10.1.22.181:11434/api/chat`)
  - 2순위 (Fallback): Gemini 1.5 Flash API
- **Styling**: Vanilla CSS

### AI 모델 Fallback 설정

사내 VPN에 연결되지 않은 경우, Gemini API를 fallback으로 사용할 수 있습니다.

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급

3. `.env` 파일에 API 키 입력:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. 개발 서버 재시작


## 실행 방법

**필수 요구사항:** Node.js

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

서버는 `http://localhost:3000`에서 실행됩니다.

## 관리자 접근

- **경로**: `/admin`
- **비밀번호**: `2025PDtone&flo`
- **기능**: 가이드라인 관리, 사용자 의견 확인

> **참고**: 향후 관리자 패널의 가이드라인 관리 기능은 축소될 예정입니다.  
> Master Rules(`docs/guidelines/master-rules.md`)가 최우선 가이드라인으로 적용됩니다.


## 배포

- **프로덕션 URL**: https://flo-ux-write-k387.vercel.app
- **자동 배포**: `main` 브랜치에 푸시 시 자동 배포됨
- **플랫폼**: Vercel
