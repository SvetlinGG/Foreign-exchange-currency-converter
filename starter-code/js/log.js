import { getLog, removeLogEntry, clearLog } from './store.js';

const listEl     = document.getElementById('logList');
const emptyEl    = document.getElementById('logEmpty');
const totalEl    = document.getElementById('logTotal');
const countBadge = document.getElementById('logCount');
const clearBtn   = document.getElementById('logClearBtn');

function relativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function renderRow(entry) {
  const { id, base, target, amount, result, timestamp } = entry;
  const li = document.createElement('li');
  li.className  = 'log__item';
  li.dataset.id = id;
  li.innerHTML = `
    <span class="log__time">${relativeTime(timestamp)}</span>
    <span class="log__pair">${base} → ${target}</span>
    <span class="log__amounts">
      <span class="log__send">${amount.toLocaleString()} ${base}</span>
      <img src="/starter-code/assets/images/icon-arrow-right.svg" alt="=" class="log__arrow">
      <span class="log__receive">${result.toLocaleString()} ${target}</span>
    </span>
    <button class="log__delete" aria-label="Delete this conversion">
      <img src="/starter-code/assets/images/icon-delete.svg" alt="">
    </button>
  `;
  li.querySelector('.log__delete').addEventListener('click', () => {
    removeLogEntry(id);
    document.dispatchEvent(new CustomEvent('fx:log-changed'));
  });
  return li;
}

export function loadLog() {
  const entries = getLog();

  countBadge.textContent = entries.length || '';
  totalEl.textContent    = entries.length ? `${entries.length} logged` : '';

  if (!entries.length) {
    listEl.hidden  = true;
    emptyEl.hidden = false;
    clearBtn.hidden = true;
    return;
  }

  listEl.innerHTML = '';
  entries.forEach(e => listEl.appendChild(renderRow(e)));
  listEl.hidden   = false;
  emptyEl.hidden  = true;
  clearBtn.hidden = false;
}

export function initLog() {
  clearBtn.addEventListener('click', () => {
    clearLog();
    document.dispatchEvent(new CustomEvent('fx:log-changed'));
  });
  document.addEventListener('fx:log-changed', loadLog);
}
