import React, { useState } from 'react';
import { X, MessageSquare, BookOpen, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'OPINION' | 'CASE_STUDY', content: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'OPINION' | 'CASE_STUDY'>('OPINION');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(activeTab, content);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">의견 보내기</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('OPINION')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'OPINION'
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            서비스 의견
          </button>
          <button
            onClick={() => setActiveTab('CASE_STUDY')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'CASE_STUDY'
                ? 'bg-white text-green-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            사례 제보
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'OPINION' ? (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                Tone & FLO를 사용하면서 느꼈던 불편한 점이나, 추가되었으면 하는 기능이 있다면 자유롭게 남겨주세요.
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력해주세요..."
                className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-4">
               <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-green-800 text-sm font-medium mb-1">💡 함께 똑똑해지는 UX 라이팅</p>
                  <p className="text-green-700 text-xs leading-relaxed">
                    실무에서 고민했던 문구나, 잘 해결된 좋은 사례를 공유해주세요.<br/>
                    제보해주신 내용은 추후 AI 학습 데이터로 활용될 수 있습니다.
                  </p>
               </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={'상황: 결제 실패 토스트 메시지\n\n[기존]\n결제에 실패했습니다.\n\n[개선]\n카드 잔액 부족으로 결제가 진행되지 않았어요.'}
                className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm leading-relaxed font-mono"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-sm ${
                activeTab === 'OPINION' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300' 
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
            }`}
          >
            <Send className="w-4 h-4" />
            보내기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;