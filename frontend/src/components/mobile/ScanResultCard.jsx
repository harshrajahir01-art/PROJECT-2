import React from 'react';
import { 
  ShieldCheck, AlertOctagon, AlertTriangle, RotateCcw, 
  MapPin, Clock, Car, Tag, ShieldAlert, FileText, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, RiskBadge } from '../common/Badge';

export const ScanResultCard = ({ result, onReset }) => {
  if (!result) return null;

  const isFlagged = result.alert_triggered || 
    ['STOLEN', 'SUSPECTED_CRIME', 'WANTED', 'TRAFFIC_VIOLATION'].includes(result.status) || 
    ['HIGH', 'CRITICAL'].includes(result.risk_level);

  const isSuccess = result.success;

  // Failure / Rejection State
  if (!isSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto bg-slate-900/90 rounded-2xl border-2 border-red-900/60 p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-700/60 mx-auto flex items-center justify-center">
          <AlertOctagon className="h-8 w-8 text-red-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Scan Unsuccessful</h3>
          <p className="text-sm text-gray-300">
            {result.error_message || "Could not detect or read license plate characters."}
          </p>
        </div>
        {result.raw_text && (
          <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-gray-400 border border-slate-800 text-left">
            <span>Raw OCR Output: </span>
            <span className="text-white font-semibold">{result.raw_text}</span>
          </div>
        )}
        <div className="text-xs text-blue-400/90 bg-blue-950/40 p-3 rounded-lg border border-blue-900/40 text-left">
          💡 <strong>Tips for better capture:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-300">
            <li>Ensure number plate fits comfortably within the rectangular reticle.</li>
            <li>Avoid direct headlight glare or intense reflections.</li>
            <li>Hold phone steady and maintain 1.5 - 3 meters distance.</li>
          </ul>
        </div>
        <button
          onClick={onReset}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>RETAKE SCAN</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Top High-Impact Status Banner */}
      <div
        className={`w-full rounded-2xl p-5 border-2 shadow-2xl transition-all ${
          isFlagged
            ? 'animate-alert-glow bg-red-950/90 border-red-600 text-white'
            : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-100'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              isFlagged
                ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/50'
                : 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
            }`}
          >
            {isFlagged ? (
              <AlertOctagon className="h-8 w-8 animate-bounce" />
            ) : (
              <ShieldCheck className="h-8 w-8" />
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-extrabold opacity-90">
              {isFlagged ? 'CRITICAL SECURITY NOTICE' : 'VERIFICATION COMPLETE'}
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {isFlagged ? 'ALERT: VEHICLE FLAGGED' : 'Vehicle Status: CLEAR'}
            </h2>
            <div className="text-xs mt-0.5 font-medium opacity-90">
              {isFlagged
                ? `Status: ${result.status} • Risk: ${result.risk_level}`
                : 'Clean record. Authorized for standard passage.'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Vehicle Details Card */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
        {/* Registration Number Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="text-xs text-gray-400 uppercase font-semibold">Registration Number</div>
            <div className="text-3xl font-black font-mono tracking-wider text-blue-400 mt-0.5">
              {result.registration_number}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={result.status} />
            <RiskBadge risk={result.risk_level} />
          </div>
        </div>

        {/* Vehicle Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <Car className="h-3.5 w-3.5 text-blue-400" />
              <span>Vehicle Make & Model</span>
            </div>
            <div className="font-semibold text-gray-100 mt-1">
              {result.manufacturer ? `${result.manufacturer} ${result.model || ''}` : 'Unregistered / Unknown'}
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <Tag className="h-3.5 w-3.5 text-blue-400" />
              <span>Type & Color</span>
            </div>
            <div className="font-semibold text-gray-100 mt-1">
              {result.vehicle_type || 'Sedan'} {result.color ? `• ${result.color}` : ''}
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Detection Time</span>
            </div>
            <div className="font-semibold text-gray-100 mt-1 text-xs">
              {result.detected_at ? new Date(result.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              <span>Observation Location</span>
            </div>
            <div className="font-semibold text-gray-100 mt-1 text-xs truncate">
              {result.location_name || 'Field Checkpoint'}
            </div>
          </div>
        </div>

        {/* AI & OCR Confidence Metrics */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-mono">OCR Confidence Score</span>
            <span className="text-emerald-400 font-mono font-bold">
              {Math.round(result.ocr_confidence * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                result.ocr_confidence > 0.7 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(10, Math.min(100, result.ocr_confidence * 100))}%` }}
            ></div>
          </div>
        </div>

        {/* Recommended Field Action Box */}
        <div
          className={`p-4 rounded-xl border ${
            isFlagged
              ? 'bg-red-950/50 border-red-800/80 text-red-200'
              : 'bg-blue-950/40 border-blue-900/50 text-blue-200'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            {isFlagged ? (
              <ShieldAlert className="h-4 w-4 text-red-400" />
            ) : (
              <FileText className="h-4 w-4 text-blue-400" />
            )}
            <span>Recommended Field Action</span>
          </div>
          <div className="text-sm font-medium">
            {result.recommended_action || "Standard passage permitted."}
          </div>
          {result.instructions_to_officer && result.instructions_to_officer !== result.recommended_action && (
            <div className="text-xs text-gray-300 mt-1 font-mono">
              Note: {result.instructions_to_officer}
            </div>
          )}
        </div>

        {/* Link to Movement Timeline & Sightings Map */}
        {result.registration_number && (
          <Link
            to={`/map?plate=${result.registration_number}`}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-blue-400 flex items-center justify-between transition-colors"
          >
            <span>View Observation Timeline ({result.last_seen_count || 1} Sightings Logged)</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}

        {/* Primary Retake / New Scan Button */}
        <button
          onClick={onReset}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <RotateCcw className="h-5 w-5" />
          <span>SCAN ANOTHER VEHICLE</span>
        </button>
      </div>
    </div>
  );
};
