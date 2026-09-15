import React, { useState } from 'react';
import { RosVersion } from '../types';
import { Copy, Check, Download, FileCode, Save, Terminal, ShieldAlert } from 'lucide-react';

interface TerminalOutputProps {
  script: string;
  rosVersion: RosVersion;
  onVersionChange: (ver: RosVersion) => void;
  routerName: string;
  onSaveConfig: () => void;
  isSaving: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  script,
  rosVersion,
  onVersionChange,
  routerName,
  onSaveConfig,
  isSaving
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleDownload = (ext: 'rsc' | 'txt') => {
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${routerName || 'mikrotik'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate lines & size
  const lineCount = script.split('\n').length;
  const byteSize = new Blob([script]).size;
  const kbSize = (byteSize / 1024).toFixed(1);

  return (
    <div id="terminal-panel" className="flex h-full flex-col rounded-xl border border-[#1f293d] bg-[#070a10] shadow-2xl overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1f293d] bg-[#0d121c] px-4 py-2.5 gap-2">
        <div className="flex items-center gap-2 font-mono text-xs text-[#00f2fe]">
          <div className="flex gap-1.5 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
          </div>
          <Terminal className="h-4 w-4" />
          <span className="font-semibold text-slate-200">
            [admin@{routerName || 'MikroTik'}] &gt; <span className="text-[#00ffaa]">{routerName || 'mikrotik'}.rsc</span>
          </span>
          <span className="rounded bg-[#1a2333] px-2 py-0.5 text-[10px] text-slate-400">
            {lineCount} baris &bull; {kbSize} KB
          </span>
        </div>

        {/* ROS Version Switch & Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle ROS Version */}
          <div className="inline-flex rounded-lg border border-[#1f293d] bg-[#111723] p-0.5 text-xs font-mono">
            <button
              id="btn-switch-v7"
              onClick={() => onVersionChange('v7')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                rosVersion === 'v7'
                  ? 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] font-bold text-black shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RouterOS v7
            </button>
            <button
              id="btn-switch-v6"
              onClick={() => onVersionChange('v6')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                rosVersion === 'v6'
                  ? 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] font-bold text-black shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RouterOS v6
            </button>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1f293d]/60 bg-[#0a0e17] px-4 py-2 gap-2">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-[#00ffaa]" />
          <span>Siap copy &amp; paste langsung ke Terminal Winbox / SSH MikroTik</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-script"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-md ${
              copied
                ? 'bg-[#00ffaa] text-black ring-2 ring-[#00ffaa]'
                : 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black hover:opacity-90 active:scale-95'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'TER-COPY!' : 'COPY SCRIPT'}</span>
          </button>

          <button
            id="btn-download-rsc"
            onClick={() => handleDownload('rsc')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#151b26] px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#00f2fe]/40 hover:bg-[#1f293d] transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#00ffaa]" />
            <span>.RSC</span>
          </button>

          <button
            id="btn-download-txt"
            onClick={() => handleDownload('txt')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#151b26] px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#00f2fe]/40 hover:bg-[#1f293d] transition-colors"
          >
            <FileCode className="h-3.5 w-3.5 text-slate-400" />
            <span>.TXT</span>
          </button>

          <button
            id="btn-save-spreadsheet"
            onClick={onSaveConfig}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-3 py-1.5 text-xs font-bold text-[#00ffaa] hover:bg-[#00ffaa]/20 transition-all disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'SAVE SCRIPT'}</span>
          </button>
        </div>
      </div>

      {/* Script Code Viewer */}
      <div className="relative flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed select-text">
        <pre className="text-slate-300">
          {script.split('\n').map((line, idx) => {
            const trimmed = line.trim();
            let lineClass = 'text-slate-300';
            if (trimmed.startsWith('#')) {
              lineClass = 'text-slate-500 font-medium italic';
            } else if (trimmed.startsWith('/')) {
              lineClass = 'text-[#00f2fe] font-semibold';
            } else if (trimmed.includes('=')) {
              lineClass = 'text-[#e2e8f0]';
            }

            return (
              <div key={idx} className="flex hover:bg-white/[0.03] transition-colors group">
                <span className="w-10 flex-shrink-0 select-none text-right pr-4 text-slate-600 group-hover:text-slate-400 text-[11px]">
                  {idx + 1}
                </span>
                <span className={`flex-1 break-all ${lineClass}`}>
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};
