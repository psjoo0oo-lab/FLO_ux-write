import React from 'react';
import { AnalysisResult, WritingMode } from '../types';
import { Copy, RefreshCw, ThumbsUp, Sparkles, PlusCircle, Check, Lightbulb, AlertCircle, Bot } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult | null;
  loading: boolean;
  onGetMore?: () => void;
  moreLoading?: boolean;
  getMoreCount?: number;
  isInvalidInput?: boolean;
  mode?: WritingMode;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  loading,
  onGetMore,
  moreLoading = false,
  getMoreCount = 0,
  isInvalidInput = false,
  mode
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center animate-pulse">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-spin-slow" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">분석 중입니다...</h3>
        <p className="text-slate-500">가이드라인과 톤앤매너를 바탕으로 최적의 문구를 생성하고 있습니다.</p>
      </div>
    );
  }

  // Guidance Screen for Invalid Input
  if (isInvalidInput) {
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">조금 더 자세한 내용이 필요해요</h3>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
          AI가 의도를 정확히 파악할 수 있도록 단어보다는 문장이나 상황을 구체적으로 적어주세요.
        </p>

        <div className="w-full bg-slate-50 rounded-lg p-5 text-left border border-slate-100 space-y-4">
          <div>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-1 inline-block">Bad</span>
            <p className="text-slate-600 text-sm pl-1">
              {mode === WritingMode.CREATE ? '"오류", "버튼", "."' : '"취소", "확인", "."'}
            </p>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1 inline-block">Good</span>
            <p className="text-slate-800 font-medium text-sm pl-1">
              {mode === WritingMode.CREATE
                ? '"로그인 실패 시 비밀번호 불일치를 알리는 에러 메시지"'
                : '"정말 탈퇴하시겠습니까? 탈퇴 후 정보는 복구되지 않습니다."'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <MonitorIcon />
        </div>
        <p className="text-slate-500 font-medium">좌측 폼을 입력하고 분석을 시작하세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-full">
      <div className="p-6 border-b border-slate-100 bg-indigo-50/50">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            AI 추천 문구
          </span>
          <button
            onClick={() => handleCopy(result.improvedText)}
            className="text-slate-400 hover:text-indigo-600 transition flex items-center gap-1 text-xs font-medium"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
        <p className="text-xl font-bold text-slate-900 leading-relaxed break-keep">
          {result.improvedText}
        </p>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-slate-500" />
            선정 이유
          </h4>
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
            {result.reasoning}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              다른 제안
            </h4>
            <span className="text-xs text-slate-400 font-medium">{result.alternatives.length}개 제안</span>
          </div>

          <ul className="space-y-2">
            {result.alternatives.map((alt, idx) => (
              <li key={idx} className="group flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                <span className="text-sm text-slate-700 leading-relaxed break-keep pr-2">{alt}</span>
                <button
                  onClick={() => handleCopy(alt)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1"
                  title="복사"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>

          {onGetMore && getMoreCount < 3 && (
            <button
              onClick={onGetMore}
              disabled={moreLoading}
              className="w-full mt-4 py-3 rounded-lg border border-dashed border-indigo-300 text-indigo-600 font-medium text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {moreLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              제안 더 받기 ({getMoreCount}/3)
            </button>
          )}
          {getMoreCount >= 3 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              추가 제안 횟수를 모두 사용했습니다.
            </p>
          )}

          {result.usedModel && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
              <Bot className="w-3 h-3" />
              <span>답변 적용 모델: <span className="font-semibold">{result.usedModel}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple icon component for placeholder
const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export default ResultCard;