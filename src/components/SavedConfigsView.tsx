import React, { useState } from 'react';
import { SavedConfigRecord, ActivityLogRecord } from '../types';
import { HardDrive, Search, Copy, Check, Eye, Trash2, Clock, Terminal, RefreshCw, FileText } from 'lucide-react';

interface SavedConfigsViewProps {
  savedConfigs: SavedConfigRecord[];
  activityLogs: ActivityLogRecord[];
  onLoadConfigIntoEditor: (cfg: SavedConfigRecord) => void;
  onDeleteConfig: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const SavedConfigsView: React.FC<SavedConfigsViewProps> = ({
  savedConfigs,
  activityLogs,
  onLoadConfigIntoEditor,
  onDeleteConfig,
  onRefresh,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'configs' | 'logs'>('configs');
  const [search, setSearch] = useState('');
  const [selectedScript, setSelectedScript] = useState<SavedConfigRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredConfigs = savedConfigs.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.config_id.toLowerCase().includes(s) ||
      c.router_name.toLowerCase().includes(s) ||
      c.config_type.toLowerCase().includes(s) ||
      c.created_by.toLowerCase().includes(s)
    );
  });

  const filteredLogs = activityLogs.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.log_id.toLowerCase().includes(s) ||
      l.action_type.toLowerCase().includes(s) ||
      l.router_name.toLowerCase().includes(s) ||
      l.details.toLowerCase().includes(s)
    );
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f293d] pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-[#00ffaa]" />
            <span>Riwayat Konfigurasi &amp; Spreadsheet Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar konfigurasi yang tersimpan di sheet <code>saved_configs</code> dan histori aktivitas <code>activity_logs</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID, router, aksi..."
              className="w-full rounded-lg border border-[#1f293d] bg-[#0b0f19] pl-9 pr-3 py-1.5 text-xs text-white focus:border-[#00f2fe] focus:outline-none"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1f293d] bg-[#151b26] text-slate-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#00f2fe]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSubTab('configs')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all border ${
            activeSubTab === 'configs'
              ? 'border-[#00f2fe]/40 bg-[#00f2fe]/10 text-[#00f2fe]'
              : 'border-[#1f293d] bg-[#151b26] text-slate-400 hover:text-white'
          }`}
        >
          <span>Saved Configurations ({filteredConfigs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all border ${
            activeSubTab === 'logs'
              ? 'border-[#00f2fe]/40 bg-[#00f2fe]/10 text-[#00f2fe]'
              : 'border-[#1f293d] bg-[#151b26] text-slate-400 hover:text-white'
          }`}
        >
          <span>Activity Logs ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Configs Table */}
      {activeSubTab === 'configs' && (
        <div className="overflow-hidden rounded-xl border border-[#1f293d] bg-[#151b26]">
          {filteredConfigs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Belum ada konfigurasi yang disimpan. Klik tombol "SAVE TO SPREADSHEET" di panel terminal.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#1f293d] bg-[#0d121c] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Config ID</th>
                    <th className="px-4 py-3">Router Name</th>
                    <th className="px-4 py-3">ROS Ver</th>
                    <th className="px-4 py-3">Config Type</th>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d]/50">
                  {filteredConfigs.map((item) => (
                    <tr key={item.config_id} className="hover:bg-[#1a2333]/50 transition-colors font-mono">
                      <td className="px-4 py-3 font-bold text-[#00f2fe]">
                        {item.config_id}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold text-white">
                        {item.router_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-[#0b0f19] px-2 py-0.5 text-[10px] text-[#00ffaa] border border-[#00ffaa]/20">
                          {item.ros_version.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans">
                        {item.config_type}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {item.created_at}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedScript(item)}
                            className="rounded p-1 text-slate-400 hover:bg-[#00f2fe]/10 hover:text-[#00f2fe]"
                            title="Lihat Script"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(item.config_id, item.script_content)}
                            className="rounded p-1 text-slate-400 hover:bg-[#00ffaa]/10 hover:text-[#00ffaa]"
                            title="Copy Script"
                          >
                            {copiedId === item.config_id ? <Check className="h-4 w-4 text-[#00ffaa]" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => onLoadConfigIntoEditor(item)}
                            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                            title="Load Script ke Terminal"
                          >
                            <Terminal className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteConfig(item.config_id)}
                            className="rounded p-1 text-slate-400 hover:bg-[#ff4757]/10 hover:text-[#ff4757]"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activity Logs Table */}
      {activeSubTab === 'logs' && (
        <div className="overflow-hidden rounded-xl border border-[#1f293d] bg-[#151b26]">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Belum ada riwayat log.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#1f293d] bg-[#0d121c] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Log ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Router</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d]/50 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-[#1a2333]/50 transition-colors">
                      <td className="px-4 py-3 text-[#00ffaa] font-bold">
                        {log.log_id}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {log.user_email}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {log.router_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-[#1a2333] px-2 py-0.5 text-[10px] text-[#00f2fe]">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-sans">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Script Preview Modal */}
      {selectedScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl border border-[#1f293d] bg-[#0b0f19] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1f293d] bg-[#151b26] px-4 py-3">
              <div>
                <h3 className="font-bold text-sm text-white">
                  {selectedScript.config_id} - {selectedScript.router_name}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedScript.config_type} &bull; {selectedScript.created_at}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedScript.config_id, selectedScript.script_content)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3 py-1.5 text-xs font-bold text-[#00f2fe] hover:bg-[#00f2fe]/20"
                >
                  {copiedId === selectedScript.config_id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === selectedScript.config_id ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setSelectedScript(null)}
                  className="rounded-lg border border-[#1f293d] bg-[#1a2333] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#070a10]">
              <pre className="whitespace-pre-wrap">{selectedScript.script_content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
