import React from 'react';
import { FileText, Shield, Clock, User, Globe } from 'lucide-react';

export const AuditLogsTable = ({ logs = [] }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111827] shadow-xl">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-gray-400 border-b border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Timestamp</th>
            <th className="py-3.5 px-4">Action</th>
            <th className="py-3.5 px-4">Officer / User</th>
            <th className="py-3.5 px-4">Resource</th>
            <th className="py-3.5 px-4">IP & Client</th>
            <th className="py-3.5 px-4">Audit Metadata</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
              <td className="py-3 px-4 text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </td>

              <td className="py-3 px-4 font-bold">
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  log.action.includes('LOGIN') ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                  log.action.includes('SCAN') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  log.action.includes('UPDATE') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-slate-800 text-gray-300'
                }`}>
                  {log.action}
                </span>
              </td>

              <td className="py-3 px-4 text-gray-200">
                {log.user_name || log.user_email || 'System / Auto'}
              </td>

              <td className="py-3 px-4 text-blue-400 font-bold">
                {log.resource_id || log.resource_type || '-'}
              </td>

              <td className="py-3 px-4 text-gray-400">
                {log.ip_address || '127.0.0.1'}
              </td>

              <td className="py-3 px-4 text-[11px] text-gray-400 max-w-xs truncate">
                {log.details ? JSON.stringify(log.details) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
