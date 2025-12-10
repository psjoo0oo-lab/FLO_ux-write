import React, { useState, useContext } from 'react';
import { WritingContext, CompareResult } from '../types';
import { compareOptions } from '../services/llmService';
import { GuideContext, FormStateContext } from '../App';
import { ArrowRightLeft, Trophy, AlertTriangle, Plus, X } from 'lucide-react';

const DecisionSupport: React.FC = () => {
  const { customGuide, caseStudies, guideAttachments, caseAttachments } = useContext(GuideContext);
  const { decisionState, setDecisionState } = useContext(FormStateContext);

  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    setDecisionState(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (decisionState.options.length <= 2) return;
    setDecisionState(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...decisionState.options];
    newOptions[index] = value;
    setDecisionState(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleCompare = async () => {
    const validOptions = decisionState.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert("최소 2개 이상의 문구를 입력해주세요.");
      return;
    }

    setLoading(true);
    setDecisionState(prev => ({ ...prev, result: null }));

    try {
      const res = await compareOptions(
        validOptions,
        WritingContext.PRODUCT_UI,
        customGuide,
        caseStudies,
        guideAttachments,
        caseAttachments
      );
      setDecisionState(prev => ({ ...prev, result: res }));
    } catch (e) {
      console.error(e);
      alert("비교 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isWinner = (index: number) => {
    if (!decisionState.result) return false;
    return decisionState.result.winner === `Option ${index + 1}` || decisionState.result.winner === `[Option ${index + 1}]`;
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <header className="mb-6 text-center shrink-0 px-2">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">결정하기</h2>
        <p className="text-slate-500 break-keep">고민되는 여러 문구 옵션을 비교 분석하여 최적의 선택을 도와드릴게요</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-xs md:text-sm font-medium border border-yellow-200 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="truncate">예시: "확인" vs "확인하기" / "취소" vs "닫기"</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-visible lg:overflow-y-auto px-2 md:px-4 pb-32 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {decisionState.options.map((opt, index) => (
            <div
              key={index}
              className={`relative h-32 md:h-40 bg-white rounded-xl border-2 transition-all group flex flex-col ${isWinner(index)
                  ? 'border-green-500 shadow-lg ring-4 ring-green-50 z-10'
                  : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                <span className={`font-bold text-xs ${isWinner(index) ? 'text-green-600' : 'text-slate-400'}`}>
                  OPTION {index + 1}
                </span>
                <div className="flex items-center gap-2 pointer-events-auto">
                  {isWinner(index) && <Trophy className="w-4 h-4 text-green-500" />}
                  {decisionState.options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="text-slate-300 hover:text-red-500 transition p-1"
                      title="옵션 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Centered Placeholder Overlay */}
              {opt === '' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-base md:text-lg font-medium opacity-60">
                  문구안 {index + 1}
                </div>
              )}

              <textarea
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full h-full bg-transparent rounded-lg p-4 pt-12 md:pt-16 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-center"
              />
            </div>
          ))}

          {/* Add Button */}
          <button
            onClick={handleAddOption}
            className="h-32 md:h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition gap-2"
          >
            <Plus className="w-6 h-6 md:w-8 md:h-8" />
            <span className="font-semibold text-sm md:text-base">옵션 추가하기</span>
          </button>
        </div>

        {/* Result Area */}
        {decisionState.result && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fade-in-up mb-4">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="bg-green-100 p-3 rounded-full shrink-0">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                  {decisionState.result.winner === 'Equal' ? '모든 옵션이 비슷하게 적절합니다' : `더 나은 선택은 [${decisionState.result.winner}] 입니다`}
                </h3>
                <p className="text-slate-500 text-sm">AI 기반 UX 적합성 판단 결과</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">판단 이유</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg text-sm md:text-base">
                  {decisionState.result.reason}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">추가 제안</h4>
                <p className="text-slate-600 text-sm md:text-base">
                  {decisionState.result.suggestion}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button Container - Fixed at bottom */}
      <div className="fixed bottom-6 lg:left-64 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
        <button
          onClick={handleCompare}
          disabled={loading || decisionState.options.filter(o => o.trim()).length < 2}
          className="pointer-events-auto bg-slate-900 text-white w-full md:w-auto px-10 py-3.5 rounded-full font-bold text-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-300 transform active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              판단 중...
            </span>
          ) : (
            <>
              <ArrowRightLeft className="w-5 h-5" />
              비교하고 결정하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DecisionSupport;