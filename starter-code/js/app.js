import { getCurrencies } from './api.js';
import { getLastTab, saveLastTab, getLastPair } from './store.js';
import { initConverter, setCurrency, updateRate } from './converter.js';
import { initPicker } from './picker.js';
import { initTicker } from './ticker.js';
import { initHistory, loadHistory } from './history.js';
import { initCompare, loadCompare } from './compare.js';
import { initFavorites, loadFavorites } from './favorites.js';
import { initLog, loadLog } from './log.js';


const tabs   = document.querySelectorAll('.tabs__tab');
const panels = document.querySelectorAll('.tab-panel');

function activateTab(id) {
  tabs.forEach(t => {
    const active = t.id === `tab-${id}`;
    t.setAttribute('aria-selected', active);
    t.classList.toggle('tabs__tab--active', active);
  });
  panels.forEach(p => { p.hidden = p.id !== `panel-${id}`; });
  saveLastTab(id);

  if (id === 'history')   loadHistory();
  if (id === 'compare')   loadCompare(window.__currencies);
  if (id === 'favorites') loadFavorites();
  if (id === 'log')       loadLog();
}

function initTabs() {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.id.replace('tab-', '')));

    
    tab.addEventListener('keydown', e => {
      const list  = [...tabs];
      const index = list.indexOf(e.currentTarget);
      if (e.key === 'ArrowRight') list[(index + 1) % list.length].focus();
      if (e.key === 'ArrowLeft')  list[(index - 1 + list.length) % list.length].focus();
    });
  });
}


async function init() {
  const currencies = await getCurrencies().catch(() => ({}));
  window.__currencies = currencies;

  
  const { base, target } = getLastPair();
  setCurrency('from', base, true);
  setCurrency('to', target, true);

  
  const count = Object.keys(currencies).length;
  if (count) document.getElementById('currencyCount').textContent = `${count} Currencies`;

  initConverter();
  await initPicker();
  initTicker();
  initHistory();
  initCompare(currencies);
  initFavorites();
  initLog();
  initTabs();

  
  activateTab(getLastTab());
  await updateRate();
}

init();
