import React, { useState } from 'react';
import { MikroTikConfig, LanInterface, PortForwardRule, VlanItem } from '../types';
import { normalizeConfig } from '../utils/generator';
import { 
  Network, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Wifi, 
  Zap, 
  KeyRound, 
  Activity, 
  Plus, 
  Trash2,
  Lock,
  Clock,
  Radio,
  Ban,
  Gamepad2,
  Tv,
  Flame,
  ShieldAlert,
  DownloadCloud,
  Compass
} from 'lucide-react';

interface NetworkModulesViewProps {
  config: MikroTikConfig;
  onChangeConfig: (newCfg: MikroTikConfig) => void;
}

export const NetworkModulesView: React.FC<NetworkModulesViewProps> = ({ config: rawConfig, onChangeConfig }) => {
  const config = normalizeConfig(rawConfig);
  const [subTab, setSubTab] = useState<'lan' | 'dns' | 'nat' | 'firewall' | 'blocker' | 'vlan' | 'hotspot' | 'queue' | 'vpn' | 'tools'>('queue');

  // LAN Helpers
  const handleUpdateLan = (idx: number, patch: Partial<LanInterface>) => {
    const updated = config.lans.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    onChangeConfig({ ...config, lans: updated });
  };

  const handleAddLan = () => {
    const nextIdx = config.lans.length + 1;
    const newLan: LanInterface = {
      id: `l${Date.now()}`,
      name: `ether${nextIdx + 2}-LAN`,
      ipAddress: `192.168.${nextIdx * 10}.1/24`,
      dhcpEnabled: true,
      dhcpPoolStart: `192.168.${nextIdx * 10}.10`,
      dhcpPoolEnd: `192.168.${nextIdx * 10}.250`,
      leaseTime: '12h'
    };
    onChangeConfig({ ...config, lans: [...config.lans, newLan] });
  };

  const handleRemoveLan = (idx: number) => {
    if (config.lans.length <= 1) return;
    onChangeConfig({ ...config, lans: config.lans.filter((_, i) => i !== idx) });
  };

  // Port Forwarding Helpers
  const handleAddPortForward = () => {
    const newRule: PortForwardRule = {
      id: `pf${Date.now()}`,
      comment: 'CCTV-DVR',
      protocol: 'tcp',
      dstPort: '8080',
      toAddress: '192.168.88.100',
      toPort: '80',
      inInterface: ''
    };
    onChangeConfig({ ...config, portForwards: [...config.portForwards, newRule] });
  };

  const handleRemovePortForward = (id: string) => {
    onChangeConfig({ ...config, portForwards: config.portForwards.filter(p => p.id !== id) });
  };

  const handleUpdatePortForward = (id: string, patch: Partial<PortForwardRule>) => {
    onChangeConfig({
      ...config,
      portForwards: config.portForwards.map(p => (p.id === id ? { ...p, ...patch } : p))
    });
  };

  // VLAN Helpers
  const handleAddVlan = () => {
    const nextId = (config.vlans.length + 1) * 10;
    const newVlan: VlanItem = {
      id: `vlan${Date.now()}`,
      name: `vlan${nextId}-Clients`,
      vlanId: nextId,
      bridge: 'bridge-lan',
      taggedPorts: ['ether4'],
      untaggedPorts: ['ether5'],
      ipAddress: `10.10.${nextId}.1/24`,
      dhcpEnabled: true
    };
    onChangeConfig({ ...config, vlans: [...config.vlans, newVlan] });
  };

  const handleRemoveVlan = (id: string) => {
    onChangeConfig({ ...config, vlans: config.vlans.filter(v => v.id !== id) });
  };

  const handleUpdateVlan = (id: string, patch: Partial<VlanItem>) => {
    onChangeConfig({
      ...config,
      vlans: config.vlans.map(v => (v.id === id ? { ...v, ...patch } : v))
    });
  };

  return (
    <div className="space-y-5">
      {/* Sub Tabs Bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#1f293d] pb-3">
        {[
          { id: 'lan', label: 'LAN & DHCP', icon: Network },
          { id: 'dns', label: 'DNS Cache', icon: Globe },
          { id: 'nat', label: 'NAT & Port Fwd', icon: Radio },
          { id: 'firewall', label: 'Firewall & RAW', icon: ShieldCheck },
          { id: 'blocker', label: 'Blokir Situs', icon: Ban },
          { id: 'vlan', label: 'VLAN Bridge', icon: Layers },
          { id: 'hotspot', label: 'Hotspot Voucher', icon: Wifi },
          { id: 'queue', label: 'Queue & QoS', icon: Zap },
          { id: 'vpn', label: 'VPN (WireGuard)', icon: KeyRound },
          { id: 'tools', label: 'Tools & Netwatch', icon: Activity }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as any)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#00f2fe]/20 to-[#4facfe]/20 text-[#00f2fe] border border-[#00f2fe]/40 shadow-sm'
                  : 'bg-[#151b26] text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* LAN & DHCP Sub-Tab */}
      {subTab === 'lan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Interface LAN &amp; DHCP Server</h3>
              <p className="text-xs text-slate-400">Atur subnet lokal, IP address router, dan DHCP pool range.</p>
            </div>
            <button
              onClick={handleAddLan}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2333] border border-[#1f293d] px-3 py-1.5 text-xs font-semibold text-[#00ffaa] hover:bg-[#202b40]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Subnet LAN</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.lans.map((lan, idx) => (
              <div key={lan.id || idx} className="rounded-xl border border-[#1f293d] bg-[#151b26] p-4">
                <div className="flex items-center justify-between border-b border-[#1f293d]/60 pb-2.5">
                  <span className="font-bold text-xs text-white">LAN Subnet {idx + 1}: {lan.name}</span>
                  {config.lans.length > 1 && (
                    <button onClick={() => handleRemoveLan(idx)} className="text-xs text-[#ff4757] hover:underline">
                      Hapus
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Interface</label>
                    <input
                      type="text"
                      value={lan.name}
                      onChange={(e) => handleUpdateLan(idx, { name: e.target.value })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Router IP (CIDR)</label>
                    <input
                      type="text"
                      value={lan.ipAddress}
                      onChange={(e) => handleUpdateLan(idx, { ipAddress: e.target.value })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">DHCP Pool Start</label>
                    <input
                      type="text"
                      value={lan.dhcpPoolStart}
                      onChange={(e) => handleUpdateLan(idx, { dhcpPoolStart: e.target.value })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">DHCP Pool End</label>
                    <input
                      type="text"
                      value={lan.dhcpPoolEnd}
                      onChange={(e) => handleUpdateLan(idx, { dhcpPoolEnd: e.target.value })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNS Sub-Tab */}
      {subTab === 'dns' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">DNS Cache &amp; Upstream Resolver</h3>
            <p className="text-xs text-slate-400">Atur upstream server DNS dan opsi allow-remote-requests.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold uppercase">DNS Servers (Pisah Koma)</label>
              <input
                type="text"
                value={config.dnsServers.join(', ')}
                onChange={(e) => onChangeConfig({ ...config, dnsServers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white"
                placeholder="8.8.8.8, 1.1.1.1"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, dnsServers: ['1.1.1.1', '1.0.0.1', '8.8.8.8'] })}
                className="rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1 text-xs text-slate-300 hover:text-[#00f2fe]"
              >
                Cloudflare + Google
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, dnsServers: ['1.1.1.3', '1.0.0.3'] })}
                className="rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1 text-xs text-slate-300 hover:text-[#00f2fe]"
              >
                Family Safe (Blokir Konten Dewasa)
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={config.dnsAllowRemote}
                onChange={(e) => onChangeConfig({ ...config, dnsAllowRemote: e.target.checked })}
                className="rounded border-[#1f293d] bg-[#0b0f19] text-[#00f2fe]"
              />
              <span>Allow Remote Requests (Router berfungsi sebagai DNS Resolver klien lokal)</span>
            </label>
          </div>
        </div>
      )}

      {/* NAT & Port Forwarding Sub-Tab */}
      {subTab === 'nat' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide">1. Masquerade NAT</h4>
            <p className="mt-1 text-xs text-slate-400">
              Generator secara otomatis membuat aturan <code className="text-[#00f2fe]">action=masquerade</code> untuk setiap interface WAN yang aktif ({config.wans.map(w => w.name).join(', ')}).
            </p>
          </div>

          <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-4">
            <div className="flex items-center justify-between border-b border-[#1f293d]/60 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">2. Port Forwarding (Destination NAT)</h4>
                <p className="text-xs text-slate-400">Buka akses kamera CCTV, Web server, atau database dari IP publik.</p>
              </div>
              <button
                onClick={handleAddPortForward}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00f2fe]/15 border border-[#00f2fe]/40 px-3 py-1.5 text-xs font-bold text-[#00f2fe] hover:bg-[#00f2fe]/25"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Rule Dst-NAT</span>
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {config.portForwards.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  Belum ada rule Port Forwarding. Klik tombol di atas untuk menambahkan.
                </div>
              ) : (
                config.portForwards.map((pf) => (
                  <div key={pf.id} className="rounded-lg border border-[#1f293d] bg-[#0b0f19] p-3 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-slate-400">Comment</label>
                      <input
                        type="text"
                        value={pf.comment}
                        onChange={(e) => handleUpdatePortForward(pf.id, { comment: e.target.value })}
                        className="w-full rounded border border-[#1f293d] bg-[#111723] px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Protocol</label>
                      <select
                        value={pf.protocol}
                        onChange={(e) => handleUpdatePortForward(pf.id, { protocol: e.target.value as any })}
                        className="w-full rounded border border-[#1f293d] bg-[#111723] px-2 py-1 text-xs text-white"
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Dst Port (Publik)</label>
                      <input
                        type="text"
                        value={pf.dstPort}
                        onChange={(e) => handleUpdatePortForward(pf.id, { dstPort: e.target.value })}
                        className="w-full rounded border border-[#1f293d] bg-[#111723] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">To IP (Lokal)</label>
                      <input
                        type="text"
                        value={pf.toAddress}
                        onChange={(e) => handleUpdatePortForward(pf.id, { toAddress: e.target.value })}
                        className="w-full rounded border border-[#1f293d] bg-[#111723] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">To Port (Lokal)</label>
                      <input
                        type="text"
                        value={pf.toPort}
                        onChange={(e) => handleUpdatePortForward(pf.id, { toPort: e.target.value })}
                        className="w-full rounded border border-[#1f293d] bg-[#111723] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex justify-end pt-3 sm:pt-0">
                      <button
                        onClick={() => handleRemovePortForward(pf.id)}
                        className="p-1.5 text-slate-500 hover:text-[#ff4757]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Firewall Filter Sub-Tab */}
      {subTab === 'firewall' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Firewall Filter &amp; RAW Hardening</h3>
            <p className="text-xs text-slate-400">Proteksi router dari serangan luar, scan port, dan exploit.</p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={config.protectRouter}
                onChange={(e) => onChangeConfig({ ...config, protectRouter: e.target.checked })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
              />
              <div>
                <div className="text-xs font-bold text-white">Drop All Unsolicited WAN Inputs</div>
                <div className="text-[11px] text-slate-400">Menolak koneksi luar ke router kecuali yang dimulai dari router itu sendiri.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={config.dropInvalid}
                onChange={(e) => onChangeConfig({ ...config, dropInvalid: e.target.checked })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
              />
              <div>
                <div className="text-xs font-bold text-white">Drop Invalid Connection State</div>
                <div className="text-[11px] text-slate-400">Membuang paket data yang statusnya invalid pada conntrack table.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={config.enableFasttrack}
                onChange={(e) => onChangeConfig({ ...config, enableFasttrack: e.target.checked })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
              />
              <div>
                <div className="text-xs font-bold text-white">Enable FastTrack Connection</div>
                <div className="text-[11px] text-slate-400">Mempercepat forwarding paket. (Otomatis dibatasi untuk koneksi no-mark jika PCC aktif).</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={config.blockDdosRaw}
                onChange={(e) => onChangeConfig({ ...config, blockDdosRaw: e.target.checked })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
              />
              <div>
                <div className="text-xs font-bold text-[#00ffaa]">RAW Table Port-Scan &amp; Bad TCP Flags Protection</div>
                <div className="text-[11px] text-slate-400">Drop paket Xmas, Null Scan, dan SYN Flood di level prerouting RAW sebelum conntrack menguras RAM.</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Site Blocker Sub-Tab */}
      {subTab === 'blocker' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f293d]/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ff4757]/20 text-[#ff4757]">
                  <Ban className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Blokir Situs &amp; Konten Terlarang</h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">Proteksi jaringan dari akses judi online, konten dewasa, P2P torrent, dan pembatasan hiburan.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer rounded-lg bg-[#0b0f19] px-3 py-1.5 border border-[#1f293d] text-white">
              <input
                type="checkbox"
                checked={config.siteBlocker?.enabled ?? true}
                onChange={(e) => onChangeConfig({
                  ...config,
                  siteBlocker: {
                    ...(config.siteBlocker || {
                      enabled: true,
                      blockJudol: true,
                      blockPorn: true,
                      blockTorrent: true,
                      blockSosmed: false,
                      blockStreaming: false,
                      customDomains: [],
                      blockMethod: 'filter_tls'
                    }),
                    enabled: e.target.checked
                  }
                })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#ff4757]"
              />
              <span>Aktifkan Blokir Situs</span>
            </label>
          </div>

          {config.siteBlocker?.enabled && (
            <div className="space-y-4">
              {/* Method Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Metode Pemblokiran MikroTik</label>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'filter_tls', title: 'Filter TLS-Host (SNI)', desc: 'Drop koneksi HTTPS berdasarkan nama domain SSL. Sangat akurat & kompatibel.' },
                    { id: 'raw_drop', title: 'RAW PreRouting Drop', desc: 'Drop sebelum Conntrack via Address-List. Paling ringan CPU untuk trafik tinggi.' },
                    { id: 'dns_redirect', title: 'DNS Static Sinkhole', desc: 'Redirect domain terlarang ke IP 127.0.0.1 lokal via static DNS router.' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onChangeConfig({
                        ...config,
                        siteBlocker: { ...config.siteBlocker, blockMethod: m.id as any }
                      })}
                      className={`rounded-lg p-3 text-left transition-all border ${
                        config.siteBlocker.blockMethod === m.id
                          ? 'border-[#ff4757] bg-[#ff4757]/10 text-white'
                          : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{m.title}</div>
                      <div className="mt-1 text-[11px] text-slate-400 leading-relaxed">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Checklist */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kategori Konten yang Diblokir</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Judi Online */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    config.siteBlocker.blockJudol ? 'border-[#ff4757]/50 bg-[#ff4757]/10' : 'border-[#1f293d] bg-[#0b0f19]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={config.siteBlocker.blockJudol}
                      onChange={(e) => onChangeConfig({
                        ...config,
                        siteBlocker: { ...config.siteBlocker, blockJudol: e.target.checked }
                      })}
                      className="mt-0.5 rounded border-[#1f293d] bg-[#111723] text-[#ff4757]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-[#ff4757]" />
                        <span>Judi Online, Slot Gacor &amp; Togel</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Blokir kata kunci: slot, gacor, judol, togel, sbobet, maxwin, zeus, pragmatic, casino, poker, depo, taruhan.
                      </div>
                    </div>
                  </label>

                  {/* Pornografi */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    config.siteBlocker.blockPorn ? 'border-[#ff4757]/50 bg-[#ff4757]/10' : 'border-[#1f293d] bg-[#0b0f19]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={config.siteBlocker.blockPorn}
                      onChange={(e) => onChangeConfig({
                        ...config,
                        siteBlocker: { ...config.siteBlocker, blockPorn: e.target.checked }
                      })}
                      className="mt-0.5 rounded border-[#1f293d] bg-[#111723] text-[#ff4757]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-[#ff4757]" />
                        <span>Pornografi &amp; Konten Dewasa 18+</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Blokir kata kunci: porn, xxx, xvideos, xnxx, bokep, onlyfans, redtube, pornhub.
                      </div>
                    </div>
                  </label>

                  {/* BitTorrent */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    config.siteBlocker.blockTorrent ? 'border-[#00f2fe]/50 bg-[#00f2fe]/10' : 'border-[#1f293d] bg-[#0b0f19]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={config.siteBlocker.blockTorrent}
                      onChange={(e) => onChangeConfig({
                        ...config,
                        siteBlocker: { ...config.siteBlocker, blockTorrent: e.target.checked }
                      })}
                      className="mt-0.5 rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <DownloadCloud className="h-3.5 w-3.5 text-[#00f2fe]" />
                        <span>P2P BitTorrent &amp; File Sharing</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Drop port TCP &amp; UDP 6881-6889, 2710, 6969 untuk mencegah penyalahgunaan bandwidth oleh torrent.
                      </div>
                    </div>
                  </label>

                  {/* Media Sosial */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    config.siteBlocker.blockSosmed ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10' : 'border-[#1f293d] bg-[#0b0f19]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={config.siteBlocker.blockSosmed}
                      onChange={(e) => onChangeConfig({
                        ...config,
                        siteBlocker: { ...config.siteBlocker, blockSosmed: e.target.checked }
                      })}
                      className="mt-0.5 rounded border-[#1f293d] bg-[#111723] text-[#f59e0b]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-[#f59e0b]" />
                        <span>Media Sosial (Jam Kantor/Sekolah)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Blokir domain: TikTok, Instagram, Facebook, Twitter / X. Cocok untuk produktivitas kerja/sekolah.
                      </div>
                    </div>
                  </label>

                  {/* Streaming Video */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    config.siteBlocker.blockStreaming ? 'border-[#a855f7]/50 bg-[#a855f7]/10' : 'border-[#1f293d] bg-[#0b0f19]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={config.siteBlocker.blockStreaming}
                      onChange={(e) => onChangeConfig({
                        ...config,
                        siteBlocker: { ...config.siteBlocker, blockStreaming: e.target.checked }
                      })}
                      className="mt-0.5 rounded border-[#1f293d] bg-[#111723] text-[#a855f7]"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Tv className="h-3.5 w-3.5 text-[#a855f7]" />
                        <span>Streaming Video (YouTube, Netflix)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Blokir layanan streaming video berat: YouTube, Netflix, Disney+.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Domains Textarea */}
              <div className="pt-2 border-t border-[#1f293d]">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Daftar Domain Kustom Tambahan (Pisahkan dengan koma atau baris baru)
                </label>
                <textarea
                  rows={2}
                  value={config.siteBlocker.customDomains.join(', ')}
                  onChange={(e) => {
                    const list = e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                    onChangeConfig({
                      ...config,
                      siteBlocker: { ...config.siteBlocker, customDomains: list }
                    });
                  }}
                  placeholder="contoh: *.situs-ilegal.com, *.web-terlarang.id, *.game-haram.org"
                  className="mt-1 w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs font-mono text-white focus:border-[#ff4757] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VLAN Sub-Tab */}
      {subTab === 'vlan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Bridge VLAN Filtering (Trunk &amp; Access)</h3>
              <p className="text-xs text-slate-400">Isolasi lalu lintas jaringan menggunakan VLAN 802.1Q standar.</p>
            </div>
            <button
              onClick={handleAddVlan}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00ffaa]/15 border border-[#00ffaa]/40 px-3 py-1.5 text-xs font-bold text-[#00ffaa] hover:bg-[#00ffaa]/25"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah VLAN</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.vlans.length === 0 ? (
              <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-6 text-center text-xs text-slate-500 font-mono">
                Belum ada VLAN. Klik "Tambah VLAN" untuk konfigurasi Router-on-a-stick.
              </div>
            ) : (
              config.vlans.map((vlan) => (
                <div key={vlan.id} className="rounded-xl border border-[#1f293d] bg-[#151b26] p-4">
                  <div className="flex items-center justify-between border-b border-[#1f293d]/60 pb-2">
                    <span className="font-bold text-xs text-[#00f2fe]">VLAN ID: {vlan.vlanId} ({vlan.name})</span>
                    <button onClick={() => handleRemoveVlan(vlan.id)} className="text-xs text-[#ff4757] hover:underline">
                      Hapus
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Nama VLAN</label>
                      <input
                        type="text"
                        value={vlan.name}
                        onChange={(e) => handleUpdateVlan(vlan.id, { name: e.target.value })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">VLAN ID (1-4094)</label>
                      <input
                        type="number"
                        min="1"
                        max="4094"
                        value={vlan.vlanId}
                        onChange={(e) => handleUpdateVlan(vlan.id, { vlanId: parseInt(e.target.value, 10) || 1 })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Tagged Trunk Ports</label>
                      <input
                        type="text"
                        value={vlan.taggedPorts.join(',')}
                        onChange={(e) => handleUpdateVlan(vlan.id, { taggedPorts: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="ether4"
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Subnet IP Router</label>
                      <input
                        type="text"
                        value={vlan.ipAddress}
                        onChange={(e) => handleUpdateVlan(vlan.id, { ipAddress: e.target.value })}
                        placeholder="10.10.10.1/24"
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hotspot Sub-Tab */}
      {subTab === 'hotspot' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Hotspot Server &amp; Voucher Setup</h3>
              <p className="text-xs text-slate-400">Konfigurasi Hotspot login page, walled garden, dan user profile.</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-[#00ffaa]">
              <input
                type="checkbox"
                checked={config.hotspot.enabled}
                onChange={(e) => onChangeConfig({
                  ...config,
                  hotspot: { ...config.hotspot, enabled: e.target.checked }
                })}
                className="rounded border-[#1f293d] bg-[#0b0f19] text-[#00ffaa]"
              />
              <span>Aktifkan Hotspot</span>
            </label>
          </div>

          {config.hotspot.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-[#1f293d]">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold uppercase">Interface Hotspot</label>
                <input
                  type="text"
                  value={config.hotspot.interface}
                  onChange={(e) => onChangeConfig({ ...config, hotspot: { ...config.hotspot, interface: e.target.value } })}
                  className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold uppercase">IP Hotspot Gateway</label>
                <input
                  type="text"
                  value={config.hotspot.ipAddress}
                  onChange={(e) => onChangeConfig({ ...config, hotspot: { ...config.hotspot, ipAddress: e.target.value } })}
                  className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold uppercase">DNS Login Name</label>
                <input
                  type="text"
                  value={config.hotspot.dnsName}
                  onChange={(e) => onChangeConfig({ ...config, hotspot: { ...config.hotspot, dnsName: e.target.value } })}
                  className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                  placeholder="wifi.login"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold uppercase">Rate-Limit User Default</label>
                <input
                  type="text"
                  value={config.hotspot.userRateLimit}
                  onChange={(e) => onChangeConfig({ ...config, hotspot: { ...config.hotspot, userRateLimit: e.target.value } })}
                  className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                  placeholder="2M/5M"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Queue / Bandwidth Sub-Tab */}
      {subTab === 'queue' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f293d]/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00f2fe]/20 text-[#00f2fe]">
                  <Zap className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Bandwidth Management (Simple Queue &amp; Queue Tree)</h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">Atur batasan kecepatan bandwidth total atau aktifkan pemisahan prioritas QoS Game, Streaming, dan Browsing.</p>
            </div>
            
            <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer rounded-lg bg-[#0b0f19] px-3 py-1.5 border border-[#1f293d] text-[#00ffaa]">
              <input
                type="checkbox"
                checked={config.queue.qosTrafficSplit}
                onChange={(e) => onChangeConfig({
                  ...config,
                  queue: { ...config.queue, qosTrafficSplit: e.target.checked }
                })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00ffaa]"
              />
              <span>Separasi QoS (Game, Stream, Browse)</span>
            </label>
          </div>

          {/* If QoS Traffic Split is ACTIVE */}
          {config.queue.qosTrafficSplit ? (
            <div className="space-y-4">
              {/* QoS Engine Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pilih Arsitektur QoS RouterOS</label>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeConfig({
                      ...config,
                      queue: { ...config.queue, qosMode: 'simple_queue' }
                    })}
                    className={`rounded-xl p-3.5 text-left transition-all border ${
                      config.queue.qosMode === 'simple_queue'
                        ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white'
                        : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Hierarchical Simple Queue (Parent-Child)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe]">Rekomendasi Kantor / Home</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      Menggunakan Parent queue untuk total subnet LAN dan 4 Child queues dengan prioritas bertingkat (1=Game, 4=Streaming, 6=Browsing, 8=Download). Mudah dipantau di Winbox.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeConfig({
                      ...config,
                      queue: { ...config.queue, qosMode: 'queue_tree' }
                    })}
                    className={`rounded-xl p-3.5 text-left transition-all border ${
                      config.queue.qosMode === 'queue_tree'
                        ? 'border-[#00ffaa] bg-[#00ffaa]/10 text-white'
                        : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Queue Tree HTB + PCQ Dynamic</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00ffaa]/20 text-[#00ffaa]">Rekomendasi Warnet / RT-RW Net</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      Menggunakan HTB Global Root dan PCQ dynamic classifier per klien. Menjamin pembagian rata antar pengguna tanpa membebani router ketika user bertambah.
                    </p>
                  </button>
                </div>
              </div>

              {/* General Target Subnet and Global Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-[#1f293d] bg-[#0b0f19]">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold uppercase">Target Subnet LAN</label>
                  <input
                    type="text"
                    value={config.queue.targetNetwork}
                    onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, targetNetwork: e.target.value } })}
                    className="mt-1 w-full rounded border border-[#1f293d] bg-[#151b26] px-2.5 py-1.5 text-xs font-mono text-white"
                    placeholder="192.168.88.0/24"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold uppercase">Total Max Upload ISP</label>
                  <input
                    type="text"
                    value={config.queue.maxUpload}
                    onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, maxUpload: e.target.value } })}
                    className="mt-1 w-full rounded border border-[#1f293d] bg-[#151b26] px-2.5 py-1.5 text-xs font-mono text-white"
                    placeholder="50M"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold uppercase">Total Max Download ISP</label>
                  <input
                    type="text"
                    value={config.queue.maxDownload}
                    onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, maxDownload: e.target.value } })}
                    className="mt-1 w-full rounded border border-[#1f293d] bg-[#151b26] px-2.5 py-1.5 text-xs font-mono text-white"
                    placeholder="100M"
                  />
                </div>
              </div>

              {/* 4 Dedicated Priority Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Game Online */}
                <div className="rounded-xl border border-[#00ffaa]/40 bg-[#00ffaa]/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-[#00ffaa]" />
                      <span className="text-xs font-bold text-white">Game Online</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00ffaa]/20 text-[#00ffaa]">
                      Priority 1 (Tertinggi)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mobile Legends, PUBG, Free Fire, Valorant, Dota 2, Roblox, Genshin, Steam.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Upload</label>
                      <input
                        type="text"
                        value={config.queue.gameUpload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, gameUpload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="10M"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Download</label>
                      <input
                        type="text"
                        value={config.queue.gameDownload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, gameDownload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="20M"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Streaming */}
                <div className="rounded-xl border border-[#00f2fe]/40 bg-[#00f2fe]/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-[#00f2fe]" />
                      <span className="text-xs font-bold text-white">Streaming Video &amp; Musik</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe]">
                      Priority 4 (Medium-High)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    YouTube, TikTok, Netflix, Spotify, Vidio, QUIC UDP 443, RTMP 1935.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Upload</label>
                      <input
                        type="text"
                        value={config.queue.streamingUpload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, streamingUpload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="15M"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Download</label>
                      <input
                        type="text"
                        value={config.queue.streamingDownload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, streamingDownload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="30M"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Browsing & Sosmed */}
                <div className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[#f59e0b]" />
                      <span className="text-xs font-bold text-white">Browsing &amp; Media Sosial</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b]">
                      Priority 6 (Normal)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Web Surfing HTTP/HTTPS, Instagram, Facebook, WhatsApp, portal berita (&lt;1MB).
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Upload</label>
                      <input
                        type="text"
                        value={config.queue.browsingUpload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, browsingUpload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="10M"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Download</label>
                      <input
                        type="text"
                        value={config.queue.browsingDownload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, browsingDownload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="20M"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Heavy Download */}
                <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DownloadCloud className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-white">Heavy Download &amp; Transfer</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      Priority 8 (Terendah)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Download file besar, Google Drive, update Windows/Game, transfer data (&gt;1MB).
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Upload</label>
                      <input
                        type="text"
                        value={config.queue.heavyUpload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, heavyUpload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="5M"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Max Download</label>
                      <input
                        type="text"
                        value={config.queue.heavyDownload}
                        onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, heavyDownload: e.target.value } })}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2 py-1 text-xs font-mono text-white"
                        placeholder="10M"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Non-Split Queue */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'Tanpa Queue' },
                  { id: 'simple', label: 'Simple Queue' },
                  { id: 'pcq', label: 'PCQ Equal Share' },
                  { id: 'tree', label: 'Queue Tree' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, queue: { ...config.queue, type: m.id as any } })}
                    className={`rounded-lg p-2 text-xs font-bold transition-all border ${
                      config.queue.type === m.id
                        ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white'
                        : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {config.queue.type !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#1f293d]">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Target Subnet</label>
                    <input
                      type="text"
                      value={config.queue.targetNetwork}
                      onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, targetNetwork: e.target.value } })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                      placeholder="192.168.88.0/24"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Max Total Upload</label>
                    <input
                      type="text"
                      value={config.queue.maxUpload}
                      onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, maxUpload: e.target.value } })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                      placeholder="20M"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Max Total Download</label>
                    <input
                      type="text"
                      value={config.queue.maxDownload}
                      onChange={(e) => onChangeConfig({ ...config, queue: { ...config.queue, maxDownload: e.target.value } })}
                      className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                      placeholder="50M"
                    />
                  </div>
                  {config.queue.type === 'pcq' && (
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold uppercase">PCQ Rate Per User</label>
                      <input
                        type="text"
                        value={`${config.queue.pcqRateUpload}/${config.queue.pcqRateDownload}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('/');
                          onChangeConfig({
                            ...config,
                            queue: {
                              ...config.queue,
                              pcqRateUpload: parts[0] || '2M',
                              pcqRateDownload: parts[1] || '5M'
                            }
                          });
                        }}
                        className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                        placeholder="2M/5M"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VPN Sub-Tab */}
      {subTab === 'vpn' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">VPN Server (WireGuard v7 / L2TP IPsec)</h3>
            <p className="text-xs text-slate-400">Akses remote aman ke jaringan lokal via VPN.</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'Disable VPN' },
              { id: 'wireguard', label: 'WireGuard (v7 Only)' },
              { id: 'l2tp', label: 'L2TP / IPsec' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeConfig({ ...config, vpn: { ...config.vpn, type: m.id as any } })}
                className={`rounded-lg p-2 text-xs font-bold transition-all border ${
                  config.vpn.type === m.id
                    ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white'
                    : 'border-[#1f293d] bg-[#0b0f19] text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {config.vpn.type === 'wireguard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1f293d]">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold uppercase">WireGuard Listen Port</label>
                <input
                  type="number"
                  value={config.vpn.wireguardPort}
                  onChange={(e) => onChangeConfig({ ...config, vpn: { ...config.vpn, wireguardPort: parseInt(e.target.value, 10) || 13231 } })}
                  className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold uppercase">WireGuard Subnet IP</label>
                <input
                  type="text"
                  value={config.vpn.wireguardAddress}
                  onChange={(e) => onChangeConfig({ ...config, vpn: { ...config.vpn, wireguardAddress: e.target.value } })}
                  className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                  placeholder="10.50.0.1/24"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tools Sub-Tab */}
      {subTab === 'tools' && (
        <div className="rounded-xl border border-[#1f293d] bg-[#151b26] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Monitoring, Netwatch &amp; Auto Scheduler</h3>
            <p className="text-xs text-slate-400">Otomasi router, auto-backup, dan pemantauan gateway aktif.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer">
              <input
                type="checkbox"
                checked={config.tools.cloudDdns}
                onChange={(e) => onChangeConfig({ ...config, tools: { ...config.tools, cloudDdns: e.target.checked } })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
              />
              <div>
                <div className="text-xs font-bold text-white">MikroTik Cloud DDNS</div>
                <div className="text-[11px] text-slate-400">Aktifkan DNS name gratis dari MikroTik cloud.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] cursor-pointer">
              <input
                type="checkbox"
                checked={config.tools.autoBackup}
                onChange={(e) => onChangeConfig({ ...config, tools: { ...config.tools, autoBackup: e.target.checked } })}
                className="rounded border-[#1f293d] bg-[#111723] text-[#00f2fe]"
              />
              <div>
                <div className="text-xs font-bold text-white">Daily Auto-Backup Scheduler</div>
                <div className="text-[11px] text-slate-400">Simpan file backup dan RSC otomatis setiap subuh (03:00).</div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold uppercase">Netwatch Ping Canary Host</label>
              <input
                type="text"
                value={config.tools.netwatchHost}
                onChange={(e) => onChangeConfig({ ...config, tools: { ...config.tools, netwatchHost: e.target.value } })}
                className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                placeholder="8.8.8.8"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-semibold uppercase">NTP Time Server</label>
              <input
                type="text"
                value={config.tools.ntpServer}
                onChange={(e) => onChangeConfig({ ...config, tools: { ...config.tools, ntpServer: e.target.value } })}
                className="mt-1 w-full rounded border border-[#1f293d] bg-[#0b0f19] px-2.5 py-1.5 text-xs font-mono text-white"
                placeholder="id.pool.ntp.org"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
