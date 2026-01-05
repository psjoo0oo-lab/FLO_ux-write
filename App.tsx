
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate, Link } from 'react-router-dom';
import { PenTool, Scale, Shield, Settings, FileSignature, LayoutGrid, Menu, X, MessageSquareQuote } from 'lucide-react';
import WritingAssistant from './pages/WritingAssistant';
import DecisionSupport from './pages/DecisionSupport';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import FeedbackModal from './components/FeedbackModal';
import { WritingGuide, WritingMode, ToneLevel, WritingContext, AnalysisResult, CompareResult, Attachment, UserFeedback } from './types';

// Global Context for "Custom Guide" and "Case Studies"
export const GuideContext = React.createContext<{
  customGuide: string;
  caseStudies: string;
  guideAttachments: Attachment[];
  caseAttachments: Attachment[];
  updateSettings: (guide: string, cases: string, guideFiles: Attachment[], caseFiles: Attachment[]) => void;
  lastUpdated: string;
  feedbackList: UserFeedback[];
  addFeedback: (type: 'OPINION' | 'CASE_STUDY', content: string) => void;
  clearFeedback: (id: string) => void;
}>({
  customGuide: '',
  caseStudies: '',
  guideAttachments: [],
  caseAttachments: [],
  updateSettings: () => { },
  lastUpdated: '',
  feedbackList: [],
  addFeedback: () => { },
  clearFeedback: () => { },
});

// New Context for persisting form state across tabs
export interface PageState {
  context: WritingContext;
  element: string; // Specific element (e.g., "Button", "Title")
  inputText: string;
  tone: ToneLevel;
  imageFile: File | null;
  imagePreview: string | null;
  result: AnalysisResult | null;
  getMoreCount: number;
  isInvalidInput: boolean; // Flag for insufficient input validation
}

export interface DecisionState {
  options: string[];
  result: CompareResult | null;
}

const defaultPageState: PageState = {
  context: WritingContext.PRODUCT_UI,
  element: '',
  inputText: '',
  tone: ToneLevel.NEUTRAL,
  imageFile: null,
  imagePreview: null,
  result: null,
  getMoreCount: 0,
  isInvalidInput: false,
};

const defaultDecisionState: DecisionState = {
  options: ['', ''],
  result: null,
};

export const FormStateContext = React.createContext<{
  createState: PageState;
  setCreateState: React.Dispatch<React.SetStateAction<PageState>>;
  refineState: PageState;
  setRefineState: React.Dispatch<React.SetStateAction<PageState>>;
  decisionState: DecisionState;
  setDecisionState: React.Dispatch<React.SetStateAction<DecisionState>>;
}>({
  createState: defaultPageState,
  setCreateState: () => { },
  refineState: defaultPageState,
  setRefineState: () => { },
  decisionState: defaultDecisionState,
  setDecisionState: () => { },
});

