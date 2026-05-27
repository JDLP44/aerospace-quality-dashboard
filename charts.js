// ============================================================
// Aerospace Quality Control Dashboard — Charts Module
// Chart.js configurations and rendering functions
// ============================================================

const CHART_COLORS = {
  blue: '#58a6ff',
  green: '#3fb950',
  red: '#f85149',
  amber: '#d29922',
  purple: '#bc8cff',
  orange: '#f0883e',
  cyan: '#56d4dd',
  pink: '#f778ba',
  blueDim: 'rgba(88, 166, 255, 0.15)',
  greenDim: 'rgba(63, 185, 80, 0.15)',
  redDim: 'rgba(248, 81, 73, 0.15)',
  amberDim: 'rgba(210, 153, 34, 0.15)',
  purpleDim: 'rgba(188, 140, 255, 0.15)',
  grid: 'rgba(48, 54, 61, 0.5)',
  gridLight: 'rgba(48, 54, 61, 0.25)',
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textTertiary: '#6e7681'
};

// Default Chart.js settings
Chart.defaults.color = CHART_COLORS.textSecondary;
Chart.defaults.borderColor = CHART_COLORS.grid;
Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = '#21262d';
Chart.defaults.plugins.tooltip.borderColor = '#30363d';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.titleFont = { family: "'Inter', sans-serif", size: 12, weight: '600' };
Chart.defaults.plugins.tooltip.bodyFont = { family: "'Inter', sans-serif", size: 11 };
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.animation.duration = 600;

// Store chart instances for cleanup
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function createChart(canvasId, config) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  chartInstances[canvasId] = new Chart(ctx, config);
  return chartInstances[canvasId];
}

// --- Executive Summary Charts ---

function renderYearlyTrendChart(data) {
  const years = Object.keys(data.kpi.byYear).sort();
  const counts = years.map(y => data.kpi.byYear[y]);

  createChart('chartYearlyTrend', {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Incidents',
        data: counts,
        backgroundColor: counts.map((c, i) => {
          if (i === counts.length - 1) return CHART_COLORS.amberDim;
          return CHART_COLORS.blueDim;
        }),
        borderColor: counts.map((c, i) => {
          if (i === counts.length - 1) return CHART_COLORS.amber;
          return CHART_COLORS.blue;
        }),
        borderWidth: 1,
        borderRadius: 3,
        maxBarThickness: 50
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: function(ctx) {
              const yr = years[ctx.dataIndex];
              if (parseInt(yr) === 2026) return '(Partial year — through May)';
              return '';
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridLight },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

function renderSeverityDistChart(data) {
  const sev = data.kpi.bySeverity;
  createChart('chartSeverityDist', {
    type: 'doughnut',
    data: {
      labels: ['Fatal', 'Serious', 'Minor', 'None'],
      datasets: [{
        data: [sev.fatal, sev.serious, sev.minor, sev.none],
        backgroundColor: [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.amber, CHART_COLORS.green],
        borderColor: '#161b22',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { padding: 12 }
        }
      }
    }
  });
}

function renderPhaseOfFlightChart(data) {
  const phases = Object.entries(data.kpi.byPhase)
    .sort((a, b) => b[1] - a[1]);

  createChart('chartPhaseOfFlight', {
    type: 'bar',
    data: {
      labels: phases.map(p => p[0]),
      datasets: [{
        data: phases.map(p => p[1]),
        backgroundColor: CHART_COLORS.purpleDim,
        borderColor: CHART_COLORS.purple,
        borderWidth: 1,
        borderRadius: 3,
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridLight },
          ticks: { precision: 0 }
        },
        y: { grid: { display: false } }
      }
    }
  });
}

// --- SPC Charts ---

function renderIChart(spcData) {
  const labels = spcData.timeSeries.map(d => d.period);
  const values = spcData.timeSeries.map(d => d.count);
  const stats = spcData.statistics;

  const pointColors = values.map(v => {
    if (v > stats.ucl || v < stats.lcl) return CHART_COLORS.red;
    if (v > stats.uwl || v < stats.lwl) return CHART_COLORS.amber;
    return CHART_COLORS.blue;
  });

  const pointSizes = values.map(v => {
    if (v > stats.ucl || v < stats.lcl) return 6;
    return 3;
  });

  createChart('chartIChart', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Monthly Count',
          data: values,
          borderColor: CHART_COLORS.blue,
          backgroundColor: CHART_COLORS.blueDim,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: pointSizes,
          pointHoverRadius: 6,
          borderWidth: 1.5,
          tension: 0.1,
          fill: false
        },
        {
          label: 'UCL (' + stats.ucl.toFixed(1) + ')',
          data: Array(labels.length).fill(stats.ucl),
          borderColor: CHART_COLORS.red,
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Mean (' + stats.mean.toFixed(1) + ')',
          data: Array(labels.length).fill(stats.mean),
          borderColor: CHART_COLORS.green,
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'LCL (' + stats.lcl.toFixed(1) + ')',
          data: Array(labels.length).fill(stats.lcl),
          borderColor: CHART_COLORS.amber,
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            callback: function(val, idx) {
              return idx % 3 === 0 ? this.getLabelForValue(val) : '';
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridLight }
        }
      }
    }
  });
}

