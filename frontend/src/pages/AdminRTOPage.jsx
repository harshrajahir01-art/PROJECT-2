import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, Edit, Trash2, Search, 
  Upload, CheckCircle2, AlertCircle, Save, X, RefreshCw 
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export const AdminRTOPage = () => {
  const { user, isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [rtoOffices, setRtoOffices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('GJ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // New RTO Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRtoState, setNewRtoState] = useState('GJ');
  const [newRtoCode, setNewRtoCode] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newOfficeName, setNewOfficeName] = useState('');

  // JSON Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Edit RTO State
  const [editingRto, setEditingRto] = useState(null);

  // Load States
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get('/rto/states');
        setStates(res.data || []);
      } catch (err) {
        console.warn('States error:', err);
      }
    };
    fetchStates();
  }, []);

  // Load RTOs for selected state
  const loadRtoOffices = async (code) => {
    try {
      const res = await api.get(`/rto/states/${code}`);
      setRtoOffices(res.data?.rto_offices || []);
    } catch (err) {
      console.warn('RTO error:', err);
    }
  };

  useEffect(() => {
    if (selectedStateCode) {
      loadRtoOffices(selectedStateCode);
    }
  }, [selectedStateCode]);

  const showNotification = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 3500);
  };

  // Add RTO
  const handleCreateRto = async (e) => {
    e.preventDefault();
    if (!newRtoCode || !newDistrict || !newCity) {
      showNotification('Please fill in all mandatory fields', true);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/rto/admin/office', {
        state_code: newRtoState,
        rto_code: newRtoCode.toUpperCase(),
        district: newDistrict,
        city: newCity,
        office_name: newOfficeName || `RTO ${newCity}`
      });
      showNotification(`Successfully created RTO ${newRtoCode.toUpperCase()}`);
      setIsAddModalOpen(false);
      setNewRtoCode('');
      setNewDistrict('');
      setNewCity('');
      setNewOfficeName('');
      loadRtoOffices(selectedStateCode);
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Failed to create RTO code', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update RTO
  const handleUpdateRto = async (e) => {
    e.preventDefault();
    if (!editingRto) return;

    setIsSubmitting(true);
    try {
      await api.put(`/rto/admin/office/${editingRto.id}`, {
        district: editingRto.district,
        city: editingRto.city,
        office_name: editingRto.office_name
      });
      showNotification(`Updated ${editingRto.rto_code} successfully`);
      setEditingRto(null);
      loadRtoOffices(selectedStateCode);
    } catch (err) {
      showNotification('Failed to update RTO', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete RTO
  const handleDeleteRto = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete RTO ${code}?`)) return;

    try {
      await api.delete(`/rto/admin/office/${id}`);
      showNotification(`Deleted RTO ${code}`);
      loadRtoOffices(selectedStateCode);
    } catch (err) {
      showNotification('Failed to delete RTO', true);
    }
  };

  // Batch Import JSON
  const handleBatchImport = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        showNotification('JSON must be an array of RTO objects', true);
        return;
      }
      let count = 0;
      for (const item of parsed) {
        if (item.state_code && item.rto_code && item.district && item.city) {
          try {
            await api.post('/rto/admin/office', {
              state_code: item.state_code.toUpperCase(),
              rto_code: item.rto_code.toUpperCase(),
              district: item.district,
              city: item.city,
              office_name: item.office_name || `RTO ${item.city}`
            });
            count++;
          } catch (e) {}
        }
      }
      showNotification(`Successfully imported ${count} RTO records!`);
      setIsImportModalOpen(false);
      setJsonInput('');
      loadRtoOffices(selectedStateCode);
    } catch (err) {
      showNotification('Invalid JSON syntax', true);
    }
  };

  const filteredRtos = rtoOffices.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.rto_code.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2 ${
            notification.isError
              ? 'bg-red-50 dark:bg-red-950/80 border-red-200 text-red-700 dark:text-red-300'
              : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 text-emerald-700 dark:text-emerald-300'
          }`}>
            {notification.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Administrative Transport Database Control</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              RTO Database Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create, modify, verify, and delete official RTO district assignments and plate prefix records.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Import JSON</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New RTO</span>
            </button>
          </div>
        </div>

        {/* State Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-64">
            <select
              value={selectedStateCode}
              onChange={(e) => setSelectedStateCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none"
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) — {s.total_rtos} RTOs
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, district, city..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* RTO Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-md">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">RTO Code</th>
                <th className="py-3 px-4">City / Area</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Official Office Name</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredRtos.map((rto) => (
                <tr key={rto.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono font-black text-blue-600 dark:text-blue-400">
                    {rto.rto_code}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                    {rto.city}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {rto.district}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                    {rto.office_name}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingRto(rto)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                        title="Edit Record"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRto(rto.id, rto.rto_code)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Add New RTO Record</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRto} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">State / UT:</label>
                  <select
                    value={newRtoState}
                    onChange={(e) => setNewRtoState(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                  >
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">RTO Code (e.g. GJ-39):</label>
                  <input
                    type="text"
                    value={newRtoCode}
                    onChange={(e) => setNewRtoCode(e.target.value.toUpperCase())}
                    placeholder="GJ-39"
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">City / Jurisdiction:</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Sanand"
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">District Name:</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="e.g. Ahmedabad"
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">Office Title:</label>
                  <input
                    type="text"
                    value={newOfficeName}
                    onChange={(e) => setNewOfficeName(e.target.value)}
                    placeholder="ARTO Sanand Unit"
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingRto && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Edit {editingRto.rto_code}
                </h3>
                <button onClick={() => setEditingRto(null)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateRto} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">City / Jurisdiction:</label>
                  <input
                    type="text"
                    value={editingRto.city}
                    onChange={(e) => setEditingRto({ ...editingRto, city: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">District Name:</label>
                  <input
                    type="text"
                    value={editingRto.district}
                    onChange={(e) => setEditingRto({ ...editingRto, district: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-400">Office Title:</label>
                  <input
                    type="text"
                    value={editingRto.office_name}
                    onChange={(e) => setEditingRto({ ...editingRto, office_name: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingRto(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow"
                  >
                    Update Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* JSON Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Batch Import RTO Data (JSON)</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBatchImport} className="space-y-3 text-xs">
                <p className="text-gray-500 dark:text-gray-400">
                  Paste an array of JSON objects with keys: <code className="text-blue-500">state_code, rto_code, district, city, office_name</code>.
                </p>

                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[\n  {\n    "state_code": "GJ",\n    "rto_code": "GJ-39",\n    "district": "Ahmedabad",\n    "city": "Sanand",\n    "office_name": "ARTO Sanand"\n  }\n]`}
                  className="w-full p-3 font-mono text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none"
                  required
                />

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow"
                  >
                    Execute Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
