import React, { useState } from 'react';
import { 
  BookOpen, HelpCircle, ChevronDown, ChevronUp, 
  ShieldCheck, AlertTriangle, ExternalLink, Info, Award 
} from 'lucide-react';
import { MockNumberPlate } from '../components/plates/MockNumberPlate';

export const AboutFAQPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'What is the standard format of an Indian vehicle registration number?',
      a: 'The standard registration format consists of 4 distinct parts: (1) State/UT Code (2 letters, e.g. GJ for Gujarat), (2) RTO District Code (2 digits, e.g. 01 for Ahmedabad Central), (3) Running Batch Series (1 to 3 letters, e.g. AB), and (4) Unique Vehicle Identification Number (4 digits, e.g. 1234).'
    },
    {
      q: 'What is the Bharat Series (BH-Series) and who is eligible for it?',
      a: 'Introduced in September 2021 under MoRTH Notification G.S.R. 594(E), the BH-Series provides pan-India vehicle registration. Eligible applicants include defence personnel, Central and State Government employees, and private sector employees working in companies with physical offices in four or more States or Union Territories. BH vehicles can be moved and driven anywhere in India without needing a Non-Objection Certificate (NOC) or local re-registration.'
    },
    {
      q: 'Why do Electric Vehicles (EVs) have green number plates in India?',
      a: 'In 2018, MoRTH mandated green retro-reflective number plates for all zero-emission battery electric vehicles (BEVs). Private electric cars and two-wheelers display white characters on a green background, while commercial electric fleet vehicles display yellow characters on green. This visually separates EVs for toll exemptions, subsidized municipal charging, and priority lane access.'
    },
    {
      q: 'What is an HSRP (High Security Registration Plate) and why is it mandatory?',
      a: 'An HSRP is made of solid aluminum and features a hot-stamped chromium Ashoka Chakra hologram on the upper-left corner, an embossed "IND" identifier with blue reflective sheeting, a unique 10-digit laser-etched serial code linked to the central VAHAN portal, and non-reusable snap locks. It is mandatory under CMVR Rule 50 to eradicate car theft, cloned duplicate plates, and plate tampering.'
    },
    {
      q: 'How does military/defence vehicle registration differ from civilian plates?',
      a: 'Vehicles operated by the Indian Army, Navy, and Air Force do not follow state RTO registration. They are governed directly by the Ministry of Defence (MoD) and carry an upward-pointing arrow (known historically as the Broad Arrow) followed by a two-digit procurement year, vehicle class letter, and military base serial number. This shields logistics troop movements from tactical reconnaissance.'
    },
    {
      q: 'How does this website handle vehicle owner data and privacy?',
      a: 'This website is strictly an educational and public transport directory. In compliance with data privacy principles, it does NOT provide, store, or display vehicle owner personal data, phone numbers, home addresses, Aadhaar, PAN, or financial records. It only provides public administrative metadata regarding RTO district codes and plate styling specifications.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Official Guide & Technical Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            About Indian Vehicle Registration
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            A comprehensive reference guide on the Indian motor vehicle registration structure, Central Motor Vehicles Rules (CMVR), HSRP mandates, and regional transport offices.
          </p>
        </div>

        {/* Section 1: Detailed Format Anatomy */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>Structure of Indian Vehicle Numbers</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            All motor vehicles registered in India under the Motor Vehicles Act, 1988 follow an alphanumeric code assigned by the Regional Transport Office (RTO) of the district in which the owner resides or the vehicle is principally kept.
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
            <MockNumberPlate registrationNumber="MH-12-AB-1234" type="private" size="lg" />
            <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
              Format: [STATE CODE] – [RTO CODE] – [SERIES] – [UNIQUE NUMBER]
            </div>
          </div>

          <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <strong className="text-gray-900 dark:text-white">1. State Code (MH): </strong>
              Identifies the State of Maharashtra. Every State and Union Territory has an official two-letter ISO 3166-2:IN code.
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <strong className="text-gray-900 dark:text-white">2. RTO Office Code (12): </strong>
              Identifies the Pune Regional Transport Office. Each RTO in the state has a unique sequential number from 01 upwards.
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <strong className="text-gray-900 dark:text-white">3. Series Identifier (AB): </strong>
              Running alphabetical sequence allocated in that district once previous batches are exhausted. May be one, two, or three letters.
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <strong className="text-gray-900 dark:text-white">4. Unique Serial (1234): </strong>
              Unique 4-digit number assigned to the specific vehicle from 0001 to 9999.
            </div>
          </div>
        </div>

        {/* Section 2: FAQ Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
            <HelpCircle className="h-6 w-6 text-blue-500" />
            <span>Frequently Asked Questions (FAQ)</span>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 bg-gray-50 dark:bg-slate-800/60 text-left font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="p-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legal & Compliance Notice */}
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>Authoritative Disclaimer & Legal Notice</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            "RTO codes and registration rules may change. Always verify registration details with the relevant official transport authority before relying on them for legal or official purposes."
          </p>
          <div className="pt-2">
            <a
              href="https://parivahan.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-100 underline"
            >
              <span>Visit Ministry of Road Transport and Highways (MoRTH) Portal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