function renderMRChart(spcData) {
  const labels = spcData.timeSeries.slice(1).map(d => d.period);
  const mrValues = spcData.movingRanges;
  const stats = spcData.statistics;

  const pointColors = mrValues.map(v => v > stats.mrUCL ? CHART_COLORS.red : CHART_COLORS.cyan);

  createChart('chartMRChart', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Moving Range',
          data: mrValues,
          borderColor: CHART_COLORS.cyan,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 3,
          borderWidth: 1.5,
          tension: 0.1,
          fill: false
        },
        {
          label: 'MR Mean (' + stats.mrMean.toFixed(1) + ')',
          data: Array(labels.length).fill(stats.mrMean),
          borderColor: CHART_COLORS.green,
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'MR UCL (' + stats.mrUCL.toFixed(1) + ')',
          data: Array(labels.length).fill(stats.mrUCL),
          borderColor: CHART_COLORS.red,
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            callback: function(val, idx) {
              return idx % 3 === 0 ? this.getLabelForValue(val) : '';
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridLight }
        }
      }
    }
  });
}

function renderPChart(spcData) {
  const labels = spcData.timeSeries.map(d => d.period);
  const proportions = spcData.timeSeries.map(d =>
    d.count > 0 ? ((d.fatal + d.serious) / d.count) : 0
  );

  const pBar = proportions.reduce((a, b) => a + b, 0) / proportions.length;
  const counts = spcData.timeSeries.map(d => d.count);
  const avgN = counts.reduce((a, b) => a + b, 0) / counts.length;
  const pUCL = pBar + 3 * Math.sqrt((pBar * (1 - pBar)) / avgN);
  const pLCL = Math.max(0, pBar - 3 * Math.sqrt((pBar * (1 - pBar)) / avgN));

  const pointColors = proportions.map(v => {
    if (v > pUCL) return CHART_COLORS.red;
    return CHART_COLORS.purple;
  });

  createChart('chartPChart', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Proportion (Fatal + Serious)',
          data: proportions.map(p => Math.round(p * 10000) / 10000),
          borderColor: CHART_COLORS.purple,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 3,
          borderWidth: 1.5,
          tension: 0.1,
          fill: false
        },
        {
          label: 'p-bar (' + (pBar * 100).toFixed(1) + '%)',
          data: Array(labels.length).fill(Math.round(pBar * 10000) / 10000),
          borderColor: CHART_COLORS.green,
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'UCL (' + (pUCL * 100).toFixed(1) + '%)',
          data: Array(labels.length).fill(Math.round(pUCL * 10000) / 10000),
          borderColor: CHART_COLORS.red,
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'LCL (' + (pLCL * 100).toFixed(1) + '%)',
          data: Array(labels.length).fill(Math.round(pLCL * 10000) / 10000),
          borderColor: CHART_COLORS.amber,
          borderWidth: 1,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ctx.dataset.label + ': ' + (ctx.raw * 100).toFixed(1) + '%';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            callback: function(val, idx) {
              return idx % 3 === 0 ? this.getLabelForValue(val) : '';
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridLight },
          ticks: {
            callback: function(val) { return (val * 100).toFixed(0) + '%'; }
          }
        }
      }
    }
  });
}

