import React, { useState, useContext, useRef } from 'react';
import ErrorDisplay from '../components/ErrorDisplay';
import { WritingContext, ToneLevel, AnalysisResult, WritingMode } from '../types';
import ToneSlider from '../components/ToneSlider';
import ResultCard from '../components/ResultCard';
import { analyzeAndRefineText, generateMoreAlternatives } from '../services/llmService';
import { GuideContext, FormStateContext } from '../App';
import { Sparkles, AlertCircle, MonitorSmartphone, Megaphone, Palette, Briefcase, Image as ImageIcon, X } from 'lucide-react';

interface WritingAssistantProps {
  mode: WritingMode;
}

const CONTEXT_ELEMENTS: Record<WritingContext, string[]> = {
  [WritingContext.PRODUCT_UI]: ['타이틀', '서브텍스트', '버튼명', '토스트 메시지', '에러 메시지', '툴팁', '플레이스홀더', '라벨/태그'],
  [WritingContext.MARKETING]: ['푸시 알림 타이틀', '푸시 알림 본문', '배너 타이틀', '배너 서브텍스트', '이벤트/프로모션 문구', '광고 슬로건'],
  [WritingContext.CREATIVE]: ['온보딩 타이틀', '온보딩 설명', '엠티 스테이트(빈화면)', '브랜드 슬로건', '로딩 문구'],
  [WritingContext.BUSINESS]: ['공지사항 제목', '정책/약관', '비즈니스 메일', 'FAQ 답변', '시스템 알림']
};

const PLACEHOLDERS: Record<WritingMode, Record<WritingContext, string>> = {
  [WritingMode.CREATE]: {
    [WritingContext.PRODUCT_UI]: "제안받고 싶은 상황이나 고민을 입력해주세요.\n\n예: 결제 완료 후 주문 내역 확인을 안내하는 토스트 메시지를 작성해줘.",
    [WritingContext.MARKETING]: "제안받고 싶은 상황이나 고민을 입력해주세요.\n\n예: 여름 시즌 할인 이벤트를 알리는 매력적인 푸시 알림 문구를 작성해줘.",
    [WritingContext.CREATIVE]: "제안받고 싶은 상황이나 고민을 입력해주세요.\n\n예: 앱을 처음 실행했을 때 사용자를 환영하는 온보딩 문구를 감성적으로 작성해줘.",
    [WritingContext.BUSINESS]: "제안받고 싶은 상황이나 고민을 입력해주세요.\n\n예: 서비스 점검 시간을 알리는 공지사항 제목을 정중하게 작성해줘."
  },
  [WritingMode.REFINE]: {
    [WritingContext.PRODUCT_UI]: "작성해둔 초안을 입력해주세요.\n\n예: 결제가 완료되었습니다. 이용해주셔서 감사합니다. 주문 내역을 확인해주세요.",
    [WritingContext.MARKETING]: "작성해둔 초안을 입력해주세요.\n\n예: 이번 여름 놓치면 후회할 초특가 할인! 지금 바로 확인해보세요.",
    [WritingContext.CREATIVE]: "작성해둔 초안을 입력해주세요.\n\n예: 안녕하세요! 우리 앱에 오신 것을 환영합니다. 즐거운 시간 되세요.",
    [WritingContext.BUSINESS]: "작성해둔 초안을 입력해주세요.\n\n예: 10월 1일 점검이 예정되어 있으니 이용에 참고 바랍니다."
  }
};

