const KEYS = {
  favorites: 'fx-favorites',
  log: 'fx-log',
  lastTab: 'fx-last-tab',
  lastPair: 'fx-last-pair',
};

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? []; }
  catch { return []; }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


export function getFavorites() { return load(KEYS.favorites); }

export function addFavorite(base, target) {
  const favs = getFavorites();
  if (!favs.find(f => f.base === base && f.target === target)) {
    favs.push({ base, target });
    save(KEYS.favorites, favs);
  }
}

export function removeFavorite(base, target) {
  save(KEYS.favorites, getFavorites().filter(f => !(f.base === base && f.target === target)));
}

export function isFavorite(base, target) {
  return getFavorites().some(f => f.base === base && f.target === target);
}


export function getLog() { return load(KEYS.log); }

export function addLog(entry) {
  const log = getLog();
  log.unshift({ ...entry, id: Date.now(), timestamp: Date.now() });
  save(KEYS.log, log);
}

export function removeLogEntry(id) {
  save(KEYS.log, getLog().filter(e => e.id !== id));
}

export function clearLog() { save(KEYS.log, []); }


export function getLastTab() { return localStorage.getItem(KEYS.lastTab) ?? 'history'; }
export function saveLastTab(tab) { localStorage.setItem(KEYS.lastTab, tab); }

export function getLastPair() {
  try { return JSON.parse(localStorage.getItem(KEYS.lastPair)) ?? { base: 'USD', target: 'EUR' }; }
  catch { return { base: 'USD', target: 'EUR' }; }
}
export function saveLastPair(base, target) {
  localStorage.setItem(KEYS.lastPair, JSON.stringify({ base, target }));
}
