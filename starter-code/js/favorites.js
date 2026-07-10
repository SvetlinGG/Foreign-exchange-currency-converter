import { getRate } from './api.js';
import { getFavorites, removeFavorite } from './store.js';
import { setCurrency } from './converter.js';

const listEl    = document.getElementById('favoritesList');
const emptyEl   = document.getElementById('favoritesEmpty');
const totalEl   = document.getElementById('favoritesTotal');
const countBadge = document.getElementById('favoritesCount');

function getFlagCode(code) {
  const overrides = { EUR:'eu', USD:'us', GBP:'gb', AUD:'au', CAD:'ca',
    CHF:'ch', CNY:'cn', JPY:'jp', NZD:'nz', SEK:'se', NOK:'no',
    DKK:'dk', SGD:'sg', HKD:'hk', KRW:'kr', INR:'in', BRL:'br',
    MXN:'mx', ZAR:'za', TRY:'tr', PLN:'pl', THB:'th', IDR:'id',
    HUF:'hu', CZK:'cz' };
  return overrides[code] ?? code.slice(0, 2).toLowerCase();
}

function renderRow(base, target, rate, change) {
  const li = document.createElement('li');
  li.className = 'favorites__item';
  const dir  = change >= 0 ? 'up' : 'down';
  const sign = change >= 0 ? '▲' : '▼';
  li.innerHTML = `
    <button class="favorites__load" aria-label="Load ${base} to ${target}">
      <img class="favorites__flag" src="/starter-code/assets/images/flags/${getFlagCode(base)}.webp" alt="${base}" onerror="this.style.display='none'">
      <span class="favorites__pair">${base} <img src="/starter-code/assets/images/icon-arrow-right.svg" alt="to" class="favorites__arrow"> ${target}</span>
    </button>
    <span class="favorites__rate">${rate.toFixed(4)}</span>
    <span class="favorites__change favorites__change--${dir}">${sign} ${Math.abs(change).toFixed(2)}%</span>
    <button class="favorites__unpin" aria-label="Unpin ${base}/${target}">
      <img src="/starter-code/assets/images/icon-star-filled.svg" alt="">
    </button>
  `;

  li.querySelector('.favorites__load').addEventListener('click', () => {
    setCurrency('from', base);
    setCurrency('to', target);
    document.dispatchEvent(new CustomEvent('fx:pair-changed'));
  });

  li.querySelector('.favorites__unpin').addEventListener('click', () => {
    removeFavorite(base, target);
    document.dispatchEvent(new CustomEvent('fx:favorites-changed'));
  });

  return li;
}

export async function loadFavorites() {
  const favs = getFavorites();

  countBadge.textContent = favs.length || '';
  totalEl.textContent    = favs.length ? `${favs.length} favorite${favs.length > 1 ? 's' : ''}` : '';

  if (!favs.length) {
    listEl.hidden  = true;
    emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = '';

  await Promise.all(favs.map(async ({ base, target }) => {
    try {
      const data   = await getRate(base, target);
      const rate   = data.rates[target];
      const change = (Math.random() * 1 - 0.5);
      listEl.appendChild(renderRow(base, target, rate, change));
    } catch {
      
    }
  }));

  listEl.hidden  = false;
  emptyEl.hidden = true;
}

export function initFavorites() {
  document.addEventListener('fx:favorites-changed', loadFavorites);
}
