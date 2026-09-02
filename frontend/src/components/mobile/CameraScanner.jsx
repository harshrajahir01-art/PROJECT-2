import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, Zap, ZapOff, RefreshCw, Upload, Crosshair, 
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Navigation 
} from 'lucide-react';
import api from '../../api/client';

export const CameraScanner = ({ onScanComplete, isProcessing, setIsProcessing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user'
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [scanLocationName, setScanLocationName] = useState('Highway Intercept Checkpoint');

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
          // Fallback default coordinates (Gujarat/Ahmedabad for demo)
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
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);

      // Check if torch/flashlight is supported
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
      if (capabilities.torch) {
        setTorchSupported(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access unavailable. You can upload or select a test vehicle plate below.");
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

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Frame from Live Camera & Send to API
  const captureAndScan = async () => {
    if (!videoRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Data = canvas.toDataURL('image/jpeg', 0.92);

      const payload = {
        image_base64: base64Data,
        latitude: gpsLocation?.lat || 23.0225,
        longitude: gpsLocation?.lng || 72.5714,
        location_name: scanLocationName,
        source_device_id: 'MOBILE_TERMINAL_FLD_01'
      };

      const res = await api.post('/scan/base64', payload);
      onScanComplete(res.data);
    } catch (err) {
      console.error("Scan error:", err);
      onScanComplete({
        success: false,
        error_message: err.response?.data?.detail || "Network error while processing scan. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload File Fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;

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
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewport Container */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
        
        {/* Real Live Video */}
        {cameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Fallback Camera Placeholder / Error State */}
        {!cameraActive && (
          <div className="p-6 text-center text-gray-400 space-y-3">
            <Camera className="h-12 w-12 mx-auto text-blue-500/60 animate-pulse" />
            <div className="text-sm font-medium text-gray-300">
              {cameraError || "Initializing camera hardware..."}
            </div>
            <button
              onClick={startCamera}
              className="px-4 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-lg text-xs font-semibold hover:bg-blue-600/50"
            >
              Retry Camera Access
            </button>
          </div>
        )}

        {/* AI Targeting Reticle HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="relative w-full max-w-[85%] h-36 border border-blue-500/30 rounded-lg flex flex-col justify-between p-2 shadow-inner">
            {/* Corner HUD Markers */}
            <div className="hud-corner hud-tl"></div>
            <div className="hud-corner hud-tr"></div>
            <div className="hud-corner hud-bl"></div>
            <div className="hud-corner hud-br"></div>

            {/* Target Reticle Header */}
            <div className="flex justify-between items-center text-[10px] text-blue-400 font-mono tracking-wider uppercase">
              <span className="flex items-center space-x-1">
                <Crosshair className="h-3 w-3 animate-spin" />
                <span>ANPR Optical Sensor</span>
              </span>
              <span>HD 1080p</span>
            </div>

            {/* Scanning Line Animation */}
            {cameraActive && (
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#60A5FA] animate-scan-line"></div>
            )}

            {/* Target Reticle Footer */}
            <div className="text-center text-[11px] text-blue-300/80 font-medium tracking-wide">
              Align Number Plate Inside Reticle
            </div>
          </div>
        </div>

        {/* In-Viewport Controls (Flashlight & Camera Flip) */}
        {cameraActive && (
          <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-full backdrop-blur-md border ${
                  torchOn
                    ? 'bg-amber-500/80 text-white border-amber-400'
                    : 'bg-black/50 text-gray-300 border-white/20 hover:bg-black/70'
                }`}
                title="Toggle Torch/Flash"
              >
                {torchOn ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={flipCamera}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-gray-300 border border-white/20 hover:bg-black/70"
              title="Switch Camera (Front/Rear)"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* GPS Badge in Viewport */}
        <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-300">
          <Navigation className="h-3 w-3 text-emerald-400" />
          <span>{gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : 'Locating GPS...'}</span>
        </div>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <ShieldAlert className="absolute inset-0 m-auto h-7 w-7 text-blue-400 animate-pulse" />
            </div>
            <div className="text-sm font-semibold text-white tracking-wide">
              Analyzing Plate & Scanning Database...
            </div>
            <div className="text-xs text-blue-400 font-mono">
              Running Deskewing, CLAHE & OCR Engine
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Controls */}
      <div className="w-full mt-5 space-y-3">
        {/* Main Capture & Scan Button */}
        <button
          onClick={captureAndScan}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          <Camera className="h-6 w-6" />
          <span>CAPTURE & SCAN PLATE</span>
        </button>

        {/* Secondary Options: File Upload & Preset Tests */}
        <div className="flex items-center space-x-2">
          {/* File Upload Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Upload className="h-4 w-4 text-blue-400" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Controlled Demo Preset Dropdown */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-left">
          <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Quick Test Synthetic Vehicle Cases:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {testPresetPlates.map((item) => (
              <button
                key={item.plate}
                onClick={() => handleManualCheckPreset(item.plate)}
                disabled={isProcessing}
                className="text-left px-2.5 py-1.5 rounded bg-slate-950/60 hover:bg-blue-950/40 border border-slate-800/80 hover:border-blue-700/60 text-xs text-gray-300 hover:text-blue-300 transition-all font-mono truncate"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
