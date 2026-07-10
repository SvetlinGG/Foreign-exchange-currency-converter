import { getLatest } from './api.js';
import { getActivePair, getSendAmount } from './converter.js';
import { isFavorite, addFavorite, removeFavorite } from './store.js';

const listEl    = document.getElementById('compareList');
const emptyEl   = document.getElementById('compareEmpty');
const amountEl  = document.getElementById('compareAmount');
const countEl   = document.getElementById('compareCount');

const COMPARE_CURRENCIES = [
  'EUR','GBP','JPY','CHF','AUD','CAD','CNY','SGD',
  'HKD','NZD','SEK','NOK','DKK','PLN','HUF','CZK',
  'TRY','BRL','MXN','ZAR','INR','KRW','THB','IDR',
];

function getFlagCode(code) {
  const overrides = { EUR:'eu', USD:'us', GBP:'gb', AUD:'au', CAD:'ca',
    CHF:'ch', CNY:'cn', JPY:'jp', NZD:'nz', SEK:'se', NOK:'no',
    DKK:'dk', SGD:'sg', HKD:'hk', KRW:'kr', INR:'in', BRL:'br',
    MXN:'mx', ZAR:'za', TRY:'tr', PLN:'pl', THB:'th', IDR:'id',
    HUF:'hu', CZK:'cz' };
  return overrides[code] ?? code.slice(0, 2).toLowerCase();
}

function renderRow(base, code, name, rate, amount) {
  const converted = (amount * rate).toFixed(2);
  const pinned    = isFavorite(base, code);
  const li        = document.createElement('li');
  li.className    = 'compare__item';
  li.dataset.code = code;
  li.innerHTML = `
    <img class="compare__flag" src="/starter-code/assets/images/flags/${getFlagCode(code)}.webp" alt="${code}" onerror="this.style.display='none'">
    <span class="compare__code">${code}</span>
    <span class="compare__name">${name ?? ''}</span>
    <span class="compare__converted">${converted}</span>
    <span class="compare__rate">@ ${rate.toFixed(4)}</span>
    <button class="compare__pin" aria-label="${pinned ? 'Unpin' : 'Pin'} ${base}/${code}" aria-pressed="${pinned}">
      <img src="/starter-code/assets/images/${pinned ? 'icon-star-filled' : 'icon-star'}.svg" alt="">
    </button>
  `;
  li.querySelector('.compare__pin').addEventListener('click', e => {
    const btn = e.currentTarget;
    const isPinned = btn.getAttribute('aria-pressed') === 'true';
    isPinned ? removeFavorite(base, code) : addFavorite(base, code);
    btn.setAttribute('aria-pressed', !isPinned);
    btn.setAttribute('aria-label', `${!isPinned ? 'Unpin' : 'Pin'} ${base}/${code}`);
    btn.querySelector('img').src = `/starter-code/assets/images/${!isPinned ? 'icon-star-filled' : 'icon-star'}.svg`;
    document.dispatchEvent(new CustomEvent('fx:favorites-changed'));
  });
  return li;
}

export async function loadCompare(currencies = {}) {
  const { base } = getActivePair();
  const amount   = getSendAmount();

  if (!amount) {
    listEl.hidden  = true;
    emptyEl.hidden = false;
    return;
  }

  try {
    const data  = await getLatest(base);
    const rates = data.rates;
    const targets = COMPARE_CURRENCIES.filter(c => c !== base && rates[c]);

    listEl.innerHTML = '';
    targets.forEach(code => {
      listEl.appendChild(renderRow(base, code, currencies[code], rates[code], amount));
    });

    amountEl.textContent = `${amount.toLocaleString()} from ${base}`;
    countEl.textContent  = `${targets.length} pairs`;
    listEl.hidden  = false;
    emptyEl.hidden = true;
  } catch {
    listEl.hidden  = true;
    emptyEl.hidden = false;
  }
}

export function initCompare(currencies = {}) {
  document.addEventListener('fx:pair-changed', () => loadCompare(currencies));
  document.getElementById('sendAmount').addEventListener('input', () => {
    const panel = document.getElementById('panel-compare');
    if (!panel.hidden) loadCompare(currencies);
  });
}
