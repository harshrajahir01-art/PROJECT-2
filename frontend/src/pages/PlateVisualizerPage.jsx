import React, { useState, useEffect } from 'react';
import { 
  Palette, Download, Copy, Check, Sparkles, 
  RefreshCw, ShieldAlert, Sliders, Eye 
} from 'lucide-react';
import api from '../api/client';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const PlateVisualizerPage = () => {
  const [states, setStates] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState('GJ');
  const [rtoOffices, setRtoOffices] = useState([]);
  const [selectedRtoCode, setSelectedRtoCode] = useState('01');
  const [series, setSeries] = useState('AB');
  const [vehicleNumber, setVehicleNumber] = useState('1234');
  const [plateCategory, setPlateCategory] = useState('private');
  const [plateSize, setPlateSize] = useState('lg');
  const [copied, setCopied] = useState(false);

  // Load States list
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

  // When state changes, fetch its RTO offices
  useEffect(() => {
    const fetchRtos = async () => {
      try {
        const res = await api.get(`/rto/states/${selectedStateCode}`);
        const offices = res.data?.rto_offices || [];
        setRtoOffices(offices);
        if (offices.length > 0) {
          const firstCode = offices[0].rto_code.split('-')[1] || '01';
          setSelectedRtoCode(firstCode);
        }
      } catch (err) {
        console.warn('RTOs error:', err);
      }
    };
    if (selectedStateCode && selectedStateCode !== 'BH') {
      fetchRtos();
    }
  }, [selectedStateCode]);

  // Construct current formatted registration string
  const formattedPlate = React.useMemo(() => {
    if (plateCategory === 'bh_series') {
      return `24 BH ${vehicleNumber.padStart(4, '0')} ${series}`;
    }
    if (plateCategory === 'diplomatic') {
      return `77 CD ${vehicleNumber}`;
    }
    if (plateCategory === 'defence') {
      return `↑ 22 B ${vehicleNumber.padStart(6, '0')} X`;
    }
    return `${selectedStateCode}-${selectedRtoCode}-${series}-${vehicleNumber.padStart(4, '0')}`;
  }, [selectedStateCode, selectedRtoCode, series, vehicleNumber, plateCategory]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(formattedPlate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const plateTypeOptions = [
    { key: 'private', label: 'Private / Personal (White / Black)', desc: 'Personal cars & bikes' },
    { key: 'commercial', label: 'Commercial / Taxi (Yellow / Black)', desc: 'Cabs, trucks & buses' },
    { key: 'ev_private', label: 'Electric Vehicle Personal (Green / White)', desc: 'Private battery EVs' },
    { key: 'ev_commercial', label: 'Electric Vehicle Fleet (Green / Yellow)', desc: 'Commercial EV fleets' },
    { key: 'bh_series', label: 'Bharat Series (White / Black BH)', desc: 'Pan-India transferable' },
    { key: 'diplomatic', label: 'Diplomatic Mission (Blue / White)', desc: 'Foreign Embassy / UN' },
    { key: 'temporary', label: 'Temporary Permit (Yellow / Red)', desc: 'Showroom transit' },
    { key: 'defence', label: 'Defence Armed Forces (Black / Arrow)', desc: 'Military vehicles' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold">
            <Palette className="h-3.5 w-3.5" />
            <span>Interactive Educational Plate Mockup Generator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Number Plate Visualizer & Generator
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Design realistic fictional Indian High Security Registration Plate (HSRP) mockups for educational demonstrations, presentations, and technical documentation.
          </p>
        </div>

        {/* Live Plate Preview Display Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center space-y-6">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            LIVE MOCKUP CANVAS
          </div>

          <div className="py-6 flex items-center justify-center w-full overflow-x-auto">
            <MockNumberPlate
              registrationNumber={formattedPlate}
              type={plateCategory}
              size={plateSize}
              showWatermark={true}
            />
          </div>

          {/* Size Selectors & Copy Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 w-full">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              {['sm', 'md', 'lg'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlateSize(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    plateSize === s
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-gray-200 dark:border-slate-700"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied Number!' : 'Copy Plate Text'}</span>
            </button>
          </div>
        </div>

        {/* Customization Controls Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-blue-500" />
            <span>Customize Plate Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Plate Category */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                Vehicle Plate Classification:
              </label>
              <select
                value={plateCategory}
                onChange={(e) => setPlateCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              >
                {plateTypeOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                State / UT Prefix:
              </label>
              <select
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
                disabled={['bh_series', 'diplomatic', 'defence'].includes(plateCategory)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                {states.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            {/* RTO Office Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                RTO District Office:
              </label>
              <select
                value={selectedRtoCode}
                onChange={(e) => setSelectedRtoCode(e.target.value)}
                disabled={['bh_series', 'diplomatic', 'defence'].includes(plateCategory)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                {rtoOffices.map((r) => {
                  const codePart = r.rto_code.split('-')[1] || r.rto_code;
                  return (
                    <option key={r.rto_code} value={codePart}>
                      {r.rto_code} — {r.city}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Batch Series */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                Vehicle Series (1-2 letters):
              </label>
              <input
                type="text"
                maxLength={3}
                value={series}
                onChange={(e) => setSeries(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Vehicle 4-digit Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                Vehicle Identification Number:
              </label>
              <input
                type="text"
                maxLength={4}
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Educational Safety Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <div className="font-bold">Strict Educational Use Only</div>
              <p className="leading-relaxed">
                Generated plates are computer-generated simulations created purely for educational, illustrative, and user-interface testing purposes. They do NOT represent legitimate road permits and must never be physically fabricated or affixed to any motor vehicle.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
