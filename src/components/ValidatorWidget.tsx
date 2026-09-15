import React from 'react';
import { ValidationSummary } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, HardDriveDownload } from 'lucide-react';

interface ValidatorWidgetProps {
  validation: ValidationSummary;
  safeMode: boolean;
  onToggleSafeMode: (val: boolean) => void;
  backupBeforeApply: boolean;
  onToggleBackup: (val: boolean) => void;
}

export const ValidatorWidget: React.FC<ValidatorWidgetProps> = ({
  validation,
  safeMode,
  onToggleSafeMode,
  backupBeforeApply,
  onToggleBackup
}) => {
  const { status, errors, warnings, infos } = validation;

  return (
    <div id="validator-widget" className="rounded-xl border border-[#1f293d] bg-[#151b26]/90 p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f293d] pb-3">
        <div className="flex items-center gap-2">
          {status === 'green' && (
            <div className="flex items-center gap-2 text-[#00ffaa]">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ffaa] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00ffaa]"></span>
              </span>
              <span className="text-sm font-bold tracking-wide">VALIDASI AMAN (READY TO APPLY)</span>
            </div>
          )}
          {status === 'yellow' && (
            <div className="flex items-center gap-2 text-[#ffd166]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-bold tracking-wide">PERINGATAN KONFIGURASI ({warnings.length})</span>
            </div>
          )}
          {status === 'red' && (
            <div className="flex items-center gap-2 text-[#ff4757]">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-bold tracking-wide">ERROR BENTROK / INVALID ({errors.length})</span>
            </div>
          )}
        </div>

        {/* Safety switches */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <label className="flex cursor-pointer items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              id="chk-safe-mode"
              checked={safeMode}
              onChange={(e) => onToggleSafeMode(e.target.checked)}
              className="rounded border-[#1f293d] bg-[#0b0f19] text-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
            />
            <ShieldCheck className="h-3.5 w-3.5 text-[#00f2fe]" />
            <span>Apply Safe Mode</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              id="chk-auto-backup"
              checked={backupBeforeApply}
              onChange={(e) => onToggleBackup(e.target.checked)}
              className="rounded border-[#1f293d] bg-[#0b0f19] text-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]"
            />
            <HardDriveDownload className="h-3.5 w-3.5 text-[#00ffaa]" />
            <span>Backup First</span>
          </label>
        </div>
      </div>

      {/* Itemized feedback */}
      <div className="mt-3 space-y-2">
        {errors.map((item) => (
          <div key={item.id} className="flex items-start gap-2 rounded-lg border border-[#ff4757]/30 bg-[#ff4757]/10 p-2.5 text-xs text-[#ff6b81]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-bold">{item.title}</div>
              <div className="text-slate-300">{item.message}</div>
            </div>
          </div>
        ))}

        {warnings.map((item) => (
          <div key={item.id} className="flex items-start gap-2 rounded-lg border border-[#ffd166]/30 bg-[#ffd166]/10 p-2.5 text-xs text-[#ffd166]">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-bold">{item.title}</div>
              <div className="text-slate-300">{item.message}</div>
            </div>
          </div>
        ))}

        {status === 'green' && (
          <div className="flex items-center gap-2 rounded-lg border border-[#00ffaa]/20 bg-[#00ffaa]/5 p-2 text-xs text-[#00ffaa]">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Semua IP, subnet, gateway, dan routing marks valid tanpa duplikasi atau bentrok.</span>
          </div>
        )}
      </div>
    </div>
  );
};
