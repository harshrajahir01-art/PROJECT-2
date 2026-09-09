import React, { useState } from 'react';

/**
 * Interactive SVG Map / Regional Grid of India for Vehicle Registration Exploration
 */
export const IndiaMapSvg = ({
  states = [],
  selectedStateCode = null,
  onSelectState = () => {}
}) => {
  const [hoveredState, setHoveredState] = useState(null);

  // States grouped by geographical zones for quick intuitive navigation
  const zones = [
    {
      name: 'Western Zone',
      codes: ['GJ', 'MH', 'GA', 'DD'],
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30'
    },
    {
      name: 'Northern Zone',
      codes: ['DL', 'HR', 'PB', 'RJ', 'UP', 'UK', 'HP', 'JK', 'LA', 'CH'],
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30'
    },
    {
      name: 'Southern Zone',
      codes: ['KA', 'TN', 'TG', 'AP', 'KL', 'PY'],
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
    },
    {
      name: 'Central & Eastern Zone',
      codes: ['MP', 'CG', 'WB', 'BR', 'JH', 'OD'],
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
    },
    {
      name: 'North-Eastern Zone',
      codes: ['AS', 'AR', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR'],
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
    },
    {
      name: 'Islands & Territories',
      codes: ['AN', 'LD'],
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30'
    }
  ];

  // State coordinate map for visual geographical layout
  const geoPositions = [
    // North
    { code: 'LA', name: 'Ladakh', col: 4, row: 1 },
    { code: 'JK', name: 'Jammu & Kashmir', col: 3, row: 1 },
    { code: 'HP', name: 'Himachal Pradesh', col: 4, row: 2 },
    { code: 'PB', name: 'Punjab', col: 3, row: 2 },
    { code: 'CH', name: 'Chandigarh', col: 3.5, row: 2.2 },
    { code: 'UK', name: 'Uttarakhand', col: 5, row: 2 },
    { code: 'HR', name: 'Haryana', col: 3, row: 3 },
    { code: 'DL', name: 'Delhi', col: 4, row: 3 },
    { code: 'UP', name: 'Uttar Pradesh', col: 5, row: 3 },
    { code: 'RJ', name: 'Rajasthan', col: 2, row: 3 },

    // Central & East
    { code: 'MP', name: 'Madhya Pradesh', col: 4, row: 4 },
    { code: 'BR', name: 'Bihar', col: 6, row: 3 },
    { code: 'JH', name: 'Jharkhand', col: 6, row: 4 },
    { code: 'WB', name: 'West Bengal', col: 7, row: 4 },
    { code: 'CG', name: 'Chhattisgarh', col: 5, row: 5 },
    { code: 'OD', name: 'Odisha', col: 6, row: 5 },

    // West
    { code: 'GJ', name: 'Gujarat', col: 1, row: 4 },
    { code: 'DD', name: 'Daman & Diu', col: 1.5, row: 4.8 },
    { code: 'MH', name: 'Maharashtra', col: 3, row: 5 },
    { code: 'GA', name: 'Goa', col: 2, row: 6 },

    // South
    { code: 'TG', name: 'Telangana', col: 4, row: 5.5 },
    { code: 'AP', name: 'Andhra Pradesh', col: 5, row: 6 },
    { code: 'KA', name: 'Karnataka', col: 3, row: 6.5 },
    { code: 'TN', name: 'Tamil Nadu', col: 4, row: 7.5 },
    { code: 'KL', name: 'Kerala', col: 3, row: 7.5 },
    { code: 'PY', name: 'Puducherry', col: 4.8, row: 7.5 },

    // North East
    { code: 'SK', name: 'Sikkim', col: 7, row: 2.5 },
    { code: 'AS', name: 'Assam', col: 8, row: 3 },
    { code: 'AR', name: 'Arunachal Pradesh', col: 9, row: 2 },
    { code: 'ML', name: 'Meghalaya', col: 8, row: 3.8 },
    { code: 'NL', name: 'Nagaland', col: 9, row: 3 },
    { code: 'MN', name: 'Manipur', col: 9, row: 3.8 },
    { code: 'MZ', name: 'Mizoram', col: 9, row: 4.5 },
    { code: 'TR', name: 'Tripura', col: 8, row: 4.5 },

    // Islands
    { code: 'LD', name: 'Lakshadweep', col: 1.5, row: 7.8 },
    { code: 'AN', name: 'Andaman & Nicobar', col: 8.5, row: 7.5 }
  ];

  const getStateInfo = (code) => {
    return states.find((s) => s.code === code) || { name: code, code, total_rtos: 0 };
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>🇮🇳 Interactive State & UT Map Explorer</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click any State or Union Territory below to inspect all its registered RTO offices and district codes.
          </p>
        </div>
        {hoveredState && (
          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-mono">
            <span className="font-bold text-blue-700 dark:text-blue-300">{hoveredState.name} ({hoveredState.code})</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">• {hoveredState.total_rtos} RTOs</span>
          </div>
        )}
      </div>

      {/* Visual Geographic Cartogram Grid */}
      <div className="p-4 bg-slate-50 dark:bg-[#0B0F17] rounded-xl border border-gray-100 dark:border-slate-800/80 overflow-x-auto">
        <div className="relative min-w-[620px] max-w-2xl mx-auto h-[480px]">
          {geoPositions.map((pos) => {
            const stInfo = getStateInfo(pos.code);
            const isSelected = selectedStateCode === pos.code;

            // Map grid coordinates to percentages
            const leftPct = (pos.col / 10.2) * 100;
            const topPct = (pos.row / 8.6) * 100;

            return (
              <button
                key={pos.code}
                onClick={() => onSelectState(pos.code)}
                onMouseEnter={() => setHoveredState(stInfo)}
                onMouseLeave={() => setHoveredState(null)}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`group flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all duration-200 shadow-sm ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 scale-110 shadow-lg shadow-blue-500/30 z-20 ring-2 ring-blue-400'
                    : 'bg-white dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105 z-10'
                } w-14 h-12`}
              >
                <span className="font-mono text-xs font-black tracking-tight">{pos.code}</span>
                <span className="text-[9px] font-medium opacity-75 truncate max-w-[50px]">
                  {stInfo.total_rtos || pos.code} RTO
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Regional Zone Quick Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((zone) => (
          <div
            key={zone.name}
            className={`p-3 rounded-xl border bg-gradient-to-br ${zone.color} space-y-2`}
          >
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
              <span>{zone.name}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                {zone.codes.length} Regions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {zone.codes.map((code) => {
                const s = getStateInfo(code);
                const isSelected = selectedStateCode === code;
                return (
                  <button
                    key={code}
                    onClick={() => onSelectState(code)}
                    className={`px-2 py-0.5 rounded-lg font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
