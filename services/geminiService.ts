import { GoogleGenAI, Type } from "@google/genai";
import { ToneLevel, WritingContext, AnalysisResult, CompareResult, WritingMode, Attachment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_BASE = `
당신은 한국 최고의 UX 라이팅 컨설턴트입니다. 
당신의 목표는 사용자 경험을 향상시키는 명확하고, 간결하며, 일관성 있는 텍스트를 작성하는 것입니다.
기업의 브랜드 보이스를 준수하며, 사용자의 상황(Context)에 가장 적합한 문구를 제안해야 합니다.
사용자가 업로드한 커스텀 가이드라인(텍스트 및 PDF 문서)이 있다면 그것을 최우선으로 고려하십시오.
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

// Helper to process attachments into Gemini Parts
const processAttachments = (attachments: Attachment[]): any[] => {
    return attachments.map(file => {
        if (file.type === 'application/pdf') {
            // Send PDF as inline binary data
            return { inlineData: { mimeType: file.type, data: file.data } };
        } else {
            // Assume text-based files (txt, md, csv, etc.)
            // Decode and send as text part
            const content = decodeBase64Text(file.data);
            return { text: `[참고 파일: ${file.name}]\n${content}\n---` };
        }
    });
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
    ? "참고: 사용자가 UI 스크린샷이나 참고 이미지를 첨부했습니다. 문구 작성 시 이 이미지의 맥락(화면 구성, 디자인 요소, 분위기 등)을 반드시 고려하여 제안하세요." 
    : "";

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
    ${guideAttachments.length > 0 ? `첨부된 가이드라인 파일 ${guideAttachments.length}개를 반드시 참고하세요.` : ""}

    [참고할 사례 학습 (Few-shot Examples)]
    ${caseStudies ? `[직접 입력 사례]: ${caseStudies}` : ""}
    ${caseAttachments.length > 0 ? `첨부된 사례 학습 파일 ${caseAttachments.length}개를 반드시 참고하세요.` : ""}

    [출력 요구사항]
    JSON 형식으로 응답해주세요.
    1. improvedText: 제안하는 핵심 문구 (가장 좋은 1개 안)
    2. reasoning: 왜 이 문구가 좋은지, 혹은 기존 문구가 왜 개선되었는지 설명 (한국어)
    3. alternatives: 상황에 따라 쓸 수 있는 5가지 다른 대안들 (다양한 뉘앙스 제안)
  `;

  // Construct parts order:
  // 1. Image Input (if any)
  // 2. Guide Attachments (PDFs/Text Files)
  // 3. Case Attachments (PDFs/Text Files)
  // 4. Main Prompt
  
  const parts: any[] = [];
  
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }

  // Add processed attachments
  parts.push(...processAttachments(guideAttachments));
  parts.push(...processAttachments(caseAttachments));

  // Add text prompt
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedText: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            alternatives: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["improvedText", "reasoning", "alternatives"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Error:", error);
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
  
  const prompt = `
    [추가 대안 생성 요청]
    사용자가 입력한 내용: "${inputText}"
    상황: ${ctxDesc} ${elementDetail}
    톤앤매너: ${toneDesc}

    [커스텀 가이드]
    ${customGuide}
    (첨부 파일 포함)

    [사례 학습]
    ${caseStudies}
    (첨부 파일 포함)

    이미 제안된 다음 문구들을 제외하고, 새롭고 신선한 표현으로 3가지 추가 대안을 제시해주세요.
    [제외할 문구들]: ${existingAlternatives.join(", ")}

    JSON 형식: { "newAlternatives": ["대안1", "대안2", "대안3"] }
  `;

  const parts: any[] = [];
  parts.push(...processAttachments(guideAttachments));
  parts.push(...processAttachments(caseAttachments));
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newAlternatives: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text).newAlternatives as string[];
    }
    return [];
  } catch (error) {
    console.error("Gemini More Alternatives Error:", error);
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

    const prompt = `
    [결정 지원 요청]
    다음 ${options.length}가지 문구 중 어느 것이 더 나은지 판단해주세요.

    ${formattedOptions}

    [상황] ${getContextDescription(context)}

    [참고 가이드]
    ${customGuide}
    ${guideAttachments.length > 0 ? "(첨부된 가이드 문서 포함)" : ""}

    [참고 사례]
    ${caseStudies}
    ${caseAttachments.length > 0 ? "(첨부된 사례 문서 포함)" : ""}

    어느 쪽이 더 명확하고, 사용자 친화적이며, 적절한가요?
    JSON 형식으로 답하세요.
    winner 필드에는 "Option 1", "Option 2"와 같이 1등 옵션의 번호를 적어주세요. 만약 완전히 동일하다면 "Equal"이라고 적어주세요.
    `;

    const parts: any[] = [];
    parts.push(...processAttachments(guideAttachments));
    parts.push(...processAttachments(caseAttachments));
    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        winner: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text) as CompareResult;
        }
        throw new Error("No response text");
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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "설명을 가져올 수 없습니다.";
};