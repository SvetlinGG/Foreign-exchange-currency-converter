import { getHistory, getRate } from './api.js';
import { getActivePair } from './converter.js';

const chartEl     = document.getElementById('historyChart');
const errorEl     = document.getElementById('historyError');
const errorPairEl = document.getElementById('errorPair');
const rangeBtns   = document.querySelectorAll('.range-switcher__btn');
const openEl      = document.getElementById('historyOpen');
const lastEl      = document.getElementById('historyLast');
const changeEl    = document.getElementById('historyChange');
const pctEl       = document.getElementById('historyPctChange');
const chartPairEl = document.getElementById('chartPair');
const chartRateEl = document.getElementById('chartRate');

let activeRange = '1M';

function updateStats(rates) {
  const values = Object.values(rates);
  const open   = values[0];
  const last   = values[values.length - 1];
  const change = last - open;
  const pct    = (change / open) * 100;
  const dir    = change >= 0 ? 'up' : 'down';

  openEl.textContent   = open.toFixed(4);
  lastEl.textContent   = last.toFixed(4);
  changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(4)}`;
  pctEl.textContent    = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`;

  changeEl.className = `history__stat-value history__stat-value--${dir}`;
  pctEl.className    = `history__stat-value history__stat-value--${dir}`;
}

function drawChart(dates, values) {
  const canvas = chartEl;
  canvas.width  = canvas.clientWidth  || 600;
  canvas.height = canvas.clientHeight || 280;

  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const pad  = { top: 16, right: 16, bottom: 32, left: 48 };
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const rangeV = maxV - minV || 1;

  const toX = i  => pad.left + (i / (values.length - 1)) * (W - pad.left - pad.right);
  const toY = v  => pad.top  + (1 - (v - minV) / rangeV) * (H - pad.top - pad.bottom);

  
  const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
  grad.addColorStop(0, 'rgba(99,179,237,0.3)');
  grad.addColorStop(1, 'rgba(99,179,237,0)');

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  values.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(values.length - 1), H - pad.bottom);
  ctx.lineTo(toX(0), H - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  values.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.strokeStyle = '#63b3ed';
  ctx.lineWidth   = 2;
  ctx.stroke();

  
  ctx.fillStyle  = '#718096';
  ctx.font       = '11px JetBrains Mono, monospace';
  ctx.textAlign  = 'right';
  [minV, (minV + maxV) / 2, maxV].forEach(v => {
    ctx.fillText(v.toFixed(4), pad.left - 6, toY(v) + 4);
  });

  
  ctx.textAlign = 'center';
  const step = Math.floor(dates.length / 5) || 1;
  dates.forEach((d, i) => {
    if (i % step === 0) ctx.fillText(d.slice(5), toX(i), H - pad.bottom + 16);
  });
}

export async function loadHistory(range = activeRange) {
  const { base, target } = getActivePair();
  activeRange = range;

  chartPairEl.textContent = `${base}/${target}`;
  errorEl.hidden = true;
  chartEl.hidden = false;

  try {
    const data  = await getHistory(base, target, range);
    const dates = Object.keys(data.rates).sort();
    const rates = {};
    dates.forEach(d => { rates[d] = data.rates[d][target]; });

    updateStats(rates);
    drawChart(dates, Object.values(rates));

    const last = Object.values(rates).at(-1);
    chartRateEl.textContent = `${last.toFixed(4)} · ${dates.at(-1)}`;
  } catch {
    chartEl.hidden = true;
    errorEl.hidden = false;
    errorPairEl.textContent = `${base}/${target}`;
  }
}

export function initHistory() {
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach(b => { b.classList.remove('range-switcher__btn--active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('range-switcher__btn--active');
      btn.setAttribute('aria-pressed', 'true');
      loadHistory(btn.dataset.range);
    });
  });

  document.addEventListener('fx:pair-changed', () => loadHistory(activeRange));
}
