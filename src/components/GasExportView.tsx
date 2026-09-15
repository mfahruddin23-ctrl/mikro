import React, { useState } from 'react';
import { GAS_FILES, GasFileItem } from '../data/gasFiles';
import { FileCode2, Copy, Check, Download, ExternalLink, HelpCircle, CheckCircle } from 'lucide-react';

export const GasExportView: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile: GasFileItem = GAS_FILES[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-3 py-1 text-xs font-semibold text-[#00ffaa]">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>3-File Architecture Siap Deploy ke Google Apps Script</span>
            </div>
            <h2 className="mt-2 text-base md:text-lg font-bold text-white">
              File Kode Google Apps Script (setup.gs, code.gs, index.html)
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Gunakan ketiga file ini untuk men-deploy aplikasi secara mandiri di akun Google Sheets / Google Workspace Anda secara gratis tanpa server tambahan.
            </p>
          </div>
        </div>

        {/* Step by step deployment tutorial cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-4 border-t border-[#1f293d]">
          <div className="rounded-lg border border-[#1f293d] bg-[#0b0f19] p-3 text-xs">
            <div className="font-bold text-[#00f2fe] font-mono">LANGKAH 1</div>
            <div className="mt-1 text-slate-300 font-semibold">Buat Google Sheet</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Buka sheets.new lalu klik menu <em>Extensions &gt; Apps Script</em>.</div>
          </div>

          <div className="rounded-lg border border-[#1f293d] bg-[#0b0f19] p-3 text-xs">
            <div className="font-bold text-[#00f2fe] font-mono">LANGKAH 2</div>
            <div className="mt-1 text-slate-300 font-semibold">Paste 3 File</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Buat file <code>setup.gs</code>, <code>code.gs</code>, dan <code>index.html</code> di editor.</div>
          </div>

          <div className="rounded-lg border border-[#1f293d] bg-[#0b0f19] p-3 text-xs">
            <div className="font-bold text-[#00f2fe] font-mono">LANGKAH 3</div>
            <div className="mt-1 text-slate-300 font-semibold">Jalankan setupDatabase()</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Pilih fungsi <code>setupDatabase</code> di toolbar lalu klik Run untuk inisialisasi sheet.</div>
          </div>

          <div className="rounded-lg border border-[#1f293d] bg-[#0b0f19] p-3 text-xs">
            <div className="font-bold text-[#00ffaa] font-mono">LANGKAH 4</div>
            <div className="mt-1 text-slate-300 font-semibold">Deploy as Web App</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Klik <em>Deploy &gt; New deployment &gt; Web app &gt; Anyone can access</em>.</div>
          </div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {GAS_FILES.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => {
                setActiveFileIndex(idx);
                setCopied(false);
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-all border ${
                activeFileIndex === idx
                  ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                  : 'border-[#1f293d] bg-[#151b26] text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="h-4 w-4" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shadow-md ${
              copied
                ? 'bg-[#00ffaa] text-black ring-2 ring-[#00ffaa]'
                : 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black hover:opacity-90'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'FILE BERHASIL DI-COPY!' : `COPY ${currentFile.filename}`}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#151b26] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1a2333]"
          >
            <Download className="h-4 w-4 text-[#00ffaa]" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="rounded-xl border border-[#1f293d] bg-[#070a10] overflow-hidden shadow-2xl">
        <div className="border-b border-[#1f293d] bg-[#0d121c] px-4 py-3">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span className="font-mono text-[#00f2fe]">{currentFile.filename}</span>
            <span className="text-[11px] text-slate-400 font-normal">({currentFile.code.split('\n').length} baris)</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {currentFile.description}
          </p>
        </div>

        <div className="max-h-[550px] overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
          <pre>{currentFile.code}</pre>
        </div>
      </div>
    </div>
  );
};
