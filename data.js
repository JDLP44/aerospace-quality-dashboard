// ============================================================
// Aerospace Quality Control Dashboard â€” Data Module
// Realistic aerospace quality data modeled on NTSB patterns
// ============================================================

const ATA_CODES = {
  '21': 'Air Conditioning & Pressurization',
  '24': 'Electrical Power',
  '27': 'Flight Controls',
  '28': 'Fuel System',
  '29': 'Hydraulic Power',
  '32': 'Landing Gear',
  '34': 'Navigation',
  '36': 'Pneumatic',
  '49': 'Airborne APU',
  '52': 'Doors',
  '53': 'Fuselage',
  '54': 'Nacelles / Pylons',
  '55': 'Stabilizers',
  '56': 'Windows',
  '57': 'Wings',
  '71': 'Powerplant',
  '72': 'Engine â€” Turbine',
  '73': 'Engine Fuel & Control',
  '74': 'Ignition',
  '76': 'Engine Controls',
  '77': 'Engine Indicating',
  '78': 'Exhaust',
  '79': 'Oil System',
  '80': 'Starting System',
  '85': 'Electrical Wiring'
};

const SEVERITY_LEVELS = ['Fatal', 'Serious', 'Minor', 'None'];
const DAMAGE_LEVELS = ['Destroyed', 'Substantial', 'Minor', 'None'];
const PHASES_OF_FLIGHT = [
  'Takeoff', 'Initial Climb', 'Cruise', 'Descent',
  'Approach', 'Landing', 'Maneuvering', 'Taxi', 'Standing'
];

const MANUFACTURERS = [
  'Boeing', 'Airbus', 'Cessna', 'Piper', 'Beechcraft',
  'Bombardier', 'Embraer', 'Cirrus', 'Gulfstream', 'Textron Aviation',
  'Lockheed Martin', 'Northrop Grumman', 'Raytheon', 'Bell', 'Sikorsky'
];

const AIRCRAFT_MODELS = {
  'Boeing': ['737-800', '737 MAX 8', '747-400', '757-200', '767-300', '777-300ER', '787-9'],
  'Airbus': ['A320neo', 'A321XLR', 'A330-300', 'A340-600', 'A350-900', 'A380-800'],
  'Cessna': ['172S', '182T', '206H', '208B', '525 CitationJet', '560XL Citation'],
  'Piper': ['PA-28 Cherokee', 'PA-32 Saratoga', 'PA-34 Seneca', 'PA-44 Seminole', 'PA-46 Malibu'],
  'Beechcraft': ['King Air 350', 'King Air 250', 'Baron G58', 'Bonanza G36', 'T-6A Texan II'],
  'Bombardier': ['CRJ-200', 'CRJ-700', 'CRJ-900', 'Global 7500', 'Challenger 350'],
  'Embraer': ['E175', 'E190-E2', 'ERJ-145', 'Phenom 300E', 'Praetor 600'],
  'Cirrus': ['SR22', 'SR22T', 'SF50 Vision Jet'],
  'Gulfstream': ['G280', 'G500', 'G600', 'G650ER', 'G700'],
  'Textron Aviation': ['Citation Latitude', 'Citation Longitude', 'Cessna Denali'],
  'Lockheed Martin': ['C-130J', 'F-16', 'F-35A', 'P-3 Orion'],
  'Northrop Grumman': ['B-2 Spirit', 'E-2D Hawkeye', 'RQ-4 Global Hawk'],
  'Raytheon': ['T-1A Jayhawk', 'T-6B Texan II', 'Beechcraft AT-6'],
  'Bell': ['206B', '407GXi', '412EPI', '429', 'V-280 Valor'],
  'Sikorsky': ['S-76D', 'S-92A', 'UH-60M', 'CH-53K']
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
];

const STATE_NAMES = {
  'AL':'Alabama','AK':'Alaska','AZ':'Arizona','AR':'Arkansas','CA':'California',
  'CO':'Colorado','CT':'Connecticut','DE':'Delaware','FL':'Florida','GA':'Georgia',
  'HI':'Hawaii','ID':'Idaho','IL':'Illinois','IN':'Indiana','IA':'Iowa',
  'KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine','MD':'Maryland',
  'MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi',
  'MO':'Missouri','MT':'Montana','NE':'Nebraska','NV':'Nevada','NH':'New Hampshire',
  'NJ':'New Jersey','NM':'New Mexico','NY':'New York','NC':'North Carolina',
  'ND':'North Dakota','OH':'Ohio','OK':'Oklahoma','OR':'Oregon','PA':'Pennsylvania',
  'RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota','TN':'Tennessee',
  'TX':'Texas','UT':'Utah','VT':'Vermont','VA':'Virginia','WA':'Washington',
  'WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming'
};

