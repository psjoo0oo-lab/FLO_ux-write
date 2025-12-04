import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, FileSignature, Scale, Shield, ArrowRight, LayoutGrid } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col justify-start lg:justify-center items-center max-w-5xl mx-auto animate-fade-in-up py-8 lg:py-0 pb-24 lg:pb-0">
      <div className="text-center mb-10 lg:mb-12 mt-6 lg:mt-0 px-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          Tone & FLO
        </h1>
        <p className="text-base lg:text-lg text-slate-500 leading-relaxed break-keep">
          오늘 어떤 UX 라이팅 작업이 필요하신가요?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 px-4 md:px-0">
        {/* Card 1: Create */}
        <Link 
          to="/create" 
          className="group relative bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <PenTool className="w-6 h-6 lg:w-7 lg:h-7" />
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
            제안받기
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base mb-10 flex-1">
            의도와 상황을 입력하면 상황에 맞는 최적의 UX 문구를 제안해 드려요.
          </p>
          <div className="flex items-center text-indigo-600 font-semibold text-sm">
            시작하기 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Refine */}
        <Link 
          to="/refine" 
          className="group relative bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileSignature className="w-6 h-6 lg:w-7 lg:h-7" />
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
            검토하기
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base mb-10 flex-1">
            작성한 문구가 가이드에 맞는지 검토하고 더 나은 표현으로 다듬어드려요.
          </p>
          <div className="flex items-center text-emerald-600 font-semibold text-sm">
            시작하기 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Decision */}
        <Link 
          to="/decision" 
          className="group relative bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Scale className="w-6 h-6 lg:w-7 lg:h-7" />
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
            결정하기
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base mb-10 flex-1">
            고민되는 여러 문구 옵션을 비교 분석하여 최적의 선택을 도와드릴게요
          </p>
          <div className="flex items-center text-amber-600 font-semibold text-sm">
            시작하기 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;