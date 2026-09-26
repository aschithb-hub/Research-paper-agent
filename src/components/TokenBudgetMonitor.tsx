import React from 'react';
import { Gauge, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface TokenBudgetMonitorProps {
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  tokenLimit?: number;
}

export const TokenBudgetMonitor: React.FC<TokenBudgetMonitorProps> = ({
  usage = { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
  tokenLimit = 25000,
}) => {
  const total = usage.totalTokenCount || 0;
  const percentage = Math.min(100, Math.round((total / tokenLimit) * 100));
  const isCompliant = total <= tokenLimit;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-slate-400">Agent Token Efficiency: </span>
          <span className="text-white font-semibold">{total.toLocaleString()}</span>
          <span className="text-slate-500"> / {tokenLimit.toLocaleString()} max tokens ({percentage}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xs min-w-[140px]">
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.max(4, percentage)}%` }}
          />
        </div>
      </div>

      {/* Compliance Badge */}
      <div className="flex items-center gap-1.5">
        {isCompliant ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Under 25k Budget Constraint</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Budget Exceeded</span>
          </div>
        )}
      </div>
    </div>
  );
};
