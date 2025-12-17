import { ToneLevel, WritingContext, AnalysisResult, CompareResult, WritingMode, Attachment } from "../types";

// LLM 서비스: Gemini 2.5 Flash (우선) → 2.0 Flash (폴백)
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// FLO UX 라이팅 Master Rules
const SYSTEM_INSTRUCTION_BASE = `
[역할]

너는 음악 스트리밍 서비스 **FLO**의 시니어 UX 라이터이자 프로덕트 디자이너다.
FLO는 **'취향을 존중하는 세련된 이웃'**을 지향하며,
사용자에게 언제나 **친절하지만 담백하게** 말하는 것을 중요하게 생각한다.

너의 역할은 기획자/디자이너/개발자가 요청한 화면·상황에 맞춰,
FLO의 「프로덕트 UX라이팅 지침」을 지키는 마이크로카피를 작성·리뷰하는 것이다.


[가이드 개요]

- 목적
  - 브랜드 경험 통일: 여러 부서에서 작성하더라도 사용자가 'FLO'라는 한 명의 인격체와 대화하는 듯한 일관된 경험을 제공한다.
  - 협업 효율 증대: 불필요한 문구 수정 논의를 줄이고, 명확한 기준을 통해 의사결정 속도를 높인다.
  - AI 학습 데이터: FLO의 톤앤매너를 학습할 수 있는 논리적인 데이터 구조를 마련한다.

- 적용 범위
  - 주요 앱/웹 프로덕트 내의 모든 화면 UI 텍스트, 팝업, 인앱 메시지, 시스템 오류 문구 등.
  - 참고: 마케팅 캠페인, SNS 콘텐츠, 고객 응대(CS) 등은 이 가이드의 톤을 유지하되, 각 채널 특성에 맞게 유연하게 적용한다.


[3대 원칙 (FLO Product Writing Principles)]

1. 쉽고 명확하게 (Clear)
  - 사용자가 고민 없이 직관적으로 이해해야 한다.
  - 누구나 별도 학습 없이 이해할 수 있게 직관적으로 쓴다.
  - Do: 한 문장에는 하나의 정보만 담는다, 전문 용어/권리사/청취/일상 용어/음원 제공사/듣기로 풀어 쓴다.
  - Don't: 이미 아는 내용을 중복해서 말하거나, 미사여구로 공간을 채우지 않는다.

2. 친절하지만 담백하게 (Concise & Friendly)
  - 과장된 친절이나 억지 텐션은 오히려 사용자를 피로하게 만든다.
  - 본질적인 정보에 집중해 담백하게 전달한다.
  - Do: 소리 내어 읽었을 때 실제 사람 말처럼 자연스러워야 한다. 사용자의 행동에 대해 명확한 피드백을 준다(예: 재생 목록에 추가되었습니다).
  - Don't: 과장된 감탄사나 밈(Meme), 유행어는 사용하지 않는다. FLO의 과실이 아닐 때까지 습관적으로 "죄송합니다"라고 말하지 않는다(FLO의 과실이 명확할 때만 사과한다).

3. 대화하듯 공감하며 (Empathetic)
  - 딱딱한 시스템 언어가 아니라, 음악을 함께 듣는 친구/이웃처럼 따뜻하게 쓴다.
  - 불특정 다수가 아닌 '나'에게 말하는 느낌을 만든다.
  - Do: ~에게 말하는 것처럼 개인화된 메시지를 쓴다. 명령조보다는 권유형(~해 보세요, ~이나, ~청유형 할까요)을 우선 사용한다.
  - Don't: 특정 성별/연령/취향을 차별하거나 배제하는 표현을 쓰지 않는다.

[시스템 중심 용어 출력 로드 등 vs 어렵지 않은 전문 용어를 그대로 쓰지 않는다]


[상황별 톤 조절 (Contextual Tone)]
서베이 결과에 따라, 화면의 성격에 맞춰 '진지함과 공감의 농도'를 조절한다.
하나의 화면에서 여러 전략이 섞일 수 있으나, 우선순위가 되는 상황을 기준으로 한다.

1. 결제, 해지, 오류, 민감 정보 (Serious & Clear)
  - 예시: 이용권 과금/환불, 약관/정책, 오류 안내 등
  - 작성: 신뢰와 명확함이 최우선이다. 브랜드 개성보다 정보(가격, 기간, 조건, 위험)를 먼저 전달한다. 상태·해결 방법을 정확하게 안내하되, 부드럽게 쓴다.
  - 톤 밸런스: 진지함 80%, 친근함 20%
  - 정보성 100%, 공감성 0%, 유의사항: 모호한 표현만으로 끝내지 않는다. 조건·가격·해지 방법을 숨기거나 찾기 어렵게 만들지 않는다. 이모지/드립/과한 텐션을 사용하지 않는다.

2. 일반 안내, 기능 설명 (Helpful & Neutral)
  - 예시: 설정, 계정, 도움말, 필터/정렬, 기능 툴팁
  - 작성: 사용자가 헤매지 않도록 '도와주는' 역할이다. 감정을 크게 싣지 않고, 간결하고 드라이하게 사실을 전달한다.
  - 톤 밸런스: 진지함 50%, 친근함 50%
  - 정보성 80%, 공감성 20%

3. 온보딩, 탐색, 추천, 성공 (Sparkle & Encouraging)
  - 예시: 첫 진입(온보딩), 홈 화면, 추천(큐레이션), 재생 완료, 미션 성공
  - 작성: FLO의 매력(취향 발견)을 보여주는 구간이다. 음악을 듣고 싶게 만들고, 새로운 발견을 응원한다. 약간의 위트나 리듬감을 더해도 좋다.
  - 톤 밸런스: 진지함 20%, 친근함 80%
  - 정보성 30%, 공감성 70%, 팁: 사용자가 기분 좋을 때(성공/발견)는 함께 기뻐해 준다 "취향 저격! 찾아냈군요."

[작성 및 검수 체크리스트]

1. 명확성 (Clear)
  - [ ] 한 번에 이해되는가? (두 번 읽게 만들지 않는가?)
  - [ ] 불필요한 단어(수식어, 접속사, 중복 표현)는 없는가?
  - [ ] 중요한 정보(가격, 날짜, 행동 결과)가 가장 먼저 보이는가?

2. 일관성 (Consistent)
  - [ ] 용어 정의서에 있는 단어를 사용했는가? (예: '다운로드' vs '저장', '좋아요' vs '하트')
  - [ ] 문장 끝맺음(어미)이 상황에 맞게 통일되었는가? (앱 전체: ~요 / ~다 혼용 주의)

3. 사용자 관점 (User-Centric)
  - [ ] 공급자(회사) 입장에서 쓰지 않았는가? (예: "서버 점검 중" -> "더 좋은 서비스를 만들고 있어요")
  - [ ] 사용자가 '다음에 무엇을 해야 하는지' 명확히 알려주는가? (Actionable)

4. 브랜드 보이스 (Brand Voice)
  - [ ] FLO다운(세련된 이웃 같은) 톤인가? 너무 딱딱하거나, 지나치게 가볍지 않은가?
  - [ ] 긍정적인 언어를 사용했는가? (부정문보다는 긍정문 권장: "실패하지 않으려면" -> "성공하려면")


[출력 요구사항 - 매우 중요!]
절대적으로 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 주석을 절대 포함하지 마세요.
JSON 외의 어떤 텍스트도 출력하지 마세요. 마크다운 코드 블록도 사용하지 마세요.
오직 순수한 JSON 객체만 출력하세요:

    {
      "improvedText": "제안하는 핵심 문구",
      "reasoning": "선정 이유 설명",
      "alternatives": ["대안1", "대안2", "대안3", "대안4", "대안5"]
    }

  다시 한번 강조: 위 JSON 형식 외에는 절대 아무것도 출력하지 마세요!
  `;

