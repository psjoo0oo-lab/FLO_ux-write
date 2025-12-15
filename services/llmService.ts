import { ToneLevel, WritingContext, AnalysisResult, CompareResult, WritingMode, Attachment } from "../types";

// 사내 GPT OSS 120b 모델 API 엔드포인트
const LLM_API_URL = "http://10.1.22.181:11434/api/chat";
const MODEL_NAME = "gpt-oss:120b";

// FLO UX 라이팅 Master Rules
// docs/guidelines/master-rules.md 참조
const SYSTEM_INSTRUCTION_BASE = `
[역할]

너는 음악 스트리밍 서비스 **FLO**의 시니어 UX 라이터이자 프로덕트 디자이너다.
FLO는 **'취향을 존중하는 세련된 이웃'**을 지향하며,
사용자에게 언제나 **친절하지만 담백하게** 말하는 것을 중요하게 생각한다.

너의 역할은 기획자/디자이너/개발자가 요청한 화면·상황에 맞춰,
FLO의 「프로덕트 UX라이팅 지침」을 지키는 마이크로카피를 작성·리뷰하는 것이다.


[가이드 개요]

- 목적
  - 브랜드 경험 통일: 여러 부서에서 작성하더라도 사용자가 'FLO'라는 한 명의 인격체와
    대화하는 듯한 일관된 경험을 제공한다.
  - 협업 효율성: 불필요한 문구 수정 논의를 줄이고, 명확한 기준을 통해 의사결정 속도를 높인다.
  - AI 학습 자산화: FLO의 톤앤매너를 학습할 수 있는 논리적인 데이터 구조를 마련한다.

- 적용 범위
  - 주요 범위: 앱/웹 프로덕트 내의 모든 화면, UI 텍스트, 팝업, 인앱 메시지, 시스템 오류 문구.
  - 참고 범위: 마케팅 캠페인, SNS 콘텐츠, 1:1 고객 응대(CS) 등은 이 가이드의 톤을 유지하되,
    각 채널 특성에 맞게 유연하게 적용한다.


[3대 원칙]

FLO 프로덕트 라이팅 3대 원칙은 다음과 같다.

1) 원칙 1. 쉽고 명확하게

- 사용자가 고민 없이 직관적으로 이해해야 한다.
- 누구나 별도 학습 없이 이해할 수 있게 **직관적으로** 쓴다.

- Do
  - 한 문장에는 하나의 정보만 담는다.
  - 전문 용어(권리사, 청취)는 일상 용어(음원 제공사, 듣기)로 풀어 쓴다.
- Don't
  - 이미 아는 내용을 중복해서 말하거나, 미사여구로 공간을 채우지 않는다.

2) 원칙 2. 친절하지만 담백하게

- 과장된 친절이나 억지 텐션은 오히려 사용자를 피로하게 만든다.
- **본질적인 정보에 집중해 담백하게** 전달한다.

- Do
  - 소리 내어 읽었을 때, 실제 사람 말처럼 자연스러워야 한다.
  - 사용자의 행동에 대해 **명확한 피드백**을 준다.
    (예: "이용권을 구매했어요.", "보관함에 담았어요.")
- Don't
  - 과장된 감탄사(!!!)나 밈(Meme), 유행어는 사용하지 않는다.
  - FLO의 과실이 아닐 때까지 습관적으로 "죄송합니다"라고 말하지 않는다.
    FLO의 과실이 명확할 때만 사과한다.

3) 원칙 3. 대화하듯 공감하며

- 딱딱한 시스템 언어가 아니라, **음악을 함께 듣는 친구 같은 이웃**처럼 따뜻하게 쓴다.
- 불특정 다수가 아닌 '나(사용자)'에게 말하는 느낌을 만든다.

- Do
  - '나(사용자)'에게 말하는 것처럼 개인화된 메시지를 쓴다.
  - 명령조보다는 권유형(~해 보세요)이나 청유형(~할까요?)을 우선 사용한다.
- Don't
  - 특정 성별, 연령, 취향을 차별하거나 배제하는 표현을 쓰지 않는다.
  - 시스템 중심 용어(출력, 로드 등)나 어려운 전문 용어를 그대로 쓰지 않는다.


[상황별 톤 조절]

서베이 결과에 따라, 화면의 성격에 맞춰 진지함과 공감의 농도를 조절한다.
하나의 화면에서 여러 전략이 섞일 수 있으나, **우선순위가 되는 상황**을 기준으로 한다.

1) 결제, 해지, 오류, 민감 정보

- 예시: 이용권, 과금, 환불, 약관/정책, 오류 안내 등
- 작성 전략: **신뢰와 명확함**
  - 브랜드 개성보다 정보(가격, 기간, 조건, 위험)를 먼저 전달한다.
  - 상태·해결 방법을 정확하게, 그러나 부드럽게 쓴다.
- 톤 밸런스
  - 진지함 7 : 3 친근함
  - 정보성 8 : 2 공감성
- 유의사항
  - "일시적인 오류입니다", "더 많은 혜택" 같은 모호한 표현만으로 끝내지 않는다.
  - 조건·가격·해지 방법을 숨기거나 찾기 어렵게 만들지 않는다.
  - 이모지, 드립, 과한 텐션을 사용하지 않는다.

2) 일반 안내, 기능 설명

- 예시: 설정, 계정, 도움말, 필터/정렬, 일반 목록·정보 화면 등
- 작성 전략: **알아듣기 쉬운 친절한 설명**
  - 한 문단의 첫 문장은 핵심 정보, 그 다음 문장은 부연 설명으로 쓴다.
  - 사용자의 상황에 공감하여, 필요한 경우 한 줄 정도 부담을 덜어주는 문장을 덧붙인다.
- 톤 밸런스
  - 진지함 5 : 5 친근함
  - 정보성 7 : 3 공감성

3) 온보딩, 추천, 성공

- 예시: 온보딩, 취향 설정, 추천, Empty 상태, 완료/성공 메시지 등
- 작성 전략: **즐거운 발견**
  - 긍정적인 경험과 탐색을 유도할 수 있도록 공감한다.
  - 사용자가 얻는 이득·기분을 간단히 표현한다.
  - 약간의 위트와 브랜드적 표현은 허용하되, 과한 드립·유행어·차별적 표현이 없는지 항상 검토한다.
- 톤 밸런스
  - 진지함 4 : 6 친근함
  - 정보성 5 : 5 공감성


[언어 스타일 가이드]

1) 말투와 종결어미

- 기본적으로 **해요체**를 사용한다.
- 시스템 치명적 오류, 법적 고지, 규정, 신고/차단 등 **무게감 있는 상황**에서만 합쇼체(합니다체)를 사용한다.
- 예
  - O: "확인해 보세요." / "이용할 수 있어요."
  - X: "확인 바랍니다." / "이용 가능합니다."
  - O: "이용에 불편을 드려 죄송합니다."
  - X: "이용에 불편을 드려 죄송해요."
  - O: "서비스 이용이 어려워요."
  - X: "제공 불가."

2) 인칭 및 호칭

- 사용자
  - 이름/닉네임을 알 경우 "OO님".
  - 모를 경우 주어를 생략하거나 문맥에 맞춰 쓴다.
  - "고객님"은 지양한다.
  - 예
    - O: "OO님, 이용권을 구매해 보세요." / "이용권을 구매해 보세요."
    - X: "고객님, 이용권을 구매해 보세요."
- 서비스
  - 서비스명은 영문 대문자 **"FLO"**를 우선 사용한다.
  - 문장 중간에 필요할 경우 한글로 '플로'를 사용할 수 있다.
  - 'Flo', '플로우' 등은 지양한다.
  - 공지가 아닌 이상 "FLO 팀, 운영진"보다는 "저희"를 사용한다.
  - 예
    - O: "FLO가 준비했어요."
    - X: "FLO팀이 준비했어요."

3) 표기법 및 문장 부호

- 타이틀, 버튼, 리스트 끝에는 마침표(.)를 찍지 않는다.
- 서비스명
  - 헤드라인: "FLO"
  - 문장 중간: "FLO" 또는 "플로"
- 이모지
  - 꼭 필요한 경우 문장 앞/뒤에 **하나만** 쓴다.
  - 오류·장애 등 부정적 상황에는 사용하지 않는다.
  - 예
    - O: "반가워요! 👋"
    - X: "로그인 실패 😢"
- 숫자/가격
  - 가격은 쉼표(,)와 통화 단위를 함께 쓴다.
  - O: "1,000원" / X: "1000원"
- 날짜
  - 모바일: M/D(요일) 형식을 권장한다. 예: "7/3(월)"
  - 연도 필요 시: YYYY-MM-DD 형식을 사용한다. 예: "2026-01-01"
- 기간
  - 물결표 ~를 사용한다. 예: "7/3(월)~7/28(금)"


[컴포넌트 별 작성 가이드]

1) 타이틀(Title)

- 기본: 해요체, 필요시 명사형/청유형 허용.
- 조사와 마침표는 생략한다.
- 사용자가 "지금 무엇을 해야 하는지 / 어떤 상태인지" 한눈에 알 수 있어야 한다.
- 예
  - O: "로그아웃할까요?", "이용권 구매 완료"
  - X: "로그아웃을 하시겠습니까?", "이용권 구매가 완료되었습니다."

2) 버튼(CTA)

- 행동을 예측할 수 있는 능동/동사형(~하기) 또는 명확한 기능(편집, 삭제 등)을 나타내는 명사형을 사용한다.
- 예
  - O: "이용권을 구매했어요", "보관함 가기", "편집", "계속 재생하기 / 멈추기"
  - X: "예 / 아니요"

3) 토스트 팝업(Toast)

- 사용자 행동에 대한 상태/피드백을 전달한다.
- 1줄 이내(최대 2줄)로 짧게 쓴다.
- 단순 통보보다 행동의 결과를 **능동태**로 말해주는 문장을 권장한다.
- 예
  - O: "보관함에 담았어요.", "삭제했어요."
  - X: "저장되었습니다.", "삭제 완료."

4) 오류 메시지(Error)

- 원인 설명과 해결책을 함께 제공한다.
- FLO의 과실이 명확할 때만 사과한다.
- 예
  - O: "연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요. 오류가 지속되면 문의해 주세요."
  - X: "일시적인 오류입니다. (502)"


[용어 사전 – 주요 예시]

- 어플, 앱(App) → 플랫폼, 앱 (공간 부족 시 "앱" 허용)
- 권리사, 음원사 → 음원 제공사
- 트랙 → 곡, 음악
- 청취, 스트리밍 → 듣기, 감상
- 찜하기, Like → 좋아요
- 음악앱, 뮤직앱, 스밍앱, 음싸 → 음악 플랫폼
- 제공 불가 → 서비스 이용이 어려워요
- 뱃지 → 배지
- (맞춤법) "캡쳐" → "캡처"

이 밖에 혼용하기 쉬운 용어는 항상 "사용자 입장에서 이해하기 쉬운 표현"을 우선적으로 선택한다.


[출력 태도]

- 항상 먼저 **화면/상황/컴포넌트**를 파악하고,
  - 이 요청이 "결제·해지·오류·민감 정보 / 일반 안내 / 온보딩·추천·성공" 중 어디에 가까운지 판단한다.
- 요청이 오면:
  1. FLO UX라이팅 지침(3대 원칙, 상황별 톤, 언어 스타일, 컴포넌트 규칙)에 맞게 카피를 작성하고,
  2. 각 문장이 어떤 원칙/상황을 따른 것인지 한두 줄로 설명한다.
- 과장된 혜택, 밈/유행어, 조건 숨기기, 사용자 탓, 부적절한 표현 등
  FLO 프로덕트 UX라이팅 지침과 배치되는 표현은 제안하지 않는다.

사용자가 업로드한 커스텀 가이드라인(텍스트 및 PDF 문서)이 있다면 위 지침과 함께 참고하십시오.
`;

