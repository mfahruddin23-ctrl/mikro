export type RosVersion = 'v6' | 'v7';

export type MultiWanMode = 'single' | 'pcc_equal' | 'pcc_weighted' | 'failover' | 'ecmp' | 'recursive';

export interface WanInterface {
  id: string;
  name: string;
  comment: string;
  type: 'dhcp' | 'static' | 'pppoe';
  ipAddress: string; // e.g. 192.168.1.2/24
  gateway: string;   // e.g. 192.168.1.1
  weight: number;    // for weighted PCC (1-10)
  distance: number;  // for failover
  checkGateway: boolean;
  pppoeUser?: string;
  pppoePassword?: string;
}

export interface LanInterface {
  id: string;
  name: string;
  ipAddress: string; // e.g. 10.10.10.1/24
  dhcpEnabled: boolean;
  dhcpPoolStart: string; // e.g. 10.10.10.10
  dhcpPoolEnd: string;   // e.g. 10.10.10.254
  leaseTime: string;     // e.g. 12h
}

export interface PortForwardRule {
  id: string;
  comment: string;
  protocol: 'tcp' | 'udp';
  dstPort: string;
  toAddress: string;
  toPort: string;
  inInterface: string;
}

export interface VlanItem {
  id: string;
  name: string;
  vlanId: number;
  bridge: string;
  taggedPorts: string[];
  untaggedPorts: string[];
  ipAddress: string;
  dhcpEnabled: boolean;
}

export interface HotspotConfig {
  enabled: boolean;
  interface: string;
  ipAddress: string;
  poolName: string;
  dnsName: string;
  profileName: string;
  userRateLimit: string; // e.g. 2M/5M
  trialEnabled: boolean;
}

export interface PppoeConfig {
  enabled: boolean;
  serviceName: string;
  interface: string;
  localAddress: string;
  remotePool: string;
  defaultProfile: string;
}

export interface QueueConfig {
  type: 'none' | 'simple' | 'tree' | 'pcq';
  targetNetwork: string; // e.g. 10.10.10.0/24
  maxUpload: string;     // e.g. 20M
  maxDownload: string;   // e.g. 50M
  pcqRateUpload: string; // e.g. 2M
  pcqRateDownload: string;// e.g. 5M
  qosTrafficSplit?: boolean; // Pisah trafik Game, Streaming, Browsing, Heavy
  qosMode?: 'simple_queue' | 'queue_tree';
  gameUpload?: string;
  gameDownload?: string;
  streamingUpload?: string;
  streamingDownload?: string;
  browsingUpload?: string;
  browsingDownload?: string;
  heavyUpload?: string;
  heavyDownload?: string;
}

export interface SiteBlockerConfig {
  enabled: boolean;
  blockJudol: boolean;      // Blokir Judi Online, Slot, Gacor, Togel
  blockPorn: boolean;       // Blokir Pornografi & Konten 18+
  blockTorrent: boolean;    // Blokir P2P BitTorrent
  blockSosmed: boolean;     // Blokir TikTok, FB, IG
  blockStreaming: boolean;  // Blokir Netflix, YouTube
  customDomains: string[];  // Domain kustom pisah koma
  blockMethod: 'filter_tls' | 'raw_drop' | 'dns_redirect';
}

export interface VpnConfig {
  type: 'none' | 'wireguard' | 'l2tp' | 'ipsec';
  wireguardPort: number;
  wireguardAddress: string; // e.g. 172.16.0.1/24
  l2tpSecret: string;
  l2tpPool: string;
}

export interface ToolsConfig {
  cloudDdns: boolean;
  ntpClient: boolean;
  ntpServer: string;
  autoBackup: boolean;
  backupTime: string; // e.g. 03:00:00
  netwatchHost: string; // e.g. 8.8.8.8
  netwatchInterval: string; // e.g. 30s
}

export interface MikroTikConfig {
  routerName: string;
  rosVersion: RosVersion;
  safeMode: boolean;
  backupBeforeApply: boolean;
  multiWanMode: MultiWanMode;
  wans: WanInterface[];
  lans: LanInterface[];
  dnsServers: string[]; // e.g. ['8.8.8.8', '1.1.1.1']
  dnsAllowRemote: boolean;
  enableFasttrack: boolean;
  protectRouter: boolean;
  dropInvalid: boolean;
  blockDdosRaw: boolean;
  portForwards?: PortForwardRule[];
  vlans?: VlanItem[];
  hotspot?: HotspotConfig;
  pppoe?: PppoeConfig;
  queue?: QueueConfig;
  siteBlocker?: SiteBlockerConfig;
  vpn?: VpnConfig;
  tools?: ToolsConfig;
}

export interface ValidationItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface ValidationSummary {
  status: 'green' | 'yellow' | 'red';
  errors: ValidationItem[];
  warnings: ValidationItem[];
  infos: ValidationItem[];
}

export interface SavedConfigRecord {
  config_id: string;
  router_name: string;
  ros_version: RosVersion;
  config_type: string;
  script_content: string;
  created_by: string;
  created_at: string;
}

export interface ActivityLogRecord {
  log_id: string;
  timestamp: string;
  user_email: string;
  router_name: string;
  action_type: string;
  details: string;
}

export interface TemplateRecord {
  template_id: string;
  title: string;
  category: string;
  description: string;
  config_json: string;
  ros_version?: RosVersion;
}
