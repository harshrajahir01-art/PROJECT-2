import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Compass, ShieldCheck, Cpu, 
  ExternalLink, ArrowRight, BookOpen, Layers, CheckCircle2,
  HelpCircle, AlertTriangle, Eye, Sparkles, Copy, Check
} from 'lucide-react';
import api from '../api/client';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [stats, setStats] = useState({
    total_states: 28,
    total_union_territories: 8,
    total_rtos: 600,
    total_plate_types: 9
  });

  const searchBoxRef = useRef(null);

  // Fetch National RTO Statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/rto/stats');
        if (res.data) setStats(res.data);
      } catch (err) {
        console.warn('Stats load error:', err);
      }
    };
    loadStats();
  }, []);

  // Universal Live Search with Debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/rto/search?q=${encodeURIComponent(q)}`);
        setSearchResults(res.data || []);
        setSearchDropdownOpen(true);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectResult = (item) => {
    setSearchDropdownOpen(false);
    if (item.match_type === 'STATE') {
      navigate(`/states?code=${item.code}`);
    } else {
      navigate(`/rto-directory?search=${item.code}`);
    }
  };

  const popularSearches = [
    { label: 'GJ-01', sub: 'Ahmedabad' },
    { label: 'GJ-18', sub: 'Gandhinagar' },
    { label: 'MH-12', sub: 'Pune' },
    { label: 'DL-01', sub: 'Delhi Central' },
    { label: 'KA-01', sub: 'Bengaluru' },
    { label: '24 BH', sub: 'Bharat Series' },
    { label: 'RJ-14', sub: 'Jaipur' },
    { label: 'TN-01', sub: 'Chennai' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* Top Authoritative Legal Disclaimer Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white text-xs py-2.5 px-4 border-b border-blue-800/60 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 bg-blue-500 text-[10px] font-black rounded uppercase tracking-wider">OFFICIAL GUIDE</span>
            <span className="text-blue-200 font-medium">
              RTO codes and registration rules may change. Always verify registration details with the relevant official transport authority before relying on them for legal purposes.
            </span>
          </div>
          <a
            href="https://parivahan.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-300 hover:text-white font-bold underline transition-colors whitespace-nowrap"
          >
            <span>Parivahan Sewa (MoRTH)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-slate-800/80">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold tracking-wide shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Comprehensive Indian Transport Database • MoRTH Standard</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Indian Vehicle Number Plate Explorer
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Discover Indian vehicle registration codes, RTO numbers, districts, and number plate types.
              Search by state, RTO prefix, district city, or decode any registration format instantly.
            </p>
          </div>

          {/* Universal Search Bar */}
          <div ref={searchBoxRef} className="max-w-2xl mx-auto relative">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/40 focus-within:border-blue-500 transition-all">
              <div className="pl-4 text-blue-600 dark:text-blue-400">
                <Search className="h-6 w-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setSearchDropdownOpen(true); }}
                placeholder="Search state, district, RTO code (e.g. GJ-01, Ahmedabad, MH-12)..."
                className="w-full py-4 pl-3 pr-12 text-sm sm:text-base bg-transparent rounded-2xl focus:outline-none text-gray-900 dark:text-white font-medium"
              />
              {isSearching && (
                <div className="pr-4">
                  <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {searchDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto text-left divide-y divide-gray-100 dark:divide-slate-800">
                {searchResults.map((item, idx) => (
                  <div
                    key={`${item.code}-${idx}`}
                    onClick={() => handleSelectResult(item)}
                    className="p-3.5 hover:bg-blue-50 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl text-xs font-black font-mono ${
                        item.match_type === 'STATE'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {item.code}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.code);
                        }}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Copy Code"
                      >
                        {copiedCode === item.code ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">Popular Searches:</span>
            {popularSearches.map((tag) => (
              <button
                key={tag.label}
                onClick={() => setSearchQuery(tag.label)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 font-mono font-bold transition-all shadow-sm"
              >
                <span>{tag.label}</span>
                <span className="text-gray-400 dark:text-gray-500 ml-1 font-sans font-normal">({tag.sub})</span>
              </button>
            ))}
          </div>

          {/* Live National Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {stats.total_states}
              </div>
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">Indian States</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {stats.total_union_territories}
              </div>
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">Union Territories</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {stats.total_rtos}+
              </div>
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">RTO District Offices</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {stats.total_plate_types}
              </div>
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">Plate Categories</div>
            </div>
          </div>

        </div>
      </section>

      {/* Quick Cards Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link
            to="/states"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
              All States & UTs
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Explore all 28 Indian States and 8 Union Territories. View their official 2-letter registration prefixes, capitals, and total RTO counts.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Browse 36 Jurisdictions</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/plate-types"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚗</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Number Plate Types
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Understand the meaning of white, yellow, green, blue, and black plates. Visual mockups for private, commercial, EV, diplomatic, and defence plates.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>View Plate Specifications</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/rto-directory"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              RTO Directory
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Complete searchable directory of 600+ RTO codes across India. Filter by state, search district names, sort, and copy codes in 1-click.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Search RTO Directory</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/decoder"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔎</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
              Number Plate Decoder
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Decode any vehicle plate (e.g. GJ-18-AB-1234, 24 BH 1234 AA) to break it down into State, RTO Office, Batch Series, and Vehicle Number.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Decode a Number Plate</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/visualizer"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-sky-500 transition-colors">
              Plate Visualizer
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Interactive educational generator. Select your State, RTO, and vehicle type to render a realistic sample HSRP number plate mockup.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-sky-600 dark:text-sky-400">
              <span>Generate Sample Plate</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/scan"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 shadow-md hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
              AI Camera & Photo Scanner
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Real-time ANPR OCR scanner. Upload photos or use live camera feed to recognize license plates and automatically record into the registry.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-red-600 dark:text-red-400">
              <span>Launch Live Scanner</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* Interactive Number Plate Format Anatomy */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-200 dark:border-slate-800/80">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Anatomy of an Indian Vehicle Registration Number
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Standard Indian vehicle registration follows a strict 4-part hierarchical structure governed by Rule 50 of the Central Motor Vehicles Rules (CMVR).
          </p>
        </div>

        {/* Visual Plate Mockup and Explanations */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-8">
          
          <div className="flex flex-col items-center justify-center">
            <MockNumberPlate
              registrationNumber="GJ-01-AB-1234"
              type="private"
              size="lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
              <div className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">GJ</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">1. State / UT Code</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Two-letter alphabetical prefix identifying the State or Union Territory where the vehicle is registered (e.g. GJ = Gujarat, MH = Maharashtra).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <div className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">01</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">2. RTO District Code</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Two-digit sequential number designating the specific Regional Transport Office / District (e.g. 01 = Ahmedabad, 18 = Gandhinagar, 05 = Surat).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <div className="font-mono text-xl font-black text-purple-600 dark:text-purple-400">AB</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">3. Vehicle Series</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                One to three letters identifying the running batch series in that district. Increments alphabetically from A to ZZ as numbers are exhausted.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
              <div className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">1234</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">4. Unique Vehicle ID</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                A four-digit unique number (0001 to 9999) issued to the specific vehicle. Leading zeros are maintained on official HSRP plates.
              </p>
            </div>

          </div>

          {/* Bharat Series Highlight */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                BHARAT SERIES (BH)
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Pan-India Transferable Registration: 24 BH 1234 AA
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
                Introduced in September 2021 by MoRTH. Allows government and eligible multi-state private employees to relocate across India without re-registering vehicles or seeking NOCs.
              </p>
            </div>
            <Link
              to="/plate-types"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all whitespace-nowrap"
            >
              Explore BH Series Guide
            </Link>
          </div>

        </div>
      </section>

      {/* Safety & Educational Privacy Commitment */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-200 dark:border-slate-800/80">
        <div className="p-6 rounded-2xl bg-gray-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              Data Privacy & Educational Safety Notice
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This portal is an educational public directory of Indian administrative RTO district codes and plate specifications.
              It does NOT expose personal vehicle owner details, phone numbers, residential addresses, Aadhaar, PAN, or private financial records.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