const Navigation = ({ isOpen, onClose, onOpenFeedback }: { isOpen: boolean; onClose: () => void; onOpenFeedback: () => void }) => {
  const mainNavItems = [
    { path: '/', icon: LayoutGrid, label: '홈' },
    { path: '/create', icon: PenTool, label: '제안받기' },
    { path: '/refine', icon: FileSignature, label: '검토하기' },
    { path: '/decision', icon: Scale, label: '결정하기' },
  ];

  const adminNavItem = { path: '/admin', icon: Shield, label: '관리자 설정' };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <Link to="/" onClick={onClose} className="block group">
              <h1 className="text-white text-3xl font-bold tracking-tight group-hover:text-indigo-400 transition-colors">
                Tone & FLO
              </h1>
            </Link>
            <p className="text-xs text-slate-500 mt-2 font-medium">UX Write 도우미</p>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()} // Close menu on selection (mobile)
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                  ? 'bg-indigo-600 text-white shadow-md font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-1">
          {/* Feedback Button */}
          <button
            onClick={() => {
              onClose();
              onOpenFeedback();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 group"
          >
            <MessageSquareQuote className="w-5 h-5 group-hover:text-indigo-400" />
            의견 보내기
          </button>

          <NavLink
            to={adminNavItem.path}
            onClick={() => onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-2 ${isActive
                ? 'bg-indigo-900 text-white shadow-md font-medium'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <adminNavItem.icon className="w-5 h-5" />
            {adminNavItem.label}
          </NavLink>

          <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 pt-2 border-t border-slate-800/50">
            <Settings className="w-4 h-4" />
            <span>v1.0.4</span>
          </div>
        </div>
      </nav>
    </>
  );
};

const App: React.FC = () => {
  // Simulate persistent storage for Settings
  const [customGuide, setCustomGuide] = useState<string>(() => {
    return localStorage.getItem('ux_custom_guide') || '';
  });
  const [caseStudies, setCaseStudies] = useState<string>(() => {
    return localStorage.getItem('ux_case_studies') || '';
  });
  const [guideAttachments, setGuideAttachments] = useState<Attachment[]>(() => {
    try {
      const saved = localStorage.getItem('ux_guide_attachments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load guide attachments", e);
      return [];
    }
  });
  const [caseAttachments, setCaseAttachments] = useState<Attachment[]>(() => {
    try {
      const saved = localStorage.getItem('ux_case_attachments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load case attachments", e);
      return [];
    }
  });
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem('ux_guide_updated') || '-';
  });
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('ux_user_feedback');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load feedback", e);
      return [];
    }
  });

  // State for Form Persistence
  const [createState, setCreateState] = useState<PageState>(defaultPageState);
  const [refineState, setRefineState] = useState<PageState>(defaultPageState);
  const [decisionState, setDecisionState] = useState<DecisionState>(defaultDecisionState);

  // Mobile Menu & Feedback Modal State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const updateSettings = (guide: string, cases: string, guideFiles: Attachment[], caseFiles: Attachment[]) => {
    try {
      setCustomGuide(guide);
      setCaseStudies(cases);
      setGuideAttachments(guideFiles);
      setCaseAttachments(caseFiles);

      const now = new Date().toLocaleString('ko-KR');
      setLastUpdated(now);

      localStorage.setItem('ux_custom_guide', guide);
      localStorage.setItem('ux_case_studies', cases);
      localStorage.setItem('ux_guide_attachments', JSON.stringify(guideFiles));
      localStorage.setItem('ux_case_attachments', JSON.stringify(caseFiles));
      localStorage.setItem('ux_guide_updated', now);
    } catch (e) {
      alert("저장 용량이 초과되어 일부 파일이 저장되지 않았을 수 있습니다. 큰 PDF 파일은 제외해주세요.");
      console.error("Local Storage Save Error", e);
    }
  };

  const addFeedback = async (type: 'OPINION' | 'CASE_STUDY', content: string) => {
    const timestamp = new Date().toLocaleString('ko-KR');
    const newFeedback: UserFeedback = {
      id: Date.now().toString(),
      type,
      content,
      date: timestamp
    };

    const updatedList = [newFeedback, ...feedbackList];
    setFeedbackList(updatedList);
    localStorage.setItem('ux_user_feedback', JSON.stringify(updatedList));

    // Webhook 전송 로직 (Slack 또는 Generic)
    const webhookUrl = import.meta.env.VITE_FEEDBACK_WEBHOOK_URL || import.meta.env.VITE_SLACK_WEBHOOK_URL;

    if (webhookUrl) {
      try {
        const isSlack = webhookUrl.includes('slack.com');
        const payload = isSlack ? {
          attachments: [
            {
              color: type === 'OPINION' ? '#4f46e5' : '#16a34a',
              title: type === 'OPINION' ? '🔔 새로운 서비스 의견' : '💡 새로운 사례 제보',
              text: content,
              fields: [
                { title: "일시", value: timestamp, short: true },
                { title: "유형", value: type === 'OPINION' ? '서비스 의견' : '사례 제보', short: true }
              ],
              footer: "Tone & FLO Feedback System"
            }
          ]
        } : {
          // 구글 시트나 일반 Webhook용 데이터 포맷
          id: newFeedback.id,
          type: type === 'OPINION' ? '서비스 의견' : '사례 제보',
          content: content,
          date: timestamp
        };

        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.error("Webhook notification failed", e);
      }
    }

    alert(type === 'OPINION' ? "소중한 의견 감사합니다!" : "사례 제보 감사합니다! 검토 후 반영하겠습니다.");
  };

  const clearFeedback = (id: string) => {
    const updatedList = feedbackList.filter(item => item.id !== id);
    setFeedbackList(updatedList);
    localStorage.setItem('ux_user_feedback', JSON.stringify(updatedList));
  };

  return (
    <GuideContext.Provider value={{
      customGuide, caseStudies, guideAttachments, caseAttachments, updateSettings, lastUpdated,
      feedbackList, addFeedback, clearFeedback
    }}>
      <FormStateContext.Provider value={{
        createState, setCreateState,
        refineState, setRefineState,
        decisionState, setDecisionState
      }}>
        <HashRouter>
          <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Navigation
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onOpenFeedback={() => setIsFeedbackOpen(true)}
            />

            <main className="flex-1 flex flex-col h-full relative w-full">
              {/* Mobile Header & Tabs */}
              <div className="lg:hidden bg-white border-b border-slate-200 shrink-0 z-20 sticky top-0">
                {/* Top Row: Logo & Menu Button */}
                <div className="p-4 flex items-center justify-between">
                  <Link to="/" className="font-bold text-lg text-slate-900">Tone & FLO</Link>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -mr-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>

                {/* Bottom Row: Fixed Quick Tabs */}
                <div className="flex px-4 space-x-1 overflow-x-auto no-scrollbar">
                  <NavLink
                    to="/create"
                    className={({ isActive }) => `
                        flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap px-4
                        ${isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}
                    `}
                  >
                    제안받기
                  </NavLink>
                  <NavLink
                    to="/refine"
                    className={({ isActive }) => `
                        flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap px-4
                        ${isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}
                    `}
                  >
                    검토하기
                  </NavLink>
                  <NavLink
                    to="/decision"
                    className={({ isActive }) => `
                        flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap px-4
                        ${isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}
                    `}
                  >
                    결정하기
                  </NavLink>
                </div>
              </div>

              {/* 
                Main Content Area 
                - Mobile: overflow-auto (window scroll feel)
                - Desktop: overflow-hidden (app-like feel, internal panels scroll)
              */}
              <div className="flex-1 overflow-auto lg:overflow-hidden relative bg-slate-50/50">
                <div className="h-full max-w-7xl mx-auto p-4 md:p-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create" element={<WritingAssistant mode={WritingMode.CREATE} />} />
                    <Route path="/refine" element={<WritingAssistant mode={WritingMode.REFINE} />} />
                    <Route path="/decision" element={<DecisionSupport />} />
                    <Route path="/admin" element={<AdminPanel />} />
                  </Routes>
                </div>
              </div>
            </main>

            {/* Feedback Modal */}
            <FeedbackModal
              isOpen={isFeedbackOpen}
              onClose={() => setIsFeedbackOpen(false)}
              onSubmit={addFeedback}
            />
          </div>
        </HashRouter>
      </FormStateContext.Provider>
    </GuideContext.Provider>
  );
};

export default App;
