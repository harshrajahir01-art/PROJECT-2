import React, { useState } from 'react';
import { 
  Database, Search, Plus, Edit2, MapPin, 
  CheckCircle, AlertTriangle, X, ShieldAlert 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, RiskBadge } from '../common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

export const VehicleRegistryTable = ({ 
  vehicles = [], 
  onRefresh, 
  searchTerm, 
  setSearchTerm,
  statusFilter,
  setStatusFilter 
}) => {
  const { isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form states for Add Vehicle
  const [newVehicle, setNewVehicle] = useState({
    registration_number: '',
    vehicle_type: 'SEDAN',
    manufacturer: '',
    model: '',
    color: '',
    status: 'CLEAR',
    risk_level: 'NONE',
    owner_name: '',
    owner_contact: '',
    registered_rto: '',
    notes: '',
    recommended_action: ''
  });

  // Form states for Status Update
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'CLEAR',
    risk_level: 'NONE',
    fir_number: '',
    reporting_police_station: '',
    notes: ''
  });

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', newVehicle);
      setIsAddModalOpen(false);
      setNewVehicle({
        registration_number: '',
        vehicle_type: 'SEDAN',
        manufacturer: '',
        model: '',
        color: '',
        status: 'CLEAR',
        risk_level: 'NONE',
        owner_name: '',
        owner_contact: '',
        registered_rto: '',
        notes: '',
        recommended_action: ''
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create vehicle record.");
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await api.put(`/vehicles/${selectedVehicle.id}/status`, statusUpdate);
      setIsStatusModalOpen(false);
      setSelectedVehicle(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update vehicle status.");
    }
  };

  const openStatusModal = (v) => {
    setSelectedVehicle(v);
    setStatusUpdate({
      status: v.status,
      risk_level: v.risk_level,
      fir_number: v.fir_number || '',
      reporting_police_station: v.reporting_police_station || '',
      notes: ''
    });
    setIsStatusModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search registration, make, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="CLEAR">CLEAR</option>
            <option value="STOLEN">STOLEN</option>
            <option value="SUSPECTED_CRIME">SUSPECTED CRIME</option>
            <option value="WANTED">WANTED</option>
            <option value="TRAFFIC_VIOLATION">TRAFFIC VIOLATION</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Vehicles Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111827] shadow-xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-gray-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Registration No</th>
              <th className="py-3.5 px-4">Vehicle Details</th>
              <th className="py-3.5 px-4">Status & Risk</th>
              <th className="py-3.5 px-4">Owner (Masked)</th>
              <th className="py-3.5 px-4">RTO / Case Details</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-900/60 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-mono font-bold text-base text-blue-400">
                    {v.registration_number}
                  </div>
                  <div className="text-[11px] text-gray-400 uppercase">
                    {v.vehicle_type}
                  </div>
                </td>

                <td className="py-4 px-4 text-xs">
                  <div className="font-semibold text-gray-200">
                    {v.manufacturer} {v.model}
                  </div>
                  <div className="text-gray-400">{v.color || 'Standard Color'}</div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-col space-y-1 items-start">
                    <StatusBadge status={v.status} />
                    <RiskBadge risk={v.risk_level} />
                  </div>
                </td>

                <td className="py-4 px-4 text-xs font-mono">
                  {v.owner_name_masked || (v.owner_name ? v.owner_name : 'Confidential')}
                </td>

                <td className="py-4 px-4 text-xs max-w-xs">
                  <div className="text-gray-300">{v.registered_rto || 'State Transport'}</div>
                  {v.fir_number && (
                    <div className="text-red-400 font-mono text-[11px] mt-0.5">
                      FIR: {v.fir_number}
                    </div>
                  )}
                  {v.reporting_police_station && (
                    <div className="text-[10px] text-gray-400">
                      Station: {v.reporting_police_station}
                    </div>
                  )}
                </td>

                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/map?plate=${v.registration_number}`}
                      title="View Observation Timeline"
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 rounded-lg text-xs font-medium inline-flex items-center"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      onClick={() => openStatusModal(v)}
                      title="Update Stolen / Risk Status"
                      className="px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Status</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-400" />
                <span>Add Vehicle to Authorized Registry</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GJ01AB1234"
                  value={newVehicle.registration_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-sm uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Honda"
                    value={newVehicle.manufacturer}
                    onChange={(e) => setNewVehicle({ ...newVehicle, manufacturer: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. City ZX"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Type</label>
                  <select
                    value={newVehicle.vehicle_type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="SEDAN">SEDAN</option>
                    <option value="SUV">SUV</option>
                    <option value="HATCHBACK">HATCHBACK</option>
                    <option value="MOTORCYCLE">MOTORCYCLE</option>
                    <option value="TRUCK">TRUCK</option>
                    <option value="BUS">BUS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Status</label>
                  <select
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="CLEAR">CLEAR</option>
                    <option value="STOLEN">STOLEN</option>
                    <option value="SUSPECTED_CRIME">SUSPECTED CRIME</option>
                    <option value="WANTED">WANTED</option>
                    <option value="TRAFFIC_VIOLATION">TRAFFIC VIOLATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Risk Level</label>
                  <select
                    value={newVehicle.risk_level}
                    onChange={(e) => setNewVehicle({ ...newVehicle, risk_level: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="NONE">NONE</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Owner Full Name (Masked for privacy)</label>
                <input
                  type="text"
                  placeholder="Owner Name"
                  value={newVehicle.owner_name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_name: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">RTO District</label>
                <input
                  type="text"
                  placeholder="e.g. GJ-01 Ahmedabad"
                  value={newVehicle.registered_rto}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registered_rto: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Vehicle Status Modal */}
      {isStatusModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Update Vehicle Status</h3>
                <div className="font-mono text-xs text-blue-400 font-bold">
                  {selectedVehicle.registration_number}
                </div>
              </div>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Vehicle Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold"
                >
                  <option value="CLEAR">CLEAR (Authorized / Normal)</option>
                  <option value="STOLEN">STOLEN (Reported Theft)</option>
                  <option value="SUSPECTED_CRIME">SUSPECTED CRIME (Active Case)</option>
                  <option value="WANTED">WANTED (Arrest / Impound Order)</option>
                  <option value="TRAFFIC_VIOLATION">TRAFFIC VIOLATION (Pending Challans)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Risk Level</label>
                <select
                  value={statusUpdate.risk_level}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, risk_level: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                >
                  <option value="NONE">NONE</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">FIR / Case Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FIR-402/2026/SURAT"
                  value={statusUpdate.fir_number}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, fir_number: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Reporting Police Station</label>
                <input
                  type="text"
                  placeholder="e.g. Surat Central Police Station"
                  value={statusUpdate.reporting_police_station}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, reporting_police_station: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Dispatch / Disposition Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add reason for status change..."
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
