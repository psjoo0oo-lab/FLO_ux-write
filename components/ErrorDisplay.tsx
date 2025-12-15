import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = "일시적인 오류가 발생했어요",
    message = "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    onRetry,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[300px] ${className}`}>
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
                {title}
            </h3>

            <p className="text-slate-500 mb-8 max-w-md break-keep leading-relaxed whitespace-pre-wrap">
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors active:scale-95"
                >
                    <RefreshCw className="w-4 h-4" />
                    다시 시도하기
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;