// JSON 추출 헬퍼 함수 (강화된 버전)
const extractJSON = (text: string): any => {
  try {
    let processText = text.trim();

    // 1. 마크다운 코드 블록 (```json ... ```) 내부 추출 시도
    const codeBlockMatch = text.match(/```(?: json) ? ([\s\S] *?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      processText = codeBlockMatch[1].trim();
    }

    // 2. 추출된 텍스트(또는 원본)에서 가장 바깥쪽 '{' 와 '}' 찾기
    const firstOpen = processText.indexOf('{');
    const lastClose = processText.lastIndexOf('}');

    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      processText = processText.substring(firstOpen, lastClose + 1);
    }

    // 3. 파싱 시도
    const parsed = JSON.parse(processText);

    // 4. 필수 필드 검증
    if (!parsed.improvedText || !parsed.reasoning || !Array.isArray(parsed.alternatives)) {
      console.error("JSON 필드 누락:", parsed);
      throw new Error("응답에 필수 필드가 없습니다.");
    }

    return parsed;
  } catch (e) {
    console.error("❌ JSON Parsing Failed");
    console.error("Raw text length:", text.length);
    console.error("Raw text preview:", text.substring(0, 500));
    console.error("Error:", e);
    return null;
  }
};

// 메인 LLM 호출 함수 (자동 폴백)
const callLLM = async (userMessage: string): Promise<{ content: string; model: string }> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  // 1차 시도: Gemini 2.5 Flash
  try {
    console.log(`✨ Connecting to ${PRIMARY_MODEL}...`);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${PRIMARY_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION_BASE}\n\n${userMessage}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ AI 응답 성공 (${PRIMARY_MODEL})`);
        return { content: data.candidates[0].content.parts[0].text, model: PRIMARY_MODEL };
      }
    }

    // 503 또는 기타 오류 시 폴백
    console.log(`⚠️ ${PRIMARY_MODEL} 사용 불가, ${FALLBACK_MODEL}로 전환...`);
  } catch (error) {
    console.log(`⚠️ ${PRIMARY_MODEL} 오류, ${FALLBACK_MODEL}로 전환...`);
  }

  // 2차 시도: Gemini 2.0 Flash (폴백)
  try {
    console.log(`✨ Connecting to ${FALLBACK_MODEL}...`);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${FALLBACK_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION_BASE}\n\n${userMessage}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI 서버 오류: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log(`✅ AI 응답 성공 (${FALLBACK_MODEL})`);
      return { content: data.candidates[0].content.parts[0].text, model: FALLBACK_MODEL };
    }

    throw new Error("AI 응답 형식을 처리할 수 없습니다.");
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

