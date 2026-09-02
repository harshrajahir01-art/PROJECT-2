import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'CLEAR':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'STOLEN':
        return 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse font-bold';
      case 'SUSPECTED_CRIME':
        return 'bg-red-950/90 text-red-300 border-red-700 font-semibold';
      case 'WANTED':
        return 'bg-orange-950/90 text-orange-300 border-orange-700 font-semibold';
      case 'TRAFFIC_VIOLATION':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'UNREGISTERED':
        return 'bg-slate-900 text-slate-400 border-slate-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide uppercase ${getStatusStyles()}`}>
      {status ? status.replace(/_/g, ' ') : 'UNKNOWN'}
    </span>
  );
};

export const RiskBadge = ({ risk }) => {
  const getRiskStyles = () => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-900/90 text-red-100 border-red-500 font-bold';
      case 'HIGH':
        return 'bg-rose-900/80 text-rose-200 border-rose-600';
      case 'MEDIUM':
        return 'bg-amber-900/80 text-amber-200 border-amber-600';
      case 'LOW':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'NONE':
      default:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-900/60';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium uppercase ${getRiskStyles()}`}>
      {risk || 'NONE'}
    </span>
  );
};
