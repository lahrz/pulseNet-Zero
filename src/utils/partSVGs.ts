// Procedural industrial part SVG generator for photorealistic precision inspection

export interface SamplePartDef {
  id: string;
  name: string;
  profile: string;
  condition: 'NORMAL' | 'SCRATCH' | 'CRACK' | 'DENT' | 'UNKNOWN';
  description: string;
  expectedStatus: 'PASS' | 'DEFECT' | 'UNKNOWN';
  defectLabel?: string;
  svgDataUri: string;
}

// Helper to encode SVG string to data URI
function svgToUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// Generate Precision Gear SVG with high technical detail
export function generateGearSvg(condition: 'NORMAL' | 'SCRATCH' | 'CRACK' | 'DENT' | 'UNKNOWN' = 'NORMAL'): string {
  // Generate gear teeth
  const teeth = 18;
  const cx = 200;
  const cy = 200;
  const rOuter = 160;
  const rRoot = 135;
  const rPitch = 148;

  let pathD = '';
  for (let i = 0; i < teeth; i++) {
    const angle1 = (i * 2 * Math.PI) / teeth;
    const angle2 = angle1 + (Math.PI / teeth) * 0.35;
    const angle3 = angle1 + (Math.PI / teeth) * 0.65;
    const angle4 = ((i + 1) * 2 * Math.PI) / teeth;

    const x1 = cx + rRoot * Math.cos(angle1);
    const y1 = cy + rRoot * Math.sin(angle1);
    const x2 = cx + rOuter * Math.cos(angle2);
    const y2 = cy + rOuter * Math.sin(angle2);
    const x3 = cx + rOuter * Math.cos(angle3);
    const y3 = cy + rOuter * Math.sin(angle3);
    const x4 = cx + rRoot * Math.cos(angle4);
    const y4 = cy + rRoot * Math.sin(angle4);

    if (i === 0) {
      pathD += `M ${x1} ${y1} `;
    } else {
      pathD += `L ${x1} ${y1} `;
    }
    pathD += `L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} `;
  }
  pathD += 'Z';

  // Condition specific defect markup
  let defectSvg = '';
  if (condition === 'SCRATCH') {
    defectSvg = `
      <!-- Surface Scratch on tooth flank -->
      <g opacity="0.9">
        <path d="M 148 185 Q 165 210 188 230" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 3px #f43f5e)" />
        <path d="M 152 192 Q 168 214 184 226" stroke="#fb7185" stroke-width="1.2" stroke-linecap="round" fill="none" />
        <path d="M 156 182 Q 170 200 180 215" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="2 1" fill="none" />
      </g>
    `;
  } else if (condition === 'CRACK') {
    defectSvg = `
      <!-- Micro-Crack on Hub Collar -->
      <g opacity="0.95">
        <path d="M 210 135 L 216 148 L 213 158 L 224 172 L 220 185" stroke="#ef4444" stroke-width="2.4" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 4px #ef4444)" />
        <path d="M 213 158 L 206 166" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" fill="none" />
        <circle cx="218" cy="162" r="3" fill="#ef4444" />
      </g>
    `;
  } else if (condition === 'DENT') {
    defectSvg = `
      <!-- Radial Dent Defect -->
      <g opacity="0.95">
        <ellipse cx="236" cy="165" rx="14" ry="9" transform="rotate(35 236 165)" fill="#e11d48" opacity="0.4" />
        <path d="M 226 160 Q 236 172 248 168" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="236" cy="165" r="8" stroke="#fda4af" stroke-width="1.5" stroke-dasharray="2 2" fill="none" />
      </g>
    `;
  } else if (condition === 'UNKNOWN') {
    defectSvg = `
      <!-- Unfamiliar Anomaly / Foreign Splatter -->
      <g opacity="0.95">
        <path d="M 175 220 C 160 210, 150 235, 168 245 C 180 252, 195 240, 190 228 C 186 218, 180 224, 175 220 Z" fill="#eab308" opacity="0.75" filter="drop-shadow(0 0 6px #ca8a04)" />
        <circle cx="162" cy="225" r="4" fill="#a16207" />
        <circle cx="182" cy="238" r="3" fill="#713f12" />
        <circle cx="198" cy="222" r="2.5" fill="#eab308" />
        <circle cx="152" cy="242" r="2" fill="#ca8a04" />
      </g>
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background-color: #0b0f19;">
    <defs>
      <!-- Metallic radial gradient -->
      <radialGradient id="metalBody" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="45%" stop-color="#1e293b" />
        <stop offset="70%" stop-color="#475569" />
        <stop offset="85%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      
      <!-- Machined toolpath circular pattern -->
      <pattern id="machinedLines" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="8" fill="none" stroke="#64748b" stroke-width="0.3" opacity="0.4" />
      </pattern>

      <!-- Chamfer gradient -->
      <linearGradient id="chamfer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8" />
        <stop offset="50%" stop-color="#334155" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>

      <!-- Glow filter -->
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background inspection table grid -->
    <rect width="400" height="400" fill="#070a12" />
    <g opacity="0.12" stroke="#38bdf8" stroke-width="0.5">
      <line x1="0" y1="100" x2="400" y2="100" />
      <line x1="0" y1="200" x2="400" y2="200" />
      <line x1="0" y1="300" x2="400" y2="300" />
      <line x1="100" y1="0" x2="100" y2="400" />
      <line x1="200" y1="0" x2="200" y2="400" />
      <line x1="300" y1="0" x2="300" y2="400" />
      <circle cx="200" cy="200" r="185" fill="none" stroke-dasharray="3 3" />
    </g>

    <!-- Gear Body Shadow -->
    <path d="${pathD}" fill="#000" opacity="0.6" transform="translate(6, 8)" filter="blur(4px)" />

    <!-- Main Gear Teeth and Body -->
    <path d="${pathD}" fill="url(#metalBody)" stroke="#94a3b8" stroke-width="1.5" />

    <!-- Circular machined rim highlights -->
    <circle cx="200" cy="200" r="${rRoot}" fill="none" stroke="#64748b" stroke-width="1" opacity="0.7" />
    <circle cx="200" cy="200" r="${rPitch}" fill="none" stroke="#38bdf8" stroke-width="0.75" stroke-dasharray="4 2" opacity="0.5" />

    <!-- Recessed web ring -->
    <circle cx="200" cy="200" r="105" fill="#111827" stroke="#475569" stroke-width="2" />
    <circle cx="200" cy="200" r="105" fill="url(#machinedLines)" />

    <!-- Weight reduction lightning holes (6 holes) -->
    <g fill="#070a12" stroke="#64748b" stroke-width="1.2">
      <circle cx="200" cy="130" r="15" />
      <circle cx="260" cy="165" r="15" />
      <circle cx="260" cy="235" r="15" />
      <circle cx="200" cy="270" r="15" />
      <circle cx="140" cy="235" r="15" />
      <circle cx="140" cy="165" r="15" />
    </g>

    <!-- Central Hub -->
    <circle cx="200" cy="200" r="54" fill="url(#metalBody)" stroke="#94a3b8" stroke-width="2" />
    
    <!-- Central Bore with Keyway -->
    <g fill="#070a12" stroke="#64748b" stroke-width="1.5">
      <!-- Bore circle 28px radius with 8px keyway at top -->
      <path d="M 194 172 L 194 163 L 206 163 L 206 172 A 28 28 0 1 1 194 172 Z" fill="#070a12" stroke="#cbd5e1" />
    </g>

    <!-- Center Crosshairs / Calibration fiducials -->
    <g stroke="#38bdf8" stroke-width="0.75" opacity="0.6">
      <line x1="180" y1="200" x2="220" y2="200" />
      <line x1="200" y1="180" x2="200" y2="220" />
      <circle cx="200" cy="200" r="3" fill="none" />
    </g>

    <!-- Inspection condition / Defect rendering -->
    ${defectSvg}

    <!-- Optical HUD Overlay Elements -->
    <g fill="#38bdf8" font-family="monospace" font-size="9" opacity="0.65">
      <text x="16" y="24">PULSENET-AOI // REF: GEAR-M12</text>
      <text x="16" y="385">FOV: 120mm | CAL: 0.005mm/px</text>
      <text x="290" y="385">STATUS: ${condition}</text>
    </g>
  </svg>`;

  return svg;
}

// Generate CNC Flange SVG
export function generateFlangeSvg(condition: 'NORMAL' | 'SCRATCH' | 'CRACK' | 'DENT' | 'UNKNOWN' = 'NORMAL'): string {
  let defectSvg = '';
  if (condition === 'SCRATCH') {
    defectSvg = `
      <path d="M 130 140 Q 155 160 180 150" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 3px #f43f5e)" />
      <path d="M 134 146 Q 158 164 176 156" stroke="#fb7185" stroke-width="1.5" stroke-linecap="round" fill="none" />
    `;
  } else if (condition === 'CRACK') {
    defectSvg = `
      <path d="M 270 200 L 290 204 L 285 212 L 310 216" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 4px #ef4444)" />
    `;
  } else if (condition === 'UNKNOWN') {
    defectSvg = `
      <polygon points="140,240 155,232 165,248 152,260 138,252" fill="#eab308" opacity="0.8" filter="drop-shadow(0 0 5px #ca8a04)" />
      <circle cx="170" cy="235" r="3" fill="#ca8a04" />
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background-color: #0b0f19;">
    <defs>
      <radialGradient id="flangeMetal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="60%" stop-color="#1e293b" />
        <stop offset="85%" stop-color="#334155" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
    </defs>
    
    <rect width="400" height="400" fill="#070a12" />

    <!-- Shadow -->
    <circle cx="206" cy="208" r="160" fill="#000" opacity="0.5" filter="blur(5px)" />

    <!-- Outer Circular Flange Rim -->
    <circle cx="200" cy="200" r="160" fill="url(#flangeMetal)" stroke="#94a3b8" stroke-width="2" />
    <circle cx="200" cy="200" r="148" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="6 3" opacity="0.6" />

    <!-- 8 Bolt Holes on PCD -->
    <g fill="#070a12" stroke="#94a3b8" stroke-width="1.8">
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const bx = 200 + 124 * Math.cos(rad);
        const by = 200 + 124 * Math.sin(rad);
        return `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="10" />
                <circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="14" fill="none" stroke="#64748b" stroke-width="0.8" opacity="0.6" />`;
      }).join('')}
    </g>

    <!-- Raised Face Collar -->
    <circle cx="200" cy="200" r="92" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.5" />
    <circle cx="200" cy="200" r="82" fill="none" stroke="#64748b" stroke-width="0.8" opacity="0.5" />

    <!-- Center Bore -->
    <circle cx="200" cy="200" r="50" fill="#070a12" stroke="#94a3b8" stroke-width="2" />

    <!-- Defect -->
    ${defectSvg}

    <g fill="#38bdf8" font-family="monospace" font-size="9" opacity="0.65">
      <text x="16" y="24">PULSENET-AOI // REF: FLANGE-ANSI-B16</text>
      <text x="16" y="385">MATERIAL: 316L SS | PCD: 124mm</text>
      <text x="290" y="385">STATUS: ${condition}</text>
    </g>
  </svg>`;

  return svg;
}

// Built-in Demo Library of parts for judges and user testing
export const DEMO_SAMPLE_PARTS: SamplePartDef[] = [
  {
    id: 'sample-gear-pass',
    name: 'Normal Precision Gear (Golden Reference)',
    profile: 'Precision Gear (PNZ-GEAR-M12)',
    condition: 'NORMAL',
    description: 'Golden reference specimen with zero deviation. Meets all DIN 3962 Class 6 dimensional tolerances.',
    expectedStatus: 'PASS',
    svgDataUri: svgToUri(generateGearSvg('NORMAL')),
  },
  {
    id: 'sample-gear-scratch',
    name: 'Precision Gear w/ Tooth Flank Scratch',
    profile: 'Precision Gear (PNZ-GEAR-M12)',
    condition: 'SCRATCH',
    description: 'Scoring defect along involute tooth face caused by metal chip ingress during hobbing.',
    expectedStatus: 'DEFECT',
    defectLabel: 'Surface Scratch',
    svgDataUri: svgToUri(generateGearSvg('SCRATCH')),
  },
  {
    id: 'sample-gear-crack',
    name: 'Precision Gear w/ Hub Micro-Crack',
    profile: 'Precision Gear (PNZ-GEAR-M12)',
    condition: 'CRACK',
    description: 'Sub-millimeter radial fracture near bore keyway caused by quenching stress concentration.',
    expectedStatus: 'DEFECT',
    defectLabel: 'Micro-Crack',
    svgDataUri: svgToUri(generateGearSvg('CRACK')),
  },
  {
    id: 'sample-gear-dent',
    name: 'Precision Gear w/ Radial Dent',
    profile: 'Precision Gear (PNZ-GEAR-M12)',
    condition: 'DENT',
    description: 'Impact deformation on pitch diameter caused by parts bin collision during transfer.',
    expectedStatus: 'DEFECT',
    defectLabel: 'Radial Dent',
    svgDataUri: svgToUri(generateGearSvg('DENT')),
  },
  {
    id: 'sample-gear-unknown',
    name: 'Precision Gear w/ Unfamiliar Anomaly',
    profile: 'Precision Gear (PNZ-GEAR-M12)',
    condition: 'UNKNOWN',
    description: 'Unseen molten slag / particulate deposit outside established normality boundary. Perfect for "Teach Me".',
    expectedStatus: 'UNKNOWN',
    defectLabel: 'Unclassified Anomaly',
    svgDataUri: svgToUri(generateGearSvg('UNKNOWN')),
  },
  {
    id: 'sample-flange-pass',
    name: 'CNC Milled Flange (Golden Reference)',
    profile: 'CNC Milled Flange (PNZ-FLG-44)',
    condition: 'NORMAL',
    description: '316L Stainless steel 8-hole flange with precise concentricity and Ra 0.8μm finish.',
    expectedStatus: 'PASS',
    svgDataUri: svgToUri(generateFlangeSvg('NORMAL')),
  },
  {
    id: 'sample-flange-scratch',
    name: 'CNC Milled Flange w/ Facing Scratch',
    profile: 'CNC Milled Flange (PNZ-FLG-44)',
    condition: 'SCRATCH',
    description: 'Tooling pull mark across gasket raised face sealing surface.',
    expectedStatus: 'DEFECT',
    defectLabel: 'Surface Scratch',
    svgDataUri: svgToUri(generateFlangeSvg('SCRATCH')),
  },
  {
    id: 'sample-flange-unknown',
    name: 'CNC Milled Flange w/ Slag Inclusion',
    profile: 'CNC Milled Flange (PNZ-FLG-44)',
    condition: 'UNKNOWN',
    description: 'Porous slag cluster outside normal visual parameters.',
    expectedStatus: 'UNKNOWN',
    defectLabel: 'Unclassified Anomaly',
    svgDataUri: svgToUri(generateFlangeSvg('UNKNOWN')),
  },
];
