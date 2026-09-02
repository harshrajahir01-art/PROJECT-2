import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MovementMap } from '../components/dashboard/MovementMap';
import { MapPin, Search, Clock, ShieldAlert, Navigation, ArrowRight } from 'lucide-react';
import { StatusBadge, RiskBadge } from '../components/common/Badge';
import api from '../api/client';

export const TimelineMapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPlate = searchParams.get('plate') || 'GJ05XY7865';

  const [plateQuery, setPlateQuery] = useState(initialPlate);
  const [timelineData, setTimelineData] = useState(null);
  const [allDetections, setAllDetections] = useState([]);
  const [viewMode, setViewMode] = useState(initialPlate ? 'single' : 'all');
  const [loading, setLoading] = useState(false);

  const fetchTimeline = async (plate) => {
    if (!plate) return;
    setLoading(true);
    try {
      const res = await api.get(`/vehicles/${plate}/timeline`);
      setTimelineData(res.data);
      setViewMode('single');
    } catch (err) {
      console.error("Timeline fetch error:", err);
      // Fallback: try all detections
      fetchRecentDetections();
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentDetections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/detections?limit=30');
      setAllDetections(res.data);
      setViewMode('all');
    } catch (err) {
      console.error("Detections fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlate) {
      fetchTimeline(initialPlate);
    } else {
      fetchRecentDetections();
    }
  }, [initialPlate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (plateQuery.trim()) {
      setSearchParams({ plate: plateQuery.trim().toUpperCase() });
      fetchTimeline(plateQuery.trim().toUpperCase());
    }
  };

  const pointsToRender = viewMode === 'single'
    ? (timelineData?.observation_timeline || [])
    : allDetections;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-500" />
            <span>Observation Timeline & Movement Map</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Sequential checkpoint observations constructed from authorized field scans.
          </p>
        </div>

        {/* Plate Search Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Track Plate (e.g. GJ05XY7865)..."
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white uppercase placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Track
          </button>
          <button
            type="button"
            onClick={fetchRecentDetections}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 rounded-xl text-xs font-semibold"
          >
            All Checkpoints
          </button>
        </form>
      </div>

      {/* Main Map + Sighting Sequence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: The Interactive Leaflet Map */}
        <div className="lg:col-span-2 space-y-3">
          <MovementMap
            points={pointsToRender}
            selectedPlate={viewMode === 'single' ? timelineData?.registration_number : null}
            height="560px"
          />
        </div>

        {/* Right Col: Chronological Sighting History */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Observation Sequence</span>
              </h2>
              <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded text-blue-300">
                {pointsToRender.length} Points
              </span>
            </div>

            {viewMode === 'single' && timelineData && (
              <div className="p-3 my-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Target Vehicle</div>
                  <div className="font-mono font-bold text-base text-white">
                    {timelineData.registration_number}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={timelineData.vehicle_status} />
                </div>
              </div>
            )}

            {/* Scrollable Timeline List */}
            <div className="space-y-3 mt-3 max-h-[380px] overflow-y-auto pr-1">
              {pointsToRender.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No observation points logged for this vehicle yet.
                </div>
              ) : (
                pointsToRender.map((pt, idx) => (
                  <div
                    key={pt.id || idx}
                    className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1.5 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 flex items-center space-x-1">
                        <span className="w-4 h-4 rounded-full bg-blue-900 text-blue-200 text-[10px] inline-flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span>{pt.location_name || 'Checkpoint Node'}</span>
                      </span>
                      <span className="font-mono text-[11px] text-gray-400">
                        {pt.timestamp ? new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (pt.detected_at ? new Date(pt.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 flex items-center justify-between font-mono">
                      <span>Device: {pt.source_device_id || 'CAM_01'}</span>
                      {pt.latitude && (
                        <span>{pt.latitude.toFixed(3)}, {pt.longitude.toFixed(3)}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 text-[11px] text-gray-300">
            ℹ️ <strong>System Note:</strong> Multiple authorized cameras & mobile scans create checkpoint observations, forming a historical timeline.
          </div>
        </div>
      </div>
    </div>
  );
};
