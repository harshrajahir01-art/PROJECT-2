import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Copy, Check, ArrowUpDown, 
  ChevronLeft, ChevronRight, Download, RefreshCw, Eye 
} from 'lucide-react';
import api from '../api/client';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const RTODirectoryPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [states, setStates] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [allRtos, setAllRtos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [sortField, setSortField] = useState('rto_code');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [inspectedRto, setInspectedRto] = useState(null);

  // Load States list
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get('/rto/states');
        setStates(res.data || []);
      } catch (err) {
        console.warn('States load error:', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch RTO data
  const loadRtoData = async (stateCode = 'ALL') => {
    setIsLoading(true);
    try {
      if (stateCode === 'ALL') {
        // Fetch from state detail for key states
        const res = await api.get('/rto/search?q=A');
        // Let's fetch all states details
        const stRes = await api.get('/rto/states');
        const stList = stRes.data || [];
        
        // Fetch multiple key states to populate comprehensive listing
        const promises = stList.slice(0, 15).map((s) => api.get(`/rto/states/${s.code}`).catch(() => null));
        const details = await Promise.all(promises);
        
        let aggregated = [];
        details.forEach((d) => {
          if (d?.data?.rto_offices) {
            aggregated.push(...d.data.rto_offices);
          }
        });
        setAllRtos(aggregated);
      } else {
        const res = await api.get(`/rto/states/${stateCode}`);
        setAllRtos(res.data?.rto_offices || []);
      }
    } catch (err) {
      console.warn('RTO data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRtoData(selectedStateCode);
    setCurrentPage(1);
  }, [selectedStateCode]);

  // Handle Copy code
  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let list = [...allRtos];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) =>
        item.rto_code.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.office_name.toLowerCase().includes(q) ||
        item.state_code.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortOrder === 'asc') {
        return valA.localeCompare(valB, undefined, { numeric: true });
      } else {
        return valB.localeCompare(valA, undefined, { numeric: true });
      }
    });

    return list;
  }, [allRtos, searchQuery, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span>📍 Official Regional Transport Office Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            India RTO & District Code Directory
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Browse, search, and copy verified RTO district codes across all Indian States and Union Territories. Search by code (e.g. GJ-01), district (Ahmedabad), or city.
          </p>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by code (GJ-01, MH-12) or district (Ahmedabad, Pune)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* State Filter Selector */}
            <div>
              <select
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="ALL">All States & UTs</option>
                {states.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value={10}>10 items per page</option>
                <option value={20}>20 items per page</option>
                <option value={50}>50 items per page</option>
                <option value={100}>100 items per page</option>
              </select>
            </div>

          </div>

          {/* Active summary bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
            <span>
              Showing <strong className="text-gray-900 dark:text-white font-mono">{filteredAndSorted.length}</strong> matching RTO records
            </span>
            <button
              onClick={() => loadRtoData(selectedStateCode)}
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  
                  <th
                    onClick={() => toggleSort('rto_code')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>RTO Code</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort('city')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>City / Jurisdiction</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>

                  <th
                    onClick={() => toggleSort('district')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>District</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>

                  <th className="py-3.5 px-4">Office Name</th>
                  <th className="py-3.5 px-4 text-center">Sample Plate</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span>Loading verified RTO database...</span>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <span>No RTO codes matching your search criteria.</span>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr
                      key={item.rto_code}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 rounded-lg">
                          {item.rto_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-900 dark:text-white font-bold">
                        {item.city}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        {item.district}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 text-xs">
                        {item.office_name}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                          {item.rto_code}-AB-1234
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleCopy(item.rto_code)}
                            title="Copy Code"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-gray-500 dark:text-gray-400 transition-colors"
                          >
                            {copiedCode === item.rto_code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setInspectedRto(item)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-gray-500 dark:text-gray-400 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div>
              Page <strong className="text-gray-900 dark:text-white font-mono">{currentPage}</strong> of{' '}
              <strong className="text-gray-900 dark:text-white font-mono">{totalPages}</strong>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-3 font-mono font-bold text-gray-800 dark:text-gray-200">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Inspection Dossier Modal */}
        {inspectedRto && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 text-center">
              <div>
                <span className="font-mono text-3xl font-black text-blue-600 dark:text-blue-400 px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-2xl inline-block border border-blue-200 dark:border-blue-900">
                  {inspectedRto.rto_code}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                  {inspectedRto.city}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {inspectedRto.office_name} • District: {inspectedRto.district}
                </p>
              </div>

              <div className="flex justify-center">
                <MockNumberPlate
                  registrationNumber={`${inspectedRto.rto_code}-AB-1234`}
                  type="private"
                  size="md"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 text-xs text-left space-y-2 border border-gray-100 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">State / Territory:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{inspectedRto.state_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">District Office:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{inspectedRto.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Standard Series Example:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{inspectedRto.rto_code}-AA-0001</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleCopy(inspectedRto.rto_code)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedCode === inspectedRto.rto_code ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => setInspectedRto(null)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
