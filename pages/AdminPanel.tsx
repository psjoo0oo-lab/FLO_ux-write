import React, { useContext, useState, useRef, useEffect } from 'react';
import { GuideContext } from '../App';
import { Upload, Check, Lock, AlertCircle, File as FileIcon, Trash2, Inbox, Download, Settings, ChevronDown, ChevronUp, Plus, Loader2, Save, RefreshCcw, X, AlertTriangle, BookOpen } from 'lucide-react';
import { Attachment } from '../types';

// Helper component extracted outside to prevent re-mounting issues
interface FileListProps {
    files: Attachment[];
    onRemove: (id: string) => void;
    readOnly?: boolean;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, readOnly = false }) => (
    <div className="space-y-2 mt-2">
        {files.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm bg-slate-50/50">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>업로드된 파일이 없습니다.</p>
            </div>
        ) : (
            files.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${file.type === 'application/pdf' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            <FileIcon className="w-5 h-5" />
                        </div>
                        <div className="truncate min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                {file.type === 'application/pdf' ? 'PDF 문서' : '텍스트 문서'}
                                <span className="text-slate-300">|</span>
                                {(file.data.length * 0.75 / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    {!readOnly && (
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // Stop event bubbling
                                onRemove(file.id);
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="파일 삭제"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))
        )}
    </div>
);

const AdminPanel: React.FC = () => {
  const { customGuide, caseStudies, guideAttachments, caseAttachments, updateSettings, lastUpdated, feedbackList, clearFeedback } = useContext(GuideContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'FEEDBACK'>('GUIDE');
  
  // State for text inputs
  const [guideValue, setGuideValue] = useState(customGuide);
  const [casesValue, setCasesValue] = useState(caseStudies);
  
  // State for attachments
  const [guideFiles, setGuideFiles] = useState<Attachment[]>(guideAttachments);
  const [caseFiles, setCaseFiles] = useState<Attachment[]>(caseAttachments);

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGuideTextOpen, setIsGuideTextOpen] = useState(false);
  const [isCaseTextOpen, setIsCaseTextOpen] = useState(false);
  
  // Alert & Confirm States
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, isCaseStudy: boolean} | null>(null);
  
  // Refs for file inputs
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (uploadError) {
          const timer = setTimeout(() => setUploadError(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [uploadError]);

  const handleLogin = () => {
    if (password === '2025PDtone&flo') {
      setIsAdmin(true);
      // Sync local state with global context on login
      setGuideValue(customGuide);
      setCasesValue(caseStudies);
      setGuideFiles(guideAttachments);
      setCaseFiles(caseAttachments);
      
      setLoginError('');
      if (customGuide) setIsGuideTextOpen(true);
      if (caseStudies) setIsCaseTextOpen(true);
    } else {
      setLoginError("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (loginError) setLoginError('');
  };

  const handleSave = () => {
    updateSettings(guideValue, casesValue, guideFiles, caseFiles);
    alert("설정이 저장되었습니다. 가이드라인과 학습 사례(문서 포함)가 모든 툴에 반영됩니다.");
  };

  const handleExportSettings = () => {
      const data = {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          settings: {
              customGuide: guideValue,
              caseStudies: casesValue,
              guideAttachments: guideFiles,
              caseAttachments: caseFiles
          }
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tone_and_flo_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.settings) {
                  const { customGuide, caseStudies, guideAttachments, caseAttachments } = json.settings;
                  
                  // Update Local State
                  setGuideValue(customGuide || '');
                  setCasesValue(caseStudies || '');
                  setGuideFiles(guideAttachments || []);
                  setCaseFiles(caseAttachments || []);
                  
                  // Update Global & Persist
                  updateSettings(
                      customGuide || '', 
                      caseStudies || '', 
                      guideAttachments || [], 
                      caseAttachments || []
                  );
                  
                  alert("설정이 성공적으로 복원되었습니다.");
              } else {
                  throw new Error("Invalid format");
              }
          } catch (err) {
              alert("파일 형식이 올바르지 않습니다. Tone & FLO 백업 파일인지 확인해주세요.");
              console.error(err);
          } finally {
              if (importInputRef.current) importInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const handleDownloadCSV = () => {
    if (feedbackList.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const headers = ["ID", "유형", "날짜", "내용"];
    const rows = feedbackList.map(item => [
      item.id,
      item.type === 'OPINION' ? '서비스 의견' : '사례 제보',
      item.date,
      `"${item.content.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tone_and_flo_feedback_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          const result = reader.result as string;
          // Extract the base64 part
          resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCaseStudy: boolean) => {
    const input = e.target;
    const file = input.files?.[0];
    
    // Always reset input to allow re-selection of the same file
    // We captured the file reference above, so this is safe.
    input.value = '';

    if (!file) return;

    // 1. Check Size
    if (file.size > 5 * 1024 * 1024) {
        setUploadError("업로드 실패: 파일 크기가 5MB를 초과했습니다.");
        return;
    }

    setIsProcessing(true);

    try {
        const base64Data = await fileToBase64(file);
        
        // Robust PDF detection (Check MIME type OR extension)
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        const newAttachment: Attachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
            name: file.name,
            type: isPdf ? 'application/pdf' : (file.type || 'text/plain'), 
            data: base64Data
        };
        
        if (isCaseStudy) {
            setCaseFiles(prev => [...prev, newAttachment]);
        } else {
            setGuideFiles(prev => [...prev, newAttachment]);
        }
    } catch (error) {
        console.error("File processing failed", error);
        setUploadError("파일 처리에 실패했습니다. 다시 시도해주세요.");
    } finally {
        setIsProcessing(false);
    }
  };

  const requestDelete = (id: string, isCaseStudy: boolean) => {
      setDeleteTarget({ id, isCaseStudy });
  };

  const confirmDelete = () => {
      if (!deleteTarget) return;
      
      const { id, isCaseStudy } = deleteTarget;
      if (isCaseStudy) {
          setCaseFiles(prev => prev.filter(f => f.id !== id));
      } else {
          setGuideFiles(prev => prev.filter(f => f.id !== id));
      }
      setDeleteTarget(null);
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">관리자 권한 필요</h2>
          <p className="text-slate-500 mb-6">가이드라인을 수정하려면 비밀번호를 입력하세요.</p>
          
          <div className="mb-4">
            <input 
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  loginError ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:border-indigo-500'
              }`}
              placeholder="비밀번호 입력"
            />
            {loginError && (
                <div className="text-red-500 text-sm mt-2 flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                </div>
            )}
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition"
          >
            관리자 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col relative">
      {/* Upload Error Toast */}
      {uploadError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-down">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="ml-2 bg-white/20 rounded-full p-0.5 hover:bg-white/30">
                  <X className="w-4 h-4" />
              </button>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">파일을 삭제하시겠습니까?</h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              삭제 후 상단의 '변경사항 저장'을 눌러야<br/>최종적으로 반영됩니다.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
              >
                취소
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end shrink-0 gap-4 mt-6 md:mt-0">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">관리자 설정</h2>
            <p className="text-slate-500 text-sm lg:text-base">전사 가이드라인 리소스 및 사용자 의견을 관리합니다.</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
             <div className="text-right text-sm text-slate-500">
                <p>최근 업데이트:</p>
                <p className="font-medium text-slate-900">{lastUpdated}</p>
            </div>
            
            {/* Backup/Restore Controls - Preserving space using visibility */}
            <div className={`flex gap-2 mt-2 ${activeTab === 'GUIDE' ? '' : 'invisible pointer-events-none'}`}>
                <input 
                    type="file" 
                    ref={importInputRef}
                    className="hidden" 
                    accept=".json"
                    onChange={handleImportSettings}
                />
                <button 
                    onClick={() => importInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition"
                    title="백업 파일(.json)을 불러와 설정을 복원합니다."
                    tabIndex={activeTab === 'GUIDE' ? 0 : -1}
                >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    설정 복원
                </button>
                <button 
                    onClick={handleExportSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition"
                    title="현재 설정을 파일로 다운로드합니다."
                    tabIndex={activeTab === 'GUIDE' ? 0 : -1}
                >
                    <Save className="w-3.5 h-3.5" />
                    설정 백업
                </button>
            </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        <button
            onClick={() => setActiveTab('GUIDE')}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'GUIDE' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Settings className="w-4 h-4" />
            가이드라인 리소스 관리
        </button>
        <button
            onClick={() => setActiveTab('FEEDBACK')}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'FEEDBACK' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Inbox className="w-4 h-4" />
            사용자 의견함
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        {activeTab === 'GUIDE' ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24 lg:pb-0 items-start">
                {/* General Guide Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">전사 공통 가이드라인</h3>
                                <p className="text-xs text-slate-500">PDF, 텍스트 파일 업로드 (최대 5MB)</p>
                            </div>
                        </div>
                        <input 
                            type="file"
                            id="guide-upload"
                            className="hidden"
                            accept=".pdf,.txt,.md"
                            onChange={(e) => handleFileUpload(e, false)}
                        />
                        <label 
                            htmlFor="guide-upload"
                            className={`flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            파일 추가
                        </label>
                    </div>

                    <div className="flex-1 min-h-[100px] mb-4">
                        <FileList 
                            files={guideFiles} 
                            onRemove={(id) => requestDelete(id, false)} 
                        />
                    </div>

                    {/* Collapsible Text Input */}
                    <div className="border-t border-slate-100 pt-4">
                        <button 
                            onClick={() => setIsGuideTextOpen(!isGuideTextOpen)}
                            className="flex items-center justify-between w-full text-sm text-slate-500 hover:text-slate-800"
                        >
                            <span className="font-medium">직접 텍스트 입력 (메모)</span>
                            {isGuideTextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isGuideTextOpen && (
                            <textarea
                                className="w-full h-32 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
                                placeholder="핵심 가이드라인이나 원칙을 직접 입력하세요..."
                                value={guideValue}
                                onChange={(e) => setGuideValue(e.target.value)}
                            />
                        )}
                    </div>
                </section>

                {/* Case Studies Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">사례 학습 (Case Studies)</h3>
                                <p className="text-xs text-slate-500">PDF, 텍스트 파일 업로드 (최대 5MB)</p>
                            </div>
                        </div>
                        <input 
                            type="file"
                            id="case-upload"
                            className="hidden"
                            accept=".pdf,.txt,.md"
                            onChange={(e) => handleFileUpload(e, true)}
                        />
                        <label 
                            htmlFor="case-upload"
                            className={`flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            파일 추가
                        </label>
                    </div>

                    <div className="flex-1 min-h-[100px] mb-4">
                        <FileList 
                            files={caseFiles} 
                            onRemove={(id) => requestDelete(id, true)} 
                        />
                    </div>

                    {/* Collapsible Text Input */}
                    <div className="border-t border-slate-100 pt-4">
                         <button 
                            onClick={() => setIsCaseTextOpen(!isCaseTextOpen)}
                            className="flex items-center justify-between w-full text-sm text-slate-500 hover:text-slate-800"
                        >
                            <span className="font-medium">직접 텍스트 입력 (메모)</span>
                            {isCaseTextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isCaseTextOpen && (
                             <textarea
                                className="w-full h-32 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm resize-none"
                                placeholder="좋은 예시나 나쁜 예시를 직접 입력하세요..."
                                value={casesValue}
                                onChange={(e) => setCasesValue(e.target.value)}
                            />
                        )}
                    </div>
                </section>
             </div>
        ) : (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-24 lg:pb-0">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 pl-2">수신된 의견 목록 ({feedbackList.length})</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-green-500 hover:text-green-600 transition"
                        >
                            <Download className="w-3.5 h-3.5" />
                            CSV 다운로드
                        </button>
                    </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {feedbackList.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>아직 접수된 의견이 없습니다.</p>
                        </div>
                    ) : (
                        feedbackList.map((item) => (
                            <div key={item.id} className="p-4 hover:bg-slate-50 transition group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            item.type === 'OPINION' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {item.type === 'OPINION' ? '서비스 의견' : '사례 제보'}
                                        </span>
                                        <span className="text-xs text-slate-400">{item.date}</span>
                                    </div>
                                    <button 
                                        onClick={() => clearFeedback(item.id)}
                                        className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                                        title="삭제"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {item.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
             </div>
        )}
      </div>

      {/* Floating Save Button */}
      {activeTab === 'GUIDE' && (
          <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
            <button
                onClick={handleSave}
                className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-slate-800 transition flex items-center gap-2"
            >
                <Save className="w-5 h-5" />
                변경사항 저장
            </button>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;