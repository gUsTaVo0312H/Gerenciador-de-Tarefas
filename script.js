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
  var accountsKey = 'usuarios';
  var registerForm = document.getElementById('registerForm');
  var loginForm = document.getElementById('loginForm');
  var authMessage = document.getElementById('authMessage');

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
    window.setTimeout(function () { window.location.replace('index.html'); }, 500);
  }

  function showAuthMessage(message, isError) {
    authMessage.textContent = message;
    authMessage.style.color = isError ? '#a33d32' : '#4b7257';
  }

  function readAccounts() {
    try {
      var accounts = JSON.parse(localStorage.getItem(accountsKey) || '[]');
      return Array.isArray(accounts) ? accounts : [];
    } catch (error) {
      return [];
    }
  }

  function downloadFile(filename, contents, mimeType) {
    var fileUrl = URL.createObjectURL(new Blob([contents], { type: mimeType }));
    var link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(fileUrl); }, 1000);
  }

  function downloadAccountText(account) {
    var textContents = [
      'Informações do cadastro',
      'Nome: ' + account.name,
      'E-mail: ' + account.email,
      'Endereço: ' + account.address,
      'CPF: ' + account.cpf,
      'Senha: ' + account.password,
      'Criado em: ' + account.createdAt
    ].join('\n');
    downloadFile('cadastro.txt', textContents, 'text/plain;charset=utf-8');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var account = {
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim().toLowerCase(),
        password: document.getElementById('registerPassword').value,
        address: document.getElementById('registerEndereço').value.trim(),
        cpf: document.getElementById('registerCPF').value.replace(/\D/g, ''),
        createdAt: new Date().toISOString()
      };
      var accounts = readAccounts();

      if (account.cpf.length !== 11) {
        showAuthMessage('Informe um CPF com 11 dígitos.', true);
        return;
      }
      if (accounts.some(function (savedAccount) { return savedAccount.email === account.email; })) {
        showAuthMessage('Este e-mail já foi cadastrado neste navegador.', true);
        return;
      }

      accounts.push(account);
      try {
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        localStorage.setItem('meuEspacoUltimoCadastro', account.email);
        downloadAccountText(account);
        loginTab.click();
        document.getElementById('loginEmail').value = account.email;
        document.getElementById('loginPassword').value = account.password;
        showAuthMessage('Cadastro salvo. Confira os dados e entre.', false);
        window.location.replace('cadastro.html#entrar');
      } catch (error) {
        showAuthMessage('Não foi possível salvar os dados neste navegador.', true);
      }
    });
  }

  if (loginForm) {
    var lastEmail = localStorage.getItem('meuEspacoUltimoCadastro');
    var lastAccount = readAccounts().find(function (savedAccount) {
      return savedAccount.email === lastEmail;
    });
    if (window.location.hash === '#entrar' && lastAccount) {
      document.getElementById('loginEmail').value = lastAccount.email;
      document.getElementById('loginPassword').value = lastAccount.password;
      showAuthMessage('Cadastro encontrado. Confira os dados e entre.', false);
    }

    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = document.getElementById('loginEmail').value.trim().toLowerCase();
      var password = document.getElementById('loginPassword').value;
      var account = readAccounts().find(function (savedAccount) {
        return savedAccount.email === email && savedAccount.password === password;
      });

      if (!account) {
        showAuthMessage('E-mail ou senha inválidos.', true);
        return;
      }
      showAuthMessage('Entrada realizada. Redirecionando...', false);
      startDemoSession(account.name);
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
