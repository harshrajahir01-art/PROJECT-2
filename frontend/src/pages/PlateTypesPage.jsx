import React, { useState } from 'react';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';
import { 
  ShieldCheck, Info, CheckCircle2, AlertTriangle, 
  Car, Zap, Award, Globe, Clock, ShieldAlert, Sparkles 
} from 'lucide-react';

export const PlateTypesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const plateTypes = [
    {
      id: 'private',
      category: 'Civilian',
      name: 'Private / Personal Vehicle',
      type: 'private',
      example: 'GJ-01-AB-1234',
      bgDescription: 'Pure White reflective background',
      textDescription: 'Solid Black embossed characters',
      eligibility: 'Privately owned passenger cars, two-wheelers (scooters/motorcycles), and personal SUVs.',
      legalRules: 'Governed by CMVR Rule 50. Cannot be used for hire, reward, passenger ferrying for money, or commercial haulage. Lifelong road tax (15 years) paid at registration.',
      hsrpFeature: 'Chromium-based IND hot-stamped hologram on top-left, blue reflective strip, laser-etched 10-digit PIN.'
    },
    {
      id: 'commercial',
      category: 'Commercial',
      name: 'Commercial / Transport Vehicle',
      type: 'commercial',
      example: 'MH-12-TC-9876',
      bgDescription: 'Vibrant Yellow reflective background',
      textDescription: 'Solid Black embossed characters',
      eligibility: 'Taxis, auto-rickshaws, city/interstate buses, freight trucks, delivery tempos, and commercial fleets.',
      legalRules: 'Driver must possess a commercial transport endorsement badge. Vehicles require fitness certificates every 1-2 years, commercial state/national permits, and front/rear retro-reflective safety tapes.',
      hsrpFeature: 'Yellow reflective background with standard blue IND strip and laser authentication mark.'
    },
    {
      id: 'ev_private',
      category: 'Electric',
      name: 'Electric Vehicle (Private / Personal)',
      type: 'ev_private',
      example: 'DL-01-EV-5678',
      bgDescription: 'Vivid Lush Green retro-reflective background',
      textDescription: 'White embossed alphanumeric characters',
      eligibility: 'Zero-emission battery-electric personal cars, electric scooters (Ather, Ola), and personal electric SUVs.',
      legalRules: 'Introduced by the Ministry of Road Transport and Highways (MoRTH) in 2018 to facilitate toll exemptions, preferential municipal green parking spots, and state EV subsidy verifications.',
      hsrpFeature: 'Green retro-reflective surface meeting ISO standards with standard blue IND band.'
    },
    {
      id: 'ev_commercial',
      category: 'Electric',
      name: 'Electric Vehicle (Commercial / Fleet)',
      type: 'ev_commercial',
      example: 'KA-01-ET-2468',
      bgDescription: 'Vivid Lush Green retro-reflective background',
      textDescription: 'Bright Yellow embossed characters',
      eligibility: 'Commercial electric cabs (BluSmart, EV Ola/Uber), electric public city buses, and electric cargo 3-wheelers.',
      legalRules: 'Combines the green environmental identifier with commercial yellow text. Subject to commercial transport permits and fitness rules while enjoying EV road-tax exemptions in most states.',
      hsrpFeature: 'Green reflective plate with high-contrast yellow lettering and IND band.'
    },
    {
      id: 'diplomatic',
      category: 'Special',
      name: 'Diplomatic & Foreign Mission Vehicle',
      type: 'diplomatic',
      example: '77 CD 01',
      bgDescription: 'Sky Blue / Light Blue background',
      textDescription: 'Embossed White characters',
      eligibility: 'Foreign Embassy Ambassadors, High Commissions, Consular Corps, and United Nations (UN) accredited diplomatic staff.',
      legalRules: 'Prefix number denotes the accredited country mission (e.g. 77 denotes a specific embassy). Letters signify status: CD = Corps Diplomatique (Embassy), CC = Corps Consulaire (Consulate), UN = United Nations agency. Diplomatic immunity under the Vienna Convention applies.',
      hsrpFeature: 'Specially authorized by the Ministry of External Affairs (MEA), Government of India.'
    },
    {
      id: 'bh_series',
      category: 'Special',
      name: 'Bharat Series (BH Series)',
      type: 'bh_series',
      example: '24 BH 1234 AA',
      bgDescription: 'Pure White background with standard IND strip',
      textDescription: 'Black embossed characters',
      eligibility: 'Defence personnel, Central & State Government officers, PSUs, and private sector employees having offices in 4 or more Indian States or Union Territories.',
      legalRules: 'Format: [YY BH #### XX] (Year + BH + 4 digits + series). Eliminates the need to transfer vehicle registration or pay double road tax when relocated to another state. Tax is paid biennially (every 2 years) or in multiples of two.',
      hsrpFeature: 'Nationwide single registration valid across all 36 Indian states and Union Territories.'
    },
    {
      id: 'government',
      category: 'Special',
      name: 'Government & Constitutional Official',
      type: 'government',
      example: 'GJ-18-G-0001',
      bgDescription: 'White background with State/National Crest',
      textDescription: 'Black characters (often featuring designated G series)',
      eligibility: 'Official vehicles of Chief Ministers, Cabinet Ministers, District Collectors (DM/DC), Judges, and State Transport Department leaders.',
      legalRules: 'The President of India and State Governors historically displayed the State Emblem of India (Ashoka Stambh) without registration numbers; modern protocols mandate standard registration plates with designated official series (e.g. G / GOVT). Red and blue beacons are strictly restricted under Supreme Court rulings.',
      hsrpFeature: 'Authorized state government administrative series with tamper-proof security locks.'
    },
    {
      id: 'temporary',
      category: 'Transit',
      name: 'Temporary Registration',
      type: 'temporary',
      example: 'GJ-TEMP-2024-1234',
      bgDescription: 'Yellow background (or Red background)',
      textDescription: 'Bold Red characters (or White characters on Red)',
      eligibility: 'Brand new vehicles driven from the dealer showroom in transit to the permanent RTO registration jurisdiction.',
      legalRules: 'Issued under Section 43 of the Motor Vehicles Act. Valid for a maximum duration of one month (30 days). Driving a vehicle with an expired temporary plate attracts heavy penal fines and vehicle impoundment.',
      hsrpFeature: 'Printed sticker or temporary sheet with dealership endorsement.'
    },
    {
      id: 'defence',
      category: 'Military',
      name: 'Defence & Military Vehicle',
      type: 'defence',
      example: '↑ 22 B 123456 X',
      bgDescription: 'Pitch Black / Olive Matte background',
      textDescription: 'Embossed White characters',
      eligibility: 'Indian Army, Indian Navy, Indian Air Force, and Defence Logistics Corps operational and support vehicles.',
      legalRules: 'Administered directly by the Ministry of Defence (MoD). Uses a prominent upward arrow (Broad Arrow, a military heraldic mark) as the first character to prevent operational intelligence and logistics troop movement tracking by adversaries.',
      hsrpFeature: 'Format: [↑ YY Class Serial Checksum]. Two digits denote procurement year, letter denotes vehicle class (B = Car/Jeep, C = Lorry, etc.).'
    }
  ];

  const filteredPlates = activeCategory === 'all'
    ? plateTypes
    : plateTypes.filter((p) => p.category === activeCategory);

  const categories = ['all', 'Civilian', 'Commercial', 'Electric', 'Special', 'Transit', 'Military'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ministry of Road Transport and Highways (MoRTH) Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Indian Vehicle Number Plate Types & Colors
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            In India, the color and format of a vehicle license plate indicates its legal classification, fuel category, and operational permissions. Learn the legal rules, HSRP requirements, and meaning behind every plate style.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Plate Types' : cat}
            </button>
          ))}
        </div>

        {/* Plate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlates.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Plate Mockup Display Area */}
                <div className="p-6 bg-slate-100/70 dark:bg-slate-950/60 border-b border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[140px]">
                  <MockNumberPlate
                    registrationNumber={item.example}
                    type={item.type}
                    size="md"
                  />
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      <span>{item.bgDescription}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300">Permitted Vehicles: </span>
                      <span className="text-gray-600 dark:text-gray-400">{item.eligibility}</span>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300">Legal & Tax Framework: </span>
                      <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.legalRules}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                      <div className="font-bold text-gray-900 dark:text-gray-200 text-[11px] mb-1">
                        HSRP & Security Features:
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.hsrpFeature}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between font-mono">
                <span>Format: {item.example}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified MoRTH</span>
              </div>
            </div>
          ))}
        </div>

        {/* High Security Registration Plate (HSRP) Mandate Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900/20 via-slate-900 to-indigo-950/20 border border-blue-500/20 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                What is an HSRP (High Security Registration Plate)?
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Mandatory for all motor vehicles in India under Rule 50 of the Central Motor Vehicles Rules (CMVR).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-gray-300">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white text-sm">1. Chromium Ashoka Hologram</div>
              <p className="leading-relaxed">
                Hot-stamped 20mm x 20mm blue chromium hologram displaying the Ashoka Chakra on the top left corner. Impossible to duplicate with standard foil.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white text-sm">2. Laser-Etched 10-Digit PIN</div>
              <p className="leading-relaxed">
                A permanent non-removable laser serial code linked directly with the National VAHAN database, binding the plate to the chassis number.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white text-sm">3. Non-Reusable Snap Locks</div>
              <p className="leading-relaxed">
                Plates are fixed using snap locks that cannot be unscrewed or removed without completely destroying the plate, preventing theft and illegal swapping.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
