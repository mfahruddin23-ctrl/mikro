import React from 'react';
import { 
  LayoutDashboard, 
  Wand2, 
  Network, 
  ShieldCheck, 
  BookOpen, 
  HardDrive, 
  FileCode2, 
  Activity, 
  Server
} from 'lucide-react';
import { RosVersion } from '../types';

export type TabType = 'dashboard' | 'wizard' | 'multiwan' | 'network' | 'templates' | 'saved' | 'gas_files';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  rosVersion: RosVersion;
  routerName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  rosVersion,
  routerName
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard & Presets',
      icon: LayoutDashboard,
      badge: 'Quick'
    },
    {
      id: 'wizard' as TabType,
      label: 'Setup Wizard',
      icon: Wand2,
      badge: 'Step'
    },
    {
      id: 'multiwan' as TabType,
      label: 'Multi-WAN & PCC',
      icon: Network,
      badge: 'Up to 8'
    },
    {
      id: 'network' as TabType,
      label: 'Network & Firewall',
      icon: ShieldCheck,
      badge: 'QoS/NAT'
    },
    {
      id: 'templates' as TabType,
      label: 'Template Library',
      icon: BookOpen,
      badge: '12 Preset'
    },
    {
      id: 'saved' as TabType,
      label: 'Saved & Logs',
      icon: HardDrive,
      badge: 'Spreadsheet'
    },
    {
      id: 'gas_files' as TabType,
      label: 'GAS Code Files (3)',
      icon: FileCode2,
      badge: 'Google Apps'
    }
  ];

  return (
    <aside id="app-sidebar" className="flex w-64 flex-col border-r border-[#1f293d] bg-[#111723] flex-shrink-0 z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-[#1f293d] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f2fe] to-[#4facfe] shadow-[0_0_15px_rgba(0,242,254,0.4)]">
          <Server className="h-5 w-5 text-black font-extrabold" />
        </div>
        <div>
          <div className="font-extrabold tracking-wide text-white text-sm">MIKROTIK PRO</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#00ffaa]/15 text-[#00ffaa] border border-[#00ffaa]/30">
              {rosVersion.toUpperCase()} READY
            </span>
            <span className="text-[10px] text-slate-400 font-mono">GAS App</span>
          </div>
        </div>
      </div>

      {/* Router ID Quick Tag */}
      <div className="mx-3 mt-3 rounded-lg border border-[#1f293d] bg-[#0b0f19] px-3 py-2 text-xs">
        <div className="text-[10px] font-semibold uppercase text-slate-400">Target Router</div>
        <div className="font-mono font-bold text-[#00f2fe] truncate mt-0.5">
          {routerName || 'MikroTik-Router'}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                isActive
                  ? 'border border-[#00f2fe]/40 bg-[#00f2fe]/10 text-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.12)]'
                  : 'text-slate-400 hover:bg-[#151b26] hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#00f2fe]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] rounded px-1.5 py-0.5 font-mono ${
                  isActive ? 'bg-[#00f2fe]/20 text-[#00f2fe]' : 'bg-[#1a2333] text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="border-t border-[#1f293d] p-3 text-xs bg-[#0b0f19]/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-[#00ffaa]" />
            <span>Generator Engine</span>
          </span>
          <span className="font-mono text-[#00ffaa]">v7.16 / v6.49</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 font-mono">
          Safe Migrate &bull; Non-Destructive
        </div>
      </div>
    </aside>
  );
};
