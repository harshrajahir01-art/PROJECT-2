import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Eye, MapPin, Clock } from 'lucide-react';
import { StatusBadge, RiskBadge } from '../common/Badge';
import api from '../../api/client';

export const AlertsTable = ({ alerts = [], onAlertUpdated }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (alertId, newStatus) => {
    setUpdatingId(alertId);
    try {
      await api.put(`/alerts/${alertId}`, {
        status: newStatus,
        resolution_notes: `Status updated to ${newStatus} by field dispatch.`
      });
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      console.error("Failed to update alert status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-gray-400">
        <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mx-auto mb-2" />
        <div className="font-semibold text-gray-300">No Active Alerts</div>
        <div className="text-xs text-gray-500 mt-0.5">All flagged vehicles are resolved or cleared.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111827] shadow-xl">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-gray-400 border-b border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Severity & Plate</th>
            <th className="py-3.5 px-4">Alert Details</th>
            <th className="py-3.5 px-4">Observation Location</th>
            <th className="py-3.5 px-4">Time</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Triage Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
            return (
              <tr 
                key={alert.id}
                className={`hover:bg-slate-900/60 transition-colors ${
                  isCritical && alert.status === 'ACTIVE' ? 'bg-red-950/20' : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'CRITICAL' ? 'bg-red-900/60 text-red-300' :
                      alert.severity === 'HIGH' ? 'bg-rose-900/50 text-rose-300' :
                      'bg-amber-900/50 text-amber-300'
                    }`}>
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-base text-blue-400">
                        {alert.registration_number || 'UNKNOWN'}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase font-semibold">
                        {alert.severity} SEVERITY
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 max-w-xs">
                  <div className="font-semibold text-gray-200 text-xs">{alert.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{alert.description}</div>
                  {alert.recommended_action && (
                    <div className="text-[11px] text-amber-300/90 mt-1 font-medium">
                      👉 {alert.recommended_action}
                    </div>
                  )}
                </td>

                <td className="py-4 px-4 text-xs">
                  <div className="flex items-center space-x-1 text-gray-300 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                    <span>{alert.location_name || 'Checkpoint Camera'}</span>
                  </div>
                </td>

                <td className="py-4 px-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                    <span>{alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ''}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    alert.status === 'ACTIVE' ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' :
                    alert.status === 'ACKNOWLEDGED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {alert.status}
                  </span>
                </td>

                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'ACKNOWLEDGED')}
                        disabled={updatingId === alert.id}
                        className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                        disabled={updatingId === alert.id}
                        className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
