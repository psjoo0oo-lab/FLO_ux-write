import React, { useState } from 'react';
import { getConceptExplanation } from '../services/llmService';
import { Search, Book } from 'lucide-react';

const TOPICS = [
  "마이크로카피의 기본 원칙",
  "보이스 앤 톤 (Voice & Tone)",
  "버튼 레이블 작성법",
  "에러 메시지 작성 가이드",
  "사용자 관점 글쓰기 (User-Centric)",
  "접근성을 고려한 글쓰기"
];

const KnowledgeBase: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTopicClick = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    setContent("");
    try {
      const explanation = await getConceptExplanation(topic);
      setContent(explanation);
    } catch (e) {
      setContent("내용을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">라이팅 지식 (Knowledge Base)</h2>
        <p className="text-slate-500">UX 라이팅의 기본 개념과 원칙들을 AI에게 물어보고 학습하세요.</p>
      </header>

      <div className="flex gap-8 h-full min-h-0">
        <div className="w-1/3 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
            <Book className="w-5 h-5" />
            추천 토픽
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className={`w-full text-left p-4 rounded-lg transition mb-1 text-sm font-medium ${selectedTopic === topic ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-8 overflow-y-auto">
          {!selectedTopic ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p>좌측에서 토픽을 선택하면 AI가 설명해드립니다.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                {selectedTopic}
              </h3>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-loose">
                  {content}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
