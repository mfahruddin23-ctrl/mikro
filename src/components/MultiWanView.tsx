import React from 'react';
import { MikroTikConfig, MultiWanMode, WanInterface } from '../types';
import { normalizeConfig } from '../utils/generator';
import { Plus, Trash2, Network, HelpCircle, CheckCircle2, Split, ArrowUpDown, Shuffle, Radio } from 'lucide-react';

interface MultiWanViewProps {
  config: MikroTikConfig;
  onChangeConfig: (newCfg: MikroTikConfig) => void;
}

export const MultiWanView: React.FC<MultiWanViewProps> = ({ config: rawConfig, onChangeConfig }) => {
  const config = normalizeConfig(rawConfig);
  const handleAddWan = () => {
    if (config.wans.length >= 8) return;
    const nextIdx = config.wans.length + 1;
    const newWan: WanInterface = {
      id: `w${Date.now()}`,
      name: `ether${nextIdx}-WAN${nextIdx}`,
      comment: `ISP${nextIdx}`,
      type: 'static',
      ipAddress: `192.168.${nextIdx}.2/24`,
      gateway: `192.168.${nextIdx}.1`,
      weight: 1,
      distance: nextIdx,
      checkGateway: true
    };
    onChangeConfig({
      ...config,
      wans: [...config.wans, newWan]
    });
  };

  const handleRemoveWan = (idx: number) => {
    if (config.wans.length <= 1) return;
    const updated = config.wans.filter((_, i) => i !== idx);
    onChangeConfig({
      ...config,
      wans: updated
    });
  };

  const handleUpdateWan = (idx: number, patch: Partial<WanInterface>) => {
    const updated = config.wans.map((w, i) => (i === idx ? { ...w, ...patch } : w));
    onChangeConfig({
      ...config,
      wans: updated
    });
  };

  const handleModeChange = (mode: MultiWanMode) => {
    onChangeConfig({
      ...config,
      multiWanMode: mode
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Selection */}
      <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="h-5 w-5 text-[#00f2fe]" />
              <span>Multi-WAN &amp; Load Balancing Generator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Konfigurasi hingga 8 ISP secara bersamaan dengan metode PCC, Failover, ECMP, atau Recursive Routing.
            </p>
          </div>

          <button
            onClick={handleAddWan}
            disabled={config.wans.length >= 8}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#4facfe] px-3.5 py-2 text-xs font-bold text-black shadow-md hover:opacity-90 disabled:opacity-40 transition-all self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah WAN ({config.wans.length}/8)</span>
          </button>
        </div>

        {/* Mode Selector Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => handleModeChange('pcc_equal')}
            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
              config.multiWanMode === 'pcc_equal'
                ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Split className="h-4 w-4 text-[#00f2fe]" />
              <span>PCC Equal</span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-slate-400">
              Beban rata (50:50, 33:33:33) via connection marks.
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('pcc_weighted')}
            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
              config.multiWanMode === 'pcc_weighted'
                ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Shuffle className="h-4 w-4 text-[#00ffaa]" />
              <span>PCC Weighted</span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-slate-400">
              Rasio bobot proporsional (misal: 50M vs 20M = 5:2).
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('failover')}
            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
              config.multiWanMode === 'failover'
                ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <ArrowUpDown className="h-4 w-4 text-[#ffd166]" />
              <span>Failover Distance</span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-slate-400">
              Active - Backup dengan check-gateway ping.
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('ecmp')}
            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
              config.multiWanMode === 'ecmp'
                ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Radio className="h-4 w-4 text-[#ff9ff3]" />
              <span>ECMP Route</span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-slate-400">
              Multi-gateway dalam satu default route 0.0.0.0/0.
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('recursive')}
            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
              config.multiWanMode === 'recursive'
                ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4 text-[#00f2fe]" />
              <span>Recursive Routing</span>
            </div>
            <span className="mt-1 text-[11px] leading-tight text-slate-400">
              Target-scope 30 ke canary 8.8.8.8 &amp; 1.1.1.1.
            </span>
          </button>
        </div>
      </div>

      {/* WAN Interfaces List */}
      <div className="space-y-3">
        {config.wans.map((wan, idx) => (
          <div
            key={wan.id || idx}
            className="rounded-xl border border-[#1f293d] bg-[#151b26] p-4 transition-all hover:border-[#1f293d]/80"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f293d]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00f2fe]/10 text-xs font-mono font-bold text-[#00f2fe]">
                  W{idx + 1}
                </div>
                <span className="font-bold text-sm text-white">
                  {wan.name}
                </span>
                <span className="rounded bg-[#0b0f19] px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  {wan.type.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {config.multiWanMode === 'pcc_weighted' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Weight:</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={wan.weight || 1}
                      onChange={(e) => handleUpdateWan(idx, { weight: parseInt(e.target.value, 10) || 1 })}
                      className="w-16 rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white text-center focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>
                )}

                {config.multiWanMode === 'failover' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Distance:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={wan.distance || (idx + 1)}
                      onChange={(e) => handleUpdateWan(idx, { distance: parseInt(e.target.value, 10) || (idx + 1) })}
                      className="w-16 rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white text-center focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>
                )}

                {config.wans.length > 1 && (
                  <button
                    onClick={() => handleRemoveWan(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-[#ff4757]/20 hover:text-[#ff4757] transition-colors"
                    title="Hapus WAN ini"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* WAN Fields Form */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">
                  Interface Name
                </label>
                <input
                  type="text"
                  value={wan.name}
                  onChange={(e) => handleUpdateWan(idx, { name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">
                  IP Assignment
                </label>
                <select
                  value={wan.type}
                  onChange={(e) => handleUpdateWan(idx, { type: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-semibold text-white focus:border-[#00f2fe] focus:outline-none"
                >
                  <option value="static">Static IP</option>
                  <option value="dhcp">DHCP Client (Dynamic)</option>
                </select>
              </div>

              {wan.type === 'static' ? (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">
                      IP Address (CIDR)
                    </label>
                    <input
                      type="text"
                      value={wan.ipAddress}
                      onChange={(e) => handleUpdateWan(idx, { ipAddress: e.target.value })}
                      placeholder="e.g. 192.168.1.2/24"
                      className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">
                      Gateway IP
                    </label>
                    <input
                      type="text"
                      value={wan.gateway}
                      onChange={(e) => handleUpdateWan(idx, { gateway: e.target.value })}
                      placeholder="e.g. 192.168.1.1"
                      className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex items-center pt-5 text-xs text-[#00ffaa]">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span>IP &amp; Gateway akan didapatkan otomatis via DHCP Client</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1f293d]/40 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={wan.checkGateway}
                  onChange={(e) => handleUpdateWan(idx, { checkGateway: e.target.checked })}
                  className="rounded border-[#1f293d] bg-[#0b0f19] text-[#00f2fe]"
                />
                <span>Enable Check-Gateway (Ping)</span>
              </label>

              <div className="text-[11px] text-slate-500 font-mono">
                Mangle Mark: <span className="text-slate-300">{wan.name}_conn</span> &bull; Routing Mark:{' '}
                <span className="text-slate-300">to_{wan.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-WAN Technical Note */}
      <div className="rounded-xl border border-[#1f293d] bg-[#0d121c] p-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <HelpCircle className="h-4 w-4 text-[#00f2fe]" />
          <span>Cara Kerja Multi-WAN di Generator Ini:</span>
        </div>
        <ul className="mt-2 list-disc list-inside space-y-1 pl-1 text-[11.5px] leading-relaxed">
          <li>
            <strong>RouterOS v7:</strong> Otomatis membuat tabel routing <code className="text-[#00f2fe]">/routing table add name=to_WANx fib</code> sebelum menyetel rute.
          </li>
          <li>
            <strong>Bypass RFC1918:</strong> Trafik antarlokal (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) di-bypass dari mangle PCC sehingga tidak merusak akses lokal.
          </li>
          <li>
            <strong>Sticky Connection:</strong> Koneksi yang masuk dari WAN1 akan dibalas keluar melalui WAN1 untuk mencegah putusnya sesi perbankan (HTTPS).
          </li>
        </ul>
      </div>
    </div>
  );
};
