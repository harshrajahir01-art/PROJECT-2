import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, ExternalLink, Copy, Check, 
  X, Compass, Building, Hash, ChevronRight 
} from 'lucide-react';
import api from '../api/client';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const StatesDirectoryPage = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [states, setStates] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialCode);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'STATE', 'UNION_TERRITORY'
  const [selectedState, setSelectedState] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch all States & UTs
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

  // Open state detail modal if initial code present in URL
  useEffect(() => {
    if (initialCode && states.length > 0) {
      loadStateDetail(initialCode);
    }
  }, [initialCode, states]);

  const loadStateDetail = async (code) => {
    setIsLoadingDetail(true);
    try {
      const res = await api.get(`/rto/states/${code}`);
      setSelectedState(res.data);
    } catch (err) {
      console.warn('State detail fetch error:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter states
  const filteredStates = states.filter((s) => {
    const matchesFilter =
      activeFilter === 'ALL' || s.type === activeFilter;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.capital && s.capital.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
            <span>🇮🇳 36 Indian Transport Jurisdictions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Indian States & Union Territories
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Search and explore all 28 States and 8 Union Territories of India. Click any state card to view all its registered RTO codes, district offices, and sample plates.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state name or code (e.g. GJ, Delhi)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All (36)
            </button>
            <button
              onClick={() => setActiveFilter('STATE')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'STATE'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              States (28)
            </button>
            <button
              onClick={() => setActiveFilter('UNION_TERRITORY')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'UNION_TERRITORY'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Union Territories (8)
            </button>
          </div>

        </div>

        {/* States Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStates.map((st) => (
            <div
              key={st.code}
              onClick={() => loadStateDetail(st.code)}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 rounded-xl">
                    {st.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 uppercase">
                    {st.type === 'UNION_TERRITORY' ? 'UT' : 'State'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {st.name}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-1">
                    <Building className="h-3 w-3 text-gray-400" />
                    <span>Capital: {st.capital || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {st.total_rtos} Registered RTOs
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center group-hover:translate-x-1 transition-transform">
                  View RTOs <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* State RTO Listing Modal */}
        {selectedState && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="font-mono text-2xl font-black text-white px-4 py-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    {selectedState.code}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>{selectedState.name}</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-900">
                        {selectedState.type.replace('_', ' ')}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Capital: {selectedState.capital} • Zone: {selectedState.zone} • {selectedState.rto_offices?.length || selectedState.total_rtos} RTO Offices
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedState(null)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sample Plate Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Official Format Example:
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    High Security Registration Plate mockup for {selectedState.name}
                  </div>
                </div>
                <MockNumberPlate
                  registrationNumber={selectedState.example_plate || `${selectedState.code}-01-AB-1234`}
                  type="private"
                  size="sm"
                />
              </div>

              {/* RTO Directory Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Registered RTO & District Offices:</span>
                  <span className="text-xs text-gray-500 font-normal">
                    Showing all registered codes
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {selectedState.rto_offices?.map((rto) => (
                    <div
                      key={rto.rto_code}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                            {rto.rto_code}
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {rto.city}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {rto.office_name} ({rto.district})
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(rto.rto_code)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-gray-100 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-600 transition-colors"
                        title="Copy RTO Code"
                      >
                        {copiedCode === rto.rto_code ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedState(null)}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Close State Window
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
