import React, { useState } from 'react';
import { INDUSTRIAL_TEMPLATES } from '../data/templates';
import { TemplateRecord, MikroTikConfig } from '../types';
import { BookOpen, Search, Filter, Check, ArrowRight, Layers, FileCode } from 'lucide-react';

interface TemplatesViewProps {
  onLoadTemplate: (cfg: MikroTikConfig) => void;
  onPreviewTemplateScript: (template: TemplateRecord) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onLoadTemplate,
  onPreviewTemplateScript
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const categories = ['All', '1 ISP Standar', 'Load Balancing', 'Routing', 'Hotspot', 'Security', 'QoS & Gaming', 'VPN', 'VLAN & Switching'];

  const filtered = INDUSTRIAL_TEMPLATES.filter((tpl) => {
    const matchSearch = (
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tpl.category.toLowerCase().includes(search.toLowerCase())
    );
    const matchCat = selectedCat === 'All' || tpl.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleApply = (tpl: TemplateRecord) => {
    try {
      const parsed = JSON.parse(tpl.config_json);
      onLoadTemplate(parsed);
      setLoadedId(tpl.template_id);
      setTimeout(() => setLoadedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f293d] pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#00f2fe]" />
            <span>Template Library Industri (12 Preset Siap Pakai)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kumpulan arsitektur konfigurasi jaringan standar ISP, kantor, kafe, dan instansi.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari template..."
            className="w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] pl-9 pr-3 py-2 text-xs text-white focus:border-[#00f2fe] focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedCat === cat
                ? 'bg-[#00f2fe] text-black font-bold shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                : 'border border-[#1f293d] bg-[#151b26] text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((tpl) => {
          const isLoaded = loadedId === tpl.template_id;
          return (
            <div
              key={tpl.template_id}
              className="flex flex-col justify-between rounded-xl border border-[#1f293d] bg-[#151b26] p-4.5 hover:border-[#00f2fe]/40 hover:bg-[#18202e] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#0b0f19] px-2 py-0.5 font-mono text-[10px] text-[#00ffaa] border border-[#00ffaa]/20">
                    {tpl.template_id}
                  </span>
                  <span className="rounded bg-[#1a2333] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    {tpl.category}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                  {tpl.title}
                </h3>

                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1f293d]/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onPreviewTemplateScript(tpl)}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(tpl)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isLoaded
                      ? 'bg-[#00ffaa] text-black ring-2 ring-[#00ffaa]'
                      : 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black hover:opacity-90'
                  }`}
                >
                  {isLoaded ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>TERAPKAN!</span>
                    </>
                  ) : (
                    <>
                      <span>Muat ke Builder</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
