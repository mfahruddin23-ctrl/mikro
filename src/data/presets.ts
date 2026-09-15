import { MikroTikConfig } from '../types';

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  tags: string[];
  config: Partial<MikroTikConfig>;
}

export const QUICK_PRESETS: PresetItem[] = [
  {
    id: 'preset-home',
    name: 'Home / SOHO',
    category: 'Residential',
    description: '1 WAN DHCP/Static, 1 LAN bridge dengan DHCP Server, DNS Google/Cloudflare, Masquerade NAT, dan proteksi basic firewall.',
    icon: 'Home',
    tags: ['Single WAN', 'Plug & Play', 'Basic Firewall'],
    config: {
      routerName: 'MikroTik-Home',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1', comment: 'ISP-Indihome', type: 'dhcp', ipAddress: '', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.88.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.88.10', dhcpPoolEnd: '192.168.88.250', leaseTime: '12h' }
      ],
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: true,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false,
      queue: { type: 'simple', targetNetwork: '192.168.88.0/24', maxUpload: '20M', maxDownload: '50M', pcqRateUpload: '2M', pcqRateDownload: '5M' }
    }
  },
  {
    id: 'preset-office',
    name: 'Office Dual WAN Failover',
    category: 'Corporate',
    description: 'Dual WAN Failover otomatis, proteksi port scanner, FastTrack, QoS untuk browsing/meeting, dan auto backup harian.',
    icon: 'Briefcase',
    tags: ['Dual WAN', 'Failover', 'Office Security', 'Auto Backup'],
    config: {
      routerName: 'MikroTik-Office-HQ',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN1', comment: 'ISP-Primary-Fiber', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-WAN2', comment: 'ISP-Backup-4G', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 1, distance: 2, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '10.10.10.1/24', dhcpEnabled: true, dhcpPoolStart: '10.10.10.20', dhcpPoolEnd: '10.10.10.200', leaseTime: '8h' }
      ],
      dnsServers: ['8.8.8.8', '8.8.4.4', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: true,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true,
      tools: { cloudDdns: true, ntpClient: true, ntpServer: 'id.pool.ntp.org', autoBackup: true, backupTime: '02:30:00', netwatchHost: '8.8.8.8', netwatchInterval: '30s' }
    }
  },
  {
    id: 'preset-hotspot',
    name: 'Hotspot Voucher Cafe / RT-RW',
    category: 'Hospitality',
    description: 'Hotspot siap voucher (Walled Garden, Profile 2M/5M, Trial 30m, DNS login custom, PCQ equal rate).',
    icon: 'Wifi',
    tags: ['Hotspot', 'Voucher Ready', 'PCQ Bandwidth', 'Walled Garden'],
    config: {
      routerName: 'MikroTik-Hotspot-Pro',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'ISP-Main', type: 'dhcp', ipAddress: '', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'ether2-LAN-Staff', ipAddress: '192.168.10.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.10.10', dhcpPoolEnd: '192.168.10.50', leaseTime: '12h' }
      ],
      hotspot: {
        enabled: true,
        interface: 'ether3-Hotspot',
        ipAddress: '10.20.30.1',
        poolName: 'pool_hotspot',
        dnsName: 'wifi.login',
        profileName: 'hsprof_cafe',
        userRateLimit: '2M/5M',
        trialEnabled: true
      },
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false
    }
  },
  {
    id: 'preset-enterprise',
    name: 'Enterprise 3-WAN PCC',
    category: 'Enterprise',
    description: '3 WAN Load Balancing PCC Weighted (50M:30M:20M), WireGuard VPN site-to-site, Bridge VLAN filtering, Hardened RAW filter.',
    icon: 'Server',
    tags: ['3-WAN PCC', 'VLAN Trunking', 'WireGuard', 'High Security'],
    config: {
      routerName: 'MikroTik-Enterprise-Gateway',
      rosVersion: 'v7',
      multiWanMode: 'pcc_weighted',
      wans: [
        { id: 'w1', name: 'ether1-WAN1', comment: 'Dedicated-50M', type: 'static', ipAddress: '103.10.1.2/30', gateway: '103.10.1.1', weight: 5, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-WAN2', comment: 'Broadband-30M', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 3, distance: 2, checkGateway: true },
        { id: 'w3', name: 'ether3-WAN3', comment: 'Backup-20M', type: 'static', ipAddress: '192.168.3.2/24', gateway: '192.168.3.1', weight: 2, distance: 3, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '172.16.0.1/24', dhcpEnabled: true, dhcpPoolStart: '172.16.0.50', dhcpPoolEnd: '172.16.0.250', leaseTime: '4h' }
      ],
      vlans: [
        { id: 'v10', name: 'vlan10-MGMT', vlanId: 10, bridge: 'bridge-lan', taggedPorts: ['ether4'], untaggedPorts: [], ipAddress: '172.16.10.1/24', dhcpEnabled: true },
        { id: 'v20', name: 'vlan20-CORP', vlanId: 20, bridge: 'bridge-lan', taggedPorts: ['ether4'], untaggedPorts: ['ether5'], ipAddress: '172.16.20.1/24', dhcpEnabled: true }
      ],
      vpn: {
        type: 'wireguard',
        wireguardPort: 13231,
        wireguardAddress: '10.50.0.1/24',
        l2tpSecret: '',
        l2tpPool: ''
      },
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    }
  },
  {
    id: 'preset-gaming',
    name: 'Ultra Low-Latency Gaming',
    category: 'Gaming',
    description: 'Optimasi bufferbloat, prioritas port gaming (Mobile Legends, Steam, Valorant, PUBG), ICMP protect, PCQ equal user share.',
    icon: 'Gamepad2',
    tags: ['Anti-Lag', 'QoS Gaming', 'Bufferbloat Fix', 'PCQ'],
    config: {
      routerName: 'MikroTik-Gaming-Arena',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-Fiber', comment: 'ISP-LowLatency', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.50.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.50.10', dhcpPoolEnd: '192.168.50.200', leaseTime: '6h' }
      ],
      queue: {
        type: 'pcq',
        targetNetwork: '192.168.50.0/24',
        maxUpload: '30M',
        maxDownload: '100M',
        pcqRateUpload: '3M',
        pcqRateDownload: '10M'
      },
      dnsServers: ['1.1.1.1', '1.0.0.1'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    }
  },
  {
    id: 'preset-warnet',
    name: 'Warnet / Esports Cybercafe',
    category: 'Gaming',
    description: 'Dual WAN: WAN1 untuk Game Online, WAN2 untuk Browsing/YouTube. Anti-lag ping stabil, PCQ per Client PC.',
    icon: 'Monitor',
    tags: ['Cybercafe', 'Split Traffic', 'Game WAN1', 'Web WAN2'],
    config: {
      routerName: 'MikroTik-CyberCafe',
      rosVersion: 'v7',
      multiWanMode: 'pcc_equal',
      wans: [
        { id: 'w1', name: 'ether1-Game', comment: 'ISP-Fiber-Game', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-Web', comment: 'ISP-Fiber-Browsing', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 1, distance: 2, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-billing', ipAddress: '192.168.100.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.100.10', dhcpPoolEnd: '192.168.100.100', leaseTime: '12h' }
      ],
      queue: {
        type: 'pcq',
        targetNetwork: '192.168.100.0/24',
        maxUpload: '50M',
        maxDownload: '150M',
        pcqRateUpload: '5M',
        pcqRateDownload: '15M'
      },
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    }
  },
  {
    id: 'preset-sekolah',
    name: 'Sekolah / Campus Network',
    category: 'Education',
    description: 'Dual WAN PCC, isolasi VLAN Guru & Siswa, SafeSearch/CleanBrowsing DNS, limitasi streaming, Drop torrent.',
    icon: 'GraduationCap',
    tags: ['School', 'VLAN Guru/Siswa', 'Family DNS', 'Safe Internet'],
    config: {
      routerName: 'MikroTik-SMK-Negeri',
      rosVersion: 'v7',
      multiWanMode: 'pcc_equal',
      wans: [
        { id: 'w1', name: 'ether1-WAN1', comment: 'ISP-Pendidikan', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-WAN2', comment: 'ISP-Cadangan', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 1, distance: 2, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '10.20.0.1/16', dhcpEnabled: true, dhcpPoolStart: '10.20.1.10', dhcpPoolEnd: '10.20.10.254', leaseTime: '4h' }
      ],
      vlans: [
        { id: 'v10', name: 'vlan10-GuruTU', vlanId: 10, bridge: 'bridge-lan', taggedPorts: ['ether4'], untaggedPorts: ['ether5'], ipAddress: '10.20.10.1/24', dhcpEnabled: true },
        { id: 'v20', name: 'vlan20-LabKomputer', vlanId: 20, bridge: 'bridge-lan', taggedPorts: ['ether4'], untaggedPorts: [], ipAddress: '10.20.20.1/24', dhcpEnabled: true }
      ],
      dnsServers: ['1.1.1.3', '1.0.0.3'], // Cloudflare Family / Malware & Adult filter
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    }
  },
  {
    id: 'preset-rumahsakit',
    name: 'Rumah Sakit / Medical Clinic',
    category: 'Healthcare',
    description: 'High-Availability Recursive Routing Failover, VLAN Alat Medis & SIMRS terisolasi, VLAN Pasien Hotspot terpisah, IPsec Site-to-Site.',
    icon: 'Activity',
    tags: ['Hospital', 'High Reliability', 'Medical Isolation', 'Recursive Failover'],
    config: {
      routerName: 'MikroTik-RSUD-Gateway',
      rosVersion: 'v7',
      multiWanMode: 'recursive',
      wans: [
        { id: 'w1', name: 'ether1-MainFiber', comment: 'LeasedLine-Primary', type: 'static', ipAddress: '103.55.10.2/29', gateway: '103.55.10.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-BackupSat', comment: 'VSAT-Backup', type: 'static', ipAddress: '192.168.10.2/24', gateway: '192.168.10.1', weight: 1, distance: 2, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-rs', ipAddress: '10.50.0.1/20', dhcpEnabled: true, dhcpPoolStart: '10.50.1.10', dhcpPoolEnd: '10.50.1.250', leaseTime: '12h' }
      ],
      vlans: [
        { id: 'v100', name: 'vlan100-SIMRS', vlanId: 100, bridge: 'bridge-rs', taggedPorts: ['ether4'], untaggedPorts: [], ipAddress: '10.50.100.1/24', dhcpEnabled: true },
        { id: 'v200', name: 'vlan200-AlatMedis', vlanId: 200, bridge: 'bridge-rs', taggedPorts: ['ether4'], untaggedPorts: ['ether5'], ipAddress: '10.50.200.1/24', dhcpEnabled: true }
      ],
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: false,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true,
      vpn: {
        type: 'wireguard',
        wireguardPort: 51820,
        wireguardAddress: '10.99.0.1/24',
        l2tpSecret: '',
        l2tpPool: ''
      }
    }
  }
];