const ROOT_CAUSE_CATEGORIES = {
  'Material': [
    'Fatigue cracking in primary structure',
    'Corrosion-induced material degradation',
    'Heat treatment non-conformance',
    'Raw material composition out of spec',
    'Composite delamination',
    'Weld joint porosity',
    'Fastener shear failure',
    'Seal degradation and leakage',
    'Bearing surface wear beyond limits',
    'Adhesive bond failure'
  ],
  'Process': [
    'Incorrect torque application during assembly',
    'Inadequate NDI inspection coverage',
    'Deviation from approved repair procedure',
    'Missing process step in work order',
    'Improper surface preparation before coating',
    'Incorrect tooling calibration',
    'Contamination during fluid servicing',
    'Inadequate curing cycle parameters',
    'Incorrect rivet installation sequence',
    'Non-conforming heat treatment cycle'
  ],
  'Design': [
    'Insufficient fatigue life margin',
    'Inadequate drainage provisions',
    'Stress concentration at geometric discontinuity',
    'Insufficient corrosion protection in design',
    'Thermal expansion mismatch between components',
    'Inadequate access for inspection',
    'Under-designed load path',
    'Missing redundancy in critical system',
    'Incorrect material selection for environment',
    'Inadequate vibration isolation'
  ],
  'Human': [
    'Maintenance procedure not followed',
    'Incorrect part installation orientation',
    'Required inspection step omitted',
    'Operator fatigue during extended shift',
    'Inadequate training on new procedure',
    'Communication breakdown between shifts',
    'Incorrect interpretation of engineering drawing',
    'Tool Foreign Object Debris (FOD) left in cavity',
    'Improper lockwire application',
    'Failure to document deviation'
  ],
  'Environmental': [
    'Salt fog exposure beyond design envelope',
    'Lightning strike damage to composite structure',
    'Bird strike impact on engine inlet',
    'Ice accumulation on control surfaces',
    'Sand/dust ingestion in desert operations',
    'UV degradation of sealant compounds',
    'Volcanic ash encounter',
    'High-humidity condensation in avionics bay',
    'Thermal cycling fatigue in high-altitude ops',
    'Galvanic corrosion from dissimilar metals'
  ]
};

// --- Seeded PRNG for deterministic data generation ---
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickWeighted(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return rand() * (max - min) + min;
}