const getToneDescription = (level: ToneLevel): string => {
  switch (level) {
    case ToneLevel.DRY: return "건조하고, 정보를 전달하는 데에만 집중하며, 매우 객관적인 톤";
    case ToneLevel.NEUTRAL: return "신뢰감을 주고, 차분하며, 정중한 표준적인 톤";
    case ToneLevel.FRIENDLY: return "친근하고, 부드러우며, 대화하는 듯한 톤";
    case ToneLevel.EMOTIONAL: return "감성적이고, 공감을 이끌어내며, 따뜻한 톤";
    case ToneLevel.EXPRESSIVE: return "매우 활기차고, 위트가 넘치며, 강력한 인상을 주는 톤";
    default: return "표준적인 톤";
  }
};

const getContextDescription = (ctx: WritingContext): string => {
  switch (ctx) {
    case WritingContext.PRODUCT_UI: return "앱/웹 UI 요소 (버튼, 토스트, 에러 메시지, 라벨). 짧고 명확해야 함.";
    case WritingContext.MARKETING: return "마케팅 배너, 푸시 알림, 랜딩 페이지. 클릭을 유도하고 매력적이어야 함.";
    case WritingContext.CREATIVE: return "온보딩 화면, 빈 화면(Empty State). 브랜드 스토리를 전달.";
    case WritingContext.BUSINESS: return "B2B 파트너 센터, 공지사항, 정책 안내. 신뢰도와 정확성이 최우선.";
    default: return "일반적인 UX 텍스트";
  }
};

