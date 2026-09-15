import { MikroTikConfig, ValidationItem, ValidationSummary } from '../types';
import { normalizeConfig } from './generator';

/**
 * IP and Subnet helper utilities
 */
function parseCidr(cidr: string): { ip: string; prefix: number; network: number; broadcast: number } | null {
  if (!cidr || !cidr.includes('/')) return null;
  const parts = cidr.trim().split('/');
  const ip = parts[0].trim();
  const prefix = parseInt(parts[1], 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const octets = ip.split('.').map(o => parseInt(o, 10));
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) return null;

  const num = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix));
  const network = num & mask;
  const broadcast = network | ~mask;

  return { ip, prefix, network: network >>> 0, broadcast: broadcast >>> 0 };
}

function ipToLong(ip: string): number | null {
  if (!ip) return null;
  const octets = ip.trim().split('.').map(o => parseInt(o, 10));
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) return null;
  return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}

export function validateMikroTikConfig(rawConfig: MikroTikConfig): ValidationSummary {
  const config = normalizeConfig(rawConfig);
  const errors: ValidationItem[] = [];
  const warnings: ValidationItem[] = [];
  const infos: ValidationItem[] = [];

  // 1. Router Identity
  if (!config.routerName.trim()) {
    warnings.push({
      id: 'warn-router-name',
      type: 'warning',
      title: 'Identitas Router Kosong',
      message: 'Nama router belum diisi, akan menggunakan default "MikroTik-Router".'
    });
  }

  // 2. WAN Validation
  if (config.wans.length === 0) {
    errors.push({
      id: 'err-no-wan',
      type: 'error',
      title: 'Tidak Ada Interface WAN',
      message: 'Minimal tambahkan 1 interface WAN untuk konektivitas internet.'
    });
  }

  const wanNames = new Set<string>();
  const parsedWanSubnets: { name: string; parsed: NonNullable<ReturnType<typeof parseCidr>> }[] = [];

  config.wans.forEach((wan, idx) => {
    if (wanNames.has(wan.name)) {
      errors.push({
        id: 'err-duplicate-wan-name-' + idx,
        type: 'error',
        title: 'Nama Interface WAN Duplikat',
        message: 'Interface "' + wan.name + '" digunakan lebih dari 1 kali.'
      });
    }
    wanNames.add(wan.name);

    if (wan.type === 'static') {
      const parsedIp = parseCidr(wan.ipAddress);
      if (!parsedIp) {
        errors.push({
          id: 'err-invalid-wan-ip-' + idx,
          type: 'error',
          title: 'Format IP WAN Tidak Valid (' + wan.name + ')',
          message: 'IP Address WAN "' + wan.ipAddress + '" harus berformat CIDR (misal: 192.168.1.2/24).'
        });
      } else {
        parsedWanSubnets.push({ name: wan.name, parsed: parsedIp });
      }

      const gwNum = ipToLong(wan.gateway);
      if (!gwNum) {
        errors.push({
          id: 'err-invalid-gateway-' + idx,
          type: 'error',
          title: 'Gateway WAN Tidak Valid (' + wan.name + ')',
          message: 'Gateway "' + wan.gateway + '" tidak valid.'
        });
      } else if (parsedIp) {
        if (gwNum < parsedIp.network || gwNum > parsedIp.broadcast) {
          warnings.push({
            id: 'warn-gateway-outside-subnet-' + idx,
            type: 'warning',
            title: 'Gateway di Luar Subnet WAN (' + wan.name + ')',
            message: 'Gateway ' + wan.gateway + ' berada di luar subnet ' + wan.ipAddress + '. Pastikan on-link route ada.'
          });
        }
      }
    } else if (wan.type === 'pppoe') {
      if (!wan.pppoeUser?.trim()) {
        warnings.push({
          id: 'warn-pppoe-user-' + idx,
          type: 'warning',
          title: 'Username PPPoE Masih Kosong (' + wan.name + ')',
          message: 'Isi username dial-up dari ISP (misal: no_internet@telkom.net) agar koneksi dapat tersambung.'
        });
      }
    }
  });

  // 3. LAN Validation & Subnet Clashes
  if (config.lans.length === 0) {
    warnings.push({
      id: 'warn-no-lan',
      type: 'warning',
      title: 'Tidak Ada Interface LAN',
      message: 'Belum ada interface LAN yang didefinisikan.'
    });
  }

  const lanNames = new Set<string>();
  const parsedLanSubnets: { name: string; parsed: NonNullable<ReturnType<typeof parseCidr>> }[] = [];

  config.lans.forEach((lan, idx) => {
    if (lanNames.has(lan.name)) {
      errors.push({
        id: 'err-duplicate-lan-name-' + idx,
        type: 'error',
        title: 'Nama Interface LAN Duplikat',
        message: 'Interface "' + lan.name + '" digunakan lebih dari 1 kali.'
      });
    }
    lanNames.add(lan.name);

    const parsedIp = parseCidr(lan.ipAddress);
    if (!parsedIp) {
      errors.push({
        id: 'err-invalid-lan-ip-' + idx,
        type: 'error',
        title: 'Format IP LAN Tidak Valid (' + lan.name + ')',
        message: 'IP Address LAN "' + lan.ipAddress + '" harus berformat CIDR (misal: 192.168.88.1/24).'
      });
    } else {
      parsedLanSubnets.push({ name: lan.name, parsed: parsedIp });
    }
  });

  // Check IP Clash between WAN & LAN
  parsedWanSubnets.forEach(w => {
    parsedLanSubnets.forEach(l => {
      // Check if subnets overlap
      const overlap = (w.parsed.network <= l.parsed.broadcast) && (l.parsed.network <= w.parsed.broadcast);
      if (overlap) {
        errors.push({
          id: 'err-subnet-collision-' + w.name + '-' + l.name,
          type: 'error',
          title: 'IP Bentrok (Subnet Collision)',
          message: 'Subnet WAN "' + w.name + '" (' + w.parsed.ip + '/' + w.parsed.prefix + ') bertabrakan dengan Subnet LAN "' + l.name + '" (' + l.parsed.ip + '/' + l.parsed.prefix + '). Ganti salah satu subnet.'
        });
      }
    });
  });

  // 4. Multi-WAN Specific Validation
  if (config.wans.length > 1) {
    if (config.multiWanMode === 'pcc_equal' || config.multiWanMode === 'pcc_weighted') {
      infos.push({
        id: 'info-pcc-mode',
        type: 'info',
        title: 'PCC Load Balancing Aktif',
        message: 'PCC (Per Connection Classifier) akan membuat mangle connection & routing mark untuk ' + config.wans.length + ' WAN.'
      });
    }

    if (config.multiWanMode === 'pcc_weighted') {
      const totalWeight = config.wans.reduce((sum, w) => sum + (w.weight || 1), 0);
      infos.push({
        id: 'info-pcc-weighted-ratio',
        type: 'info',
        title: 'Rasio Bobot PCC',
        message: 'Total ratio slot: ' + totalWeight + ' (' + config.wans.map(w => w.name + ': ' + w.weight).join(', ') + ').'
      });
    }

    if (config.multiWanMode === 'failover') {
      const distances = config.wans.map(w => w.distance);
      const uniqueDistances = new Set(distances);
      if (uniqueDistances.size < distances.length) {
        warnings.push({
          id: 'warn-failover-distance',
          type: 'warning',
          title: 'Jarak Metrik Failover Sama',
          message: 'Beberapa WAN memiliki distance yang sama pada mode Failover. Sebaiknya bedakan (misal: 1, 2, 3).'
        });
      }
    }
  }

  // 5. Fasttrack vs Queues / PCC
  if (config.enableFasttrack) {
    if (config.wans.length > 1 && (config.multiWanMode === 'pcc_equal' || config.multiWanMode === 'pcc_weighted')) {
      warnings.push({
        id: 'warn-fasttrack-pcc',
        type: 'warning',
        title: 'FastTrack vs Mangle PCC',
        message: 'FastTrack dapat melewati aturan mangle PCC. Generator secara otomatis membatasi FastTrack agar tidak memecah koneksi Load Balancing.'
      });
    }
    if (config.queue.type !== 'none') {
      warnings.push({
        id: 'warn-fasttrack-queue',
        type: 'warning',
        title: 'FastTrack vs Queue Limit',
        message: 'FastTrack mempercepat paket dengan bypass CPU queue. Jika limitasi queue tidak berjalan akurat, nonaktifkan FastTrack.'
      });
    }
  }

  // 6. VLAN Validation
  const vlanIds = new Set<number>();
  config.vlans.forEach((vlan, idx) => {
    if (vlanIds.has(vlan.vlanId)) {
      errors.push({
        id: 'err-dup-vlan-' + idx,
        type: 'error',
        title: 'VLAN ID Duplikat (' + vlan.vlanId + ')',
        message: 'VLAN ID ' + vlan.vlanId + ' digunakan lebih dari 1 kali.'
      });
    }
    vlanIds.add(vlan.vlanId);
    if (vlan.vlanId < 1 || vlan.vlanId > 4094) {
      errors.push({
        id: 'err-invalid-vlan-id-' + idx,
        type: 'error',
        title: 'VLAN ID di Luar Jangkauan',
        message: 'VLAN ID harus antara 1 sampai 4094.'
      });
    }
  });

  // 7. Safety checklist
  if (config.multiWanMode === 'single' || config.wans.length === 1) {
    const primaryWan = config.wans[0];
    infos.push({
      id: 'info-single-isp',
      type: 'info',
      title: 'Mode 1 ISP (Single WAN) Aktif',
      message: `Terkoneksi via ${primaryWan?.name || 'ether1'} (${primaryWan?.type.toUpperCase() || 'DHCP'}). Mangle load balancing dinonaktifkan sehingga CPU router bekerja maksimal untuk routing & QoS.`
    });
  }

  if (config.queue?.qosTrafficSplit) {
    infos.push({
      id: 'info-qos-active',
      type: 'info',
      title: 'QoS Multi-Prioritas Aktif (' + (config.queue.qosMode === 'simple_queue' ? 'Simple Queue' : 'Queue Tree') + ')',
      message: 'Trafik dipisah otomatis: Game Online (Pri 1), Streaming (Pri 4), Browsing (Pri 6), dan Heavy Download (Pri 8).'
    });
  }

  if (config.siteBlocker?.enabled) {
    const blockedCategories = [];
    if (config.siteBlocker.blockJudol) blockedCategories.push('Judi Online/Slot');
    if (config.siteBlocker.blockPorn) blockedCategories.push('Konten Dewasa');
    if (config.siteBlocker.blockTorrent) blockedCategories.push('BitTorrent');
    if (config.siteBlocker.blockSosmed) blockedCategories.push('Medsos');
    if (config.siteBlocker.blockStreaming) blockedCategories.push('Streaming');

    infos.push({
      id: 'info-site-blocker',
      type: 'info',
      title: 'Blokir Situs Aktif (' + config.siteBlocker.blockMethod.toUpperCase() + ')',
      message: 'Kategori diblokir: ' + (blockedCategories.length > 0 ? blockedCategories.join(', ') : 'Custom Domains')
    });
  }

  if (config.safeMode) {
    infos.push({
      id: 'info-safe-mode',
      type: 'info',
      title: 'Safe Mode Diaktifkan',
      message: 'Perintah /system safe-mode disertakan di awal script untuk proteksi jika koneksi terputus.'
    });
  }

  if (config.backupBeforeApply) {
    infos.push({
      id: 'info-backup-command',
      type: 'info',
      title: 'Auto-Backup Sebelum Eksekusi',
      message: 'Perintah backup sistem dan export konfigurasi akan otomatis dieksekusi sebelum konfigurasi baru diterapkan.'
    });
  }

  // Status calculation
  let status: 'green' | 'yellow' | 'red' = 'green';
  if (errors.length > 0) {
    status = 'red';
  } else if (warnings.length > 0) {
    status = 'yellow';
  }

  return {
    status,
    errors,
    warnings,
    infos
  };
}
