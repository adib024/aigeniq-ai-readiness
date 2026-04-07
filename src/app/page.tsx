'use client';

import { Sector, SECTOR_LABELS } from '../types';
import { useRouter } from 'next/navigation';


export default function HomePage() {
  const router = useRouter();

  const handleSelection = (sector: Sector) => {
    router.push(`/assessment/${sector}`);
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Side Branding - Identical to Mockup */}
      <div className="side-branding">
        <div className="vertical-logo">AiGENiQ</div>
      </div>

      {/* Hero Block - Identical to Mockup */}
      <div className="hero-block">
        <h1 className="hero-text">
          EVALUATE<br />YOUR AI<br />READINESS
        </h1>
      </div>

      {/* Content Grid - Identical to Mockup logic */}
      <div className="content-grid">
        {(Object.entries(SECTOR_LABELS) as [Sector, string][]).map(([key, label], index) => (
          <button
            key={key}
            onClick={() => handleSelection(key)}
            className="sector-btn group"
          >
            <span className="sector-lbl">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <h2 className="sector-name">
              {renderSectorName(label)}
            </h2>
          </button>
        ))}
      </div>

      {/* Footer - Identical to Mockup */}
      <footer className="ml-[140px] p-10 font-mono text-[11px] text-[var(--cyan)] uppercase">
        [ AiGENiQ READINESS PLATFORM ]
      </footer>
    </main>
  );
}

// Helper to match mockup line breaks exactly
function renderSectorName(label: string) {
  const parts = label.split(' ');
  if (parts.length >= 2) {
    if (label === 'Tech & Software') return <>{parts[0]} &<br />{parts[2]}</>;
    if (label === 'Trade & Field') return <>{parts[0]} &<br />{parts[2]}</>;
    if (label === 'Retail & Hospitality') return <>{parts[0]} &<br />{parts[2]}</>;
    if (label === 'Health & Wellbeing') return <>{parts[0]} &<br />{parts[2]}</>;
    return <>{parts[0]}<br />{parts[1]}</>;
  }
  return label;
}
