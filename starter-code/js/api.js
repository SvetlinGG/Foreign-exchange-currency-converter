const BASE = 'https://api.frankfurter.dev/v2';

export async function getCurrencies() {
  const res = await fetch(`${BASE}/currencies`);
  if (!res.ok) throw new Error('Failed to fetch currencies');
  return res.json(); 
}

export async function getLatest(base = 'USD') {
  const res = await fetch(`${BASE}/latest?base=${base}`);
  if (!res.ok) throw new Error('Failed to fetch latest rates');
  return res.json(); 
}

export async function getRate(base, target) {
  const res = await fetch(`${BASE}/latest?base=${base}&symbols=${target}`);
  if (!res.ok) throw new Error('Failed to fetch rate');
  return res.json();
}

export async function getHistory(base, target, range) {
  const { start, end } = getRangeDates(range);
  const res = await fetch(`${BASE}/${start}..${end}?base=${base}&symbols=${target}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json(); 
}

function getRangeDates(range) {
  const end = new Date();
  const start = new Date();
  const map = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, '5Y': 1825 };
  start.setDate(end.getDate() - (map[range] ?? 30));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
