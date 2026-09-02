import React, { useState, useEffect } from 'react';
import { VehicleRegistryTable } from '../components/dashboard/VehicleRegistryTable';
import { Database, RefreshCw } from 'lucide-react';
import api from '../api/client';

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.query = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/vehicles', { params });
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to load vehicle registry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchTerm, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Database className="h-7 w-7 text-blue-500" />
            <span>Authorized Vehicle Registry</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage authorized vehicles, reported stolen vehicles, active FIR cases, and risk levels.
          </p>
        </div>

        <button
          onClick={fetchVehicles}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      <VehicleRegistryTable
        vehicles={vehicles}
        onRefresh={fetchVehicles}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  );
};
