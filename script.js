document.addEventListener('DOMContentLoaded', function () {
  var registerTab = document.getElementById('registerTab');
  var loginTab = document.getElementById('loginTab');
  var registerPanel = document.getElementById('registerPanel');
  var loginPanel = document.getElementById('loginPanel');

  if (!registerTab || !loginTab || !registerPanel || !loginPanel) {
    return;
  }

  registerTab.addEventListener('click', function () {
    registerTab.classList.add('active');
    registerTab.setAttribute('aria-selected', 'true');
    registerPanel.hidden = false;

    loginTab.classList.remove('active');
    loginTab.setAttribute('aria-selected', 'false');
    loginPanel.hidden = true;
  });

  loginTab.addEventListener('click', function () {
    loginTab.classList.add('active');
    loginTab.setAttribute('aria-selected', 'true');
    loginPanel.hidden = false;

    registerTab.classList.remove('active');
    registerTab.setAttribute('aria-selected', 'false');
    registerPanel.hidden = true;
  });

  if (window.location.hash === '#entrar') {
    loginTab.click();
  }
});

const btnsobre = document.getElementById('sobre');
const menuVerticalLicencas = document.getElementById('sidebar-sobre');
const btnContato = document.getElementById('contato');
const menuVerticalContato = document.getElementById('sidebar-contato');

if (btnsobre && menuVerticalLicencas) {
    btnsobre.addEventListener('click', function(event) {
        abreMenu(event, menuVerticalLicencas);
    });
}

if (btnContato && menuVerticalContato) {
    btnContato.addEventListener('click', function(event) {
        abreMenu(event, menuVerticalContato);
    });
}

function abreMenu(event, menu) {
    event.preventDefault();
    menu.classList.toggle('active');
}

function fechaMenu(event, menu, btn) {
    if (!menu.contains(event.target) && event.target !== btn) {
        menu.classList.remove('active');
    }
}

document.addEventListener('click', function(event) {

    if (menuVerticalLicencas && btnsobre) {
        fechaMenu(event, menuVerticalLicencas, btnsobre);
    }

    if (menuVerticalContato && btnContato) {
        fechaMenu(event, menuVerticalContato, btnContato);
    }

});

document.addEventListener('DOMContentLoaded', function () {
  var accessKey = 'meuEspacoAccess';
  var nameKey = 'meuEspacoName';
  var registerForm = document.getElementById('registerForm');
  var loginForm = document.getElementById('loginForm');

  document.querySelectorAll('input[type="password"]').forEach(function (field) {
    var character = field.nextElementSibling;
    var hideCharacterTimeout;

    field.addEventListener('input', function (event) {
      window.clearTimeout(hideCharacterTimeout);
      character.classList.remove('is-visible');
      if (!field.value || (event.inputType && !event.inputType.startsWith('insert'))) {
        character.textContent = '';
        return;
      }

      character.textContent = field.value.slice(-1);
      void character.offsetWidth;
      character.classList.add('is-visible');
      hideCharacterTimeout = window.setTimeout(function () {
        character.textContent = '';
        character.classList.remove('is-visible');
      }, 500);
    });
  });

  function startDemoSession(name) {
    sessionStorage.setItem(accessKey, 'true');
    if (name) localStorage.setItem(nameKey, name);
    window.location.replace('index.html');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var nameField = document.getElementById('registerName');
      startDemoSession(nameField.value.trim());
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      startDemoSession(localStorage.getItem(nameKey));
    });
  }

  var tasksNav = document.getElementById('tasks-nav');
  if (!tasksNav) return;

  var hasAccess = sessionStorage.getItem(accessKey) === 'true';
  document.getElementById('login-nav').hidden = hasAccess;
  document.getElementById('register-nav').hidden = hasAccess;
  tasksNav.hidden = !hasAccess;
  document.getElementById('logout-nav').hidden = !hasAccess;

  var guestMessage = document.getElementById('guest-message');
  var memberMessage = document.getElementById('member-message');
  guestMessage.hidden = hasAccess;
  memberMessage.hidden = !hasAccess;
  if (hasAccess) {
    var name = localStorage.getItem(nameKey);
    memberMessage.textContent = name ? 'Olá, ' + name + '! Seu espaço está pronto.' : 'Seu espaço está pronto.';
  }

  document.getElementById('logout-button').addEventListener('click', function () {
    sessionStorage.removeItem(accessKey);
    window.location.reload();
  });
});
