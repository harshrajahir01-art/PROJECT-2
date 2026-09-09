import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Compass, MapPin, Building, Copy, Check, 
  ExternalLink, Search, ChevronRight 
} from 'lucide-react';
import api from '../api/client';
import { IndiaMapSvg } from '../components/maps/IndiaMapSvg';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const StateExplorerPage = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || 'GJ';

  const [states, setStates] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState(initialCode);
  const [stateDetail, setStateDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [rtoSearchFilter, setRtoSearchFilter] = useState('');

  // Fetch all states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get('/rto/states');
        setStates(res.data || []);
      } catch (err) {
        console.warn('States fetch error:', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch state detail on state select
  useEffect(() => {
    if (!selectedStateCode) return;
    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await api.get(`/rto/states/${selectedStateCode}`);
        setStateDetail(res.data);
      } catch (err) {
        console.warn('State detail error:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedStateCode]);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredRtos = (stateDetail?.rto_offices || []).filter((r) => {
    const q = rtoSearchFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      r.rto_code.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
            <Compass className="h-3.5 w-3.5" />
            <span>Interactive Geographic State Navigator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Interactive India State Explorer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Click on any State or Union Territory on the interactive map to inspect its registration prefix, capital, and complete directory of district RTO offices.
          </p>
        </div>

        {/* Main Grid: Interactive Map (Left) & State Dossier (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Interactive Map */}
          <div className="lg:col-span-7 space-y-6">
            <IndiaMapSvg
              states={states}
              selectedStateCode={selectedStateCode}
              onSelectState={(code) => setSelectedStateCode(code)}
            />
          </div>

          {/* State Dossier Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {stateDetail ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
                
                {/* State Hero Header */}
                <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {stateDetail.name}
                      </h2>
                      <span className="text-lg">🇮🇳</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Capital: {stateDetail.capital} • {stateDetail.zone} Region
                    </div>
                  </div>

                  <div className="font-mono text-2xl font-black text-white px-4 py-1.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                    {stateDetail.code}
                  </div>
                </div>

                {/* Sample Plate Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Official Registration Format Sample
                  </div>
                  <MockNumberPlate
                    registrationNumber={stateDetail.example_plate || `${stateDetail.code}-01-AB-1234`}
                    type="private"
                    size="sm"
                  />
                </div>

                {/* Search RTOs within state */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={rtoSearchFilter}
                    onChange={(e) => setRtoSearchFilter(e.target.value)}
                    placeholder={`Filter ${stateDetail.name} RTOs...`}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* RTO List Scrollable */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Registered RTO Codes ({filteredRtos.length}):</span>
                    <span className="text-[10px] text-gray-500">Click code to copy</span>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                    {filteredRtos.map((rto) => (
                      <div
                        key={rto.rto_code}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 rounded">
                              {rto.rto_code}
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {rto.city}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            District: {rto.district}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(rto.rto_code)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-600 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === rto.rto_code ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-12 text-center text-gray-400">
                <Compass className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-3" />
                <p className="text-xs">Loading State Information...</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
