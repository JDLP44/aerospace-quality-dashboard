// ============================================================
// Aerospace Quality Control Dashboard â€” Application Module
// Routing, view management, interactivity, and data binding
// ============================================================

(function() {
  'use strict';

  const DATA = window.AEROSPACE_DATA;
  let currentView = 'executive';
  let current8DStep = 0;
  let current8DCase = 0;

  // --- Initialization ---
  function init() {
    updateHeaderStats();
    setupNavigation();
    setupSPCTabs();
    setupRCCATabs();
    setup8DNavigation();
    setupSupplierControls();
    setupTrendFilters();
    renderExecutiveView();
  }

  function updateHeaderStats() {
    document.getElementById('headerEventCount').textContent = DATA.kpi.totalEvents.toLocaleString() + ' events loaded';
    document.getElementById('headerDateRange').textContent = DATA.kpi.dateRange.from + ' to ' + DATA.kpi.dateRange.to;
  }

  // --- Navigation ---
  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        const viewId = this.dataset.view;
        if (viewId === currentView) return;

        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + viewId).classList.add('active');

        currentView = viewId;
        renderView(viewId);
      });
    });
  }

  function renderView(viewId) {
    switch (viewId) {
      case 'executive': renderExecutiveView(); break;
      case 'spc': renderSPCView(); break;
      case 'rcca': renderRCCAView(); break;
      case 'suppliers': renderSuppliersView(); break;
      case 'ncr': renderNCRView(); break;
      case 'trends': renderTrendsView(); break;
    }
  }

  // =============================================
  // VIEW 1: EXECUTIVE SUMMARY
  // =============================================
  function renderExecutiveView() {
    renderKPICards();
    renderYearlyTrendChart(DATA);
    renderSeverityDistChart(DATA);
    renderPhaseOfFlightChart(DATA);
    renderParetoATA();
    renderExecMfrTable();
  }

  function renderKPICards() {
    const kpi = DATA.kpi;
    const cards = [
      {
        label: 'Total Reported Events',
        value: kpi.totalEvents.toLocaleString(),
        change: kpi.yoyChange,
        changeLabel: 'YoY (annualized)',
        invert: true
      },
      {
        label: 'Fatal / Serious Events',
        value: (kpi.bySeverity.fatal + kpi.bySeverity.serious).toLocaleString(),
        change: null,
        sub: kpi.bySeverity.fatal + ' fatal, ' + kpi.bySeverity.serious + ' serious'
      },
      {
        label: 'Defect Escape Rate',
        value: kpi.escapeRate + '%',
        change: null,
        sub: 'Events with injury severity > None'
      },
      {
        label: 'Aircraft Destroyed',
        value: kpi.byDamage.destroyed.toLocaleString(),
        change: null,
        sub: ((kpi.byDamage.destroyed / kpi.totalEvents) * 100).toFixed(1) + '% of total events'
      }
    ];

    const container = document.getElementById('kpiCards');
    container.innerHTML = cards.map(card => {
      let changeHtml = '';
      if (card.change !== null) {
        const cls = card.invert
          ? (card.change > 0 ? 'negative' : card.change < 0 ? 'positive' : 'neutral')
          : (card.change > 0 ? 'positive' : card.change < 0 ? 'negative' : 'neutral');
        const arrow = card.change > 0 ? '&#9650;' : card.change < 0 ? '&#9660;' : '&#9654;';
        changeHtml = `<div class="kpi-change ${cls}">${arrow} ${Math.abs(card.change)}% ${card.changeLabel || ''}</div>`;
      }
      if (card.sub) {
        changeHtml = `<div style="margin-top: var(--space-sm); font-size: 0.75rem; color: var(--text-tertiary);">${card.sub}</div>`;
      }
      return `
        <div class="kpi-card">
          <div class="kpi-label">${card.label}</div>
          <div class="kpi-value">${card.value}</div>
          ${changeHtml}
        </div>
      `;
    }).join('');
  }

  function renderParetoATA() {
    const ataEntries = Object.entries(DATA.kpi.byATA)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    const maxCount = ataEntries[0][1];
    let cumulative = 0;
    const total = ataEntries.reduce((sum, e) => sum + e[1], 0);

    const container = document.getElementById('paretoATAList');
    container.innerHTML = ataEntries.map((entry, i) => {
      cumulative += entry[1];
      const pct = ((entry[1] / total) * 100).toFixed(1);
      const barWidth = ((entry[1] / maxCount) * 100).toFixed(1);
      return `
        <div class="pareto-item">
          <span class="pareto-rank">${i + 1}</span>
          <div class="pareto-bar-wrapper">
            <span class="pareto-bar-label">${entry[0]}</span>
            <div class="pareto-bar-track">
              <div class="pareto-bar-fill" style="width: ${barWidth}%"></div>
            </div>
          </div>
          <span class="pareto-count">${entry[1]}</span>
          <span class="pareto-pct">${pct}%</span>
        </div>
      `;
    }).join('');
  }

  function renderExecMfrTable() {
    const tbody = document.getElementById('execMfrTableBody');
    tbody.innerHTML = DATA.manufacturers.slice(0, 10).map(mfr => {
      const riskClass = mfr.riskRating.toLowerCase();
      const trendIcon = mfr.trend === 'Degrading' ? '&#9650;' : mfr.trend === 'Improving' ? '&#9660;' : '&#9654;';
      const trendClass = mfr.trend === 'Degrading' ? 'trend-up' : mfr.trend === 'Improving' ? 'trend-down' : 'trend-stable';

      return `
        <tr>
          <td>${mfr.name}</td>
          <td class="cell-mono cell-right">${mfr.totalEvents}</td>
          <td class="cell-mono cell-right">${mfr.fatal}</td>
          <td class="cell-mono cell-right">${mfr.serious}</td>
          <td class="cell-mono cell-right">${mfr.minor}</td>
          <td class="cell-mono cell-right">${mfr.severityScore}</td>
          <td class="${trendClass}">${trendIcon} ${mfr.trend}</td>
          <td><span class="badge badge-${riskClass === 'critical' ? 'critical' : riskClass}">${mfr.riskRating}</span></td>
        </tr>
      `;
    }).join('');
  }

  // =============================================
  // VIEW 2: SPC ANALYSIS
  // =============================================
  function renderSPCView() {
    renderSPCStats();
    renderIChart(DATA.spc);
    renderMRChart(DATA.spc);
    renderPChart(DATA.spc);
    renderProcessCapability();
    renderWERules();
    renderOOCSummary();
  }

  function renderSPCStats() {
    const s = DATA.spc.statistics;
    document.getElementById('spcStats').innerHTML = `
      <div class="spc-stat">
        <span class="spc-stat-label">Process Mean</span>
        <span class="spc-stat-value mean">${s.mean.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">Std. Deviation</span>
        <span class="spc-stat-value">${s.stdDev.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">UCL (3-sigma)</span>
        <span class="spc-stat-value ucl">${s.ucl.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">LCL (3-sigma)</span>
        <span class="spc-stat-value lcl">${s.lcl.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">UWL (2-sigma)</span>
        <span class="spc-stat-value">${s.uwl.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">LWL (2-sigma)</span>
        <span class="spc-stat-value">${s.lwl.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">MR Mean</span>
        <span class="spc-stat-value">${s.mrMean.toFixed(2)}</span>
      </div>
      <div class="spc-stat">
        <span class="spc-stat-label">Observations</span>
        <span class="spc-stat-value">${DATA.spc.timeSeries.length}</span>
      </div>
    `;
  }

  function renderProcessCapability() {
    const s = DATA.spc.statistics;
    // Simulated specification limits
    const USL = s.mean + 4 * s.stdDev;
    const LSL = Math.max(0, s.mean - 4 * s.stdDev);
    const Cp = ((USL - LSL) / (6 * s.stdDev)).toFixed(3);
    const CpkUpper = ((USL - s.mean) / (3 * s.stdDev)).toFixed(3);
    const CpkLower = ((s.mean - LSL) / (3 * s.stdDev)).toFixed(3);
    const Cpk = Math.min(parseFloat(CpkUpper), parseFloat(CpkLower)).toFixed(3);

    document.getElementById('processCapability').innerHTML = `
      <div class="stat-row">
        <span class="stat-row-label">USL (Simulated)</span>
        <span class="stat-row-value">${USL.toFixed(2)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">LSL (Simulated)</span>
        <span class="stat-row-value">${LSL.toFixed(2)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Cp</span>
        <span class="stat-row-value">${Cp}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Cpk</span>
        <span class="stat-row-value">${Cpk}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Cpk (Upper)</span>
        <span class="stat-row-value">${CpkUpper}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Cpk (Lower)</span>
        <span class="stat-row-value">${CpkLower}</span>
      </div>
      <div style="margin-top: var(--space-md); font-size: 0.75rem; color: var(--text-tertiary);">
        Note: Specification limits are simulated at mean +/- 4 sigma for demonstration.
        Cp > 1.33 indicates process is capable. Cpk > 1.33 indicates process is centered and capable.
      </div>
    `;
  }

  function renderWERules() {
    const values = DATA.spc.timeSeries.map(d => d.count);
    const s = DATA.spc.statistics;
    const violations = [];

    // Rule 1: Point beyond 3-sigma
    const rule1 = values.filter(v => v > s.ucl || v < s.lcl).length;
    if (rule1 > 0) violations.push({ rule: 'Rule 1', desc: 'Point beyond 3-sigma limits', count: rule1, severity: 'critical' });

    // Rule 2: 9 consecutive points on one side of mean
    let rule2 = 0;
    for (let i = 8; i < values.length; i++) {
      const slice = values.slice(i - 8, i + 1);
      if (slice.every(v => v > s.mean) || slice.every(v => v < s.mean)) { rule2++; break; }
    }
    if (rule2 > 0) violations.push({ rule: 'Rule 2', desc: '9 consecutive points same side of mean', count: rule2, severity: 'high' });

    // Rule 3: 6 points in a row steadily increasing or decreasing
    let rule3 = 0;
    for (let i = 5; i < values.length; i++) {
      const slice = values.slice(i - 5, i + 1);
      let inc = true, dec = true;
      for (let j = 1; j < slice.length; j++) {
        if (slice[j] <= slice[j - 1]) inc = false;
        if (slice[j] >= slice[j - 1]) dec = false;
      }
      if (inc || dec) { rule3++; break; }
    }
    if (rule3 > 0) violations.push({ rule: 'Rule 3', desc: '6 points steadily increasing/decreasing', count: rule3, severity: 'medium' });

    // Rule 4: 2 of 3 points beyond 2-sigma
    let rule4 = 0;
    for (let i = 2; i < values.length; i++) {
      const slice = values.slice(i - 2, i + 1);
      const beyond2 = slice.filter(v => v > s.uwl || v < s.lwl).length;
      if (beyond2 >= 2) { rule4++; break; }
    }
    if (rule4 > 0) violations.push({ rule: 'Rule 4', desc: '2 of 3 consecutive points beyond 2-sigma', count: rule4, severity: 'high' });

    const container = document.getElementById('weRulesResults');
    if (violations.length === 0) {
      container.innerHTML = `<div style="color: var(--accent-green); font-size: 0.85rem;">No Western Electric rule violations detected. Process appears stable.</div>`;
    } else {
      container.innerHTML = violations.map(v => `
        <div class="stat-row">
          <div>
            <span style="font-weight: 600; color: var(--text-primary); font-size: 0.8rem;">${v.rule}</span>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${v.desc}</div>
          </div>
          <span class="badge badge-${v.severity}">${v.severity}</span>
        </div>
      `).join('');
    }
  }

  function renderOOCSummary() {
    const values = DATA.spc.timeSeries.map(d => d.count);
    const s = DATA.spc.statistics;
    const oocPoints = values.filter(v => v > s.ucl || v < s.lcl);
    const warningPoints = values.filter(v => (v > s.uwl && v <= s.ucl) || (v < s.lwl && v >= s.lcl));

    document.getElementById('oocSummary').innerHTML = `
      <div class="stat-row">
        <span class="stat-row-label">Total Observations</span>
        <span class="stat-row-value">${values.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Out-of-Control Points</span>
        <span class="stat-row-value" style="color: var(--accent-red);">${oocPoints.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Warning Zone Points (2-3 sigma)</span>
        <span class="stat-row-value" style="color: var(--accent-amber);">${warningPoints.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">In-Control Points</span>
        <span class="stat-row-value" style="color: var(--accent-green);">${values.length - oocPoints.length - warningPoints.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">OOC Rate</span>
        <span class="stat-row-value">${((oocPoints.length / values.length) * 100).toFixed(1)}%</span>
      </div>
      <div style="margin-top: var(--space-md);">
        <div class="progress-track" style="height: 8px;">
          <div class="progress-fill green" style="width: ${((values.length - oocPoints.length - warningPoints.length) / values.length * 100)}%;"></div>
        </div>
        <div style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 4px;">Process stability: ${(((values.length - oocPoints.length) / values.length) * 100).toFixed(1)}%</div>
      </div>
    `;
  }

  function setupSPCTabs() {
    const tabs = document.querySelectorAll('[data-spc-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.dataset.spcTab;
        document.querySelectorAll('[id^="spcPanel-"]').forEach(p => p.style.display = 'none');
        document.getElementById('spcPanel-' + tabId).style.display = 'block';
      });
    });
  }

  // =============================================
  // VIEW 3: RCCA
  // =============================================
  function renderRCCAView() {
    renderFishbone();
    renderRCCategoryChart(DATA);
    renderCategoryATAChart(DATA);
    renderParetoRCChart(DATA);
    render5Why(0);
  }

  function renderFishbone() {
    const container = document.getElementById('fishboneContainer');
    const categories = Object.keys(DATA.lookups.rootCauseCategories);
    const catColors = {
      'Material': 'cat-material',
      'Process': 'cat-process',
      'Design': 'cat-design',
      'Human': 'cat-human',
      'Environmental': 'cat-environmental'
    };

    const W = 960, H = 480;
    const spineY = H / 2;
    const spineStart = 60;
    const spineEnd = W - 100;
    const headX = spineEnd;
    const boneSpacing = (spineEnd - spineStart - 80) / 3;

    let svg = `<svg class="fishbone-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;

    // Spine
    svg += `<line class="fb-spine" x1="${spineStart}" y1="${spineY}" x2="${headX}" y2="${spineY}"/>`;

    // Head
    svg += `<polygon class="fb-head" points="${headX},${spineY - 25} ${headX + 80},${spineY} ${headX},${spineY + 25}"/>`;
    svg += `<text class="fb-head-text" x="${headX + 12}" y="${spineY + 4}" font-size="11" font-weight="600">DEFECT</text>`;

    // Bones (3 top, 2 bottom)
    const topCats = categories.slice(0, 3);
    const botCats = categories.slice(3, 5);

    topCats.forEach((cat, i) => {
      const boneX = spineStart + 80 + i * boneSpacing;
      const boneEndY = 60;
      const colorClass = catColors[cat];
      const causes = DATA.lookups.rootCauseCategories[cat].slice(0, 3);

      svg += `<line class="fb-bone ${colorClass}" x1="${boneX}" y1="${spineY}" x2="${boneX + 60}" y2="${boneEndY}"/>`;
      svg += `<text class="fb-category ${colorClass}" x="${boneX + 65}" y="${boneEndY - 5}">${cat.toUpperCase()}</text>`;

      causes.forEach((cause, j) => {
        const cy = boneEndY + 30 + j * 36;
        const cx = boneX + 30 + j * 15;
        const shortCause = cause.length > 35 ? cause.slice(0, 35) + '...' : cause;
        svg += `<line class="fb-bone" x1="${cx}" y1="${cy}" x2="${boneX + (60 * (1 - (cy - boneEndY) / (spineY - boneEndY)))}" y2="${cy}" style="stroke: var(--border-primary); stroke-width: 1;"/>`;
        svg += `<text class="fb-cause" x="${cx + 5}" y="${cy - 4}" font-size="9">${shortCause}</text>`;
      });
    });

    botCats.forEach((cat, i) => {
      const boneX = spineStart + 80 + (i + 0.5) * boneSpacing;
      const boneEndY = H - 60;
      const colorClass = catColors[cat];
      const causes = DATA.lookups.rootCauseCategories[cat].slice(0, 3);

      svg += `<line class="fb-bone ${colorClass}" x1="${boneX}" y1="${spineY}" x2="${boneX + 60}" y2="${boneEndY}"/>`;
      svg += `<text class="fb-category ${colorClass}" x="${boneX + 65}" y="${boneEndY + 18}">${cat.toUpperCase()}</text>`;

      causes.forEach((cause, j) => {
        const cy = boneEndY - 30 - j * 36;
        const cx = boneX + 30 + j * 15;
        const shortCause = cause.length > 35 ? cause.slice(0, 35) + '...' : cause;
        svg += `<line class="fb-bone" x1="${cx}" y1="${cy}" x2="${boneX + (60 * (1 - (boneEndY - cy) / (boneEndY - spineY)))}" y2="${cy}" style="stroke: var(--border-primary); stroke-width: 1;"/>`;
        svg += `<text class="fb-cause" x="${cx + 5}" y="${cy - 4}" font-size="9">${shortCause}</text>`;
      });
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  function render5Why(caseIndex) {
    const cs = DATA.caseStudies[caseIndex];

    // Generate 5-Why based on case study
    const whys = [
      {
        q: 'Why did the failure occur?',
        a: cs.d2_problem
      },
      {
        q: 'Why was the component in this condition?',
        a: cs.d4_rootCause.split('.').slice(0, 2).join('.') + '.'
      },
      {
        q: 'Why was the process deviation not caught?',
        a: cs.d4_rootCause.split('.').slice(2, 4).join('.').trim() || 'Insufficient in-process quality controls and automated monitoring were not in place for the affected special process parameters.'
      },
      {
        q: 'Why were controls inadequate?',
        a: 'The supplier quality requirements document (SQRD) did not mandate automated process parameter recording for this process class. Manual verification was the sole control mechanism, creating a single point of failure.'
      },
      {
        q: 'Why was the SQRD lacking this requirement? (Root Cause)',
        a: 'The SQRD had not been updated to reflect current industry best practices for special process controls. The gap was identified during this investigation and has been closed through ' + (cs.d7_prevention[0] || 'systemic preventive action').toLowerCase() + '.'
      }
    ];

    const container = document.getElementById('fiveWhyContainer');
    container.innerHTML = whys.map((w, i) => `
      <div class="why-step">
        <div class="why-number">W${i + 1}</div>
        <div class="why-content">
          <div class="why-question">${w.q}</div>
          <div class="why-answer">${w.a}</div>
        </div>
      </div>
    `).join('');
  }

  function setupRCCATabs() {
    const tabs = document.querySelectorAll('[data-rcca-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.dataset.rccaTab;
        document.querySelectorAll('[id^="rccaPanel-"]').forEach(p => p.style.display = 'none');
        document.getElementById('rccaPanel-' + tabId).style.display = 'block';
      });
    });

    document.getElementById('fiveWhyCase').addEventListener('change', function() {
      render5Why(parseInt(this.value));
    });
  }

  // =============================================
  // VIEW 4: SUPPLIER SCORECARDS
  // =============================================
  function renderSuppliersView() {
    renderSupplierTable();
    renderMfrTrendChart(DATA);
    renderRiskDistChart(DATA);
    renderSCARAgingChart(DATA);
    populateSupplierDrilldown();
    renderSupplierDrilldown(DATA.manufacturers[0]);
  }

  function renderSupplierTable(sortBy, riskFilter) {
    let mfrs = [...DATA.manufacturers];

    if (riskFilter && riskFilter !== 'all') {
      mfrs = mfrs.filter(m => m.riskRating === riskFilter);
    }

    if (sortBy === 'severity') {
      mfrs.sort((a, b) => b.severityScore - a.severityScore);
    } else if (sortBy === 'risk') {
      const order = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      mfrs.sort((a, b) => order[a.riskRating] - order[b.riskRating]);
    }

    const tbody = document.getElementById('supplierTableBody');
    tbody.innerHTML = mfrs.map((mfr, i) => {
      const riskClass = mfr.riskRating.toLowerCase();
      const trendIcon = mfr.trend === 'Degrading' ? '&#9650;' : mfr.trend === 'Improving' ? '&#9660;' : '&#9654;';
      const trendClass = mfr.trend === 'Degrading' ? 'trend-up' : mfr.trend === 'Improving' ? 'trend-down' : 'trend-stable';

      return `
        <tr>
          <td class="cell-mono">${i + 1}</td>
          <td style="font-weight: 500;">${mfr.name}</td>
          <td class="cell-mono">${mfr.modelCount}</td>
          <td class="cell-mono cell-right">${mfr.totalEvents}</td>
          <td class="cell-mono cell-right" style="color: ${mfr.fatal > 0 ? 'var(--accent-red)' : 'inherit'}">${mfr.fatal}</td>
          <td class="cell-mono cell-right">${mfr.serious}</td>
          <td class="cell-mono cell-right">${mfr.destroyed}</td>
          <td class="cell-mono cell-right">${mfr.severityScore}</td>
          <td class="${trendClass}">${trendIcon} ${mfr.trend}</td>
          <td class="cell-mono cell-right" style="color: ${mfr.fairPassRate < 90 ? 'var(--accent-amber)' : 'var(--accent-green)'}">${mfr.fairPassRate}%</td>
          <td><span class="badge badge-${riskClass === 'critical' ? 'critical' : riskClass}">${mfr.riskRating}</span></td>
        </tr>
      `;
    }).join('');
  }

  function populateSupplierDrilldown() {
    const select = document.getElementById('supplierDrilldown');
    select.innerHTML = DATA.manufacturers.map(m =>
      `<option value="${m.name}">${m.name}</option>`
    ).join('');
  }

  function renderSupplierDrilldown(mfrData) {
    renderSupplierATAChart(mfrData);
    renderSupplierRCChart(mfrData);
  }

  function setupSupplierControls() {
    document.getElementById('supplierSort').addEventListener('change', function() {
      renderSupplierTable(this.value, document.getElementById('supplierRiskFilter').value);
    });

    document.getElementById('supplierRiskFilter').addEventListener('change', function() {
      renderSupplierTable(document.getElementById('supplierSort').value, this.value);
    });

    document.getElementById('supplierDrilldown').addEventListener('change', function() {
      const mfr = DATA.manufacturers.find(m => m.name === this.value);
      if (mfr) renderSupplierDrilldown(mfr);
    });
  }

  // =============================================
  // VIEW 5: NCR 8D SIMULATOR
  // =============================================
  function renderNCRView() {
    render8DCase(current8DCase);
    render8DStep(current8DStep);
  }

  function render8DCase(caseIndex) {
    const cs = DATA.caseStudies[caseIndex];
    const summary = document.getElementById('ncrCaseSummary');
    summary.innerHTML = `
      <div class="case-card-header">
        <div>
          <div class="case-card-title">${cs.title}</div>
          <div class="case-card-meta">Case ${cs.id} | ATA ${cs.ataCode} â€” ${DATA.lookups.ataCodes[cs.ataCode]} | Severity: ${cs.severity}</div>
        </div>
        <span class="badge badge-${cs.severity === 'Fatal' ? 'critical' : cs.severity === 'Serious' ? 'high' : 'medium'}">${cs.severity}</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-lg); margin-top: var(--space-md); font-size: 0.8rem; color: var(--text-secondary); background: var(--bg-surface); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); border-left: 3px solid var(--accent-purple);">
        <div><strong style="color: var(--text-primary);">PFMEA RPN:</strong> ${cs.rpn}</div>
        <div><strong style="color: var(--text-primary);">Supplier CAGE:</strong> ${cs.cageCode}</div>
        <div><strong style="color: var(--text-primary);">Heat Lot:</strong> ${cs.heatLot}</div>
        <div><strong style="color: var(--text-primary);">Affected S/N:</strong> ${cs.serialNumberRange}</div>
      </div>
      <div style="margin-top: var(--space-sm); font-size: 0.75rem; color: var(--text-tertiary);">
        <strong>Traceability:</strong> Batch ID ${cs.heatLot} verified against production run ${cs.serialNumberRange}.
      </div>
      <p class="case-card-summary">${cs.summary}</p>
    `;
  }

  function render8DStep(stepIndex) {
    const cs = DATA.caseStudies[current8DCase];
    const content = document.getElementById('eightDContent');

    const steps = [
      {
        title: 'D1 â€” Establish the Team',
        body: `<p>A cross-functional team has been assembled with the expertise required to address this non-conformance:</p>
               <ul>${cs.d1_team.map(m => `<li>${m}</li>`).join('')}</ul>
               <p style="margin-top: var(--space-md); color: var(--text-tertiary); font-size: 0.8rem;">Team composition follows AS9145 requirements for PPAP/8D problem resolution.</p>`
      },
      {
        title: 'D2 â€” Define the Problem',
        body: `<p>${cs.d2_problem}</p>`
      },
      {
        title: 'D3 â€” Implement Interim Containment Actions',
        body: `<p>The following containment actions have been implemented to protect the customer from further exposure to non-conforming product:</p>
               <ul>${cs.d3_containment.map(a => `<li>${a}</li>`).join('')}</ul>`
      },
      {
        title: 'D4 â€” Determine Root Cause',
        body: `<p>${cs.d4_rootCause}</p>`
      },
      {
        title: 'D5 â€” Develop Permanent Corrective Actions',
        body: `<p>The following permanent corrective actions have been developed and are being implemented:</p>
               <ul>${cs.d5_corrective.map(a => `<li>${a}</li>`).join('')}</ul>`
      },
      {
        title: 'D6 â€” Implement and Verify Corrective Actions',
        body: `<p>Verification activities confirm the effectiveness of corrective actions:</p>
               <ul>${cs.d6_verification.map(a => `<li>${a}</li>`).join('')}</ul>`
      },
      {
        title: 'D7 â€” Prevent Recurrence (Systemic Actions)',
        body: `<p>Systemic preventive actions to ensure the root cause cannot recur across the supplier base:</p>
               <ul>${cs.d7_prevention.map(a => `<li>${a}</li>`).join('')}</ul>`
      },
      {
        title: 'D8 â€” Closure and Team Recognition',
        body: `<p>${cs.d8_recognition}</p>
               <div style="margin-top: var(--space-lg); padding: var(--space-lg); background: var(--accent-green-dim); border-radius: var(--radius-md); border-left: 3px solid var(--accent-green);">
                 <p style="color: var(--accent-green); font-weight: 600; margin-bottom: var(--space-sm);">8D Report Complete</p>
                 <p style="color: var(--text-secondary);">All 8 disciplines have been addressed. This non-conformance report is closed pending final verification audit at the supplier facility.</p>
               </div>`
      }
    ];

    content.innerHTML = `<h3>${steps[stepIndex].title}</h3>${steps[stepIndex].body}`;

    // Update nav
    document.querySelectorAll('.eight-d-step-nav').forEach((nav, i) => {
      nav.classList.remove('active', 'completed');
      if (i < stepIndex) nav.classList.add('completed');
      if (i === stepIndex) nav.classList.add('active');
    });

    document.getElementById('eightDPrev').disabled = stepIndex === 0;
    document.getElementById('eightDNext').textContent = stepIndex === 7 ? 'Complete' : 'Next Step';
    document.getElementById('eightDNext').disabled = stepIndex === 7;
    document.getElementById('eightDProgress').textContent = `Step ${stepIndex + 1} of 8`;
  }

  function setup8DNavigation() {
    document.getElementById('eightDNext').addEventListener('click', function() {
      if (current8DStep < 7) {
        current8DStep++;
        render8DStep(current8DStep);
      }
    });

    document.getElementById('eightDPrev').addEventListener('click', function() {
      if (current8DStep > 0) {
        current8DStep--;
        render8DStep(current8DStep);
      }
    });

    document.querySelectorAll('.eight-d-step-nav').forEach(nav => {
      nav.addEventListener('click', function() {
        current8DStep = parseInt(this.dataset.step);
        render8DStep(current8DStep);
      });
    });

    document.getElementById('ncrCaseSelect').addEventListener('change', function() {
      current8DCase = parseInt(this.value);
      current8DStep = 0;
      render8DCase(current8DCase);
      render8DStep(0);
    });
  }

  // =============================================
  // VIEW 6: DEFECT TRENDS
  // =============================================
  function renderTrendsView() {
    populateTrendFilters();
    const ataFilter = document.getElementById('trendATAFilter').value;
    const sevFilter = document.getElementById('trendSeverityFilter').value;
    renderDefectTrendChart(DATA, ataFilter, sevFilter);
    renderSeverityScoreChart(DATA);
    renderATAHeatmapChart(DATA);
    renderDamageTrendChart(DATA);
    renderDispositioningSummary();
  }

  function populateTrendFilters() {
    const select = document.getElementById('trendATAFilter');
    if (select.options.length > 1) return;

    const ataCodes = Object.entries(DATA.lookups.ataCodes)
      .sort((a, b) => a[0].localeCompare(b[0]));

    ataCodes.forEach(([code, desc]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `ATA ${code} â€” ${desc}`;
      select.appendChild(opt);
    });
  }

  function renderDispositioningSummary() {
    // Simulate dispositioning categories based on severity and damage
    const events = DATA.events;
    const recent = events.filter(e => e.year >= 2025);
    const total = recent.length;

    const useAsIs = recent.filter(e => e.aircraftDamage === 'None' && e.injurySeverity === 'None').length;
    const repair = recent.filter(e => e.aircraftDamage === 'Minor').length;
    const rework = recent.filter(e => e.aircraftDamage === 'Substantial').length;
    const scrap = recent.filter(e => e.aircraftDamage === 'Destroyed').length;
    const mrbReview = Math.round(total * 0.12);

    const container = document.getElementById('dispositioningSummary');
    container.innerHTML = `
      <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">Based on 2025-2026 events (${total} records)</div>
      <div class="stat-row">
        <span class="stat-row-label">Use-As-Is (UAI)</span>
        <div>
          <span class="stat-row-value" style="color: var(--accent-green);">${useAsIs}</span>
          <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-left: 8px;">${((useAsIs/total)*100).toFixed(1)}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Repair</span>
        <div>
          <span class="stat-row-value" style="color: var(--accent-blue);">${repair}</span>
          <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-left: 8px;">${((repair/total)*100).toFixed(1)}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Rework / MRB Disposition</span>
        <div>
          <span class="stat-row-value" style="color: var(--accent-amber);">${rework}</span>
          <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-left: 8px;">${((rework/total)*100).toFixed(1)}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Scrap / Beyond Economical Repair</span>
        <div>
          <span class="stat-row-value" style="color: var(--accent-red);">${scrap}</span>
          <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-left: 8px;">${((scrap/total)*100).toFixed(1)}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Pending MRB Review</span>
        <div>
          <span class="stat-row-value" style="color: var(--accent-purple);">${mrbReview}</span>
          <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-left: 8px;">${((mrbReview/total)*100).toFixed(1)}%</span>
        </div>
      </div>
      <hr class="section-divider">
      <div style="font-size: 0.75rem; color: var(--text-tertiary);">
        Disposition categories follow AS9102 FAIR and AS9145 PPAP guidelines.
        MRB (Material Review Board) reviews are triggered for substantial damage events requiring engineering disposition authority.
      </div>
    `;
  }

  function setupTrendFilters() {
    document.getElementById('trendATAFilter').addEventListener('change', function() {
      renderDefectTrendChart(DATA, this.value, document.getElementById('trendSeverityFilter').value);
    });
    document.getElementById('trendSeverityFilter').addEventListener('change', function() {
      renderDefectTrendChart(DATA, document.getElementById('trendATAFilter').value, this.value);
    });
  }

  // --- Initialize ---
  document.addEventListener('DOMContentLoaded', init);

})();
