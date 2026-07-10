import { getCurrencies } from './api.js';
import { setCurrency } from './converter.js';

const dialog      = document.getElementById('currencyPicker');
const searchInput = document.getElementById('currencySearch');
const popularList = document.getElementById('popularList');
const otherList   = document.getElementById('otherList');
const popularCount = document.getElementById('popularCount');
const otherCount   = document.getElementById('otherCount');
const closeBtn    = document.getElementById('pickerCloseBtn');

const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD'];

let allCurrencies = {};
let activeSide = 'from';
let activeCode = 'USD';

function getFlagCode(code) {
  const overrides = { EUR: 'eu', USD: 'us', GBP: 'gb', AUD: 'au', CAD: 'ca',
    CHF: 'ch', CNY: 'cn', JPY: 'jp', NZD: 'nz', SEK: 'se', NOK: 'no',
    DKK: 'dk', SGD: 'sg', HKD: 'hk', KRW: 'kr', INR: 'in', BRL: 'br',
    MXN: 'mx', ZAR: 'za', TRY: 'tr', RUB: 'ru', PLN: 'pl', THB: 'th',
    IDR: 'id', HUF: 'hu', CZK: 'cz', MYR: 'my', PHP: 'ph' };
  return overrides[code] ?? code.slice(0, 2).toLowerCase();
}

function renderRow(code, name) {
  const li = document.createElement('li');
  li.className = 'currency-picker__item';
  li.setAttribute('role', 'option');
  li.setAttribute('aria-selected', code === activeCode);
  li.dataset.code = code;
  li.innerHTML = `
    <img class="currency-picker__flag" src="/starter-code/assets/images/flags/${getFlagCode(code)}.webp" alt="${code}" onerror="this.style.display='none'">
    <span class="currency-picker__code">${code}</span>
    <span class="currency-picker__name">${name}</span>
    ${code === activeCode ? `<img class="currency-picker__check" src="/starter-code/assets/images/icon-check.svg" alt="selected">` : ''}
  `;
  li.addEventListener('click', () => {
    setCurrency(activeSide, code);
    dialog.close();
  });
  return li;
}

function renderLists(query = '') {
  const q = query.toLowerCase();
  const entries = Object.entries(allCurrencies).filter(([code, name]) =>
    !q || code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
  );

  const popular = entries.filter(([code]) => POPULAR.includes(code));
  const other   = entries.filter(([code]) => !POPULAR.includes(code));

  popularList.innerHTML = '';
  otherList.innerHTML   = '';
  popular.forEach(([code, name]) => popularList.appendChild(renderRow(code, name)));
  other.forEach(([code, name])   => otherList.appendChild(renderRow(code, name)));

  popularCount.textContent = popular.length;
  otherCount.textContent   = other.length;
}

export function openPicker(side, currentCode) {
  activeSide = side;
  activeCode = currentCode;
  searchInput.value = '';
  renderLists();
  dialog.showModal();
  searchInput.focus();
}

export async function initPicker() {
  allCurrencies = await getCurrencies();

  document.getElementById('fromCurrencyBtn').addEventListener('click', () =>
    openPicker('from', document.getElementById('fromCode').textContent)
  );
  document.getElementById('toCurrencyBtn').addEventListener('click', () =>
    openPicker('to', document.getElementById('toCode').textContent)
  );

  closeBtn.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });

  searchInput.addEventListener('input', () => renderLists(searchInput.value));
}