const WritingAssistant: React.FC<WritingAssistantProps> = ({ mode }) => {
  const { customGuide, caseStudies, guideAttachments, caseAttachments } = useContext(GuideContext);
  const { createState, setCreateState, refineState, setRefineState } = useContext(FormStateContext);

  // Select the appropriate state based on the current mode
  const pageState = mode === WritingMode.CREATE ? createState : refineState;
  const setPageState = mode === WritingMode.CREATE ? setCreateState : setRefineState;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreLoading, setMoreLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to update specific fields in the global state object
  const updateState = (updates: Partial<typeof pageState>) => {
    setPageState(prev => ({ ...prev, ...updates }));
  };

  const handleContextChange = (newContext: WritingContext) => {
    // If context changes, reset the element selection unless it's the same context
    updateState({
      context: newContext,
      element: '' // Reset element on context switch
    });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateState({
        imageFile: file,
        imagePreview: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) processFile(file);
        return;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = () => {
    updateState({
      imageFile: null,
      imagePreview: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    const text = pageState.inputText.trim();

    // Validation: Check if text is too short or just symbols
    if ((!text || text.length < 2) && !pageState.imageFile) {
      updateState({ isInvalidInput: true });
      return;
    }

    // Reset invalid state if valid
    updateState({ isInvalidInput: false });

    setLoading(true);
    setError(null);
    updateState({ result: null, getMoreCount: 0 });

    try {
      let imageData = undefined;
      if (pageState.imageFile) {
        const base64 = await fileToBase64(pageState.imageFile);
        imageData = {
          data: base64.split(',')[1],
          mimeType: pageState.imageFile.type
        };
      }

      const data = await analyzeAndRefineText(
        pageState.inputText,
        pageState.context,
        pageState.tone,
        customGuide,
        caseStudies,
        mode,
        imageData,
        pageState.element,
        guideAttachments, // Pass attachments
        caseAttachments   // Pass attachments
      );
      updateState({ result: data });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      // 상세 에러를 UI에 표시하여 원인 파악
      setError(`${errorMessage}\n(잠시 후 다시 시도하거나 관리자에게 문의하세요.)`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMore = async () => {
    if (!pageState.result || pageState.getMoreCount >= 3) return;

    setMoreLoading(true);
    try {
      const existingAlternatives = [...pageState.result.alternatives, pageState.result.improvedText];
      const newAlternatives = await generateMoreAlternatives(
        pageState.inputText,
        pageState.context,
        pageState.tone,
        customGuide,
        caseStudies,
        existingAlternatives,
        pageState.element,
        guideAttachments,
        caseAttachments
      );

      if (newAlternatives.length > 0) {
        updateState({
          result: {
            ...pageState.result,
            alternatives: [...pageState.result.alternatives, ...newAlternatives]
          },
          getMoreCount: pageState.getMoreCount + 1
        });
      }
    } catch (e) {
      console.error("Failed to get more suggestions", e);
    } finally {
      setMoreLoading(false);
    }
  };

  const getContextIcon = (ctx: WritingContext) => {
    switch (ctx) {
      case WritingContext.PRODUCT_UI: return <MonitorSmartphone className="w-5 h-5 mb-2" />;
      case WritingContext.MARKETING: return <Megaphone className="w-5 h-5 mb-2" />;
      case WritingContext.CREATIVE: return <Palette className="w-5 h-5 mb-2" />;
      case WritingContext.BUSINESS: return <Briefcase className="w-5 h-5 mb-2" />;
    }
  };

  const pageTitle = mode === WritingMode.CREATE ? '제안받기' : '검토하기';
  const pageDescription = mode === WritingMode.CREATE
    ? '의도와 상황을 입력하면 상황에 맞는 최적의 문구를 제안해 드릴게요.'
    : '작성한 문구를 가이드에 맞게 교정하고 더 나은 표현으로 다듬어줍니다.';

  return (
    <div className="flex flex-col h-full lg:overflow-hidden">
      <header className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{pageTitle}</h2>
        <p className="text-slate-500">{pageDescription}</p>
      </header>

      {/* Main Layout: Stack on Mobile, Row on Desktop */}
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full lg:min-h-0">

        {/* Left Input Column */}
        <div className="flex-1 flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-visible lg:overflow-y-auto">

          {/* STEP 1 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">STEP 1</span>
              <h3 className="font-bold text-slate-800">어디에 쓰이는 문구인가요?</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {Object.values(WritingContext).map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => handleContextChange(ctx)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-sm font-medium ${pageState.context === ctx
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  {getContextIcon(ctx)}
                  <span>
                    {ctx === WritingContext.PRODUCT_UI && "프로덕트"}
                    {ctx === WritingContext.MARKETING && "마케팅"}
                    {ctx === WritingContext.CREATIVE && "브랜딩"}
                    {ctx === WritingContext.BUSINESS && "비즈니스"}
                  </span>
                </button>
              ))}
            </div>

            {/* Element Selection */}
            {pageState.context && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 animate-fade-in-down">
                <p className="text-xs text-slate-500 font-semibold mb-2 ml-1">상세 요소 선택 (선택사항)</p>
                <div className="flex flex-wrap gap-2">
                  {CONTEXT_ELEMENTS[pageState.context].map((elem) => (
                    <button
                      key={elem}
                      onClick={() => updateState({ element: pageState.element === elem ? '' : elem })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${pageState.element === elem
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                      {elem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <hr className="border-slate-100" />

          {/* STEP 2 */}
          <section className="flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">STEP 2</span>
                <h3 className="font-bold text-slate-800">고민 내용을 입력하세요</h3>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition whitespace-nowrap"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  이미지 추가
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-1 flex flex-col min-h-[200px] lg:min-h-0">
              {pageState.imagePreview && (
                <div className="mb-3 relative inline-block self-start">
                  <img
                    src={pageState.imagePreview}
                    alt="Preview"
                    className="h-24 w-auto rounded-lg border border-slate-200 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 hover:bg-red-500 transition shadow-sm"
                    title="이미지 제거"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <textarea
                className={`w-full p-4 rounded-lg border focus:ring-2 resize-none text-base leading-relaxed flex-1 min-h-[120px] transition-all 
                ${pageState.isInvalidInput
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30'
                    : isDragging
                      ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/50'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                placeholder={PLACEHOLDERS[mode][pageState.context]}
                value={pageState.inputText}
                onChange={(e) => updateState({ inputText: e.target.value, isInvalidInput: false })}
                onPaste={handlePaste}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
              {pageState.isInvalidInput && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  내용을 조금 더 구체적으로 작성해주세요.
                </p>
              )}
            </div>

            {/* Tone Slider */}
            <div className="mt-6 mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                표현의 정도
              </label>
              <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <ToneSlider value={pageState.tone} onChange={(val) => updateState({ tone: val })} />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {mode === WritingMode.CREATE ? '제안받기' : '검토하기'}
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </section>
        </div>

        {/* Right Result Column */}
        <div className="w-full lg:w-1/2 lg:min-w-[320px] overflow-visible lg:overflow-y-auto">
          {error ? (
            <ErrorDisplay
              message={error}
              onRetry={handleAnalyze}
              className="h-full border-none shadow-none bg-slate-50"
            />
          ) : (
            <ResultCard
              result={pageState.result}
              loading={loading}
              onGetMore={handleGetMore}
              moreLoading={moreLoading}
              getMoreCount={pageState.getMoreCount}
              isInvalidInput={pageState.isInvalidInput}
              mode={mode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingAssistant;