import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, Zap, ZapOff, RefreshCw, Upload, Crosshair, 
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Navigation,
  Radio, Lock, CheckCircle, Play, Pause, Film
} from 'lucide-react';
import api from '../../api/client';

export const CameraScanner = ({ onScanComplete, isProcessing, setIsProcessing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const simCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const realtimeTimerRef = useRef(null);
  const isScanningFrameRef = useRef(false);
  const lastDetectedPlateRef = useRef(null);
  const lastDetectedTimeRef = useRef(0);
  const simAnimationRef = useRef(null);
  const activeStreamRef = useRef(null);

  // Camera & Stream State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user'
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [scanLocationName, setScanLocationName] = useState('Highway Intercept Checkpoint');
  
  // Feed Mode: 'camera' (Physical Device Webcam/Camera) or 'simulation' (Live Traffic Video Stream)
  const [feedMode, setFeedMode] = useState('camera');

  // Traffic Simulation Scenarios
  const simulationScenarios = [
    {
      id: 'stolen_i20_fog',
      name: 'Worst-Case: Stolen i20 in Dense Fog & Mist',
      plate: 'GJ05XY7865',
      carModel: 'Hyundai i20 (White)',
      weather: 'fog',
      speed: '95 km/h',
      status: 'STOLEN',
      risk: 'HIGH'
    },
    {
      id: 'wanted_harrier_rain',
      name: 'Night Rain: Wanted Harrier (Hit & Run)',
      plate: 'KA03GH3456',
      carModel: 'Tata Harrier (Dark Grey)',
      weather: 'rain',
      speed: '80 km/h',
      status: 'WANTED',
      risk: 'CRITICAL'
    },
    {
      id: 'clear_xuv700_speed',
      name: 'Highway Speed: Mahindra XUV700 Passing',
      plate: 'MH12CD5678',
      carModel: 'Mahindra XUV700 (Silver)',
      weather: 'clear',
      speed: '110 km/h',
      status: 'CLEAR',
      risk: 'LOW'
    },
    {
      id: 'clear_honda_city',
      name: 'Daytime Traffic: Honda City Clear',
      plate: 'GJ01AB1234',
      carModel: 'Honda City (Bronze)',
      weather: 'clear',
      speed: '65 km/h',
      status: 'CLEAR',
      risk: 'LOW'
    },
    {
      id: 'bh_series_nexon',
      name: 'High-Speed Intercept: Bharat Series EV',
      plate: '22BH1234AA',
      carModel: 'Tata Nexon EV (Blue)',
      weather: 'clear',
      speed: '85 km/h',
      status: 'CLEAR',
      risk: 'LOW'
    }
  ];

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);

  // Real-Time Scanning State
  const [isRealtime, setIsRealtime] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('Real-Time ANPR Active • Aiming...');
  const [scanCount, setScanCount] = useState(0);
  const [lockedPlate, setLockedPlate] = useState(null);

  // Audio alert on plate detection
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
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
      } else {
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.25);
      }
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // AudioContext autoplay restrictions
    }
  };

  // GPS Geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setGpsLocation({ lat: 23.0225, lng: 72.5714 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsLocation({ lat: 23.0225, lng: 72.5714 });
    }
  }, []);

  // Stop current active media stream safely
  const stopCurrentStream = useCallback(() => {
    if (simAnimationRef.current) {
      cancelAnimationFrame(simAnimationRef.current);
      simAnimationRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Start Physical Device Camera with multi-level constraint fallbacks
  const startCamera = async () => {
    setCameraError(null);
    setPermissionDenied(false);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera API not accessible in this context. Use localhost or HTTPS.');
      return;
    }

    // Stop existing camera track if running
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch (e) {}
      });
      activeStreamRef.current = null;
    }

    try {
      let mediaStream;
      // Level 1: Try high resolution environment rear camera
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        });
      } catch (errLvl1) {
        // Level 2: Try facingMode without strict resolution constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false
          });
        } catch (errLvl2) {
          // Level 3: Universal fallback for any available video device
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      activeStreamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play waiting for user interaction:', playErr);
        }
      }
      setCameraActive(true);

      // Check torch capabilities
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack?.getCapabilities ? videoTrack.getCapabilities() : {};
      if (capabilities.torch) {
        setTorchSupported(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setCameraError('Camera permission was blocked. Click the lock 🔒 icon in your browser address bar and select Allow.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera hardware found on this device. You can test using the Traffic Video Simulator.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another app (Zoom, Teams, etc.). Please close other apps and try again.');
      } else {
        setCameraError(err.message || 'Failed to initialize camera.');
      }
      setCameraActive(false);
    }
  };

  // Start Real-Time Traffic Stream Simulator (visible directly in viewport canvas)
  const startTrafficSimulation = () => {
    stopCurrentStream();
    setCameraError(null);
    setPermissionDenied(false);

    const canvas = simCanvasRef.current;
    if (!canvas) return;

    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');

    const scenario = simulationScenarios[activeScenarioIdx];
    let carProgress = 0.05;
    let roadStripeOffset = 0;
    let fogParticles = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 40 + Math.random() * 80,
      alpha: 0.15 + Math.random() * 0.25,
      speedX: 0.5 + Math.random() * 1.5
    }));

    let rainDrops = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 15 + Math.random() * 20,
      speed: 16 + Math.random() * 12
    }));

    const renderSimulationFrame = () => {
      // 1. Draw Road & Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.45);
      if (scenario.weather === 'rain') {
        skyGrad.addColorStop(0, '#0a0f1d');
        skyGrad.addColorStop(1, '#1e293b');
      } else if (scenario.weather === 'fog') {
        skyGrad.addColorStop(0, '#64748b');
        skyGrad.addColorStop(1, '#94a3b8');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#38bdf8');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.45);

      // Asphalt Road
      ctx.fillStyle = scenario.weather === 'rain' ? '#0b0f19' : '#1e293b';
      ctx.fillRect(0, canvas.height * 0.45, canvas.width, canvas.height * 0.55);

      // Perspective Road Borders
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.4, canvas.height * 0.45);
      ctx.lineTo(0, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.6, canvas.height * 0.45);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();

      // Animated Dashed Center Lanes (Speed simulation)
      roadStripeOffset = (roadStripeOffset + 14) % 80;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.setLineDash([30, 40]);
      ctx.lineDashOffset = -roadStripeOffset;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.45);
      ctx.lineTo(canvas.width * 0.5, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Animate Approaching Vehicle
      carProgress += 0.007;
      if (carProgress > 1.25) {
        carProgress = 0.05;
      }

      const scale = 0.2 + Math.pow(carProgress, 1.8) * 0.95;
      const carY = canvas.height * 0.45 + (canvas.height * 0.48) * carProgress;
      const carX = canvas.width * 0.5;

      // Draw Car Body
      const carW = 380 * scale;
      const carH = 200 * scale;

      ctx.save();
      ctx.translate(carX, carY);

      // Vehicle Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, carH * 0.4, carW * 0.55, carH * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vehicle Chassis
      let carColor = '#ffffff';
      if (scenario.id === 'wanted_harrier_rain') carColor = '#334155';
      if (scenario.id === 'clear_xuv700_speed') carColor = '#cbd5e1';
      if (scenario.id === 'clear_honda_city') carColor = '#b45309';
      if (scenario.id === 'bh_series_nexon') carColor = '#0284c7';

      ctx.fillStyle = carColor;
      ctx.beginPath();
      ctx.roundRect(-carW * 0.5, -carH * 0.4, carW, carH * 0.8, 12 * scale);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3 * scale;
      ctx.stroke();

      // Windshield & Roof
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-carW * 0.4, -carH * 0.35, carW * 0.8, carH * 0.35, 8 * scale);
      ctx.fill();

      // Front Radiator Grille
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-carW * 0.35, carH * 0.02, carW * 0.7, carH * 0.22, 6 * scale);
      ctx.fill();

      // Headlights with Glow
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-carW * 0.38, 0, 16 * scale, 0, Math.PI * 2);
      ctx.arc(carW * 0.38, 0, 16 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Headlight Beam Reflections
      if (scenario.weather === 'rain' || scenario.weather === 'fog') {
        const beamGradL = ctx.createRadialGradient(-carW * 0.38, 0, 5 * scale, -carW * 0.38, carH * 0.6, 90 * scale);
        beamGradL.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        beamGradL.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGradL;
        ctx.beginPath();
        ctx.arc(-carW * 0.38, carH * 0.4, 90 * scale, 0, Math.PI * 2);
        ctx.fill();

        const beamGradR = ctx.createRadialGradient(carW * 0.38, 0, 5 * scale, carW * 0.38, carH * 0.6, 90 * scale);
        beamGradR.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        beamGradR.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGradR;
        ctx.beginPath();
        ctx.arc(carW * 0.38, carH * 0.4, 90 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // HIGH-SECURITY LICENSE PLATE (Standard Indian HSRP)
      const plateW = 190 * scale;
      const plateH = 46 * scale;
      const plateY = carH * 0.15;

      // White Plate Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-plateW * 0.5, plateY, plateW, plateH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, 2.5 * scale);
      ctx.strokeRect(-plateW * 0.5, plateY, plateW, plateH);

      // Blue IND Strip on Left
      const indW = plateW * 0.12;
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-plateW * 0.5, plateY, indW, plateH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(6, Math.round(9 * scale))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('IND', -plateW * 0.5 + indW * 0.5, plateY + plateH * 0.65);

      // Plate Text (Clear, High-Contrast Crisp Characters for OCR)
      ctx.fillStyle = '#0a0a0a';
      ctx.font = `900 ${Math.max(12, Math.round(26 * scale))}px 'Roboto Mono', 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(scenario.plate, indW * 0.45, plateY + plateH * 0.72);

      ctx.restore();

      // 3. Render Adverse Weather Effects (Mist, Fog, Rain)
      if (scenario.weather === 'fog') {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        fogParticles.forEach((p) => {
          p.x = (p.x + p.speedX) % (canvas.width + 100);
          ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x - 50, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (scenario.weather === 'rain') {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
        ctx.lineWidth = 1.5;
        rainDrops.forEach((drop) => {
          drop.y = (drop.y + drop.speed) % canvas.height;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();
        });
      }

      // HUD Telemetry overlay in simulator stream
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(16, 16, 320, 60);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, 320, 60);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SIMULATED TRAFFIC: ${scenario.name.toUpperCase()}`, 24, 34);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(`SPEED: ${scenario.speed} • WEATHER: ${scenario.weather.toUpperCase()} • ${scenario.plate}`, 24, 52);

      simAnimationRef.current = requestAnimationFrame(renderSimulationFrame);
    };

    renderSimulationFrame();
    setCameraActive(true);
  };

  // Safe Lifecycle: Attempt auto-start on mount or when mode/facing changes
  useEffect(() => {
    if (feedMode === 'camera') {
      startCamera();
    } else {
      startTrafficSimulation();
    }
    return () => {
      stopCurrentStream();
    };
  }, [feedMode, facingMode]);

  // Restart simulation when scenario index changes
  useEffect(() => {
    if (feedMode === 'simulation') {
      startTrafficSimulation();
    }
  }, [activeScenarioIdx]);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (!activeStreamRef.current || feedMode === 'simulation') return;
    const track = activeStreamRef.current.getVideoTracks()[0];
    try {
      const newStatus = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: newStatus }]
      });
      setTorchOn(newStatus);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Flip front/rear camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Fast ANPR Capture & Process Frame
  const captureAndScan = useCallback(async (isAuto = false) => {
    if (isScanningFrameRef.current) return;
    
    let sourceElement = null;
    let sourceW = 0;
    let sourceH = 0;

    if (feedMode === 'simulation') {
      const simCanvas = simCanvasRef.current;
      if (simCanvas && simCanvas.width > 0) {
        sourceElement = simCanvas;
        sourceW = simCanvas.width;
        sourceH = simCanvas.height;
      }
    } else {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        sourceElement = video;
        sourceW = video.videoWidth || 640;
        sourceH = video.videoHeight || 480;
      }
    }

    const canvas = canvasRef.current;
    if (!sourceElement || !canvas || sourceW === 0 || sourceH === 0) return;

    isScanningFrameRef.current = true;
    if (!isAuto) {
      setIsProcessing(true);
    } else {
      setRealtimeStatus('ANPR analyzing frame...');
    }

    try {
      // Reticle Optical Center-Crop:
      // Cropping the central 85% width x 55% height eliminates reflections and magnifies plate characters
      const cropW = Math.round(sourceW * 0.85);
      const cropH = Math.round(sourceH * 0.55);
      const cropX = Math.round((sourceW - cropW) / 2);
      const cropY = Math.round((sourceH - cropH) / 2);

      canvas.width = cropW;
      canvas.height = cropH;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(sourceElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

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

      if (res.data.success && res.data.registration_number) {
        const reg = res.data.registration_number;
        const now = Date.now();
        const isNewDetection = (reg !== lastDetectedPlateRef.current) || (now - lastDetectedTimeRef.current > 5000);

        setLockedPlate({
          plate: reg,
          alert: res.data.alert_triggered,
          status: res.data.status
        });

        if (isNewDetection) {
          lastDetectedPlateRef.current = reg;
          lastDetectedTimeRef.current = now;
          setRealtimeStatus(`🚨 Locked: ${reg} • Stored in Registry`);
          playChime(res.data.alert_triggered);
          onScanComplete(res.data);
        } else {
          setRealtimeStatus(`Tracking: ${reg} • In Registry`);
        }
      } else {
        if (!isAuto) {
          onScanComplete(res.data);
        } else {
          setRealtimeStatus('Real-Time ANPR Active • Aiming at plate...');
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
      if (!isAuto) {
        let detail = err.response?.data?.detail;
        if (!detail) {
          const isRemoteHost = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          if (isRemoteHost && !import.meta.env.VITE_API_URL) {
            detail = 'Backend URL not configured on public host. Set VITE_API_URL in your hosting settings (e.g. Netlify) pointing to your public Render backend URL.';
          } else {
            detail = 'Network error connecting to backend. If your backend is hosted on a free tier (like Render), it may be waking up from sleep (~50s). Please wait a moment and try again.';
          }
        }
        onScanComplete({
          success: false,
          error_message: detail
        });
      }
    } finally {
      isScanningFrameRef.current = false;
      if (!isAuto) {
        setIsProcessing(false);
      }
    }
  }, [feedMode, gpsLocation, scanLocationName, onScanComplete, setIsProcessing]);

  // High-Speed Real-Time Scanning Loop (every 900ms)
  useEffect(() => {
    if (!isRealtime || !cameraActive) {
      if (realtimeTimerRef.current) {
        clearInterval(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
      return;
    }

    realtimeTimerRef.current = setInterval(() => {
      if (cameraActive && !isScanningFrameRef.current) {
        captureAndScan(true);
      }
    }, 900);

    return () => {
      if (realtimeTimerRef.current) {
        clearInterval(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, [isRealtime, cameraActive, captureAndScan]);

  // File Upload Fallback with Rock-Solid Base64 transport
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;
    e.target.value = '';

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const payload = {
            image_base64: base64Data,
            latitude: gpsLocation?.lat || 23.0225,
            longitude: gpsLocation?.lng || 72.5714,
            location_name: scanLocationName || 'Field Photo Upload',
            source_device_id: 'MOBILE_PHOTO_UPLOAD'
          };
          const res = await api.post('/scan/base64', payload);
          if (res.data.success) {
            playChime(res.data.alert_triggered);
          }
          onScanComplete(res.data);
        } catch (err) {
          console.error('File upload scan error:', err);
          onScanComplete({
            success: false,
            error_message: err.response?.data?.detail || 'Could not recognize license plate from image.'
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setIsProcessing(false);
        onScanComplete({ success: false, error_message: 'Failed to read file from device.' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsProcessing(false);
      console.error('File read error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-4">
      {/* Hidden Offscreen Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Feed Source Mode Switcher */}
      <div className="w-full flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => setFeedMode('camera')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            feedMode === 'camera'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Physical Camera / Webcam</span>
        </button>
        <button
          onClick={() => setFeedMode('simulation')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            feedMode === 'simulation'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Film className="h-4 w-4 text-cyan-400" />
          <span>Traffic Video Simulator</span>
        </button>
      </div>

      {/* Simulation Scenario Selector (when simulation mode is active) */}
      {feedMode === 'simulation' && (
        <div className="w-full p-3 bg-cyan-950/30 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Traffic Video Scenario:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-900/60 rounded text-cyan-200">
              30 FPS Stream
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            {simulationScenarios.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioIdx(i)}
                className={`p-2 rounded-xl text-left border font-mono transition-all flex items-center justify-between ${
                  activeScenarioIdx === i
                    ? 'bg-cyan-600 text-white border-cyan-400 font-bold shadow-md'
                    : 'bg-slate-900/80 text-gray-300 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="truncate">
                  <div className="text-[11px] font-bold">{sc.plate} ({sc.speed})</div>
                  <div className="text-[10px] opacity-80 truncate">{sc.weather.toUpperCase()} • {sc.status}</div>
                </div>
                {activeScenarioIdx === i && <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
        
        {/* Visible Canvas for Traffic Video Simulation */}
        <canvas
          ref={simCanvasRef}
          className={`w-full h-full object-cover absolute inset-0 z-0 ${feedMode === 'simulation' ? 'block' : 'hidden'}`}
        />

        {/* Real Live Video Feed Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
              setCameraActive(true);
            }
          }}
          onPlaying={() => setCameraActive(true)}
          className={`w-full h-full object-cover absolute inset-0 z-0 ${feedMode === 'camera' ? 'block' : 'hidden'}`}
        />

        {/* Permission Denied Notice */}
        {feedMode === 'camera' && permissionDenied && (
          <div className="p-6 text-center text-gray-300 space-y-3 z-20 max-w-xs bg-slate-950/90 rounded-2xl border border-red-500/40">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-white">Camera Access Required</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Please click the <strong>Lock (🔒)</strong> or <strong>Camera icon</strong> in your browser address bar at the top, select <strong>Allow</strong>, then tap below:
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={startCamera}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                Allow Camera & Start
              </button>
              <button
                onClick={() => setFeedMode('simulation')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all"
              >
                Switch to Traffic Video Stream
              </button>
            </div>
          </div>
        )}

        {/* Camera Inactive / Tap to Start Overlay (When Camera is not streaming yet) */}
        {feedMode === 'camera' && !cameraActive && !permissionDenied && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg animate-pulse">
              <Camera className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-sm font-bold text-white">Camera Ready to Start</h3>
              <p className="text-xs text-gray-400">
                {cameraError || 'Tap below to activate physical camera feed & real-time ANPR.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
              <button
                onClick={startCamera}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <span>START CAMERA FEED</span>
              </button>
              <button
                onClick={() => setFeedMode('simulation')}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30 flex items-center justify-center space-x-2 transition-all"
              >
                <Film className="h-4 w-4" />
                <span>TRAFFIC SIM</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Targeting Reticle HUD Overlay */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
            <div className={`relative w-full max-w-[85%] h-36 border-2 rounded-lg flex flex-col justify-between p-2 shadow-inner transition-all duration-300 ${
              lockedPlate
                ? lockedPlate.alert
                  ? 'border-red-500 bg-red-950/20 shadow-[0_0_24px_rgba(239,68,68,0.4)]'
                  : 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_24px_rgba(52,211,153,0.4)]'
                : 'border-blue-500/50 bg-blue-950/10'
            }`}>
              {/* Corner HUD Markers */}
              <div className="hud-corner hud-tl"></div>
              <div className="hud-corner hud-tr"></div>
              <div className="hud-corner hud-bl"></div>
              <div className="hud-corner hud-br"></div>

              {/* Target Reticle Header */}
              <div className="flex justify-between items-center text-[10px] font-mono tracking-wider uppercase">
                <span className="flex items-center space-x-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full animate-ping ${
                    lockedPlate ? (lockedPlate.alert ? 'bg-red-500' : 'bg-emerald-400') : 'bg-emerald-400'
                  }`}></span>
                  <span className={`font-bold ${
                    lockedPlate ? (lockedPlate.alert ? 'text-red-400' : 'text-emerald-300') : 'text-blue-400'
                  }`}>
                    {lockedPlate ? `LOCKED: ${lockedPlate.plate}` : 'ANPR SENSOR ACTIVE'}
                  </span>
                </span>
                <span className="text-gray-400">
                  {feedMode === 'simulation' ? 'SIM VIDEO' : (facingMode === 'environment' ? 'REAR' : 'FRONT')}
                </span>
              </div>

              {/* Scanning Laser Line Animation */}
              <div className={`w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38BDF8] animate-scan-line ${
                lockedPlate ? (lockedPlate.alert ? 'via-red-500 shadow-[0_0_14px_#EF4444]' : 'via-emerald-400 shadow-[0_0_14px_#10B981]') : ''
              }`}></div>

              {/* Target Reticle Footer */}
              <div className={`text-center text-[11px] font-semibold tracking-wide ${
                lockedPlate ? (lockedPlate.alert ? 'text-red-300 font-bold' : 'text-emerald-300 font-bold') : 'text-blue-300/90'
              }`}>
                {lockedPlate 
                  ? (lockedPlate.alert ? '🚨 ALERT: FLAGGED VEHICLE DETECTED' : '✅ SAVED IN VEHICLE REGISTRY')
                  : 'Align Number Plate Inside Reticle'
                }
              </div>
            </div>
          </div>
        )}

        {/* Top Floating Controls: GPS & Live Status */}
        {cameraActive && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
            {/* GPS Pill */}
            <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700/60 text-[11px] font-mono text-gray-300 flex items-center space-x-1 shadow-md">
              <Navigation className="h-3 w-3 text-emerald-400" />
              <span>
                {gpsLocation ? `${gpsLocation.lat.toFixed(3)}, ${gpsLocation.lng.toFixed(3)}` : 'GPS Active'}
              </span>
            </div>

            {/* In-Viewport Controls (Flashlight & Camera Flip / Restart) */}
            <div className="flex items-center space-x-2">
              {feedMode === 'camera' && torchSupported && (
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

              {feedMode === 'camera' && (
                <button
                  onClick={flipCamera}
                  title="Flip Camera (Front/Back)"
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-slate-700/60 text-gray-300 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}

              {feedMode === 'simulation' && (
                <button
                  onClick={startTrafficSimulation}
                  title="Restart Simulation"
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Floating Pill: Real-Time Scanning Activity */}
        {cameraActive && isRealtime && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-cyan-500/40 text-[11px] text-cyan-300 font-medium flex items-center space-x-1.5 shadow-lg z-20">
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
              <span>Rapid Real-Time ANPR (900ms)</span>
              {isRealtime && <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/30 text-emerald-300 rounded font-mono">ACTIVE</span>}
            </div>
            <div className="text-[10px] text-gray-400">Fast continuous scanning for moving vehicles & screens</div>
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
    </div>
  );
};
