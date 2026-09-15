import React from 'react';
import { MikroTikConfig } from '../types';
import { normalizeConfig } from '../utils/generator';
import { QUICK_PRESETS, PresetItem } from '../data/presets';
import { 
  Zap, 
  Home, 
  Briefcase, 
  Wifi, 
  Server, 
  Gamepad2, 
  Monitor, 
  GraduationCap, 
  Activity, 
  ArrowRight,
  Shield,
  Layers,
  Network
} from 'lucide-react';

interface DashboardViewProps {
  config: MikroTikConfig;
  onChangeConfig: (newCfg: MikroTikConfig) => void;
  onApplyPreset: (preset: PresetItem) => void;
  onNavigateTab: (tab: any) => void;
}

const iconMap: Record<string, any> = {
  Home,
  Briefcase,
  Wifi,
  Server,
  Gamepad2,
  Monitor,
  GraduationCap,
  Activity
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  config: rawConfig,
  onChangeConfig,
  onApplyPreset,
  onNavigateTab
}) => {
  const config = normalizeConfig(rawConfig);
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1f293d] bg-gradient-to-r from-[#151b26] via-[#111723] to-[#0e1420] p-6 shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#00f2fe]/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00f2fe]/30 bg-[#00f2fe]/10 px-3 py-1 text-xs font-semibold text-[#00f2fe]">
              <Zap className="h-3.5 w-3.5" />
              <span>RouterOS Script Generator Pro</span>
            </div>
            <h1 className="mt-2 text-xl md:text-2xl font-extrabold text-white">
              MikroTik Config Builder Pro
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-xl">
              Buat script RouterOS v6 &amp; v7 otomatis dengan Multi-WAN PCC, Failover, ECMP, Firewall Hardening, VLAN, dan Hotspot. Siap dieksekusi langsung di Terminal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('wizard')}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#4facfe] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#00f2fe]/20 hover:opacity-90 active:scale-95 transition-all"
            >
              <span>Mulai Setup Wizard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigateTab('multiwan')}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1f293d] bg-[#1a2333] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#222d42] transition-colors"
            >
              <Network className="h-4 w-4 text-[#00ffaa]" />
              <span>Multi-WAN ({config.wans.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Router Parameters Form */}
        <div className="mt-6 pt-4 border-t border-[#1f293d] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Router Identity
            </label>
            <input
              type="text"
              value={config.routerName}
              onChange={(e) => onChangeConfig({ ...config, routerName: e.target.value })}
              placeholder="e.g. MikroTik-Core"
              className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Multi-WAN Mode
            </label>
            <select
              value={config.multiWanMode}
              onChange={(e) => onChangeConfig({ ...config, multiWanMode: e.target.value as any })}
              className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-semibold text-white focus:border-[#00f2fe] focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
            >
              <option value="pcc_equal">PCC Equal (Beban Seimbang)</option>
              <option value="pcc_weighted">PCC Weighted (Beban Bobot)</option>
              <option value="failover">Failover (Active / Backup Distance)</option>
              <option value="ecmp">ECMP (Equal Cost Multi-Path)</option>
              <option value="recursive">Recursive Routing (Host Ping Check)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Target RouterOS
            </label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, rosVersion: 'v7' })}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  config.rosVersion === 'v7'
                    ? 'bg-[#00f2fe] text-black shadow-md shadow-[#00f2fe]/20'
                    : 'border border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-white'
                }`}
              >
                RouterOS v7
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, rosVersion: 'v6' })}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  config.rosVersion === 'v6'
                    ? 'bg-[#00f2fe] text-black shadow-md shadow-[#00f2fe]/20'
                    : 'border border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-white'
                }`}
              >
                RouterOS v6
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>WAN Interfaces</span>
            <Network className="h-4 w-4 text-[#00f2fe]" />
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-white">
            {config.wans.length} WAN
          </div>
          <div className="mt-0.5 text-[11px] text-[#00ffaa]">
            {config.multiWanMode.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>LAN &amp; DHCP</span>
            <Layers className="h-4 w-4 text-[#00ffaa]" />
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-white">
            {config.lans.length} Subnet
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {config.lans[0]?.ipAddress || 'None'}
          </div>
        </div>

        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Firewall Rules</span>
            <Shield className="h-4 w-4 text-[#ffd166]" />
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-white">
            {config.protectRouter ? 'Hardened' : 'Basic'}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {config.blockDdosRaw ? 'RAW Anti-DDoS On' : 'Standard Filter'}
          </div>
        </div>

        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Bandwidth Queue</span>
            <Zap className="h-4 w-4 text-[#ff9ff3]" />
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-white uppercase">
            {config.queue?.type || 'none'}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {config.queue?.type && config.queue.type !== 'none' ? `${config.queue.maxUpload}/${config.queue.maxDownload}` : 'Unlimited'}
          </div>
        </div>
      </div>

      {/* 8 Quick Setup Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#00f2fe]" />
              <span>Quick Setup Presets (1-Click Load)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pilih template skenario bisnis untuk mengisi semua field konfigurasi secara instan.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('templates')}
            className="text-xs font-semibold text-[#00f2fe] hover:underline"
          >
            Lihat 12 Template Industri &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_PRESETS.map((preset) => {
            const Icon = iconMap[preset.icon] || Server;
            return (
              <div
                key={preset.id}
                id={`preset-card-${preset.id}`}
                onClick={() => onApplyPreset(preset)}
                className="group relative cursor-pointer rounded-xl border border-[#1f293d] bg-[#151b26] p-4 transition-all hover:border-[#00f2fe]/50 hover:bg-[#1a2333] hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00f2fe]/10 text-[#00f2fe] group-hover:bg-[#00f2fe] group-hover:text-black transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded bg-[#0b0f19] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                      {preset.category}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                    {preset.name}
                  </h3>

                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f293d]/60">
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="rounded bg-[#0b0f19] px-1.5 py-0.5 text-[9.5px] font-mono text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-[#00f2fe] group-hover:translate-x-0.5 transition-transform">
                    <span>Terapkan Preset</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