// --- RCCA Charts ---

function renderRCCategoryChart(data) {
  const categories = Object.entries(data.findings.byCategory)
    .sort((a, b) => b[1] - a[1]);

  const colors = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.orange, CHART_COLORS.amber];

  createChart('chartRCCategory', {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c[0]),
      datasets: [{
        data: categories.map(c => c[1]),
        backgroundColor: colors,
        borderColor: '#161b22',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'right', labels: { padding: 12 } }
      }
    }
  });
}

function renderCategoryATAChart(data) {
  const top10 = data.findings.categoryByATA.slice(0, 10);
  const catColors = {
    'Material': CHART_COLORS.blue,
    'Process': CHART_COLORS.green,
    'Design': CHART_COLORS.purple,
    'Human': CHART_COLORS.orange,
    'Environmental': CHART_COLORS.amber
  };

  createChart('chartCategoryATA', {
    type: 'bar',
    data: {
      labels: top10.map(d => `ATA ${d.ataCode}`),
      datasets: [{
        data: top10.map(d => d.count),
        backgroundColor: top10.map(d => catColors[d.category] || CHART_COLORS.blue),
        borderRadius: 3,
        maxBarThickness: 30
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(ctx) {
              const item = top10[ctx[0].dataIndex];
              return `ATA ${item.ataCode} — ${item.ataDesc}`;
            },
            afterLabel: function(ctx) {
              return 'Category: ' + top10[ctx.dataIndex].category;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } }
      }
    }
  });
}

function renderParetoRCChart(data) {
  const top15 = data.findings.topCauses.slice(0, 15);
  const total = top15.reduce((sum, c) => sum + c.count, 0);
  let cumulative = 0;
  const cumulativePct = top15.map(c => {
    cumulative += c.count;
    return Math.round((cumulative / total) * 10000) / 100;
  });

  createChart('chartParetoRC', {
    type: 'bar',
    data: {
      labels: top15.map((c, i) => `${i + 1}. ${c.cause.length > 40 ? c.cause.slice(0, 40) + '...' : c.cause}`),
      datasets: [
        {
          type: 'bar',
          label: 'Frequency',
          data: top15.map(c => c.count),
          backgroundColor: CHART_COLORS.blueDim,
          borderColor: CHART_COLORS.blue,
          borderWidth: 1,
          borderRadius: 3,
          yAxisID: 'y',
          maxBarThickness: 40
        },
        {
          type: 'line',
          label: 'Cumulative %',
          data: cumulativePct,
          borderColor: CHART_COLORS.amber,
          pointBackgroundColor: CHART_COLORS.amber,
          pointRadius: 3,
          borderWidth: 2,
          tension: 0.2,
          yAxisID: 'y1',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            title: function(ctx) {
              const idx = ctx[0].dataIndex;
              return top15[idx].cause;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45, font: { size: 10 } }
        },
        y: {
          beginAtZero: true,
          position: 'left',
          grid: { color: CHART_COLORS.gridLight },
          ticks: { precision: 0 },
          title: { display: true, text: 'Frequency', color: CHART_COLORS.textTertiary }
        },
        y1: {
          beginAtZero: true,
          max: 100,
          position: 'right',
          grid: { display: false },
          ticks: {
            callback: function(val) { return val + '%'; }
          },
          title: { display: true, text: 'Cumulative %', color: CHART_COLORS.textTertiary }
        }
      }
    }
  });
}

// --- Supplier Charts ---

