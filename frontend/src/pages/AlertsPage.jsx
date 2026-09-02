import React, { useState, useEffect } from 'react';
import { AlertsTable } from '../components/dashboard/AlertsTable';
import { ShieldAlert, RefreshCw, Filter } from 'lucide-react';
import api from '../api/client';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;

      const res = await api.get('/alerts', { params });
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <ShieldAlert className="h-7 w-7 text-red-500" />
            <span>Security Alert & Incident Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time notifications for stolen vehicles, crime suspects, and high-risk interdictions.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-3 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-gray-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-gray-300 focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      <AlertsTable alerts={alerts} onAlertUpdated={fetchAlerts} />
    </div>
  );
};
