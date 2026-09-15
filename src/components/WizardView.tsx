import React, { useState } from 'react';
import { MikroTikConfig, MultiWanMode } from '../types';
import { normalizeConfig } from '../utils/generator';
import { Wand2, ArrowRight, ArrowLeft, Check, Shield, Network, Server, Lock, Zap } from 'lucide-react';

interface WizardViewProps {
  config: MikroTikConfig;
  onChangeConfig: (newCfg: MikroTikConfig) => void;
  onFinishWizard: () => void;
}

export const WizardView: React.FC<WizardViewProps> = ({ config: rawConfig, onChangeConfig, onFinishWizard }) => {
  const config = normalizeConfig(rawConfig);
  const [step, setStep] = useState<number>(1);

  const steps = [
    { num: 1, title: 'Identitas & ROS', desc: 'Nama router & versi RouterOS' },
    { num: 2, title: 'Multi-WAN ISP', desc: 'Jumlah ISP & mode load balance' },
    { num: 3, title: 'Jaringan Lokal', desc: 'Subnet LAN & DHCP Server' },
    { num: 4, title: 'Proteksi Keamanan', desc: 'Firewall, RAW & FastTrack' }
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00f2fe]/10 text-[#00f2fe]">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Setup Wizard RouterOS</h2>
            <p className="text-xs text-slate-400">
              Langkah terpadu untuk merancang arsitektur router MikroTik siap pakai hanya dalam 4 tahap.
            </p>
          </div>
        </div>

        {/* Steps Progress Bar */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((s) => {
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  isCurrent
                    ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                    : isDone
                    ? 'border-[#00ffaa]/40 bg-[#00ffaa]/5 text-slate-300'
                    : 'border-[#1f293d] bg-[#0b0f19] text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isCurrent ? 'bg-[#00f2fe] text-black' : isDone ? 'bg-[#00ffaa] text-black' : 'bg-[#1a2333] text-slate-400'
                  }`}>
                    {isDone ? <Check className="h-3 w-3" /> : s.num}
                  </span>
                  <span className="text-xs font-bold">{s.title}</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400 truncate">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-6 shadow-xl">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-[#00f2fe]" />
              <span>Langkah 1: Identitas Router &amp; Versi RouterOS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Router System Identity</label>
                <input
                  type="text"
                  value={config.routerName}
                  onChange={(e) => onChangeConfig({ ...config, routerName: e.target.value })}
                  placeholder="e.g. MikroTik-Core"
                  className="mt-1.5 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Akan menjadi nama router di terminal Winbox dan prompt command.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Target RouterOS Version</label>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, rosVersion: 'v7' })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      config.rosVersion === 'v7'
                        ? 'bg-[#00f2fe] text-black font-extrabold'
                        : 'border border-[#1f293d] bg-[#0b0f19] text-slate-400'
                    }`}
                  >
                    RouterOS v7 (Modern FIB)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, rosVersion: 'v6' })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      config.rosVersion === 'v6'
                        ? 'bg-[#00f2fe] text-black font-extrabold'
                        : 'border border-[#1f293d] bg-[#0b0f19] text-slate-400'
                    }`}
                  >
                    RouterOS v6 (Legacy)
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">RouterOS v7 memerlukan deklarasi routing-table terpisah.</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="h-4 w-4 text-[#00f2fe]" />
              <span>Langkah 2: Multi-WAN &amp; Metode Load Balancing</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Pilih Mode Distribusi Trafik &amp; Arsitektur WAN</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { id: 'single', title: '1 ISP (Single WAN)', desc: '1 Jalur internet utama standar tanpa mangle (DHCP / Static / PPPoE dial-up)' },
                    { id: 'pcc_equal', title: 'PCC Equal', desc: 'Beban rata seimbang untuk bandwidth ISP yang seimbang' },
                    { id: 'pcc_weighted', title: 'PCC Weighted', desc: 'Beban proporsional sesuai rasio bobot (misal 50M vs 20M)' },
                    { id: 'failover', title: 'Failover Distance', desc: 'ISP backup hanya aktif saat ISP utama putus/RTO' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onChangeConfig({ ...config, multiWanMode: m.id as MultiWanMode })}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        config.multiWanMode === m.id
                          ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white'
                          : 'border-[#1f293d] bg-[#0b0f19] text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{m.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Jumlah WAN Aktif Saat Ini</label>
                <div className="mt-1 text-xs text-[#00ffaa] font-mono">
                  {config.wans.length} WAN Interface aktif ({config.wans.map(w => w.name).join(', ')})
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#00f2fe]" />
              <span>Langkah 3: Jaringan Lokal (LAN Bridge &amp; Subnet)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">LAN IP Address &amp; CIDR</label>
                <input
                  type="text"
                  value={config.lans[0]?.ipAddress || '192.168.88.1/24'}
                  onChange={(e) => {
                    const updated = [...config.lans];
                    if (updated[0]) updated[0].ipAddress = e.target.value;
                    onChangeConfig({ ...config, lans: updated });
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">DNS Cache Servers</label>
                <input
                  type="text"
                  value={config.dnsServers.join(', ')}
                  onChange={(e) => onChangeConfig({ ...config, dnsServers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="mt-1.5 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#00f2fe] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#00f2fe]" />
              <span>Langkah 4: Proteksi Keamanan &amp; Firewall Hardening</span>
            </h3>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.protectRouter}
                  onChange={(e) => onChangeConfig({ ...config, protectRouter: e.target.checked })}
                  className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
                />
                <div>
                  <div className="text-xs font-bold text-white">Drop All Unsolicited WAN Inputs</div>
                  <div className="text-[11px] text-slate-400">Mencegah akses luar langsung ke port management router.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.blockDdosRaw}
                  onChange={(e) => onChangeConfig({ ...config, blockDdosRaw: e.target.checked })}
                  className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
                />
                <div>
                  <div className="text-xs font-bold text-white">RAW Anti-Port Scan &amp; SYN Flood Protection</div>
                  <div className="text-[11px] text-slate-400">Proteksi tingkat tinggi di level prerouting RAW MikroTik.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#1f293d]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1f293d] bg-[#0b0f19] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1a2333]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#4facfe] px-4 py-2 text-xs font-bold text-black hover:opacity-90"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onFinishWizard}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00ffaa] px-5 py-2 text-xs font-extrabold text-black hover:opacity-90 shadow-lg shadow-[#00ffaa]/20"
            >
              <Check className="h-4 w-4" />
              <span>Selesai &amp; Generate Script</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
