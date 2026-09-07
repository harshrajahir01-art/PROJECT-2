import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, Zap, ZapOff, RefreshCw, Upload, Crosshair, 
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Navigation,
  Radio, Lock, CheckCircle
} from 'lucide-react';
import api from '../../api/client';

export const CameraScanner = ({ onScanComplete, isProcessing, setIsProcessing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const realtimeTimerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user'
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [scanLocationName, setScanLocationName] = useState('Highway Intercept Checkpoint');
  
  // Real-Time Scanning Mode
  const [isRealtime, setIsRealtime] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('Searching for plate...');
  const [scanCount, setScanCount] = useState(0);

  // Play audio alert on plate detection
  const playChime = (flagged) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = flagged ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(flagged ? 440 : 880, ctx.currentTime);
      if (flagged) {
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);
      } else {
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.25);
      }
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext unavailable or auto-play prevented
    }
  };

  // Request GPS Location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.warn("GPS Geolocation error:", err.message);
          setGpsError("GPS permission optional. Using checkpoint defaults.");
          setGpsLocation({ lat: 23.0225, lng: 72.5714 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsLocation({ lat: 23.0225, lng: 72.5714 });
    }
  }, []);

  // Initialize and start live camera feed
  const startCamera = async () => {
    setCameraError(null);
    setPermissionDenied(false);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let mediaStream;
      try {
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (errConstraint) {
        console.warn("Retrying camera with generic constraints:", errConstraint);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn("Auto-play error:", e));
      }

      // Check if torch/flashlight is supported
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
      if (capabilities.torch) {
        setTorchSupported(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setCameraError("Camera permission blocked. Please click the lock 🔒 icon in your browser address bar and allow camera access.");
      } else {
        setCameraError("Camera hardware unavailable or in use by another app. You can also upload a photo below.");
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Ensure stream stays attached to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn("Video play error:", e));
    }
  }, [stream]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const newStatus = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: newStatus }]
      });
      setTorchOn(newStatus);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  // Flip Camera (Front / Rear)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Frame from Live Camera & Send to API
  const captureAndScan = useCallback(async (isAuto = false) => {
    if (!videoRef.current || isProcessing) return;
    if (videoRef.current.readyState < 2) return; // Wait for video frame readiness

    if (!isAuto) {
      setIsProcessing(true);
    } else {
      setRealtimeStatus('ANPR analyzing frame...');
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Data = canvas.toDataURL('image/jpeg', 0.88);

      const payload = {
        image_base64: base64Data,
        latitude: gpsLocation?.lat || 23.0225,
        longitude: gpsLocation?.lng || 72.5714,
        location_name: scanLocationName,
        source_device_id: isAuto ? 'REALTIME_ANPR_CAM' : 'MOBILE_TERMINAL_FLD_01'
      };

      const res = await api.post('/scan/base64', payload);
      setScanCount((c) => c + 1);

      // If a valid license plate was locked on
      if (res.data.success && res.data.registration_number) {
        setRealtimeStatus(`Plate Locked: ${res.data.registration_number}`);
        playChime(res.data.alert_triggered);
        onScanComplete(res.data);
      } else {
        if (!isAuto) {
          onScanComplete(res.data);
        } else {
          setRealtimeStatus('Scanning for license plate...');
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
      if (!isAuto) {
        onScanComplete({
          success: false,
          error_message: err.response?.data?.detail || "Network error while processing scan. Please try again."
        });
      }
    } finally {
      if (!isAuto) {
        setIsProcessing(false);
      }
    }
  }, [gpsLocation, scanLocationName, isProcessing, onScanComplete, setIsProcessing]);

  // Real-Time Scanning Loop (every 2.0s when camera active and real-time enabled)
  useEffect(() => {
    if (!isRealtime || !cameraActive || isProcessing) {
      if (realtimeTimerRef.current) {
        clearInterval(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
      return;
    }

    realtimeTimerRef.current = setInterval(() => {
      if (cameraActive && !isProcessing) {
        captureAndScan(true);
      }
    }, 2000);

    return () => {
      if (realtimeTimerRef.current) {
        clearInterval(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, [isRealtime, cameraActive, isProcessing, captureAndScan]);

  // Upload File Fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;

    // Reset input value so selecting the same file again triggers onChange
    e.target.value = '';

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', gpsLocation?.lat || 23.0225);
    formData.append('longitude', gpsLocation?.lng || 72.5714);
    formData.append('location_name', scanLocationName);
    formData.append('source_device_id', 'MOBILE_FILE_UPLOAD');

    try {
      const res = await api.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        playChime(res.data.alert_triggered);
      }
      onScanComplete(res.data);
    } catch (err) {
      console.error("File upload scan error:", err);
      onScanComplete({
        success: false,
        error_message: err.response?.data?.detail || "Could not process image file."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Synthetic Sample Test Helper
  const testPresetPlates = [
    { label: 'GJ05XY7865 (Stolen i20 - High Risk)', plate: 'GJ05XY7865', file: 'plate_stolen_i20.jpg' },
    { label: 'GJ01AB1234 (Clear Honda City)', plate: 'GJ01AB1234', file: 'plate_clear_honda.jpg' },
    { label: 'MH12CD5678 (Clear Mahindra XUV700)', plate: 'MH12CD5678', file: 'plate_clear_xuv700.jpg' },
    { label: 'KA03GH3456 (Wanted Harrier - Hit & Run)', plate: 'KA03GH3456', file: 'plate_wanted_harrier.jpg' },
    { label: '22BH1234AA (Clear Bharat Series)', plate: '22BH1234AA', file: 'plate_bh_series.jpg' },
  ];

  const handleManualCheckPreset = async (plateNumber) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await api.post('/vehicles/check', {
        registration_number: plateNumber,
        latitude: gpsLocation?.lat || 23.0225,
        longitude: gpsLocation?.lng || 72.5714,
        location_name: scanLocationName,
        source_device_id: 'PRESET_TEST_SCANNER'
      });

      const data = res.data;
      if (data.found) {
        const v = data.vehicle;
        playChime(data.is_flagged);
        onScanComplete({
          success: true,
          registration_number: v.registration_number,
          ocr_confidence: 0.98,
          plate_detection_confidence: 0.95,
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
          location_name: scanLocationName,
          recommended_action: v.recommended_action || "Standard passage permitted.",
          instructions_to_officer: v.notes || "No special instructions."
        });
      } else {
        onScanComplete({
          success: false,
          error_message: `Vehicle plate ${plateNumber} is not registered in the system.`
        });
      }
    } catch (err) {
      onScanComplete({
        success: false,
        error_message: "Failed to query preset vehicle record."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-4">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewport Container */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
        
        {/* Real Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {/* Permission Denied Guide State */}
        {permissionDenied && (
          <div className="p-6 text-center text-gray-300 space-y-3 z-20 max-w-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-white">Camera Access Required</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Please click the <strong>Lock (🔒)</strong> or <strong>Camera icon</strong> in your browser's address bar at the top, select <strong>"Allow"</strong> for Camera, then click below:
            </p>
            <button
              onClick={startCamera}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              Grant Camera Permission
            </button>
          </div>
        )}

        {/* Generic Fallback Placeholder / Error State */}
        {!cameraActive && !permissionDenied && (
          <div className="p-6 text-center text-gray-400 space-y-3">
            <Camera className="h-12 w-12 mx-auto text-blue-500/60 animate-pulse" />
            <div className="text-sm font-medium text-gray-300">
              {cameraError || "Initializing camera hardware..."}
            </div>
            <button
              onClick={startCamera}
              className="px-4 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-lg text-xs font-semibold hover:bg-blue-600/50"
            >
              Start Camera
            </button>
          </div>
        )}

        {/* AI Targeting Reticle HUD Overlay */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-full max-w-[85%] h-36 border border-blue-500/40 rounded-lg flex flex-col justify-between p-2 shadow-inner">
              {/* Corner HUD Markers */}
              <div className="hud-corner hud-tl"></div>
              <div className="hud-corner hud-tr"></div>
              <div className="hud-corner hud-bl"></div>
              <div className="hud-corner hud-br"></div>

              {/* Target Reticle Header */}
              <div className="flex justify-between items-center text-[10px] text-blue-400 font-mono tracking-wider uppercase">
                <span className="flex items-center space-x-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold">ANPR SENSOR</span>
                </span>
                <span className="text-gray-400">{facingMode === 'environment' ? 'REAR' : 'FRONT'}</span>
              </div>

              {/* Scanning Laser Line Animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38BDF8] animate-scan-line"></div>

              {/* Target Reticle Footer */}
              <div className="text-center text-[11px] text-blue-300/90 font-semibold tracking-wide">
                Align Number Plate Inside Reticle
              </div>
            </div>
          </div>
        )}

        {/* Top Floating Controls: GPS & Live Status */}
        {cameraActive && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
            {/* GPS Pill */}
            <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700/60 text-[11px] font-mono text-gray-300 flex items-center space-x-1 shadow-md">
              <Navigation className="h-3 w-3 text-emerald-400" />
              <span>
                {gpsLocation ? `${gpsLocation.lat.toFixed(3)}, ${gpsLocation.lng.toFixed(3)}` : 'GPS Tracking'}
              </span>
            </div>

            {/* In-Viewport Controls (Flashlight & Camera Flip) */}
            <div className="flex items-center space-x-2">
              {torchSupported && (
                <button
                  onClick={toggleTorch}
                  title="Flashlight"
                  className={`p-2 rounded-full backdrop-blur-md border ${
                    torchOn
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                      : 'bg-black/50 border-slate-700/60 text-gray-300'
                  }`}
                >
                  {torchOn ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                </button>
              )}

              <button
                onClick={flipCamera}
                title="Flip Camera (Front/Back)"
                className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-slate-700/60 text-gray-300 hover:text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Floating Pill: Real-Time Scanning Activity */}
        {cameraActive && isRealtime && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-cyan-500/40 text-[11px] text-cyan-300 font-medium flex items-center space-x-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{realtimeStatus}</span>
          </div>
        )}
      </div>

      {/* Real-Time ANPR Mode Toggle Switch */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg ${isRealtime ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
            <Radio className={`h-4 w-4 ${isRealtime ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Continuous Real-Time ANPR</span>
              {isRealtime && <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/30 text-emerald-300 rounded font-mono">ACTIVE</span>}
            </div>
            <div className="text-[10px] text-gray-400">Auto-detects and verifies plates as you aim</div>
          </div>
        </div>
        <button
          onClick={() => setIsRealtime(!isRealtime)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isRealtime ? 'bg-emerald-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isRealtime ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full space-y-2.5">
        <button
          onClick={() => captureAndScan(false)}
          disabled={!cameraActive || isProcessing}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <Camera className="h-5 w-5" />
          <span>{isProcessing ? 'ANALYZING LICENSE PLATE...' : 'CAPTURE & SCAN NOW'}</span>
        </button>

        {/* Upload Fallback File Button */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,.jpg,.jpeg,.png,.webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 flex items-center justify-center space-x-2 transition-colors"
        >
          <Upload className="h-4 w-4 text-blue-400" />
          <span>Select Photo from Device</span>
        </button>
      </div>

      {/* Quick Test Synthetic Cases for instant verification without a vehicle */}
      <div className="w-full p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-300">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>Quick Test Synthetic Vehicle Cases:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {testPresetPlates.map((item) => (
            <button
              key={item.plate}
              onClick={() => handleManualCheckPreset(item.plate)}
              disabled={isProcessing}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left font-mono text-gray-300 hover:text-white transition-all flex items-center justify-between"
            >
              <span className="truncate">{item.label}</span>
              <span className="text-[10px] text-blue-400 uppercase font-bold ml-1">Scan</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
