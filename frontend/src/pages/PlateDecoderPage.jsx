import React, { useState } from 'react';
import { 
  Search, ShieldCheck, Sparkles, CheckCircle2, 
  AlertTriangle, ArrowRight, HelpCircle, RefreshCw, Copy, Check 
} from 'lucide-react';
import api from '../api/client';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const PlateDecoderPage = () => {
  const [inputPlate, setInputPlate] = useState('GJ-18-AB-1234');
  const [decodedData, setDecodedData] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const samplePlates = [
    { plate: 'GJ-18-AB-1234', desc: 'Gujarat Gandhinagar (Private)' },
    { plate: 'MH-12-TC-9876', desc: 'Maharashtra Pune (Commercial)' },
    { plate: '24 BH 1234 AA', desc: 'Bharat Series (All-India)' },
    { plate: 'DL-01-EV-5678', desc: 'Delhi North (Electric Vehicle)' },
    { plate: 'KA-05-MB-4567', desc: 'Karnataka Bengaluru South' },
    { plate: '77 CD 01', desc: 'Diplomatic Mission (Embassy)' },
    { plate: '↑ 22 B 123456 X', desc: 'Defence Military Forces' }
  ];

  const handleDecode = async (plateToDecode = inputPlate) => {
    const q = plateToDecode.trim();
    if (!q) return;

    setIsDecoding(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/rto/decode', { registration_number: q });
      if (res.data.success) {
        setDecodedData(res.data);
      } else {
        setDecodedData(null);
        setErrorMessage(res.data.explanation || 'Unrecognized Indian license plate format.');
      }
    } catch (err) {
      console.error('Decoder error:', err);
      setErrorMessage('Failed to connect to decoder service. Please try again.');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Run decode on initial mount
  React.useEffect(() => {
    handleDecode('GJ-18-AB-1234');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Assisted Indian Registration Format Parser</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Decode a Number Plate
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Enter any Indian vehicle registration number (Standard, Bharat Series, Diplomatic, or Military) to deconstruct its exact state, RTO district, vehicle series, and allocation batch.
          </p>
        </div>

        {/* Decoder Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDecode(inputPlate);
            }}
            className="space-y-4"
          >
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Enter Indian Vehicle Registration Number:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputPlate}
                  onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ-18-AB-1234 or 24 BH 1234 AA..."
                  className="w-full py-4 pl-4 pr-10 font-mono text-lg sm:text-xl font-black uppercase rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-blue-500 text-gray-900 dark:text-white focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isDecoding || !inputPlate.trim()}
                className="py-4 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isDecoding ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>DECODING...</span>
                  </>
                ) : (
                  <>
                    <span>DECODE PLATE</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Preset Samples */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Try Preset Format Samples:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePlates.map((sample) => (
                <button
                  key={sample.plate}
                  type="button"
                  onClick={() => {
                    setInputPlate(sample.plate);
                    handleDecode(sample.plate);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 font-mono text-xs font-bold text-gray-700 dark:text-gray-300 transition-all flex items-center space-x-1.5"
                >
                  <span>{sample.plate}</span>
                  <span className="text-[10px] text-gray-400 font-sans">({sample.desc})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold">Invalid Registration Pattern</div>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Decoded Breakdown Dossier */}
        {decodedData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 animate-fadeIn">
            
            {/* Visual Plate Mockup */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rendered Plate Visual Mockup
              </div>
              <MockNumberPlate
                registrationNumber={decodedData.normalized}
                type={decodedData.example_plate_type || 'private'}
                size="lg"
              />
            </div>

            {/* Component Pill Breakdown */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>Structure Breakdown:</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                  {decodedData.format_type}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {decodedData.components?.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-base font-black px-2.5 py-0.5 rounded-lg text-white"
                        style={{ backgroundColor: comp.highlight_color }}
                      >
                        {comp.code}
                      </span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Part {idx + 1}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-gray-900 dark:text-white pt-1">
                      {comp.label}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {comp.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* In-depth Legal / Administrative Explanation */}
            <div className="p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Administrative & Legal Context</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {decodedData.explanation}
              </p>
            </div>

            {/* Copy Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleCopy(decodedData.normalized)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 transition-all flex items-center space-x-1.5"
              >
                {copiedText ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>{copiedText ? 'Copied Breakdown!' : 'Copy Formatted Registration'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
