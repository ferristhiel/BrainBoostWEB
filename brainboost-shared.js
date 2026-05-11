(() => {
  const PREFIX = 'brainboost_';
  const DEFAULT_PROFILE = { name: 'Gast', xp: 0, streak: 0, completed: [], lastXpDay: '' };

  const storage = {
    available: false,
    memory: new Map(),
    init() {
      try {
        const probe = `${PREFIX}probe`;
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        this.available = true;
      } catch {
        this.available = false;
      }
    },
    readRaw(key) {
      if (this.available) return localStorage.getItem(`${PREFIX}${key}`);
      return this.memory.has(key) ? this.memory.get(key) : null;
    },
    writeRaw(key, value) {
      if (this.available) localStorage.setItem(`${PREFIX}${key}`, value);
      else this.memory.set(key, value);
    },
    remove(key) {
      if (this.available) localStorage.removeItem(`${PREFIX}${key}`);
      else this.memory.delete(key);
      notifyUpdate();
    },
  };

  function notifyUpdate() {
    document.dispatchEvent(new CustomEvent('brainboost:update'));
  }

  const store = {
    get(key, fallback) {
      try {
        const value = storage.readRaw(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        storage.writeRaw(key, JSON.stringify(value));
      } catch {
        storage.memory.set(key, JSON.stringify(value));
      }
      notifyUpdate();
    },
    remove(key) {
      storage.remove(key);
    },
    isPersistent() {
      return storage.available;
    },
  };

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

  const todayIso = () => new Date().toISOString().slice(0, 10);

  function profile() {
    const saved = store.get('profile', DEFAULT_PROFILE);
    return { ...DEFAULT_PROFILE, ...saved, completed: Array.isArray(saved.completed) ? saved.completed : [] };
  }

  function saveProfile(next) {
    store.set('profile', { ...profile(), ...next });
    renderEverything();
  }


  function mountLoader() {
    if (document.querySelector('.app-loader')) return;
    const loader = document.createElement('div');
    loader.className = 'app-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = '<div class="loader-card"><div class="loader-brand"><span>BrainBoost startet</span><span class="loader-percent">100%</span></div><div class="loader-track"><span class="loader-fill"></span></div><p>Pfad, Speicher und Tools werden vorbereitet …</p></div>';
    document.body.prepend(loader);
    window.setTimeout(() => loader.classList.add('is-hidden'), 850);
    window.setTimeout(() => loader.remove(), 1300);
  }

  function renderProfile() {
    const current = profile();
    document.querySelectorAll('[data-bb-name]').forEach((node) => { node.textContent = current.name; });
    document.querySelectorAll('[data-bb-xp]').forEach((node) => { node.textContent = current.xp; });
    document.querySelectorAll('[data-bb-level]').forEach((node) => { node.textContent = Math.max(1, Math.floor(current.xp / 140) + 1); });
    document.querySelectorAll('[data-bb-streak]').forEach((node) => { node.textContent = current.streak; });
    document.querySelectorAll('.login-btn').forEach((button) => {
      button.textContent = current.name === 'Gast' ? 'Profil anlegen' : `👤 ${current.name}`;
      button.setAttribute('aria-label', current.name === 'Gast' ? 'Lokales Demo-Profil anlegen' : `Lokales Profil ${current.name}`);
    });
  }


  const subjectPaths = {
    mathe: {
      label: 'Mathe',
      title: 'Mathe-Prüfungspfad',
      description: 'Von Rechentechnik bis Prüfung: 5 Übungen, eine Abfrage, weitere Übungen und eine Abschlussprüfung.',
      stages: [
        ['exercise', 'Zahlen & Terme', 'Kopfrechnen, Vorzeichen, Klammern und saubere Rechenwege.', 'Übung 1', '12 XP'],
        ['exercise', 'Brüche sicher kürzen', 'Erweitern, Kürzen und gemischte Zahlen in Aufgaben anwenden.', 'Übung 2', '12 XP'],
        ['exercise', 'Prozentrechnung', 'Grundwert, Prozentwert und Prozentsatz unterscheiden.', 'Übung 3', '14 XP'],
        ['exercise', 'Dreisatz-Training', 'Direkte und indirekte Proportionalität erkennen.', 'Übung 4', '14 XP'],
        ['exercise', 'Gleichungen lösen', 'Äquivalenzumformungen Schritt für Schritt üben.', 'Übung 5', '16 XP'],
        ['quiz', 'Abfrage 1: Basis-Check', '5 kurze Fragen zu Zahlen, Prozenten und Gleichungen.', 'Abfrage', '30 XP'],
        ['exercise', 'Geometrie-Flächen', 'Dreieck, Rechteck, Kreis und Einheiten sicher nutzen.', 'Übung 6', '16 XP'],
        ['exercise', 'Diagramme lesen', 'Tabellen, Koordinaten und Sachaufgaben auswerten.', 'Übung 7', '16 XP'],
        ['exam', 'Mathe-Prüfung', 'Gemischte Abschlussprüfung mit Zeitlimit und Fehlerliste.', 'Prüfung', '80 XP'],
      ],
    },
    deutsch: {
      label: 'Deutsch',
      title: 'Deutsch-Prüfungspfad',
      description: 'Trainiere Lesen, Schreiben und Argumentieren mit einer Abfrage nach fünf Übungen.',
      stages: [
        ['exercise', 'Text markieren', 'Schlüsselstellen finden und Randnotizen schreiben.', 'Übung 1', '12 XP'],
        ['exercise', 'Inhaltsangabe', 'Einleitungssatz, Präsens und sachlicher Stil.', 'Übung 2', '12 XP'],
        ['exercise', 'Argument finden', 'These, Begründung und Beispiel sauber trennen.', 'Übung 3', '14 XP'],
        ['exercise', 'Sprachliche Mittel', 'Wirkung von Metapher, Vergleich und Wiederholung erklären.', 'Übung 4', '14 XP'],
        ['exercise', 'Roter Faden', 'Absätze planen und Überleitungen formulieren.', 'Übung 5', '16 XP'],
        ['quiz', 'Abfrage 1: Text-Check', 'Kurze Kontrolle zu Inhalt, Argument und Sprache.', 'Abfrage', '30 XP'],
        ['exercise', 'Erörterung schreiben', 'Einleitung, Hauptteil und Schluss in Prüfungsstruktur.', 'Übung 6', '16 XP'],
        ['exercise', 'Überarbeiten', 'Satzbau, Rechtschreibung und Ausdruck verbessern.', 'Übung 7', '16 XP'],
        ['exam', 'Deutsch-Prüfung', 'Schreibaufgabe mit Checkliste und Selbsteinschätzung.', 'Prüfung', '80 XP'],
      ],
    },
    englisch: {
      label: 'Englisch',
      title: 'Englisch-Prüfungspfad',
      description: 'Vokabeln, Grammatik, Reading und Speaking als richtiger Trainingspfad.',
      stages: [
        ['exercise', 'Vocabulary Sprint', 'Aktive Sätze statt isolierter Wortlisten schreiben.', 'Übung 1', '12 XP'],
        ['exercise', 'Present & Past', 'Zeitformen erkennen und korrekt bilden.', 'Übung 2', '12 XP'],
        ['exercise', 'Reading Skills', 'Skimming, Scanning und Belege im Text finden.', 'Übung 3', '14 XP'],
        ['exercise', 'Writing Basics', 'Topic sentence, connectors und short paragraph.', 'Übung 4', '14 XP'],
        ['exercise', 'Speaking Answers', 'Kurze Antworten mit Beispiel und Begründung geben.', 'Übung 5', '16 XP'],
        ['quiz', 'Abfrage 1: English Check', '5 Fragen zu Zeiten, Vokabeln und Textverständnis.', 'Abfrage', '30 XP'],
        ['exercise', 'Listening Notes', 'Stichpunkte aus Hörtexten sortieren.', 'Übung 6', '16 XP'],
        ['exercise', 'Email Writing', 'Formelle und informelle E-Mail-Struktur üben.', 'Übung 7', '16 XP'],
        ['exam', 'Englisch-Prüfung', 'Reading, Writing und Speaking als Abschlusscheck.', 'Prüfung', '80 XP'],
      ],
    },
  };

  function lessonId(subject, index) {
    return `${subject}-${index + 1}`;
  }

  function renderSubjectPath(subject = store.get('active_subject', 'mathe')) {
    const road = document.getElementById('learningRoad');
    if (!road) return;
    const safeSubject = subjectPaths[subject] ? subject : 'mathe';
    const path = subjectPaths[safeSubject];
    store.set('active_subject', safeSubject);
    document.querySelectorAll('[data-subject-path]').forEach((button) => {
      const active = button.dataset.subjectPath === safeSubject;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    const label = document.querySelector('[data-active-subject-label]');
    const title = document.querySelector('[data-active-subject-title]');
    const description = document.querySelector('[data-active-subject-description]');
    if (label) label.textContent = path.label;
    if (title) title.textContent = path.title;
    if (description) description.textContent = path.description;
    road.innerHTML = path.stages.map((stage, index) => {
      const [type, name, copy, badge, xp] = stage;
      const id = lessonId(safeSubject, index);
      const node = type === 'quiz' ? '?' : type === 'exam' ? '★' : String(index + 1);
      const stateClass = type === 'quiz' ? ' is-query' : type === 'exam' ? ' is-boss' : '';
      return `<article class="road-stage${stateClass}" data-lesson-card="${id}">
        <div class="road-card">
          <span class="badge">${escapeHtml(badge)}</span>
          <h3>${escapeHtml(name)}</h3>
          <p class="muted">${escapeHtml(copy)}</p>
          <div class="progress-track"><span class="progress-fill" style="--progress: 0%"></span></div>
          <div class="road-actions"><span class="muted">${type === 'quiz' ? '🧠 Abfrage nach 5 Übungen' : type === 'exam' ? '🏁 Abschlussprüfung' : '✍️ echte Übung'} · ⚡ ${escapeHtml(xp)}</span><button class="btn" data-start-lesson="${id}" data-lesson-type="${type}" data-lesson-title="${escapeHtml(name)}" data-lesson-copy="${escapeHtml(copy)}" type="button">${type === 'quiz' ? 'Abfrage starten' : type === 'exam' ? 'Prüfung starten' : 'Übung starten'}</button></div>
        </div>
        <div class="road-node">${node}</div>
      </article>`;
    }).join('');
    renderEverything();
  }

  function bindSubjectSwitcher() {
    if (!document.getElementById('learningRoad')) return;
    document.querySelectorAll('[data-subject-path]').forEach((button) => {
      button.addEventListener('click', () => renderSubjectPath(button.dataset.subjectPath));
    });
    renderSubjectPath(store.get('active_subject', 'mathe'));
  }

  function renderStorageStatus() {
    document.querySelectorAll('[data-storage-mode]').forEach((node) => {
      node.textContent = store.isPersistent() ? 'Lokaler Browser-Speicher aktiv' : 'Temporärer Speicher aktiv';
    });
    document.querySelectorAll('[data-storage-count]').forEach((node) => {
      const key = node.dataset.storageCount;
      node.textContent = store.get(key, []).length;
    });
  }

  function renderLessonProgress() {
    const current = profile();
    const completed = new Set(current.completed);
    const cards = Array.from(document.querySelectorAll('[data-lesson-card]'));
    cards.forEach((card) => {
      const lesson = card.dataset.lessonCard;
      const isComplete = completed.has(lesson);
      card.classList.toggle('is-complete', isComplete);
      const button = card.querySelector('[data-start-lesson]');
      if (button && isComplete) button.textContent = '✅ Abgeschlossen';
      const fill = card.querySelector('.progress-fill');
      if (fill && isComplete) fill.style.setProperty('--progress', '100%');
    });
    const percent = cards.length ? Math.round((cards.filter((card) => completed.has(card.dataset.lessonCard)).length / cards.length) * 100) : 0;
    document.querySelectorAll('[data-path-percent]').forEach((node) => { node.textContent = percent; });
    document.querySelectorAll('[data-path-progress]').forEach((node) => { node.style.setProperty('--progress', `${percent}%`); });
  }

  function renderEverything() {
    renderProfile();
    renderStorageStatus();
    renderLessonProgress();
  }

  function login() {
    const current = profile();
    const name = window.prompt('BrainBoost Profil: Wie heißt du?', current.name === 'Gast' ? '' : current.name);
    if (!name || !name.trim()) return;
    saveProfile({ name: name.trim().slice(0, 32) });
  }

  function addXp(points = 10) {
    const current = profile();
    const today = todayIso();
    saveProfile({
      xp: Number(current.xp || 0) + points,
      streak: current.lastXpDay === today ? Number(current.streak || 0) : Number(current.streak || 0) + 1,
      lastXpDay: today,
    });
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function bindStorageList({ formId, listId, key, fields, render }) {
    const form = document.getElementById(formId);
    const list = document.getElementById(listId);
    if (!form || !list) return;

    const getItems = () => store.get(key, []);
    const setItems = (items) => store.set(key, items);
    const draw = () => {
      const items = getItems();
      list.innerHTML = items.length
        ? items.map(render).join('')
        : '<li class="empty-state">Noch nichts gespeichert. Erstelle deinen ersten echten Eintrag – er bleibt lokal in diesem Browser erhalten.</li>';
      renderStorageStatus();
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const item = { id: makeId(), createdAt: todayIso(), done: false };
      fields.forEach((field) => { item[field] = String(formData.get(field) || '').trim(); });
      if (!fields.some((field) => item[field])) return;
      setItems([item, ...getItems()].slice(0, 100));
      form.reset();
      addXp(8);
      draw();
    });

    list.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('[data-delete]');
      const doneButton = event.target.closest('[data-done]');
      if (deleteButton) {
        setItems(getItems().filter((item) => item.id !== deleteButton.dataset.delete));
        draw();
      }
      if (doneButton) {
        setItems(getItems().map((item) => item.id === doneButton.dataset.done ? { ...item, done: !item.done } : item));
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
      output.textContent = 'BrainBoost erstellt deinen Inhalt …';
      const local = {
        lernplan: `Lernpaket für ${topic}\n\n1. Ziel: Schreibe einen Merksatz.\n2. Verstehen: Erkläre 3 Schlüsselbegriffe.\n3. Üben: Löse 3 Aufgaben ohne Hilfe.\n4. Sichern: Notiere 1 Fehler und 1 Frage für morgen.`,
        quiz: `Mini-Quiz zu ${topic}\n\n1. Was ist die wichtigste Regel?\n2. Nenne ein Beispiel aus dem Alltag.\n3. Welche typische Falle musst du vermeiden?`,
        struktur: `Gliederung zu ${topic}\n\nEinleitung: Thema und Ziel.\nHauptteil: 3 Kernpunkte mit Beispiel.\nAbschluss: Fazit, Merksatz und nächste Übung.`,
      };
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `${mode}: ${topic}` }),
        });
        const data = await response.json();
        output.textContent = data.reply || local[mode];
      } catch {
        output.textContent = local[mode];
      }
      addXp(10);
    });
  }

  function modalTemplate({ id, type, title, copy }) {
    const isCheck = type === 'quiz' || type === 'exam';
    const heading = type === 'quiz' ? 'Abfrage nach 5 Übungen' : type === 'exam' ? 'Prüfung starten' : 'Übung starten';
    const options = isCheck
      ? `<div class="lesson-options" role="radiogroup" aria-label="Antwort auswählen">
          <button class="lesson-option" data-modal-answer="wrong" type="button">Ich rate ohne Begründung.</button>
          <button class="lesson-option" data-modal-answer="correct" type="button">Ich löse, begründe und prüfe meinen Fehlerweg.</button>
          <button class="lesson-option" data-modal-answer="wrong" type="button">Ich überspringe die Aufgabe.</button>
        </div>`
      : `<div class="lesson-task-list">
          <label><input type="checkbox" data-task-check /> Aufgabe gelesen</label>
          <label><input type="checkbox" data-task-check /> Lösung notiert</label>
          <label><input type="checkbox" data-task-check /> Fehler kontrolliert</label>
        </div>`;
    return `<div class="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lessonModalTitle">
      <div class="lesson-modal-card">
        <button class="modal-close" data-close-modal type="button" aria-label="Übung schließen">×</button>
        <span class="badge">${heading}</span>
        <h2 id="lessonModalTitle">${escapeHtml(title)}</h2>
        <p class="muted">${escapeHtml(copy)}</p>
        <div class="lesson-prompt">
          <strong>${isCheck ? 'Beantworte die Kontrollfrage:' : 'Arbeite diese Mini-Aufgabe ab:'}</strong>
          <p>${isCheck ? 'Welche Strategie bringt dich sicher zur richtigen Lösung?' : 'Starte die Übung, schreibe deine Lösung auf und hake die Schritte ab.'}</p>
        </div>
        ${options}
        <div class="lesson-modal-actions">
          <button class="ghost-btn" data-close-modal type="button">Abbrechen</button>
          <button class="btn" data-finish-lesson="${id}" data-finish-type="${type}" type="button" disabled>${isCheck ? 'Antwort prüfen & XP sichern' : 'Übung abschließen & XP sichern'}</button>
        </div>
        <p class="muted" data-modal-feedback>${isCheck ? 'Wähle eine Antwort aus.' : 'Hake alle Schritte ab, dann kannst du abschließen.'}</p>
      </div>
    </div>`;
  }

  function openLessonModal(button) {
    if (button.textContent.includes('Abgeschlossen')) return;
    document.querySelector('.lesson-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalTemplate({
      id: button.dataset.startLesson,
      type: button.dataset.lessonType,
      title: button.dataset.lessonTitle,
      copy: button.dataset.lessonCopy,
    }));
  }

  function updateModalState(modal) {
    const finish = modal.querySelector('[data-finish-lesson]');
    const feedback = modal.querySelector('[data-modal-feedback]');
    const type = finish?.dataset.finishType;
    if (!finish) return;
    if (type === 'quiz' || type === 'exam') {
      const selected = modal.querySelector('.lesson-option.is-selected');
      finish.disabled = !selected || selected.dataset.modalAnswer !== 'correct';
      if (feedback) feedback.textContent = selected
        ? (selected.dataset.modalAnswer === 'correct' ? 'Richtig. Du kannst XP sichern.' : 'Noch nicht. Wähle die Strategie mit Begründen und Prüfen.')
        : 'Wähle eine Antwort aus.';
      return;
    }
    const checks = Array.from(modal.querySelectorAll('[data-task-check]'));
    const done = checks.length > 0 && checks.every((check) => check.checked);
    finish.disabled = !done;
    if (feedback) feedback.textContent = done ? 'Alle Schritte erledigt. Du kannst XP sichern.' : 'Hake alle Schritte ab, dann kannst du abschließen.';
  }

  function completeLesson(id) {
    const current = profile();
    if ((current.completed || []).includes(id)) return;
    saveProfile({ completed: Array.from(new Set([...(current.completed || []), id])), xp: Number(current.xp || 0) + 25 });
  }

  function bindLessonButtons() {
    document.addEventListener('click', (event) => {
      const startButton = event.target.closest('[data-start-lesson]');
      if (startButton) {
        openLessonModal(startButton);
        return;
      }
      const closeButton = event.target.closest('[data-close-modal]');
      if (closeButton) {
        closeButton.closest('.lesson-modal')?.remove();
        return;
      }
      const option = event.target.closest('[data-modal-answer]');
      if (option) {
        const modal = option.closest('.lesson-modal');
        modal.querySelectorAll('.lesson-option').forEach((button) => button.classList.remove('is-selected'));
        option.classList.add('is-selected');
        updateModalState(modal);
        return;
      }
      const finish = event.target.closest('[data-finish-lesson]');
      if (finish && !finish.disabled) {
        completeLesson(finish.dataset.finishLesson);
        finish.closest('.lesson-modal')?.remove();
      }
    });
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-task-check]')) updateModalState(event.target.closest('.lesson-modal'));
    });
  }

  function bindGames() {
    const feedback = document.getElementById('gameFeedback');
    document.querySelectorAll('[data-game-answer]').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('[data-game-card]');
        if (card?.classList.contains('is-complete')) return;
        if (button.dataset.gameAnswer === 'correct') {
          const xp = Number(button.dataset.gameXp || 10);
          addXp(xp);
          card?.classList.add('is-complete');
          card?.querySelectorAll('[data-game-answer]').forEach((option) => { option.disabled = true; });
          if (feedback) feedback.textContent = `Richtig! +${xp} Game XP wurden gespeichert.`;
        } else if (feedback) {
          feedback.textContent = 'Knapp daneben. Versuch eine andere Antwort.';
        }
      });
    });
  }


  function bindClearButtons() {
    document.querySelectorAll('[data-clear-storage]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.clearStorage;
        if (!key) return;
        store.set(key, []);
        document.dispatchEvent(new CustomEvent('brainboost:list-reset', { detail: { key } }));
        renderEverything();
      });
    });
  }

  function itemHeader(item, fallback) {
    return `<strong class="item-title">${escapeHtml(item || fallback)}</strong>`;
  }

  storage.init();

  document.addEventListener('DOMContentLoaded', () => {
    mountLoader();
    bindSubjectSwitcher();
    renderEverything();
    document.querySelectorAll('.login-btn').forEach((button) => button.addEventListener('click', login));
    bindLessonButtons();
    bindClearButtons();
    bindTools();
    bindGames();

    bindStorageList({
      formId: 'plannerForm',
      listId: 'plannerList',
      key: 'tasks',
      fields: ['title', 'subject', 'date', 'notes'],
      render: (item) => `<li class="list-item ${item.done ? 'done' : ''}"><span>${itemHeader(item.title, 'Lernaufgabe')}<br><span class="muted">${escapeHtml(item.subject || 'Allgemein')} · ${escapeHtml(item.date || 'ohne Deadline')}</span>${item.notes ? `<br><span class="muted">${escapeHtml(item.notes)}</span>` : ''}</span><span class="list-actions"><button class="success-btn" data-done="${item.id}" type="button">${item.done ? 'Wieder öffnen' : 'Erledigt'}</button><button class="danger-btn" data-delete="${item.id}" type="button">Löschen</button></span></li>`,
    });

    bindStorageList({
      formId: 'appointmentsForm',
      listId: 'appointmentsList',
      key: 'appointments',
      fields: ['title', 'date', 'time', 'note'],
      render: (item) => `<li class="list-item"><span>${itemHeader(item.title, 'Termin')}<br><span class="muted">${escapeHtml(item.date || 'ohne Datum')} ${escapeHtml(item.time || '')}</span>${item.note ? `<br><span class="muted">${escapeHtml(item.note)}</span>` : ''}</span><span class="list-actions"><button class="danger-btn" data-delete="${item.id}" type="button">Löschen</button></span></li>`,
    });

    bindStorageList({
      formId: 'applicationForm',
      listId: 'applicationList',
      key: 'applications',
      fields: ['company', 'role', 'status', 'deadline'],
      render: (item) => `<li class="list-item"><span>${itemHeader(item.company, 'Unternehmen')}<br><span class="muted">${escapeHtml(item.role || 'Position offen')} · ${escapeHtml(item.status || 'Geplant')} · ${escapeHtml(item.deadline || 'keine Frist')}</span></span><span class="list-actions"><button class="danger-btn" data-delete="${item.id}" type="button">Löschen</button></span></li>`,
    });

    document.addEventListener('brainboost:list-reset', () => {
      ['plannerList', 'appointmentsList', 'applicationList'].forEach((id) => {
        const list = document.getElementById(id);
        if (list) list.innerHTML = '<li class="empty-state">Noch nichts gespeichert. Erstelle deinen ersten echten Eintrag – er bleibt lokal in diesem Browser erhalten.</li>';
      });
    });
  });

  window.BrainBoost = { store, profile, saveProfile, addXp };
})();
