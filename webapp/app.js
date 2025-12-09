const tg = window.Telegram ? window.Telegram.WebApp : null;
const init = (tg && tg.initDataUnsafe) ? tg.initDataUnsafe : {};
const user = (init && init.user) ? init.user : { id: 1, first_name: 'Guest' };

// UI navigation
const pages = document.querySelectorAll('.page');
document.querySelectorAll('nav button').forEach(b => {
  b.addEventListener('click', () => {
    const page = b.dataset.page;
    pages.forEach(p => p.classList.add('hidden'));
    document.getElementById(page).classList.remove('hidden');
    if (page === 'inventory') loadInventory();
    if (page === 'profile') loadProfile();
    if (page === 'top') loadTop();
  });
});

async function callApi(path, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  return res.json();
}

// Open pack
document.getElementById('openPack').addEventListener('click', async () => {
  const res = await callApi('/api/openPack', 'POST', { userId: user.id, username: user.username || user.first_name });
  if (res.error === 'wait') {
    document.getElementById('packResult').innerText = '⏳ Подожди 30 минут. Осталось: ' + Math.ceil(res.remaining/1000) + ' сек';
    return;
  }

  const pack = res.pack;
  renderPack(pack);
});

function renderPack(pack) {
  const root = document.getElementById('packResult');
  root.innerHTML = '';
  pack.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card rarity-' + c.rarity;
    const img = document.createElement('img');
    img.src = `assets/cards/${c.id}.png`;
    img.onerror = () => {
      img.src = `assets/cards/${c.rarity}.png`;
      img.onerror = () => img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%230b1020" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white">No Image</text></svg>';
    };
    const name = document.createElement('div');
    name.innerText = c.name + ' (' + c.rarity + ')';
    div.appendChild(img);
    div.appendChild(name);
    root.appendChild(div);
  });
}

async function loadInventory() {
  const inv = await callApi('/api/inventory/' + user.id);
  const root = document.getElementById('inventoryList');
  root.innerHTML = '';
  inv.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card rarity-' + c.rarity;
    const img = document.createElement('img');
    img.src = `assets/cards/${c.id}.png`;
    img.onerror = () => img.src = `assets/cards/${c.rarity}.png`;
    const name = document.createElement('div');
    name.innerText = c.name + ' (' + c.rarity + ')';
    div.appendChild(img);
    div.appendChild(name);
    root.appendChild(div);
  });
}

async function loadProfile() {
  const p = await callApi('/api/profile/' + user.id);
  const root = document.getElementById('profileInfo');
  root.innerHTML = `<div>Имя: ${user.first_name || p.username || 'Guest'}</div>` +
    `<div>Уровень: ${p.level || 1}</div>` +
    `<div>Опыт: ${p.exp || 0}</div>`;
}

async function loadTop() {
  const t = await callApi('/api/top');
  const root = document.getElementById('topList');
  root.innerHTML = '';
  t.forEach(u => {
    const el = document.createElement('div');
    el.innerText = `${u.username || u.id} — lvl:${u.level} exp:${u.exp}`;
    root.appendChild(el);
  });
}

// Auto init
if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
  document.querySelector('nav button[data-page="home"]').click();
}

// Expand webapp if available
if (tg && tg.expand) tg.expand();
