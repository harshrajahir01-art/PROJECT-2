import React, { useState } from 'react';
import { CameraScanner } from '../components/mobile/CameraScanner';
import { ScanResultCard } from '../components/mobile/ScanResultCard';
import { ShieldAlert, History, MapPin, Search } from 'lucide-react';
import api from '../api/client';

export const MobileScanPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'manual'

  const handleScanComplete = (result) => {
    setScanResult(result);
  };

  const handleReset = () => {
    setScanResult(null);
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
      if (data.found) {
        const v = data.vehicle;
        setScanResult({
          success: true,
          registration_number: v.registration_number,
          ocr_confidence: 1.0,
          plate_detection_confidence: 1.0,
          is_registered: true,
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
          recommended_action: v.recommended_action || "Standard passage permitted.",
          instructions_to_officer: v.notes || "No special instructions."
        });
      } else {
        setScanResult({
          success: false,
          error_message: `Vehicle ${manualInput.toUpperCase()} not found in the authorized database.`
        });
      }
    } catch (err) {
      setScanResult({
        success: false,
        error_message: "Failed to connect to database for manual lookup."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Scan & Verify Vehicle</h1>
            <p className="text-xs text-gray-400">Point real phone camera at license plate or search manually.</p>
          </div>
        </div>

        {/* Tab Toggle (Camera vs Manual Plate Entry) */}
        {!scanResult && (
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('camera')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Live Camera ANPR
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Manual Entry
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {scanResult ? (
        /* Result Screen */
        <ScanResultCard result={scanResult} onReset={handleReset} />
      ) : activeTab === 'camera' ? (
        /* Live Camera Scanner View */
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
              <span>{isProcessing ? 'Verifying...' : 'VERIFY VEHICLE STATUS'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
