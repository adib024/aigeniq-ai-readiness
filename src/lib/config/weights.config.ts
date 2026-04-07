// lib/config/weights.config.ts
// Sector weight profiles — LOCKED AND VALIDATED
// Source: AiGENiQ_Build_Instructions.docx §7
// Do NOT adjust these values. Total for every sector must equal exactly 1.0.

import { DimensionId, Sector } from '../../types';

type WeightProfile = Record<DimensionId, number>;

export const sectorWeights: Record<Sector | 'base', WeightProfile> = {
  base:                   { D1: 0.18, D2: 0.16, D3: 0.14, D4: 0.14, D5: 0.13, D6: 0.12, D7: 0.08, D8: 0.05 },
  professional_services:  { D1: 0.20, D2: 0.16, D3: 0.20, D4: 0.12, D5: 0.13, D6: 0.08, D7: 0.07, D8: 0.04 },
  creative_agency:        { D1: 0.14, D2: 0.15, D3: 0.16, D4: 0.13, D5: 0.15, D6: 0.17, D7: 0.07, D8: 0.03 },
  technology_software:    { D1: 0.22, D2: 0.20, D3: 0.12, D4: 0.10, D5: 0.11, D6: 0.10, D7: 0.10, D8: 0.05 },
  trade_field_services:   { D1: 0.16, D2: 0.18, D3: 0.09, D4: 0.18, D5: 0.20, D6: 0.10, D7: 0.06, D8: 0.03 },
  retail_hospitality:     { D1: 0.18, D2: 0.15, D3: 0.10, D4: 0.15, D5: 0.12, D6: 0.16, D7: 0.09, D8: 0.05 },
  health_wellbeing:       { D1: 0.20, D2: 0.15, D3: 0.25, D4: 0.13, D5: 0.12, D6: 0.07, D7: 0.05, D8: 0.03 },
};
