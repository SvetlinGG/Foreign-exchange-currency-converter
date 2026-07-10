import { getRate } from './api.js';
import { isFavorite, addFavorite, removeFavorite, addLog, saveLastPair } from './store.js';

const sendInput    = document.getElementById('sendAmount');
const receiveInput = document.getElementById('receiveAmount');
const rateEl       = document.getElementById('convertRate');
const fromCodeEl   = document.getElementById('fromCode');
const toCodeEl     = document.getElementById('toCode');
const fromFlagEl   = document.getElementById('fromFlag');
const toFlagEl     = document.getElementById('toFlag');
const favoriteBtn  = document.getElementById('favoriteBtn');
const favLabelEl   = document.getElementById('favoriteBtnLabel');
const logBtn       = document.getElementById('logBtn');
const swapBtn      = document.getElementById('swapBtn');

let currentRate = null;

export function getActivePair() {
  return { base: fromCodeEl.textContent, target: toCodeEl.textContent };
}

export function getSendAmount() {
  return parseFloat(sendInput.value) || 0;
}

export async function updateRate() {
  const { base, target } = getActivePair();
  saveLastPair(base, target);
  try {
    const data = await getRate(base, target);
    currentRate = data.rates[target];
    rateEl.textContent = `1 ${base} = ${currentRate.toFixed(4)} ${target}`;
    updateReceive();
    updateFavoriteBtn();
  } catch {
    rateEl.textContent = 'Rate unavailable';
  }
}

function updateReceive() {
  const amount = getSendAmount();
  receiveInput.value = amount && currentRate
    ? (amount * currentRate).toFixed(2)
    : '';
}

function updateFavoriteBtn() {
  const { base, target } = getActivePair();
  const pinned = isFavorite(base, target);
  favoriteBtn.setAttribute('aria-pressed', pinned);
  favLabelEl.textContent = pinned ? 'Favorited' : 'Favorite';
  favoriteBtn.querySelector('img').src = pinned
    ? '/starter-code/assets/images/icon-star-filled.svg'
    : '/starter-code/assets/images/icon-star.svg';
}

export function setCurrency(side, code) {
  const flagSrc = `/starter-code/assets/images/flags/${getFlagCode(code)}.webp`;
  if (side === 'from') {
    fromCodeEl.textContent = code;
    fromFlagEl.src = flagSrc;
    fromFlagEl.alt = code;
  } else {
    toCodeEl.textContent = code;
    toFlagEl.src = flagSrc;
    toFlagEl.alt = code;
  }
  updateRate();
}

function getFlagCode(currencyCode) {
  const overrides = { EUR: 'eu', USD: 'us', GBP: 'gb', AUD: 'au', CAD: 'ca',
    CHF: 'ch', CNY: 'cn', JPY: 'jp', NZD: 'nz', SEK: 'se', NOK: 'no',
    DKK: 'dk', SGD: 'sg', HKD: 'hk', KRW: 'kr', INR: 'in', BRL: 'br',
    MXN: 'mx', ZAR: 'za', TRY: 'tr', RUB: 'ru', PLN: 'pl', THB: 'th',
    IDR: 'id', HUF: 'hu', CZK: 'cz', ILS: 'il', MYR: 'my', PHP: 'ph' };
  return overrides[currencyCode] ?? currencyCode.slice(0, 2).toLowerCase();
}

export function initConverter() {
  sendInput.addEventListener('input', updateReceive);

  swapBtn.addEventListener('click', () => {
    const prevFrom = fromCodeEl.textContent;
    const prevTo   = toCodeEl.textContent;
    setCurrency('from', prevTo);
    setCurrency('to', prevFrom);
  });

  favoriteBtn.addEventListener('click', () => {
    const { base, target } = getActivePair();
    isFavorite(base, target) ? removeFavorite(base, target) : addFavorite(base, target);
    updateFavoriteBtn();
    document.dispatchEvent(new CustomEvent('fx:favorites-changed'));
  });

  logBtn.addEventListener('click', () => {
    const { base, target } = getActivePair();
    const amount = getSendAmount();
    if (!amount || !currentRate) return;
    addLog({ base, target, amount, result: +(amount * currentRate).toFixed(2), rate: currentRate });
    document.dispatchEvent(new CustomEvent('fx:log-changed'));
  });
}
