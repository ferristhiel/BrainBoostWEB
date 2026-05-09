(() => {
  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(`brainboost_${key}`);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`brainboost_${key}`, JSON.stringify(value));
        document.dispatchEvent(new CustomEvent('brainboost:update'));
      } catch {
        // Local storage can be unavailable in strict privacy contexts; keep UI usable.
      }
    },
  };

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const todayIso = () => new Date().toISOString().slice(0, 10);

  function profile() {
    return store.get('profile', { name: 'Gast', xp: 180, streak: 3, completed: ['grundlagen', 'fokus'] });
  }

  function saveProfile(next) {
    store.set('profile', { ...profile(), ...next });
    renderProfile();
  }

  function renderProfile() {
    const current = profile();
    document.querySelectorAll('[data-bb-name]').forEach((node) => { node.textContent = current.name; });
    document.querySelectorAll('[data-bb-xp]').forEach((node) => { node.textContent = current.xp; });
    document.querySelectorAll('[data-bb-level]').forEach((node) => { node.textContent = Math.max(1, Math.floor(current.xp / 140) + 1); });
    document.querySelectorAll('[data-bb-streak]').forEach((node) => { node.textContent = current.streak; });
    document.querySelectorAll('.login-btn').forEach((button) => {
      button.textContent = current.name === 'Gast' ? 'Einloggen' : `👤 ${current.name}`;
      button.setAttribute('aria-label', current.name === 'Gast' ? 'Demo-Profil anlegen' : `Profil ${current.name}`);
    });
  }

  function login() {
    const current = profile();
    const name = window.prompt('BrainBoost Demo-Profil: Wie heißt du?', current.name === 'Gast' ? '' : current.name);
    if (!name || !name.trim()) return;
    saveProfile({ name: name.trim().slice(0, 32) });
  }

  function addXp(points = 10) {
    const current = profile();
    saveProfile({ xp: current.xp + points, streak: Number(current.streak || 0) + (localStorage.getItem('brainboost_last_xp_day') === todayIso() ? 0 : 1) });
    localStorage.setItem('brainboost_last_xp_day', todayIso());
  }

  function bindStorageList({ formId, listId, key, fields, render }) {
    const form = document.getElementById(formId);
    const list = document.getElementById(listId);
    if (!form || !list) return;

    const getItems = () => store.get(key, []);
    const setItems = (items) => store.set(key, items);
    const draw = () => {
      const items = getItems();
      list.innerHTML = items.length ? items.map(render).join('') : '<li class="list-item"><span class="muted">Noch keine Einträge. Starte mit dem Formular oben.</span></li>';
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const item = { id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), createdAt: todayIso() };
      fields.forEach((field) => { item[field] = String(formData.get(field) || '').trim(); });
      if (fields.some((field) => item[field])) {
        setItems([item, ...getItems()].slice(0, 30));
        form.reset();
        addXp(8);
        draw();
      }
    });

    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-delete]');
      const done = event.target.closest('[data-done]');
      if (button) {
        setItems(getItems().filter((item) => item.id !== button.dataset.delete));
        draw();
      }
      if (done) {
        setItems(getItems().map((item) => item.id === done.dataset.done ? { ...item, done: !item.done } : item));
        addXp(12);
        draw();
      }
    });

    draw();
  }

  function bindTools() {
    const toolForm = document.getElementById('toolForm');
    const output = document.getElementById('toolOutput');
    if (!toolForm || !output) return;
    toolForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const topic = String(new FormData(toolForm).get('topic') || '').trim();
      const mode = String(new FormData(toolForm).get('mode') || 'lernplan');
      if (!topic) return;
      output.textContent = 'BrainBoost denkt nach …';
      const local = {
        lernplan: `Lernpaket für ${topic}\n\n• 5 Minuten: Vorwissen notieren\n• 12 Minuten: Kernbegriff erklären\n• 10 Minuten: 3 Aufgaben lösen\n• 3 Minuten: Fehlerliste aktualisieren`,
        quiz: `Mini-Quiz zu ${topic}\n\n1. Was ist die wichtigste Regel?\n2. Nenne ein Beispiel aus dem Alltag.\n3. Woran erkennst du einen typischen Fehler?`,
        struktur: `Gliederung zu ${topic}\n\n1. Einstieg: Problem oder Beispiel\n2. Erklärung: 3 Hauptpunkte\n3. Anwendung: Übung oder Beleg\n4. Abschluss: Merksatz`,
      };
      try {
        const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `${mode}: ${topic}` }) });
        const data = await response.json();
        output.textContent = data.reply || local[mode];
      } catch {
        output.textContent = local[mode];
      }
      addXp(10);
    });
  }

  function bindLessonButtons() {
    document.querySelectorAll('[data-complete-lesson]').forEach((button) => {
      button.addEventListener('click', () => {
        const current = profile();
        const lesson = button.dataset.completeLesson;
        saveProfile({ completed: Array.from(new Set([...(current.completed || []), lesson])), xp: current.xp + 25 });
        button.textContent = '✅ Abgeschlossen';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProfile();
    document.querySelectorAll('.login-btn').forEach((button) => button.addEventListener('click', login));
    bindLessonButtons();
    bindTools();
    bindStorageList({
      formId: 'plannerForm', listId: 'plannerList', key: 'tasks', fields: ['title', 'subject', 'date'],
      render: (item) => `<li class="list-item ${item.done ? 'done' : ''}"><span><strong>${escapeHtml(item.title || 'Lernaufgabe')}</strong><br><span class="muted">${escapeHtml(item.subject || 'Allgemein')} · ${escapeHtml(item.date || 'ohne Datum')}</span></span><span><button class="ghost-btn" data-done="${item.id}" type="button">${item.done ? 'Reaktivieren' : 'Erledigt'}</button> <button class="danger-btn" data-delete="${item.id}" type="button">Löschen</button></span></li>`,
    });
    bindStorageList({
      formId: 'appointmentsForm', listId: 'appointmentsList', key: 'appointments', fields: ['title', 'date', 'note'],
      render: (item) => `<li class="list-item"><span><strong>${escapeHtml(item.title || 'Termin')}</strong><br><span class="muted">${escapeHtml(item.date || 'offen')} · ${escapeHtml(item.note || 'keine Notiz')}</span></span><button class="danger-btn" data-delete="${item.id}" type="button">Löschen</button></li>`,
    });
    bindStorageList({
      formId: 'applicationForm', listId: 'applicationList', key: 'applications', fields: ['company', 'role', 'status'],
      render: (item) => `<li class="list-item"><span><strong>${escapeHtml(item.company || 'Unternehmen')}</strong><br><span class="muted">${escapeHtml(item.role || 'Position')} · ${escapeHtml(item.status || 'Geplant')}</span></span><button class="danger-btn" data-delete="${item.id}" type="button">Löschen</button></li>`,
    });
  });

  window.BrainBoost = { store, profile, saveProfile, addXp };
})();