function renderMfrTrendChart(data) {
  const top5 = data.manufacturers.slice(0, 5);
  const allYears = [...new Set(data.events.map(e => e.year))].sort();
  const colors = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.orange, CHART_COLORS.amber];

  const datasets = top5.map((mfr, i) => ({
    label: mfr.name,
    data: allYears.map(y => mfr.yearlyTrend[y] || 0),
    borderColor: colors[i],
    backgroundColor: 'transparent',
    pointRadius: 3,
    pointBackgroundColor: colors[i],
    borderWidth: 2,
    tension: 0.2
  }));

  createChart('chartMfrTrend', {
    type: 'line',
    data: { labels: allYears, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } }
      }
    }
  });
}

function renderRiskDistChart(data) {
  const riskCounts = { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 };
  data.manufacturers.forEach(m => { riskCounts[m.riskRating]++; });

  createChart('chartRiskDist', {
    type: 'doughnut',
    data: {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      datasets: [{
        data: [riskCounts.Low, riskCounts.Medium, riskCounts.High, riskCounts.Critical],
        backgroundColor: [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.orange, CHART_COLORS.red],
        borderColor: '#161b22',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: { legend: { position: 'right', labels: { padding: 12 } } }
    }
  });
}

function renderSupplierATAChart(mfrData) {
  const ataCodes = Object.entries(mfrData.ataCodes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  createChart('chartSupplierATA', {
    type: 'bar',
    data: {
      labels: ataCodes.map(a => `ATA ${a[0]}`),
      datasets: [{
        data: ataCodes.map(a => a[1]),
        backgroundColor: CHART_COLORS.blueDim,
        borderColor: CHART_COLORS.blue,
        borderWidth: 1,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(ctx) {
              const code = ataCodes[ctx[0].dataIndex][0];
              return 'ATA ' + code + ' — ' + (window.AEROSPACE_DATA.lookups.ataCodes[code] || '');
            }
          }
        }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } },
        y: { grid: { display: false } }
      }
    }
  });
}

function renderSupplierRCChart(mfrData) {
  const cats = Object.entries(mfrData.rootCauses).sort((a, b) => b[1] - a[1]);
  const catColors = {
    'Material': CHART_COLORS.blue,
    'Process': CHART_COLORS.green,
    'Design': CHART_COLORS.purple,
    'Human': CHART_COLORS.orange,
    'Environmental': CHART_COLORS.amber
  };

  createChart('chartSupplierRC', {
    type: 'doughnut',
    data: {
      labels: cats.map(c => c[0]),
      datasets: [{
        data: cats.map(c => c[1]),
        backgroundColor: cats.map(c => catColors[c[0]] || CHART_COLORS.blue),
        borderColor: '#161b22',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      plugins: { legend: { position: 'right', labels: { padding: 10 } } }
    }
  });
}

// --- Defect Trends Charts ---

function renderDefectTrendChart(data, ataFilter, severityFilter) {
  let filtered = data.events;
  if (ataFilter && ataFilter !== 'all') {
    filtered = filtered.filter(e => e.ataCode === ataFilter);
  }
  if (severityFilter && severityFilter !== 'all') {
    filtered = filtered.filter(e => e.injurySeverity === severityFilter);
  }

  // Monthly aggregation
  const monthly = {};
  filtered.forEach(ev => {
    const key = `${ev.year}-${String(ev.month).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = 0;
    monthly[key]++;
  });

  const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
  const labels = sorted.map(s => s[0]);
  const values = sorted.map(s => s[1]);

  // Moving average (3-period)
  const ma = values.map((v, i) => {
    if (i < 2) return null;
    return Math.round(((values[i - 2] + values[i - 1] + v) / 3) * 100) / 100;
  });

  createChart('chartDefectTrend', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Monthly Count',
          data: values,
          borderColor: CHART_COLORS.blue,
          backgroundColor: CHART_COLORS.blueDim,
          pointRadius: 2,
          borderWidth: 1.5,
          tension: 0.15,
          fill: true
        },
        {
          label: '3-Period Moving Average',
          data: ma,
          borderColor: CHART_COLORS.amber,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [6, 3],
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            callback: function(val, idx) { return idx % 4 === 0 ? this.getLabelForValue(val) : ''; }
          }
        },
        y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } }
      }
    }
  });
}

function renderSeverityScoreChart(data) {
  const monthly = {};
  data.events.forEach(ev => {
    const key = `${ev.year}-${String(ev.month).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = 0;
    const weight = ev.injurySeverity === 'Fatal' ? 10 : ev.injurySeverity === 'Serious' ? 5 : ev.injurySeverity === 'Minor' ? 2 : 0.5;
    monthly[key] += weight;
  });

  const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));

  createChart('chartSeverityScore', {
    type: 'line',
    data: {
      labels: sorted.map(s => s[0]),
      datasets: [{
        label: 'Severity-Weighted Score',
        data: sorted.map(s => Math.round(s[1] * 10) / 10),
        borderColor: CHART_COLORS.red,
        backgroundColor: CHART_COLORS.redDim,
        pointRadius: 2,
        borderWidth: 1.5,
        tension: 0.15,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            callback: function(val, idx) { return idx % 4 === 0 ? this.getLabelForValue(val) : ''; }
          }
        },
        y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLight } }
      }
    }
  });
}

