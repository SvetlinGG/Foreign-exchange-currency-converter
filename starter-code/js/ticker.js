import { getLatest } from './api.js';

const tickerList = document.getElementById('tickerList');

const PAIRS = [
  ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'JPY'], ['USD', 'CHF'],
  ['USD', 'AUD'], ['USD', 'CAD'], ['USD', 'CNY'], ['USD', 'SGD'],
  ['EUR', 'GBP'], ['EUR', 'JPY'], ['GBP', 'JPY'], ['USD', 'HKD'],
];

function renderItem(base, target, rate, change) {
  const li = document.createElement('li');
  li.className = 'ticker-chip';
  const dir = change >= 0 ? 'up' : 'down';
  const sign = change >= 0 ? '▲' : '▼';
  li.innerHTML = `
    <span class="ticker-chip__pair">${base}/${target}</span>
    <span class="ticker-chip__rate">${rate.toFixed(4)}</span>
    <span class="ticker-chip__change--${dir}">${sign} ${Math.abs(change).toFixed(2)}%</span>
  `;
  return li;
}

export async function initTicker() {
  try {
    const [latestUSD, latestEUR, latestGBP] = await Promise.all([
      getLatest('USD'),
      getLatest('EUR'),
      getLatest('GBP'),
    ]);

    const rateMap = {
      USD: latestUSD.rates,
      EUR: latestEUR.rates,
      GBP: latestGBP.rates,
    };

    tickerList.innerHTML = '';

    PAIRS.forEach(([base, target]) => {
      const rates = rateMap[base];
      if (!rates?.[target]) return;
      const rate = rates[target];
      
      const change = (Math.random() * 1 - 0.5).toFixed(2) * 1;
      tickerList.appendChild(renderItem(base, target, rate, change));
    });

    
    tickerList.innerHTML += tickerList.innerHTML;

  } catch {
    tickerList.closest('.app-nav__markets').hidden = true;
  }
}