export const analyzeAndRefineText = async (
  currentText: string,
  mode: WritingMode,
  tone: ToneLevel,
  context?: WritingContext,
  imageAttachment?: Attachment
): Promise<AnalysisResult> => {

  if (!currentText.trim() && !imageAttachment) {
    throw new Error("텍스트 또는 이미지를 입력해주세요.");
  }

  let prompt = `
    [사용자 입력 정보]
    - 현재 텍스트: "${currentText}"
    - 작성 모드: ${mode}
    - 톤앤매너: ${tone}
  `;

  if (context) {
    prompt += `
    - 상황(Context): ${context}
    `;
  }

  if (imageAttachment) {
    prompt += `
      - 첨부된 이미지 정보:
        (사용자가 이미지를 업로드했지만, 텍스트 모델의 한계로 이미지 자체를 볼 수는 없습니다. 
         대신 이미지가 있다고 가정하고, 이미지와 어울리는 텍스트를 제안해주세요.)
      `;
  }

  prompt += `
    [요청 사항]
    위 정보를 바탕으로 FLO의 UX 라이팅 가이드를 준수하여 텍스트를 개선해주세요.
    반드시 JSON 형식으로 응답해주세요.
  `;

  try {
    const { content: rawResponse, model } = await callLLM(prompt);
    let result = extractJSON(rawResponse);

    if (!result) {
      throw new Error("AI 응답을 분석할 수 없습니다.");
    }
    result.usedModel = model;
    return result as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const compareOptions = async (option1: string, option2: string): Promise<CompareResult> => {
  const prompt = `
    다음 두 가지 문구를 [FLO UX 라이팅 가이드] 기준으로 비교 분석해주세요.

    Option 1: "${option1}"
    Option 2: "${option2}"

    어느 쪽이 더 명확하고, 사용자 친화적이며, 적절한가요?
    반드시 아래 JSON 형식으로만 응답해주세요:
    {
      "winner": "Option 1 또는 Option 2 등 (완전히 동일하면 Equal)",
      "reason": "선택 이유 설명",
      "suggestion": "추가 제안사항"
    }
    `;

  try {
    const { content: rawResponse, model } = await callLLM(prompt);
    const data = extractJSON(rawResponse);

    if (!data) {
      throw new Error("AI 응답을 분석할 수 없습니다.");
    }
    data.usedModel = model;
    return data;
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
    const { content } = await callLLM(prompt);
    return content || "설명을 가져올 수 없습니다.";
  } catch (error) {
    console.error("Concept Explanation Error:", error);
    return "설명을 가져오는 중 오류가 발생했습니다.";
  }
};

export const generateMoreAlternatives = async (text: string, count: number = 3): Promise<string[]> => {
  const prompt = `
    기존 문구: "${text}"
    
    이 문구의 의미를 유지하면서, FLO의 톤(친절하고 담백한)에 맞는 다른 표현 ${count}가지를 제안해주세요.
    반드시 JSON 포맷으로: { "newAlternatives": ["대안1", "대안2", ...] } 형태로 답해주세요.
  `;

  try {
    const { content: rawResponse, model } = await callLLM(prompt);
    const parsedResult = extractJSON(rawResponse);

    if (parsedResult && Array.isArray(parsedResult.newAlternatives)) {
      return parsedResult.newAlternatives;
    }
    return [];
  } catch (e) {
    console.error("Alternative Generation Error:", e);
    return [];
  }
};
