import React, { useState, useEffect, useMemo } from 'react';
import { MikroTikConfig, SavedConfigRecord, ActivityLogRecord, RosVersion, ValidationSummary } from './types';
import { generateRouterOsScript, normalizeConfig } from './utils/generator';
import { validateMikroTikConfig } from './utils/validator';
import { INDUSTRIAL_TEMPLATES } from './data/templates';
import { PresetItem } from './data/presets';
import { Sidebar, TabType } from './components/Sidebar';
import { TerminalOutput } from './components/TerminalOutput';
import { ValidatorWidget } from './components/ValidatorWidget';
import { DashboardView } from './components/DashboardView';
import { WizardView } from './components/WizardView';
import { MultiWanView } from './components/MultiWanView';
import { NetworkModulesView } from './components/NetworkModulesView';
import { TemplatesView } from './components/TemplatesView';
import { SavedConfigsView } from './components/SavedConfigsView';
import { GasExportView } from './components/GasExportView';
import { Menu, X, ShieldAlert, Sparkles } from 'lucide-react';

declare const google: any;

const INITIAL_CONFIG: MikroTikConfig = {
  routerName: 'MikroTik-Router',
  rosVersion: 'v7',
  safeMode: true,
  backupBeforeApply: true,
  multiWanMode: 'pcc_equal',
  wans: [
    {
      id: 'w1',
      name: 'ether1-WAN1',
      comment: 'ISP1-Indihome',
      type: 'static',
      ipAddress: '192.168.1.2/24',
      gateway: '192.168.1.1',
      weight: 1,
      distance: 1,
      checkGateway: true
    },
    {
      id: 'w2',
      name: 'ether2-WAN2',
      comment: 'ISP2-Biznet',
      type: 'static',
      ipAddress: '192.168.2.2/24',
      gateway: '192.168.2.1',
      weight: 1,
      distance: 2,
      checkGateway: true
    }
  ],
  lans: [
    {
      id: 'l1',
      name: 'bridge-lan',
      ipAddress: '192.168.88.1/24',
      dhcpEnabled: true,
      dhcpPoolStart: '192.168.88.10',
      dhcpPoolEnd: '192.168.88.254',
      leaseTime: '8h'
    }
  ],
  dnsServers: ['1.1.1.1', '8.8.8.8'],
  dnsAllowRemote: true,
  enableFasttrack: false,
  protectRouter: true,
  dropInvalid: true,
  blockDdosRaw: true,
  portForwards: [],
  vlans: [],
  hotspot: {
    enabled: false,
    interface: 'bridge-hotspot',
    ipAddress: '10.10.10.1/24',
    poolName: 'hs-pool',
    dnsName: 'wifi.login',
    profileName: 'hsprof-default',
    userRateLimit: '2M/5M',
    trialEnabled: false
  },
  pppoe: {
    enabled: false,
    serviceName: 'pppoe-service',
    interface: 'ether3-LAN',
    localAddress: '10.0.0.1',
    remotePool: 'pppoe-pool',
    defaultProfile: 'pppoe-profile'
  },
  queue: {
    type: 'pcq',
    targetNetwork: '192.168.88.0/24',
    maxUpload: '50M',
    maxDownload: '100M',
    pcqRateUpload: '5M',
    pcqRateDownload: '10M',
    qosTrafficSplit: true,
    qosMode: 'simple_queue',
    gameUpload: '10M',
    gameDownload: '20M',
    streamingUpload: '15M',
    streamingDownload: '30M',
    browsingUpload: '10M',
    browsingDownload: '20M',
    heavyUpload: '5M',
    heavyDownload: '10M'
  },
  siteBlocker: {
    enabled: true,
    blockJudol: true,
    blockPorn: true,
    blockTorrent: true,
    blockSosmed: false,
    blockStreaming: false,
    customDomains: ['domain-judi-ilegal.com', 'situs-terlarang.net'],
    blockMethod: 'filter_tls'
  },
  vpn: {
    type: 'none',
    wireguardPort: 13231,
    wireguardAddress: '10.50.0.1/24',
    l2tpSecret: 'MikroTik123!',
    l2tpPool: '10.50.1.0/24'
  },
  tools: {
    cloudDdns: true,
    ntpClient: true,
    ntpServer: 'id.pool.ntp.org',
    autoBackup: true,
    backupTime: '03:00:00',
    netwatchHost: '8.8.8.8',
    netwatchInterval: '30s'
  }
};

