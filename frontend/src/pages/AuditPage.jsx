import React, { useState, useEffect } from 'react';
import { AuditLogsTable } from '../components/dashboard/AuditLogsTable';
import { FileText, RefreshCw, Shield, Filter } from 'lucide-react';
import api from '../api/client';

export const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (actionFilter) params.action = actionFilter;

      const res = await api.get('/audit/logs', { params });
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit trail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Shield className="h-7 w-7 text-indigo-400" />
            <span>Immutable Compliance & Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Tamper-evident logs of all vehicle scans, database access events, user authentications, and status updates.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-3 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-gray-300 focus:outline-none"
        >
          <option value="">All Audit Actions</option>
          <option value="LOGIN_SUCCESS">LOGIN SUCCESS</option>
          <option value="SCAN_VEHICLE">SCAN VEHICLE</option>
          <option value="MANUAL_PLATE_CHECK">MANUAL PLATE CHECK</option>
          <option value="UPDATE_VEHICLE_STATUS">UPDATE VEHICLE STATUS</option>
          <option value="UPDATE_ALERT_STATUS">UPDATE ALERT STATUS</option>
          <option value="REGISTER_VEHICLE">REGISTER VEHICLE</option>
        </select>
      </div>

      <AuditLogsTable logs={logs} />
    </div>
  );
};
