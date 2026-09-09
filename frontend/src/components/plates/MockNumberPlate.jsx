import React from 'react';

/**
 * Realistic CSS/HTML Indian High Security Registration Plate (HSRP) Mockup
 */
export const MockNumberPlate = ({
  registrationNumber = 'GJ-01-AB-1234',
  type = 'private', // 'private', 'commercial', 'ev_private', 'ev_commercial', 'diplomatic', 'temporary', 'bh_series', 'defence', 'government'
  size = 'md', // 'sm', 'md', 'lg'
  showWatermark = true,
  className = ''
}) => {
  // Styles by Plate Category
  const typeConfig = {
    private: {
      bg: 'bg-white',
      border: 'border-slate-800',
      text: 'text-slate-950',
      showInd: true,
      indBg: 'bg-blue-700',
      label: 'Private Vehicle'
    },
    commercial: {
      bg: 'bg-amber-300',
      border: 'border-amber-700',
      text: 'text-slate-950',
      showInd: true,
      indBg: 'bg-blue-700',
      label: 'Commercial Transport'
    },
    ev_private: {
      bg: 'bg-emerald-700',
      border: 'border-emerald-950',
      text: 'text-white',
      showInd: true,
      indBg: 'bg-blue-700',
      label: 'Personal Electric (EV)'
    },
    ev_commercial: {
      bg: 'bg-emerald-700',
      border: 'border-emerald-950',
      text: 'text-yellow-300',
      showInd: true,
      indBg: 'bg-blue-700',
      label: 'Commercial Electric (EV)'
    },
    diplomatic: {
      bg: 'bg-sky-600',
      border: 'border-sky-900',
      text: 'text-white',
      showInd: false,
      indBg: 'bg-sky-800',
      label: 'Diplomatic Mission'
    },
    temporary: {
      bg: 'bg-yellow-200',
      border: 'border-red-500',
      text: 'text-red-600',
      showInd: false,
      indBg: 'bg-yellow-400',
      label: 'Temporary Permit'
    },
    bh_series: {
      bg: 'bg-white',
      border: 'border-slate-800',
      text: 'text-slate-950',
      showInd: true,
      indBg: 'bg-blue-700',
      label: 'Bharat Series (BH)'
    },
    defence: {
      bg: 'bg-slate-950',
      border: 'border-slate-700',
      text: 'text-white',
      showInd: false,
      indBg: 'bg-slate-800',
      label: 'Defence Military'
    },
    government: {
      bg: 'bg-white',
      border: 'border-slate-800',
      text: 'text-slate-950',
      showInd: true,
      indBg: 'bg-blue-700',
      label: 'Government Official'
    }
  };

  const config = typeConfig[type] || typeConfig.private;

  // Sizing definitions
  const sizeStyles = {
    sm: {
      wrapper: 'w-48 h-10 text-xs px-1',
      indWidth: 'w-6',
      indText: 'text-[7px]',
      plateText: 'text-xs tracking-wider',
      watermark: 'text-[6px]'
    },
    md: {
      wrapper: 'w-72 h-14 text-base px-2',
      indWidth: 'w-8',
      indText: 'text-[9px]',
      plateText: 'text-lg tracking-widest',
      watermark: 'text-[7px]'
    },
    lg: {
      wrapper: 'w-96 h-20 text-2xl px-3',
      indWidth: 'w-11',
      indText: 'text-xs',
      plateText: 'text-2xl tracking-widest',
      watermark: 'text-[9px]'
    }
  }[size] || sizeStyles.md;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Plate Physical Shell */}
      <div
        className={`relative ${sizeStyles.wrapper} ${config.bg} rounded-lg border-2 ${config.border} shadow-md flex items-center overflow-hidden transition-transform duration-200 hover:scale-[1.02]`}
        style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.25)'
        }}
      >
        {/* Blue IND Strip (left side) */}
        {config.showInd && (
          <div className={`${sizeStyles.indWidth} h-full ${config.indBg} flex flex-col items-center justify-between py-1 border-r border-blue-900/40 text-white font-bold`}>
            {/* Ashoka Chakra vector representation */}
            <div className="w-2.5 h-2.5 rounded-full border border-yellow-400 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
            </div>
            <span className={`${sizeStyles.indText} font-black tracking-tighter leading-none`}>IND</span>
          </div>
        )}

        {/* Embossed Registration Text */}
        <div className="flex-1 flex items-center justify-center font-mono font-black">
          <span
            className={`${sizeStyles.plateText} ${config.text} font-black drop-shadow-sm uppercase whitespace-nowrap`}
            style={{
              letterSpacing: '0.12em',
              textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.15)'
            }}
          >
            {registrationNumber}
          </span>
        </div>

        {/* Security Hologram Tag (Top right corner on real plates) */}
        <div className="absolute top-1 right-1.5 w-2 h-2 rounded-sm bg-gradient-to-tr from-yellow-300 via-emerald-300 to-blue-300 opacity-60 border border-slate-400"></div>
      </div>

      {/* Educational Sample Watermark Notice */}
      {showWatermark && (
        <span className={`mt-1 font-mono font-semibold ${sizeStyles.watermark} text-gray-500 dark:text-gray-400 tracking-wider text-center uppercase`}>
          DEMO / SAMPLE — NOT A REAL REGISTRATION
        </span>
      )}
    </div>
  );
};
