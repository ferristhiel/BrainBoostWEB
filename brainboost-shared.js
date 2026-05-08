(function () {
  const USER_KEY = 'brainboost_user';

  function updateLoginButtons() {
    const user = localStorage.getItem(USER_KEY);
    document.querySelectorAll('.login-btn, #openLogin').forEach((button) => {
      if (user) {
        button.textContent = `👤 ${user}`;
        button.setAttribute('aria-label', `Eingeloggt als ${user}`);
      }
    });
  }

  function quickLogin() {
    const name = window.prompt('BrainBoost Login (Demo): Wie heißt du?', localStorage.getItem(USER_KEY) || 'demo-schueler');
    if (!name) return;
    localStorage.setItem(USER_KEY, name.trim());
    updateLoginButtons();
    window.alert(`Willkommen zurück, ${name.trim()}! Dein Demo-Profil wurde lokal gespeichert.`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateLoginButtons();
    document.querySelectorAll('.login-btn:not(#openLogin)').forEach((button) => {
      button.addEventListener('click', quickLogin);
    });
  });

  window.brainBoostQuickLogin = quickLogin;
  window.brainBoostUpdateLoginButtons = updateLoginButtons;
}());