function renderATAHeatmapChart(data) {
  // Top 8 ATA codes
  const ataCounts = {};
  data.events.forEach(ev => {
    if (!ataCounts[ev.ataCode]) ataCounts[ev.ataCode] = 0;
    ataCounts[ev.ataCode]++;
  });
  const topATA = Object.entries(ataCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(a => a[0]);
  const years = [...new Set(data.events.map(e => e.year))].sort();

  const datasets = topATA.map((ata, i) => {
    const yearData = {};
    data.events.filter(e => e.ataCode === ata).forEach(e => {
      if (!yearData[e.year]) yearData[e.year] = 0;
      yearData[e.year]++;
    });

    const hues = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.orange,
                  CHART_COLORS.amber, CHART_COLORS.cyan, CHART_COLORS.pink, CHART_COLORS.red];

    return {
      label: `ATA ${ata}`,
      data: years.map(y => yearData[y] || 0),
      backgroundColor: hues[i],
      borderRadius: 2,
      maxBarThickness: 16
    };
  });

  createChart('chartATAHeatmap', {
    type: 'bar',
    data: { labels: years, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 } } },
        tooltip: {
          callbacks: {
            title: function(ctx) {
              const ata = topATA[ctx[0].datasetIndex];
              return 'ATA ' + ata + ' — ' + (data.lookups.ataCodes[ata] || '');
            }
          }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } }
      }
    }
  });
}

function renderDamageTrendChart(data) {
  const years = [...new Set(data.events.map(e => e.year))].sort();
  const damageTypes = ['Destroyed', 'Substantial', 'Minor', 'None'];
  const damageColors = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.amber, CHART_COLORS.green];

  const datasets = damageTypes.map((dmg, i) => ({
    label: dmg,
    data: years.map(y => data.events.filter(e => e.year === y && e.aircraftDamage === dmg).length),
    backgroundColor: damageColors[i],
    borderRadius: 2,
    maxBarThickness: 25
  }));

  createChart('chartDamageTrend', {
    type: 'bar',
    data: { labels: years, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } }
      }
    }
  });
}

function renderSCARAgingChart(data) {
  // Aggregate SCARs from all manufacturers
  let s30 = 0, s60 = 0, s90 = 0;
  data.manufacturers.forEach(m => {
    // distribute the random openSCARs count
    for (let i=0; i<m.openSCARs; i++) {
      let r = Math.random();
      if (r < 0.6) s30++;
      else if (r < 0.85) s60++;
      else s90++;
    }
  });

  createChart('chartSCARAging', {
    type: 'bar',
    data: {
      labels: ['0-30 Days', '31-60 Days', '61-90+ Days'],
      datasets: [{
        label: 'Open SCARs',
        data: [s30, s60, s90],
        backgroundColor: [CHART_COLORS.blueDim, CHART_COLORS.amberDim, CHART_COLORS.redDim],
        borderColor: [CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.red],
        borderWidth: 1,
        borderRadius: 3,
        maxBarThickness: 50
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLight }, ticks: { precision: 0 } }
      }
    }
  });
}