// --- Generate Events ---
function generateEvents(count) {
  const events = [];
  const ataCodes = Object.keys(ATA_CODES);
  // Weight manufacturers by realistic fleet distribution
  const mfrWeights = [18, 15, 14, 10, 8, 6, 6, 5, 3, 3, 2, 2, 2, 3, 3];

  for (let i = 0; i < count; i++) {
    const year = pickWeighted(
      [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      [10, 8, 11, 13, 14, 16, 17, 11]
    );
    const month = randInt(1, year === 2026 ? 5 : 12);
    const day = randInt(1, 28);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const mfr = pickWeighted(MANUFACTURERS, mfrWeights);
    const models = AIRCRAFT_MODELS[mfr];
    const model = pick(models);
    const state = pick(US_STATES);
    const ataCode = pickWeighted(ataCodes, [
      3, 5, 8, 6, 7, 12, 4, 3, 2, 3, 5, 2, 3, 2, 4, 9, 10, 5, 3, 4, 3, 3, 4, 3, 4
    ]);

    const severity = pickWeighted(SEVERITY_LEVELS, [3, 8, 25, 64]);
    const damage = pickWeighted(DAMAGE_LEVELS, [4, 20, 35, 41]);
    const phase = pickWeighted(PHASES_OF_FLIGHT, [12, 8, 15, 8, 14, 18, 10, 10, 5]);

    const rcCategory = pick(Object.keys(ROOT_CAUSE_CATEGORIES));
    const causes = ROOT_CAUSE_CATEGORIES[rcCategory];
    const primaryCause = pick(causes);

    const totalTime = randInt(200, 45000);
    const totalCycles = Math.round(totalTime * randFloat(0.8, 1.5));

    events.push({
      id: `EVT-${String(year).slice(2)}${String(i + 1).padStart(4, '0')}`,
      date: dateStr,
      year,
      month,
      state,
      stateName: STATE_NAMES[state] || state,
      manufacturer: mfr,
      model,
      aircraftCategory: mfr === 'Bell' || mfr === 'Sikorsky' ? 'Rotorcraft' : 'Fixed Wing',
      injurySeverity: severity,
      aircraftDamage: damage,
      phaseOfFlight: phase,
      ataCode,
      ataDescription: ATA_CODES[ataCode],
      rootCauseCategory: rcCategory,
      primaryCause,
      totalAircraftHours: totalTime,
      totalCycles,
      controlNumber: `${state}${year}${String(randInt(1000, 9999))}`
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

// --- Generate SPC Time Series ---
function generateSPCData(events) {
  const monthly = {};
  events.forEach(ev => {
    const key = `${ev.year}-${String(ev.month).padStart(2, '0')}`;
    if (!monthly[key]) {
      monthly[key] = { period: key, year: ev.year, month: ev.month, count: 0, fatal: 0, serious: 0, minor: 0, none: 0, byATA: {}, byMfr: {} };
    }
    monthly[key].count++;
    monthly[key][ev.injurySeverity.toLowerCase()]++;

    if (!monthly[key].byATA[ev.ataCode]) monthly[key].byATA[ev.ataCode] = 0;
    monthly[key].byATA[ev.ataCode]++;

    if (!monthly[key].byMfr[ev.manufacturer]) monthly[key].byMfr[ev.manufacturer] = 0;
    monthly[key].byMfr[ev.manufacturer]++;
  });

  const sorted = Object.values(monthly).sort((a, b) => a.period.localeCompare(b.period));

  // Calculate SPC statistics
  const counts = sorted.map(d => d.count);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const stdDev = Math.sqrt(counts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / counts.length);
  const ucl = mean + 3 * stdDev;
  const lcl = Math.max(0, mean - 3 * stdDev);
  const uwl = mean + 2 * stdDev;
  const lwl = Math.max(0, mean - 2 * stdDev);

  // Calculate moving range
  const movingRanges = [];
  for (let i = 1; i < counts.length; i++) {
    movingRanges.push(Math.abs(counts[i] - counts[i - 1]));
  }
  const mrMean = movingRanges.reduce((a, b) => a + b, 0) / movingRanges.length;
  const mrUCL = mrMean * 3.267;

  return {
    timeSeries: sorted,
    statistics: {
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      ucl: Math.round(ucl * 100) / 100,
      lcl: Math.round(lcl * 100) / 100,
      uwl: Math.round(uwl * 100) / 100,
      lwl: Math.round(lwl * 100) / 100,
      mrMean: Math.round(mrMean * 100) / 100,
      mrUCL: Math.round(mrUCL * 100) / 100
    },
    movingRanges
  };
}

// --- Generate Manufacturer Scorecards ---
function generateManufacturerScores(events) {
  const mfrData = {};
  events.forEach(ev => {
    if (!mfrData[ev.manufacturer]) {
      mfrData[ev.manufacturer] = {
        name: ev.manufacturer,
        totalEvents: 0,
        fatal: 0,
        serious: 0,
        minor: 0,
        none: 0,
        destroyed: 0,
        substantial: 0,
        models: new Set(),
        ataCodes: {},
        yearlyTrend: {},
        rootCauses: {}
      };
    }
    const m = mfrData[ev.manufacturer];
    m.totalEvents++;
    m[ev.injurySeverity.toLowerCase()]++;
    if (ev.aircraftDamage === 'Destroyed') m.destroyed++;
    if (ev.aircraftDamage === 'Substantial') m.substantial++;
    m.models.add(ev.model);

    if (!m.ataCodes[ev.ataCode]) m.ataCodes[ev.ataCode] = 0;
    m.ataCodes[ev.ataCode]++;

    if (!m.yearlyTrend[ev.year]) m.yearlyTrend[ev.year] = 0;
    m.yearlyTrend[ev.year]++;

    if (!m.rootCauses[ev.rootCauseCategory]) m.rootCauses[ev.rootCauseCategory] = 0;
    m.rootCauses[ev.rootCauseCategory]++;
  });

  return Object.values(mfrData).map(m => {
    const severityScore = (m.fatal * 10 + m.serious * 5 + m.minor * 2 + m.none * 0.5) / m.totalEvents;
    const years = Object.keys(m.yearlyTrend).sort();
    let trend = 'Stable';
    if (years.length >= 2) {
      const recent = m.yearlyTrend[years[years.length - 1]] || 0;
      const prev = m.yearlyTrend[years[years.length - 2]] || 0;
      if (recent > prev * 1.15) trend = 'Degrading';
      else if (recent < prev * 0.85) trend = 'Improving';
    }

    let riskRating = 'Low';
    if (severityScore > 4) riskRating = 'Critical';
    else if (severityScore > 3) riskRating = 'High';
    else if (severityScore > 2) riskRating = 'Medium';

    return {
      ...m,
      models: Array.from(m.models),
      modelCount: m.models.size,
      severityScore: Math.round(severityScore * 100) / 100,
      trend,
      riskRating,
      defectRate: Math.round((m.totalEvents / 500) * 10000) / 100,
      fairPassRate: randInt(82, 99),
      openSCARs: randInt(0, 8)
    };
  }).sort((a, b) => b.totalEvents - a.totalEvents);
}

// --- Generate Findings/Root Cause Analysis Data ---
function generateFindings(events) {
  const categoryCount = {};
  const causeCount = {};
  const categoryByATA = {};

  events.forEach(ev => {
    if (!categoryCount[ev.rootCauseCategory]) categoryCount[ev.rootCauseCategory] = 0;
    categoryCount[ev.rootCauseCategory]++;

    if (!causeCount[ev.primaryCause]) causeCount[ev.primaryCause] = 0;
    causeCount[ev.primaryCause]++;

    const key = `${ev.ataCode}-${ev.rootCauseCategory}`;
    if (!categoryByATA[key]) categoryByATA[key] = { ataCode: ev.ataCode, ataDesc: ev.ataDescription, category: ev.rootCauseCategory, count: 0 };
    categoryByATA[key].count++;
  });

  const sortedCauses = Object.entries(causeCount)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count);

  return {
    byCategory: categoryCount,
    topCauses: sortedCauses.slice(0, 20),
    categoryByATA: Object.values(categoryByATA).sort((a, b) => b.count - a.count),
    totalFindings: events.length
  };
}

// --- 8D Case Studies ---
const CASE_STUDIES = [
  {
    id: 'CS-001',
    title: 'Landing Gear Retraction Failure â€” Boeing 737-800',
    ataCode: '32',
    severity: 'Serious',
    rpn: 240,
    cageCode: '4U93A',
    heatLot: 'HT-99421-B',
    serialNumberRange: 'LGA-2800 thru LGA-2850',
    summary: 'During approach to runway 28L, the flight crew reported that the left main landing gear failed to fully extend. Emergency procedures were initiated and the aircraft landed with the left main gear in a partially retracted position, resulting in substantial damage to the left wing and engine nacelle.',
    d1_team: ['Lead Quality Engineer', 'Supplier Quality Engineer', 'Stress Engineer', 'Landing Gear Design Engineer', 'MRO Inspector', 'Metallurgist'],
    d2_problem: 'Left main landing gear actuator failed to achieve full extension during normal gear deployment sequence. Actuator piston exhibited abnormal resistance at approximately 85% travel. Hydraulic system pressure was within normal operating range (3,000 PSI). Condition affected aircraft S/N WL-4821, landing gear actuator P/N 65C29102-7, S/N LGA-2847.',
    d3_containment: [
      'Issued AOG (Aircraft on Ground) hold for all 737-800 aircraft with actuators from the same production lot (Lot 2024-Q3-LG)',
      'Initiated fleet-wide special inspection of landing gear actuators per Engineering Order EO-2025-0147',
      'Established 200 flight-hour repetitive inspection interval pending root cause determination',
      'Quarantined 47 uninstalled actuators from the same supplier lot at distribution centers'
    ],
    d4_rootCause: 'Metallurgical analysis revealed subsurface hydrogen embrittlement in the actuator piston chrome plating. The plating thickness was within specification (0.002-0.005 inch), but hydrogen bake-out after chrome plating was performed at 375F for only 2 hours instead of the required 4 hours per BAC 5709 specification. Review of supplier process records confirmed the abbreviated bake cycle for production lot 2024-Q3-LG.',
    d5_corrective: [
      'Supplier corrective action: Revised chrome plating work instruction WI-CP-042 to include mandatory 4-hour hydrogen bake-out timer with automated process lock',
      'Added in-process verification checkpoint requiring Quality Inspector sign-off before parts proceed from bake oven',
      'Installed automated oven temperature/time recording system with deviation alerting',
      'All actuators from affected lot to be returned for re-processing or scrap disposition'
    ],
    d6_verification: [
      'Destructive testing of 5 sample actuators from corrected production lot confirmed zero hydrogen embrittlement indicators',
      'Hydrogen content testing (LECO analysis) showed values below 1.0 ppm threshold',
      'Actuator functional testing confirmed full stroke travel under maximum load conditions',
      '1,000 cycle endurance test completed with no degradation'
    ],
    d7_prevention: [
      'Updated supplier audit checklist to include verification of post-plating bake parameters',
      'Added hydrogen embrittlement testing (per ASTM F519) to incoming inspection requirements for all chrome-plated flight-critical components',
      'Revised Supplier Quality Requirements Document (SQRD) to mandate automated process controls for all special processes',
      'Scheduled quarterly process audits at supplier facility for 12-month period'
    ],
    d8_recognition: 'The cross-functional team identified the root cause within 72 hours and implemented effective containment that prevented any additional fleet incidents. The systemic process improvements will strengthen special process controls across the supplier base.'
  },
  {
    id: 'CS-002',
    title: 'Engine Turbine Blade FOD Event â€” CFM56-7B',
    ataCode: '72',
    severity: 'Serious',
    rpn: 320,
    cageCode: '1A4B9',
    heatLot: 'CST-2023-441',
    serialNumberRange: 'HPT-9900 thru HPT-9950',
    summary: 'During cruise at FL350, the left engine (CFM56-7B26) experienced a contained turbine blade separation event. The flight crew reported vibration and EGT exceedance. Engine was shut down and the aircraft diverted safely. Borescope inspection revealed separation of a 1st-stage high-pressure turbine blade at the platform-to-airfoil fillet radius.',
    d1_team: ['Propulsion Quality Engineer', 'Supplier Quality Manager', 'Materials Engineer', 'Engine Design Authority', 'NDI Level III Inspector', 'Reliability Engineer'],
    d2_problem: 'First-stage HPT blade P/N 1589M57P04, S/N HPT-9923, separated at the platform fillet radius after 8,247 cycles since new (CSN). Design life is 20,000 cycles. Blade material is single-crystal CMSX-4 nickel superalloy. Engine S/N CFM-726841 was installed on aircraft MSN 42156.',
    d3_containment: [
      'Issued fleet alert for all CFM56-7B engines with HPT blades from supplier lot SX-2023-08',
      'Mandatory borescope inspection of 1st-stage HPT blades at next engine access opportunity',
      'Reduced inspection interval from 6,000 to 3,000 cycles for affected blade lots',
      'Held shipment of 120 blades from supplier pending investigation'
    ],
    d4_rootCause: 'Fractographic analysis identified high-cycle fatigue initiation from a casting microporosity cluster (0.08mm max dimension) located 0.15mm below the surface at the fillet radius. The porosity exceeded the maximum allowable per AMS 5383 specification. Review of supplier HIP (Hot Isostatic Pressing) records indicated that the HIP cycle pressure was 12 ksi instead of the required 15 ksi minimum for the affected lot.',
    d5_corrective: [
      'Supplier installed redundant pressure transducers on HIP vessel with automatic cycle abort if pressure drops below 14.5 ksi',
      'Implemented 100% CT (computed tomography) inspection of all HPT blade castings to screen for subsurface porosity',
      'Revised casting acceptance criteria to reduce maximum allowable porosity from 0.10mm to 0.05mm in fillet radius region',
      'Blade supplier Quality Management System (QMS) audit and corrective action verification'
    ],
    d6_verification: [
      'CT inspection of 200 blades from corrected lots showed zero porosity exceedances',
      'Spin pit testing of 10 blades from corrected lot to 30,000 equivalent cycles with no indications',
      'Metallurgical sections of 3 destructive test specimens confirmed full HIP densification',
      'HIP vessel pressure recording verified within specification for 5 consecutive production lots'
    ],
    d7_prevention: [
      'Added HIP process parameters to Supplier Process Control Plan (SPCP) as Key Characteristics',
      'Implemented real-time SPC monitoring of HIP cycle parameters across all casting suppliers',
      'Updated corporate Supplier Quality Manual to require CT inspection for all single-crystal turbine component castings',
      'Established joint supplier/OEM process FMEA review requirement for all special processes'
    ],
    d8_recognition: 'The rapid cross-functional response prevented potential in-flight engine failure. The systemic improvements to HIP process controls and casting inspection requirements elevate quality assurance across the entire turbine blade supply chain.'
  }
];

// --- Generate all data ---
const EVENTS = generateEvents(800);
const SPC_DATA = generateSPCData(EVENTS);
const MANUFACTURER_SCORES = generateManufacturerScores(EVENTS);
const FINDINGS_DATA = generateFindings(EVENTS);

// --- Aggregate KPI summaries ---
const KPI_SUMMARY = {
  totalEvents: EVENTS.length,
  dateRange: { from: EVENTS[0].date, to: EVENTS[EVENTS.length - 1].date },
  bySeverity: {
    fatal: EVENTS.filter(e => e.injurySeverity === 'Fatal').length,
    serious: EVENTS.filter(e => e.injurySeverity === 'Serious').length,
    minor: EVENTS.filter(e => e.injurySeverity === 'Minor').length,
    none: EVENTS.filter(e => e.injurySeverity === 'None').length
  },
  byDamage: {
    destroyed: EVENTS.filter(e => e.aircraftDamage === 'Destroyed').length,
    substantial: EVENTS.filter(e => e.aircraftDamage === 'Substantial').length,
    minor: EVENTS.filter(e => e.aircraftDamage === 'Minor').length,
    none: EVENTS.filter(e => e.aircraftDamage === 'None').length
  },
  byPhase: {},
  byState: {},
  byATA: {},
  byYear: {},
  topManufacturers: MANUFACTURER_SCORES.slice(0, 10)
};

EVENTS.forEach(ev => {
  if (!KPI_SUMMARY.byPhase[ev.phaseOfFlight]) KPI_SUMMARY.byPhase[ev.phaseOfFlight] = 0;
  KPI_SUMMARY.byPhase[ev.phaseOfFlight]++;

  if (!KPI_SUMMARY.byState[ev.state]) KPI_SUMMARY.byState[ev.state] = 0;
  KPI_SUMMARY.byState[ev.state]++;

  const ataKey = `${ev.ataCode} - ${ev.ataDescription}`;
  if (!KPI_SUMMARY.byATA[ataKey]) KPI_SUMMARY.byATA[ataKey] = 0;
  KPI_SUMMARY.byATA[ataKey]++;

  if (!KPI_SUMMARY.byYear[ev.year]) KPI_SUMMARY.byYear[ev.year] = 0;
  KPI_SUMMARY.byYear[ev.year]++;
});

// Year-over-year change
const years = Object.keys(KPI_SUMMARY.byYear).sort();
const currentYear = parseInt(years[years.length - 1]);
const prevYear = currentYear - 1;
const currentYearCount = KPI_SUMMARY.byYear[currentYear] || 0;
const prevYearCount = KPI_SUMMARY.byYear[prevYear] || 0;
// Annualize current year if partial
const currentMonth = 5; // May 2026
const annualizedCurrent = Math.round(currentYearCount * (12 / currentMonth));
KPI_SUMMARY.yoyChange = prevYearCount > 0
  ? Math.round(((annualizedCurrent - prevYearCount) / prevYearCount) * 10000) / 100
  : 0;
KPI_SUMMARY.annualizedCurrent = annualizedCurrent;

// Escape rate (events with severity > None / total)
const escapedDefects = EVENTS.filter(e => e.injurySeverity !== 'None').length;
KPI_SUMMARY.escapeRate = Math.round((escapedDefects / EVENTS.length) * 10000) / 100;

// --- Export ---
window.AEROSPACE_DATA = {
  events: EVENTS,
  spc: SPC_DATA,
  manufacturers: MANUFACTURER_SCORES,
  findings: FINDINGS_DATA,
  kpi: KPI_SUMMARY,
  caseStudies: CASE_STUDIES,
  lookups: {
    ataCodes: ATA_CODES,
    severityLevels: SEVERITY_LEVELS,
    damageLevels: DAMAGE_LEVELS,
    phasesOfFlight: PHASES_OF_FLIGHT,
    manufacturers: MANUFACTURERS,
    stateNames: STATE_NAMES,
    rootCauseCategories: ROOT_CAUSE_CATEGORIES
  }
};
