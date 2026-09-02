import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', badge }) => {
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    red: 'from-red-600/20 to-red-500/5 text-red-400 border-red-500/20',
    amber: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    emerald: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    purple: 'from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/20',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} bg-[#111827] border backdrop-blur-sm shadow-xl flex flex-col justify-between`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-black tracking-tight text-white">{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        {badge && <div className="mt-2">{badge}</div>}
      </div>
    </div>
  );
};