export default function App() {
  const [config, setConfig] = useState<MikroTikConfig>(INITIAL_CONFIG);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [safeMode, setSafeMode] = useState<boolean>(true);
  const [backupBeforeApply, setBackupBeforeApply] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence State
  const [savedConfigs, setSavedConfigs] = useState<SavedConfigRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load from localStorage or Google Apps Script on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadSavedData = () => {
    setIsLoadingData(true);
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((res: any) => {
          setIsLoadingData(false);
          if (res && res.data) {
            setSavedConfigs(res.data);
          }
        })
        .withFailureHandler(() => {
          setIsLoadingData(false);
          loadLocalFallbackData();
        })
        .fetchSavedConfigs(1, 50, '');
    } else {
      loadLocalFallbackData();
    }
  };

  const loadLocalFallbackData = () => {
    setIsLoadingData(false);
    try {
      const localSaved = localStorage.getItem('mikrotik_pro_saved_configs');
      const localLogs = localStorage.getItem('mikrotik_pro_activity_logs');
      if (localSaved) {
        setSavedConfigs(JSON.parse(localSaved));
      } else {
        // Initial sample seed
        const sample: SavedConfigRecord[] = [
          {
            config_id: 'CFG-0001',
            router_name: 'Core-Office-RB4011',
            ros_version: 'v7',
            config_type: 'Dual WAN PCC Equal',
            script_content: '# Sample configuration export\n/system identity set name=Core-Office-RB4011',
            created_by: 'admin@mikrotikpro.local',
            created_at: new Date().toLocaleDateString('id-ID')
          }
        ];
        setSavedConfigs(sample);
        localStorage.setItem('mikrotik_pro_saved_configs', JSON.stringify(sample));
      }

      if (localLogs) {
        setActivityLogs(JSON.parse(localLogs));
      } else {
        const sampleLog: ActivityLogRecord[] = [
          {
            log_id: 'LOG-0001',
            timestamp: new Date().toLocaleTimeString('id-ID'),
            user_email: 'admin@mikrotikpro.local',
            router_name: 'Core-Office-RB4011',
            action_type: 'INITIALIZE',
            details: 'Inisialisasi sistem database MikroTik Pro'
          }
        ];
        setActivityLogs(sampleLog);
        localStorage.setItem('mikrotik_pro_activity_logs', JSON.stringify(sampleLog));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate RouterOS Script Reactively
  const generatedScript = useMemo(() => {
    return generateRouterOsScript({ ...config, safeMode, backupBeforeApply });
  }, [config, safeMode, backupBeforeApply]);

  // Validation Checklist Reactively
  const validationSummary: ValidationSummary = useMemo(() => {
    return validateMikroTikConfig(config);
  }, [config]);

  // Actions
  const handleApplyPreset = (preset: PresetItem) => {
    setConfig(prev => normalizeConfig(preset.config, prev));
    showToast(`Preset "${preset.name}" berhasil diterapkan!`);
  };

  const handleLoadTemplate = (tplConfig: MikroTikConfig) => {
    setConfig(prev => normalizeConfig(tplConfig, prev));
    showToast(`Template "${tplConfig.routerName || 'Template'}" dimuat ke builder!`);
  };

  const handleSaveToSpreadsheet = () => {
    setIsSaving(true);
    const newConfigId = `CFG-${String(savedConfigs.length + 1).padStart(4, '0')}`;
    const nowStr = new Date().toLocaleString('id-ID');
    const userEmail = 'admin@mikrotikpro.local';

    const newRecord: SavedConfigRecord = {
      config_id: newConfigId,
      router_name: config.routerName,
      ros_version: config.rosVersion,
      config_type: `${config.multiWanMode.replace('_', ' ').toUpperCase()} (${config.wans.length} WAN)`,
      script_content: generatedScript,
      created_by: userEmail,
      created_at: nowStr
    };

    const newLogRecord: ActivityLogRecord = {
      log_id: `LOG-${String(activityLogs.length + 1).padStart(4, '0')}`,
      timestamp: nowStr,
      user_email: userEmail,
      router_name: config.routerName,
      action_type: 'SAVE_CONFIG',
      details: `Disimpan script ${newConfigId} dengan mode ${config.multiWanMode}`
    };

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((res: any) => {
          setIsSaving(false);
          if (res && res.success) {
            setSavedConfigs([res.data, ...savedConfigs]);
            showToast(res.message || 'Berhasil disimpan ke Google Sheets!');
          }
        })
        .withFailureHandler((err: any) => {
          setIsSaving(false);
          // Fallback to local
          persistLocally(newRecord, newLogRecord);
        })
        .saveConfiguration({
          router_name: config.routerName,
          ros_version: config.rosVersion,
          config_type: newRecord.config_type,
          script_content: generatedScript,
          created_by: userEmail
        });
    } else {
      setTimeout(() => {
        setIsSaving(false);
        persistLocally(newRecord, newLogRecord);
      }, 400);
    }
  };

  const persistLocally = (rec: SavedConfigRecord, log: ActivityLogRecord) => {
    const updatedConfigs = [rec, ...savedConfigs];
    const updatedLogs = [log, ...activityLogs];
    setSavedConfigs(updatedConfigs);
    setActivityLogs(updatedLogs);
    try {
      localStorage.setItem('mikrotik_pro_saved_configs', JSON.stringify(updatedConfigs));
      localStorage.setItem('mikrotik_pro_activity_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error(e);
    }
    showToast(`Konfigurasi ${rec.config_id} berhasil disimpan!`);
  };

  const handleDeleteConfig = (id: string) => {
    const updated = savedConfigs.filter(c => c.config_id !== id);
    setSavedConfigs(updated);
    try {
      localStorage.setItem('mikrotik_pro_saved_configs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast(`Konfigurasi ${id} dihapus dari riwayat.`);
  };

  const handleLoadSavedConfigIntoEditor = (rec: SavedConfigRecord) => {
    showToast(`Script ${rec.config_id} siap di-copy di panel terminal.`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          rosVersion={config.rosVersion}
          routerName={config.routerName}
        />
      </div>

      {/* Main App Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-[#1f293d] bg-[#111723] px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f293d] bg-[#151b26] text-slate-400 hover:text-white lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {currentTab.toUpperCase().replace('_', ' ')}
              </span>
              <span className="hidden sm:inline-flex items-center rounded bg-[#0b0f19] px-2 py-0.5 text-[10px] font-mono text-[#00f2fe] border border-[#00f2fe]/20">
                {config.multiWanMode.replace('_', ' ').toUpperCase()} &bull; {config.wans.length} WAN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to GAS Code Files */}
            <button
              onClick={() => setCurrentTab('gas_files')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#00f2fe]/30 bg-[#00f2fe]/10 px-3 py-1.5 text-xs font-bold text-[#00f2fe] hover:bg-[#00f2fe]/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Lihat 3 File GAS</span>
            </button>
          </div>
        </header>

        {/* Workspace Body: Split View */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Left / Center Work Area: Active Form Tab */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Live Safety Validator Widget */}
              <ValidatorWidget
                validation={validationSummary}
                safeMode={safeMode}
                onToggleSafeMode={setSafeMode}
                backupBeforeApply={backupBeforeApply}
                onToggleBackup={setBackupBeforeApply}
              />

              {/* View Render based on Current Tab */}
              {currentTab === 'dashboard' && (
                <DashboardView
                  config={config}
                  onChangeConfig={setConfig}
                  onApplyPreset={handleApplyPreset}
                  onNavigateTab={setCurrentTab}
                />
              )}

              {currentTab === 'wizard' && (
                <WizardView
                  config={config}
                  onChangeConfig={setConfig}
                  onFinishWizard={() => {
                    setCurrentTab('dashboard');
                    showToast('Wizard selesai! Script siap digunakan.');
                  }}
                />
              )}

              {currentTab === 'multiwan' && (
                <MultiWanView
                  config={config}
                  onChangeConfig={setConfig}
                />
              )}

              {currentTab === 'network' && (
                <NetworkModulesView
                  config={config}
                  onChangeConfig={setConfig}
                />
              )}

              {currentTab === 'templates' && (
                <TemplatesView
                  onLoadTemplate={handleLoadTemplate}
                  onPreviewTemplateScript={(tpl) => {
                    try {
                      const parsed = JSON.parse(tpl.config_json);
                      setConfig(prev => normalizeConfig(parsed, prev));
                      showToast(`Preview script "${tpl.title}" aktif di terminal.`);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                />
              )}

              {currentTab === 'saved' && (
                <SavedConfigsView
                  savedConfigs={savedConfigs}
                  activityLogs={activityLogs}
                  onLoadConfigIntoEditor={handleLoadSavedConfigIntoEditor}
                  onDeleteConfig={handleDeleteConfig}
                  onRefresh={loadSavedData}
                  isLoading={isLoadingData}
                />
              )}

              {currentTab === 'gas_files' && (
                <GasExportView />
              )}
            </div>
          </main>

          {/* Right Panel: Interactive RouterOS Terminal Output */}
          <aside className="w-full lg:w-[460px] xl:w-[500px] border-t lg:border-t-0 lg:border-l border-[#1f293d] bg-[#070a10] flex flex-col h-96 lg:h-auto">
            <TerminalOutput
              script={generatedScript}
              rosVersion={config.rosVersion}
              onVersionChange={(ver) => setConfig({ ...config, rosVersion: ver })}
              routerName={config.routerName}
              onSaveConfig={handleSaveToSpreadsheet}
              isSaving={isSaving}
            />
          </aside>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#00f2fe]/40 bg-[#151b26] px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-[#00f2fe]/20 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-[#00ffaa]"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
