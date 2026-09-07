import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraScanner } from '../components/mobile/CameraScanner';
import { ScanResultCard } from '../components/mobile/ScanResultCard';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon, 
  Search, ExternalLink, CheckCircle2, Database, Clock, 
  Car, Eye, X, RefreshCw, Radio
} from 'lucide-react';
import api from '../api/client';

export const MobileScanPage = () => {
  const [latestScan, setLatestScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'manual'

  // When a plate is scanned via camera or file upload
  const handleScanComplete = (result) => {
    if (!result) return;
    setLatestScan(result);

    if (result.success && result.registration_number) {
      setScanHistory((prev) => {
        // Prevent immediate duplicate in history feed
        const filtered = prev.filter((item) => item.registration_number !== result.registration_number);
        return [result, ...filtered.slice(0, 24)]; // Keep latest 25 scans
      });
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setIsProcessing(true);

    try {
      const res = await api.post('/vehicles/check', {
        registration_number: manualInput.trim(),
        location_name: "Manual Checkpoint Entry"
      });

      const data = res.data;
      if (data.found && data.vehicle) {
        const v = data.vehicle;
        const scanObj = {
          success: true,
          registration_number: v.registration_number,
          ocr_confidence: 1.0,
          plate_detection_confidence: 1.0,
          is_registered: true,
          saved_to_registry: true,
          auto_registered: data.auto_registered || false,
          vehicle_id: v.id,
          vehicle_type: v.vehicle_type,
          manufacturer: v.manufacturer,
          model: v.model,
          color: v.color,
          status: v.status,
          risk_level: v.risk_level,
          alert_triggered: data.is_flagged,
          detected_at: new Date().toISOString(),
          location_name: "Manual Checkpoint Entry",
          recommended_action: data.is_flagged 
            ? "🚨 CRITICAL: High-Risk / Stolen Flagged Vehicle! Verify credentials." 
            : "Vehicle record verified clear. Directly saved in registry.",
          instructions_to_officer: v.notes || "Auto-recorded into system."
        };
        handleScanComplete(scanObj);
      } else {
        setLatestScan({
          success: false,
          error_message: `Vehicle ${manualInput.toUpperCase()} could not be processed.`
        });
      }
    } catch (err) {
      setLatestScan({
        success: false,
        error_message: err.response?.data?.detail || "Failed to verify vehicle in database."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">Real-Time ANPR Scanner</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE FEED</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Continuous AI scanning — plates are automatically saved directly into the registry.</p>
          </div>
        </div>

        {/* Tab Toggle (Camera vs Manual Entry) */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Live Camera ANPR</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Section (Camera stays permanently active) */}
      {activeTab === 'camera' ? (
        <CameraScanner
          onScanComplete={handleScanComplete}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      ) : (
        /* Manual Search Mode */
        <div className="max-w-lg mx-auto bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Manual License Plate Search</h2>
          <form onSubmit={handleManualSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Enter Registration Number (e.g. GJ05XY7865, MH12CD5678)
              </label>
              <input
                type="text"
                required
                placeholder="GJ01AB1234"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-base font-bold text-blue-400 uppercase placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{isProcessing ? 'Verifying & Saving...' : 'VERIFY & SAVE TO REGISTRY'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Instant Real-Time Detection HUD Banner (Appears beneath camera upon scan) */}
      {latestScan && (
        <div className={`w-full rounded-2xl p-5 border-2 shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
          !latestScan.success
            ? 'bg-slate-900/90 border-red-800/80 text-gray-200'
            : latestScan.alert_triggered
            ? 'bg-red-950/90 border-red-600 text-white shadow-red-950/50'
            : 'bg-emerald-950/90 border-emerald-500/80 text-white shadow-emerald-950/50'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <div className={`p-3 rounded-2xl flex-shrink-0 mt-0.5 ${
                !latestScan.success
                  ? 'bg-red-900/40 text-red-400'
                  : latestScan.alert_triggered
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-emerald-500 text-white'
              }`}>
                {!latestScan.success ? (
                  <AlertOctagon className="h-7 w-7" />
                ) : latestScan.alert_triggered ? (
                  <AlertTriangle className="h-7 w-7" />
                ) : (
                  <ShieldCheck className="h-7 w-7" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-black rounded uppercase tracking-wider ${
                    !latestScan.success
                      ? 'bg-red-900/60 text-red-200'
                      : latestScan.alert_triggered
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {!latestScan.success
                      ? 'SCAN UNRESOLVED'
                      : latestScan.alert_triggered
                      ? `🚨 CRITICAL ALERT: ${latestScan.status}`
                      : '✅ DIRECTLY SAVED TO REGISTRY'}
                  </span>

                  {latestScan.success && (
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-900/80 text-blue-300 border border-slate-700 rounded flex items-center space-x-1">
                      <Database className="h-3 w-3 text-blue-400" />
                      <span>Saved in Registry</span>
                    </span>
                  )}
                </div>

                {latestScan.success ? (
                  <>
                    <div className="text-2xl font-black font-mono tracking-wider text-white">
                      {latestScan.registration_number}
                    </div>
                    <div className="text-sm font-medium text-gray-200">
                      {latestScan.manufacturer || 'Standard'} {latestScan.model || 'Vehicle'} 
                      {latestScan.color ? ` • ${latestScan.color}` : ''}
                      {latestScan.vehicle_type ? ` (${latestScan.vehicle_type})` : ''}
                    </div>
                    <div className="text-xs text-gray-300 font-medium">
                      {latestScan.recommended_action || "Vehicle record recorded in registry database."}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-red-300 font-medium">
                    {latestScan.error_message || "Could not recognize plate. Please align clearly inside the reticle."}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Dismiss */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {latestScan.success && (
                <>
                  <button
                    onClick={() => setSelectedVehicleForModal(latestScan)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center space-x-1 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Full Dossier</span>
                  </button>

                  <Link
                    to="/vehicles"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1 transition-colors"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Registry</span>
                    <ExternalLink className="h-3 w-3 ml-0.5" />
                  </Link>
                </>
              )}

              <button
                onClick={() => setLatestScan(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss Banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Session Scanned Vehicles & Registry Feed */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Real-Time Scanned Vehicles & Registry Feed</span>
                <span className="px-2 py-0.2 text-[11px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 rounded-full">
                  {scanHistory.length} Recorded
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">All vehicles recognized by camera are saved directly into the database.</p>
            </div>
          </div>

          <Link
            to="/vehicles"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
          >
            <span>Open Vehicle Registry Table</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {scanHistory.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs space-y-2">
            <Car className="h-8 w-8 mx-auto text-gray-600 opacity-60" />
            <div>Point camera at license plate to see live detections appear here in real time.</div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {scanHistory.map((item, index) => (
              <div
                key={`${item.registration_number}-${index}`}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-800/80 rounded-xl border border-slate-800 flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  {/* Plate Crop Thumbnail */}
                  {item.plate_crop_url ? (
                    <img
                      src={item.plate_crop_url}
                      alt={item.registration_number}
                      className="w-16 h-8 object-cover rounded border border-slate-700 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center font-mono text-[10px] text-gray-400">
                      PLATE
                    </div>
                  )}

                  {/* Plate & Vehicle Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-white tracking-wide">
                        {item.registration_number}
                      </span>
                      <span className={`px-2 py-0.2 text-[10px] font-bold rounded uppercase ${
                        item.alert_triggered
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {item.status || 'CLEAR'}
                      </span>
                      <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] bg-blue-950 text-blue-300 border border-blue-900 rounded font-medium">
                        ✓ In Registry
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">
                      {item.manufacturer || 'Vehicle'} {item.model || ''}
                      {item.color ? ` • ${item.color}` : ''}
                      <span className="text-gray-500 ml-2">
                        {new Date(item.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dossier Modal Button */}
                <button
                  onClick={() => setSelectedVehicleForModal(item)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Full Dossier Modal (Does NOT unmount the camera!) */}
      {selectedVehicleForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-blue-400" />
                <span className="text-base font-bold text-white">Full Vehicle Dossier</span>
              </div>
              <button
                onClick={() => setSelectedVehicleForModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ScanResultCard
              result={selectedVehicleForModal}
              onReset={() => setSelectedVehicleForModal(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
