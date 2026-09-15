import { TemplateRecord } from '../types';

export const INDUSTRIAL_TEMPLATES: TemplateRecord[] = [
  {
    template_id: 'TPL-0001',
    title: 'Dual WAN Load Balance PCC Equal (v7 / v6)',
    category: 'Load Balancing',
    description: 'Skema PCC 2 WAN dengan bandwidth seimbang 50:50. Dilengkapi bypass RFC1918 dan RouterOS v7 routing table support.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-PCC-Dual',
      rosVersion: 'v7',
      multiWanMode: 'pcc_equal',
      wans: [
        { id: 'w1', name: 'ether1-WAN1', comment: 'ISP1-50M', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-WAN2', comment: 'ISP2-50M', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 1, distance: 2, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.88.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.88.10', dhcpPoolEnd: '192.168.88.254', leaseTime: '8h' }
      ],
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false
    })
  },
  {
    template_id: 'TPL-0002',
    title: '3-WAN Weighted PCC (50M : 30M : 20M)',
    category: 'Load Balancing',
    description: 'PCC dengan pembagian bobot proporsional 5:3:2 untuk memaksimalkan kapasitas ISP yang berbeda kecepatan.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-PCC-3WAN-Weighted',
      rosVersion: 'v7',
      multiWanMode: 'pcc_weighted',
      wans: [
        { id: 'w1', name: 'ether1-WAN1', comment: 'ISP-50M-Weight5', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 5, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-WAN2', comment: 'ISP-30M-Weight3', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 3, distance: 2, checkGateway: true },
        { id: 'w3', name: 'ether3-WAN3', comment: 'ISP-20M-Weight2', type: 'static', ipAddress: '192.168.3.2/24', gateway: '192.168.3.1', weight: 2, distance: 3, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '10.0.0.1/24', dhcpEnabled: true, dhcpPoolStart: '10.0.0.10', dhcpPoolEnd: '10.0.0.250', leaseTime: '12h' }
      ],
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    })
  },
  {
    template_id: 'TPL-0003',
    title: 'Failover Recursive Routing (Host Ping Check)',
    category: 'Routing',
    description: 'Pendeteksian ISP down secara akurat menggunakan target-scope 30 ke public DNS (8.8.8.8 & 1.1.1.1), bukan hanya gateway lokal.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-Recursive-Failover',
      rosVersion: 'v7',
      multiWanMode: 'recursive',
      wans: [
        { id: 'w1', name: 'ether1-Primary', comment: 'Primary-Fiber', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-Secondary', comment: 'Secondary-4G', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 1, distance: 2, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.1.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.1.20', dhcpPoolEnd: '192.168.1.200', leaseTime: '12h' }
      ],
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: true,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false
    })
  },
  {
    template_id: 'TPL-0004',
    title: '4-WAN ECMP & Recursive Balancing',
    category: 'Load Balancing',
    description: 'Konfigurasi 4 ISP aktif bersamaan dengan Equal Cost Multi-Path (ECMP) routing dan check gateway aktif.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-4WAN-ECMP',
      rosVersion: 'v7',
      multiWanMode: 'ecmp',
      wans: [
        { id: 'w1', name: 'ether1-ISP1', comment: 'WAN1', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w2', name: 'ether2-ISP2', comment: 'WAN2', type: 'static', ipAddress: '192.168.2.2/24', gateway: '192.168.2.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w3', name: 'ether3-ISP3', comment: 'WAN3', type: 'static', ipAddress: '192.168.3.2/24', gateway: '192.168.3.1', weight: 1, distance: 1, checkGateway: true },
        { id: 'w4', name: 'ether4-ISP4', comment: 'WAN4', type: 'static', ipAddress: '192.168.4.2/24', gateway: '192.168.4.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '10.10.10.1/24', dhcpEnabled: true, dhcpPoolStart: '10.10.10.10', dhcpPoolEnd: '10.10.10.250', leaseTime: '8h' }
      ],
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    })
  },
  {
    template_id: 'TPL-0005',
    title: 'Hotspot Voucher Server + Walled Garden',
    category: 'Hotspot',
    description: 'Hotspot server lengkap dengan rate limit per user 2M/5M, cookie login, trial 30 menit, dan bypass situs bank & payment gateway.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-Hotspot-Server',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'ISP-Main', type: 'dhcp', ipAddress: '', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'ether2-LAN-Admin', ipAddress: '192.168.99.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.99.10', dhcpPoolEnd: '192.168.99.50', leaseTime: '12h' }
      ],
      hotspot: {
        enabled: true,
        interface: 'ether3-Hotspot',
        ipAddress: '10.50.0.1',
        poolName: 'pool_hotspot',
        dnsName: 'login.wifi',
        profileName: 'prof_voucher',
        userRateLimit: '2M/5M',
        trialEnabled: true
      },
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false
    })
  },
  {
    template_id: 'TPL-0006',
    title: 'WireGuard Site-to-Site & Road Warrior (v7)',
    category: 'VPN',
    description: 'Konfigurasi VPN WireGuard modern pada RouterOS v7 dengan performa tinggi, enkripsi ChaCha20-Poly1305, dan port 13231.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-WireGuard-Hub',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'Public-IP', type: 'static', ipAddress: '103.111.10.2/29', gateway: '103.111.10.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.10.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.10.50', dhcpPoolEnd: '192.168.10.200', leaseTime: '8h' }
      ],
      vpn: {
        type: 'wireguard',
        wireguardPort: 13231,
        wireguardAddress: '10.200.0.1/24',
        l2tpSecret: '',
        l2tpPool: ''
      },
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    })
  },
  {
    template_id: 'TPL-0007',
    title: 'RAW Anti-DDOS & Brute Force Shield',
    category: 'Security',
    description: 'Aturan proteksi RAW sebelum conntrack: drop syn flood, port scanner Xmas/Null, dan proteksi login brute-force Winbox/SSH.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-Firewall-Hardened',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'Internet', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.88.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.88.10', dhcpPoolEnd: '192.168.88.254', leaseTime: '12h' }
      ],
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: true,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    })
  },
  {
    template_id: 'TPL-0008',
    title: 'Gaming QoS & Bufferbloat Mitigation',
    category: 'QoS & Gaming',
    description: 'Prioritas paket UDP game latency rendah, Simple Queue burst, dan penekanan bufferbloat koneksi broadband.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-Gaming-QoS',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'Fiber-LowPing', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.55.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.55.10', dhcpPoolEnd: '192.168.55.200', leaseTime: '12h' }
      ],
      queue: {
        type: 'pcq',
        targetNetwork: '192.168.55.0/24',
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
    })
  },
  {
    template_id: 'TPL-0009',
    title: 'PCQ Dynamic Equal Bandwidth Share',
    category: 'Bandwidth Management',
    description: 'PCQ (Per Connection Queue) membagi bandwidth rata secara otomatis untuk setiap user aktif tanpa perlu membuat queue manual per IP.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-PCQ-AutoShare',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'ISP-Main', type: 'dhcp', ipAddress: '', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.20.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.20.10', dhcpPoolEnd: '192.168.20.250', leaseTime: '12h' }
      ],
      queue: {
        type: 'pcq',
        targetNetwork: '192.168.20.0/24',
        maxUpload: '40M',
        maxDownload: '100M',
        pcqRateUpload: '2M',
        pcqRateDownload: '5M'
      },
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false
    })
  },
  {
    template_id: 'TPL-0010',
    title: 'VLAN Router-on-a-Stick (Bridge VLAN Filtering)',
    category: 'VLAN & Switching',
    description: 'Isolasi jaringan menggunakan Bridge VLAN Filtering: VLAN 10 (Staff), VLAN 20 (Guest), VLAN 30 (Management) dalam 1 port trunk.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-VLAN-Gateway',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'ISP', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-vlan', ipAddress: '192.168.99.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.99.10', dhcpPoolEnd: '192.168.99.100', leaseTime: '8h' }
      ],
      vlans: [
        { id: 'v10', name: 'vlan10-Staff', vlanId: 10, bridge: 'bridge-vlan', taggedPorts: ['ether2'], untaggedPorts: ['ether3'], ipAddress: '10.10.10.1/24', dhcpEnabled: true },
        { id: 'v20', name: 'vlan20-Guest', vlanId: 20, bridge: 'bridge-vlan', taggedPorts: ['ether2'], untaggedPorts: ['ether4'], ipAddress: '10.10.20.1/24', dhcpEnabled: true },
        { id: 'v30', name: 'vlan30-MGMT', vlanId: 30, bridge: 'bridge-vlan', taggedPorts: ['ether2'], untaggedPorts: [], ipAddress: '10.10.30.1/24', dhcpEnabled: true }
      ],
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: false
    })
  },
  {
    template_id: 'TPL-0011',
    title: 'PPPoE Server + Local IP Pool',
    category: 'ISP & PPPoE',
    description: 'Server PPPoE untuk ISP mini / RT-RW Net dengan enkripsi CHAP/MS-CHAPv2, default profile, dan pool IP pelanggan terpisah.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-PPPoE-BRAS',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-Uplink', comment: 'Dedicated-Fiber', type: 'static', ipAddress: '103.50.1.2/30', gateway: '103.50.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'ether2-Distribution', ipAddress: '172.16.0.1/24', dhcpEnabled: false, dhcpPoolStart: '', dhcpPoolEnd: '', leaseTime: '' }
      ],
      pppoe: {
        enabled: true,
        serviceName: 'pppoe-internet',
        interface: 'ether2-Distribution',
        localAddress: '172.16.1.1',
        remotePool: 'pool_pppoe',
        defaultProfile: 'prof-pppoe'
      },
      dnsServers: ['8.8.8.8', '1.1.1.1'],
      dnsAllowRemote: true,
      enableFasttrack: false,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    })
  },
  {
    template_id: 'TPL-0012',
    title: 'Hardened SOHO Firewall & Port Forwarding',
    category: 'Security',
    description: 'Konfigurasi lengkap rumah/kantor dengan proteksi input WAN ketat, auto Cloud DDNS, NTP Server, dan port forwarding CCTV & Web Server.',
    ros_version: 'v7',
    config_json: JSON.stringify({
      routerName: 'MikroTik-SOHO-Secure',
      rosVersion: 'v7',
      multiWanMode: 'failover',
      wans: [
        { id: 'w1', name: 'ether1-WAN', comment: 'ISP-Public', type: 'static', ipAddress: '192.168.1.2/24', gateway: '192.168.1.1', weight: 1, distance: 1, checkGateway: true }
      ],
      lans: [
        { id: 'l1', name: 'bridge-lan', ipAddress: '192.168.88.1/24', dhcpEnabled: true, dhcpPoolStart: '192.168.88.20', dhcpPoolEnd: '192.168.88.200', leaseTime: '12h' }
      ],
      portForwards: [
        { id: 'pf1', comment: 'CCTV-DVR-RTSP', protocol: 'tcp', dstPort: '554', toAddress: '192.168.88.100', toPort: '554', inInterface: '' },
        { id: 'pf2', comment: 'Local-Web-Server', protocol: 'tcp', dstPort: '8080', toAddress: '192.168.88.50', toPort: '80', inInterface: '' }
      ],
      tools: {
        cloudDdns: true,
        ntpClient: true,
        ntpServer: 'id.pool.ntp.org',
        autoBackup: true,
        backupTime: '03:00:00',
        netwatchHost: '8.8.8.8',
        netwatchInterval: '30s'
      },
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      dnsAllowRemote: true,
      enableFasttrack: true,
      protectRouter: true,
      dropInvalid: true,
      blockDdosRaw: true
    })
  }
];
