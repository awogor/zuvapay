'use client';

import React from 'react';

export function FeaturedOn() {
  return (
    <section className="py-10 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-[#6366F1] mb-8 font-mono">
          FEATURED ON
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20">
          {/* 1. PUNCH */}
          <div className="h-8 flex items-center hover:opacity-100 opacity-90 transition-all hover:scale-105 duration-200">
            <svg
              className="h-7 w-auto"
              viewBox="0 0 115 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="The Punch Newspaper"
            >
              {/* Top Accent Bar: Orange, Yellow, Green */}
              <rect x="2" y="1" width="34" height="3" rx="1.5" fill="#FF6A00" />
              <rect x="40" y="1" width="34" height="3" rx="1.5" fill="#E2E600" />
              <rect x="78" y="1" width="34" height="3" rx="1.5" fill="#75C800" />
              {/* PUNCH Bold Serif/Display Letters */}
              <text
                x="2"
                y="27"
                fill="#E20000"
                fontFamily="'Arial Black', 'Impact', sans-serif"
                fontWeight="900"
                fontSize="24"
                letterSpacing="0.5"
              >
                PUNCH
              </text>
            </svg>
          </div>

          {/* 2. techcabal */}
          <div className="h-8 flex items-center hover:opacity-100 opacity-90 transition-all hover:scale-105 duration-200">
            <svg
              className="h-7 w-auto"
              viewBox="0 0 148 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="TechCabal"
            >
              {/* Rounded Square with 'tc' */}
              <rect x="1" y="2" width="28" height="28" rx="6" fill="#EA3A19" />
              <text
                x="6"
                y="21.5"
                fill="#FFFFFF"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontWeight="900"
                fontSize="15"
                letterSpacing="-0.5"
              >
                tc
              </text>
              {/* 'techcabal' wordmark */}
              <text
                x="37"
                y="22"
                fill="#EA3A19"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontWeight="800"
                fontSize="18"
                letterSpacing="-0.3"
              >
                techcabal
              </text>
            </svg>
          </div>

          {/* 3. pulse.ng */}
          <div className="h-8 flex items-center hover:opacity-100 opacity-90 transition-all hover:scale-105 duration-200">
            <svg
              className="h-7 w-auto"
              viewBox="0 0 115 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Pulse.ng"
            >
              {/* Heartbeat circle p */}
              <circle cx="16" cy="18" r="11" fill="none" stroke="#7A1D1D" strokeWidth="2.8" />
              <path
                d="M5 18 h6 l2.5 -6 l3 12 l3 -9 l2 3 h4"
                fill="none"
                stroke="#7A1D1D"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M11 7 v22" stroke="#7A1D1D" strokeWidth="2.8" strokeLinecap="round" />
              {/* 'ulse' in dark red */}
              <text
                x="29"
                y="24"
                fill="#7A1D1D"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontWeight="900"
                fontSize="22"
                letterSpacing="-0.8"
              >
                ulse
              </text>
              {/* '.ng' sub-label */}
              <text
                x="82"
                y="33"
                fill="#7A1D1D"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontWeight="800"
                fontSize="10"
              >
                .ng
              </text>
            </svg>
          </div>

          {/* 4. Vanguard */}
          <div className="h-8 flex items-center hover:opacity-100 opacity-90 transition-all hover:scale-105 duration-200">
            <svg
              className="h-7 w-auto"
              viewBox="0 0 135 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Vanguard News"
            >
              <text
                x="1"
                y="24"
                fill="#E20000"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontStyle="italic"
                fontWeight="900"
                fontSize="25"
                letterSpacing="-0.5"
              >
                Vanguard
              </text>
            </svg>
          </div>

          {/* 5. Techpoint Africa */}
          <div className="h-8 flex items-center hover:opacity-100 opacity-90 transition-all hover:scale-105 duration-200">
            <svg
              className="h-7 w-auto"
              viewBox="0 0 140 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Techpoint Africa"
            >
              {/* Target / Radar Icon with antenna dot */}
              <circle cx="13" cy="16" r="9" fill="none" stroke="#0284C7" strokeWidth="2.8" />
              <circle cx="13" cy="16" r="3.2" fill="#0284C7" />
              <path d="M7 10 l-3.5 -3.5" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" />
              {/* 'Techpoint' wordmark */}
              <text
                x="28"
                y="21"
                fill="#1E293B"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontWeight="800"
                fontSize="17"
                letterSpacing="-0.4"
              >
                Techpoint
              </text>
              {/* '.africa' wordmark */}
              <text
                x="90"
                y="29"
                fill="#0284C7"
                fontFamily="'Inter', -apple-system, sans-serif"
                fontWeight="700"
                fontSize="8.5"
                letterSpacing="0.2"
              >
                .africa
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}