// Helper to decode Base64 safely (handling UTF-8 for Korean)
const decodeBase64Text = (str: string): string => {
  try {
    return decodeURIComponent(atob(str).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
  } catch (e) {
    return atob(str);
  }
};

// Helper to process attachments into text content
const processAttachments = (attachments: Attachment[]): string => {
  return attachments.map(file => {
    if (file.type === 'application/pdf') {
      // PDF는 텍스트 추출이 필요하지만, 현재는 파일명만 표시
      return `[참고 PDF 파일: ${file.name}]`;
    } else {
      // 텍스트 기반 파일은 내용 디코딩
      const content = decodeBase64Text(file.data);
      return `[참고 파일: ${file.name}]\n${content}\n---`;
    }
  }).join('\n');
};

// Gemini API 설정 (fallback용)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// 모델명을 명확하게 지정 (목록에 존재하는 확실한 모델 사용)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Gemini API 호출 함수
const callGeminiAPI = async (userMessage: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_INSTRUCTION_BASE}\n\n${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      // 에러 응답의 본문을 읽어서 더 자세한 원인 파악 시도
      const errorBody = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();

    // Gemini API 응답 형식: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("Invalid response format from Gemini API");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// LLM API 호출 헬퍼 함수 (사내 모델 우선, 실패 시 Gemini fallback)
const callLLM = async (userMessage: string): Promise<string> => {
  // 1차 시도: 사내 GPT OSS 120b 모델
  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: SYSTEM_INSTRUCTION_BASE
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        stream: false
      }),
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    });

    if (!response.ok) {
      throw new Error(`Internal LLM API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Ollama API 응답 형식: { message: { content: "..." } }
    if (data.message && data.message.content) {
      console.log('✅ Using internal GPT OSS 120b model');
      return data.message.content;
    }

    throw new Error("Invalid response format from internal LLM");
  } catch (error) {
    console.warn('⚠️ Internal LLM failed, falling back to Gemini API:', error);

    // 2차 시도: Gemini 1.5 Flash API
    try {
      const geminiResponse = await callGeminiAPI(userMessage);
      console.log('✅ Using Gemini 1.5 Flash API (fallback)');
      return geminiResponse;
    } catch (geminiError) {
      console.error('❌ Both internal LLM and Gemini API failed');
      const geminiMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
      throw new Error(`모든 AI 서비스 연결 실패:\n[Gemini] ${geminiMsg}`);
    }
  }
};

// 안전한 JSON 파싱 헬퍼 함수
const safeJsonParse = <T>(text: string): T | null => {
  try {
    // 1. 순수 JSON 파싱 시도
    return JSON.parse(text);
  } catch (e) {
    // 2. Markdown 코드 블록 제거 (```json ... ```)
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\}|\[[\s\S]*\])\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        /* ignore */
      }
    }

    // 3. 중괄호/대괄호 범위 찾아서 파싱 시도
    const objectMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (e3) {
        /* ignore */
      }
    }

    console.error("JSON Parsing Failed. Raw text:", text);
    return null;
  }
};

export const analyzeAndRefineText = async (
  inputText: string,
  context: WritingContext,
  tone: ToneLevel,
  customGuide: string,
  caseStudies: string,
  mode: WritingMode,
  image?: { data: string; mimeType: string },
  element?: string,
  guideAttachments: Attachment[] = [],
  caseAttachments: Attachment[] = []
): Promise<AnalysisResult> => {

  const toneDesc = getToneDescription(tone);
  const ctxDesc = getContextDescription(context);
  const elementDetail = element ? `(상세 요소: ${element})` : '';

  let taskInstruction = "";
  if (mode === WritingMode.CREATE) {
    taskInstruction = `
    [모드: 신규 문구 생성]
    사용자는 작성하려는 문구의 '의도'나 '키워드'를 입력했습니다.
    이 의도를 파악하여, 해당 상황${elementDetail}에 가장 적절하고 매력적인 UX 라이팅 문구를 처음부터 창작해주세요.
    입력된 내용: "${inputText}"
    `;
  } else {
    taskInstruction = `
    [모드: 기존 문구 교정/개선]
    사용자는 '초안 문구'를 입력했습니다.
    이 문구의 문제점을 분석하고, 더 나은 UX 라이팅 표현으로 다듬어주세요. 맞춤법, 띄어쓰기, 어색한 표현을 수정하세요.
    해당 문구가 사용되는 구체적인 요소는 '${element || '일반'}' 입니다.
    입력된 내용: "${inputText}"
    `;
  }

  const imageInstruction = image
    ? "참고: 사용자가 UI 스크린샷이나 참고 이미지를 첨부했습니다. (현재 이미지 분석은 지원되지 않으므로 텍스트 정보만 활용합니다.)"
    : "";

  const guideContent = processAttachments(guideAttachments);
  const caseContent = processAttachments(caseAttachments);

  const prompt = `
    [작업 요청]
    ${taskInstruction}
    ${imageInstruction}

    [설정된 상황(Context)]
    ${ctxDesc} ${elementDetail}

    [목표 톤앤매너 (1-5단계 중 ${tone}단계)]
    ${toneDesc}

    [참고할 커스텀 가이드라인 (최우선 준수)]
    ${customGuide ? `[직접 입력 가이드]: ${customGuide}` : ""}
    ${guideContent}

    [참고할 사례 학습 (Few-shot Examples)]
    ${caseStudies ? `[직접 입력 사례]: ${caseStudies}` : ""}
    ${caseContent}

    [출력 요구사항]
    반드시 아래 JSON 형식으로만 응답해주세요. 다른 설명 없이 JSON만 출력하세요.
    {
      "improvedText": "제안하는 핵심 문구 (가장 좋은 1개 안)",
      "reasoning": "왜 이 문구가 좋은지, 혹은 기존 문구가 왜 개선되었는지 설명 (한국어)",
      "alternatives": ["대안1", "대안2", "대안3", "대안4", "대안5"]
    }
  `;

  try {
    const responseText = await callLLM(prompt);

    // 안전한 JSON 파싱 시도
    const result = safeJsonParse<AnalysisResult>(responseText);

    if (result && result.improvedText) {
      return result;
    }

    // 파싱 실패 시 기본값 반환보다는 에러를 던져서 UI에서 알림
    throw new Error("AI가 올바른 응답을 주지 못했습니다. 다시 시도해주세요.");
  } catch (error) {
    console.error("LLM Error:", error);
    throw error;
  }
};

export const generateMoreAlternatives = async (
  inputText: string,
  context: WritingContext,
  tone: ToneLevel,
  customGuide: string,
  caseStudies: string,
  existingAlternatives: string[],
  element?: string,
  guideAttachments: Attachment[] = [],
  caseAttachments: Attachment[] = []
): Promise<string[]> => {
  const toneDesc = getToneDescription(tone);
  const ctxDesc = getContextDescription(context);
  const elementDetail = element ? `(상세 요소: ${element})` : '';

  const guideContent = processAttachments(guideAttachments);
  const caseContent = processAttachments(caseAttachments);

  const prompt = `
    [추가 대안 생성 요청]
    사용자가 입력한 내용: "${inputText}"
    상황: ${ctxDesc} ${elementDetail}
    톤앤매너: ${toneDesc}

    [커스텀 가이드]
    ${customGuide}
    ${guideContent}

    [사례 학습]
    ${caseStudies}
    ${caseContent}

    이미 제안된 다음 문구들을 제외하고, 새롭고 신선한 표현으로 3가지 추가 대안을 제시해주세요.
    [제외할 문구들]: ${existingAlternatives.join(", ")}

    반드시 아래 JSON 형식으로만 응답해주세요:
    { "newAlternatives": ["대안1", "대안2", "대안3"] }
  `;

  try {
    const responseText = await callLLM(prompt);

    // 안전한 JSON 파싱 시도
    const result = safeJsonParse<{ newAlternatives: string[] }>(responseText);

    if (result && Array.isArray(result.newAlternatives)) {
      return result.newAlternatives;
    }

    return [];
  } catch (error) {
    console.error("LLM More Alternatives Error:", error);
    return [];
  }
};

export const compareOptions = async (
  options: string[],
  context: WritingContext,
  customGuide: string,
  caseStudies: string,
  guideAttachments: Attachment[] = [],
  caseAttachments: Attachment[] = []
): Promise<CompareResult> => {

  const formattedOptions = options.map((opt, idx) => `[옵션 ${idx + 1}] "${opt}"`).join("\n");
  const guideContent = processAttachments(guideAttachments);
  const caseContent = processAttachments(caseAttachments);

  const prompt = `
    [결정 지원 요청]
    다음 ${options.length}가지 문구 중 어느 것이 더 나은지 판단해주세요.

    ${formattedOptions}

    [상황] ${getContextDescription(context)}

    [참고 가이드]
    ${customGuide}
    ${guideContent}

    [참고 사례]
    ${caseStudies}
    ${caseContent}

    어느 쪽이 더 명확하고, 사용자 친화적이며, 적절한가요?
    반드시 아래 JSON 형식으로만 응답해주세요:
    {
      "winner": "Option 1 또는 Option 2 등 (완전히 동일하면 Equal)",
      "reason": "선택 이유 설명",
      "suggestion": "추가 제안사항"
    }
    `;

  try {
    const responseText = await callLLM(prompt);

    // 안전한 JSON 파싱 시도
    const result = safeJsonParse<CompareResult>(responseText);

    if (result && result.winner) {
      return result;
    }

    throw new Error("AI가 올바른 응답을 주지 못했습니다.");
  } catch (error) {
    console.error("Comparison Error:", error);
    throw error;
  }
};

export const getConceptExplanation = async (topic: string): Promise<string> => {
  const prompt = `
    UX 라이팅 개념 중 "${topic}"에 대해 설명해주세요.
    초보자도 이해하기 쉽게 설명하고, 필요하다면 좋은 예시(O)와 나쁜 예시(X)를 들어주세요.
    마크다운 형식으로 출력해주세요.
    `;

  try {
    const responseText = await callLLM(prompt);
    return responseText || "설명을 가져올 수 없습니다.";
  } catch (error) {
    console.error("Concept Explanation Error:", error);
    return "설명을 가져오는 중 오류가 발생했습니다.";
  }
};
