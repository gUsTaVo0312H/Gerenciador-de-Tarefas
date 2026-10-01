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
});
