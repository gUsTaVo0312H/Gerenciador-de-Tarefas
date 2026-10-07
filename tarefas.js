document.addEventListener('DOMContentLoaded', function () {
  if (sessionStorage.getItem('meuEspacoAccess') !== 'true') {
    window.location.replace('index.html');
    return;
  }

  var storageKey = 'meu-espaco-itens-v1';
  var today = dateKey(new Date());
  var entries = loadEntries();
  var activeFilter = 'all';
  var calendarMonth = new Date();
  var sectionNames = {
    home: 'Início', tasks: 'Tarefas', notes: 'Anotações',
    calendar: 'Agenda', progress: 'Progresso', goals: 'Objetivos'
  };

  function dateKey(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function addDays(date, amount) {
    var result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function loadEntries() {
    try {
      var saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.warn('Não foi possível carregar os dados salvos.', error);
    }

    var now = new Date();
    var todayKey = dateKey(now);
    return [
      { id: makeId(), type: 'task', title: 'Estudar JavaScript', detail: 'Revisar funções e praticar um exercício.', date: todayKey, done: false },
      { id: makeId(), type: 'task', title: 'Finalizar o trabalho', detail: '', date: todayKey, done: true, doneDate: todayKey },
      { id: makeId(), type: 'task', title: 'Organizar meus arquivos', detail: '', date: todayKey, done: false },
      { id: makeId(), type: 'task', title: 'Responder mensagens', detail: '', date: todayKey, done: false },
      { id: makeId(), type: 'note', title: 'Uma ideia para o projeto', detail: 'Criar uma página para acompanhar as pequenas conquistas do dia.', date: todayKey },
      { id: makeId(), type: 'note', title: 'Revisar nos estudos', detail: 'Arrays, objetos e métodos de iteração.', date: todayKey },
      { id: makeId(), type: 'note', title: 'Lista do mercado', detail: 'Arroz, leite e café.', date: todayKey },
      { id: makeId(), type: 'goal', title: 'Aprender JavaScript', detail: 'Um pouco de prática por dia.', progress: 60 },
      { id: makeId(), type: 'goal', title: 'Treinar regularmente', detail: 'Criar uma rotina que funcione para mim.', progress: 40 },
      { id: makeId(), type: 'goal', title: 'Guardar dinheiro', detail: 'Acompanhar os pequenos avanços.', progress: 25 },
      { id: makeId(), type: 'goal', title: 'Terminar meu projeto', detail: 'Transformar a ideia em algo real.', progress: 75 },
      { id: makeId(), type: 'event', title: 'Separar um tempo para ler', detail: '', date: dateKey(addDays(now, 2)) },
      { id: makeId(), type: 'event', title: 'Revisar o planejamento', detail: '', date: dateKey(addDays(now, 5)) }
    ];
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function saveEntries() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (error) {
      console.warn('Não foi possível salvar os dados neste navegador.', error);
    }
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setView(view) {
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== view;
    });
    document.querySelectorAll('[data-view]').forEach(function (button) {
      var selected = button.dataset.view === view;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('current-section').textContent = sectionNames[view];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function taskRow(task) {
    var row = element('div', 'task-row' + (task.done ? ' completed' : ''));
    var check = element('button', 'task-check', task.done ? '✓' : '✓');
    check.type = 'button';
    check.setAttribute('aria-label', (task.done ? 'Reabrir: ' : 'Concluir: ') + task.title);
    check.setAttribute('aria-pressed', String(Boolean(task.done)));
    check.addEventListener('click', function () {
      task.done = !task.done;
      task.doneDate = task.done ? today : '';
      saveEntries();
      render();
    });
    var title = element('span', 'task-title', task.title);
    row.append(check, title);
    if (task.date && task.date !== today) {
      row.append(element('span', 'task-date', formatShortDate(task.date)));
    }
    return row;
  }

  function renderTaskList(container, tasks, emptyText) {
    container.replaceChildren();
    if (!tasks.length) {
      container.append(element('div', 'empty-state', emptyText));
      return;
    }
    tasks.forEach(function (task) { container.append(taskRow(task)); });
  }

  function noteCard(note) {
    var card = element('article', 'note-card');
    var head = element('div', 'note-card-head');
    var category = element('span', 'note-category', note.category || '✎  ANOTAÇÃO');
    var remove = element('button', 'note-delete', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Excluir anotação: ' + note.title);
    remove.addEventListener('click', function () {
      entries = entries.filter(function (entry) { return entry.id !== note.id; });
      saveEntries();
      render();
    });
    head.append(category, remove);
    card.append(head, element('h3', '', note.title), element('p', '', note.detail || 'Sem detalhes por enquanto.'));
    return card;
  }

  function renderNotes(container, notes, emptyText) {
    container.replaceChildren();
    if (!notes.length) {
      container.append(element('div', 'empty-state', emptyText));
      return;
    }
    notes.forEach(function (note) { container.append(noteCard(note)); });
  }

  function mondayOf(date) {
    var result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var weekday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - weekday);
    return result;
  }

  function renderWeek(tasks) {
    var chart = document.getElementById('week-chart');
    chart.replaceChildren();
    var monday = mondayOf(new Date());
    var counts = [];
    for (var day = 0; day < 7; day += 1) {
      var key = dateKey(addDays(monday, day));
      var count = tasks.filter(function (task) { return task.done && task.doneDate === key; }).length;
      counts.push(count);
    }
    var maximum = Math.max(3, ...counts);
    var labels = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
    counts.forEach(function (count, index) {
      var item = element('div', 'chart-day' + (dateKey(addDays(monday, index)) === today ? ' today' : ''));
      var track = element('div', 'chart-bar-track');
      var bar = element('span', 'chart-bar');
      bar.style.height = Math.max(4, (count / maximum) * 100) + '%';
      track.append(bar);
      item.append(track, element('span', '', labels[index]));
      chart.append(item);
    });
    var total = counts.reduce(function (sum, count) { return sum + count; }, 0);
    var weekTasks = tasks.filter(function (task) {
      return task.date && task.date >= dateKey(monday) && task.date <= dateKey(addDays(monday, 6));
    });
    var completedWeekTasks = weekTasks.filter(function (task) { return task.done; }).length;
    var weekPercent = weekTasks.length ? Math.round((completedWeekTasks / weekTasks.length) * 100) : 0;
    document.getElementById('week-total').textContent = total + (total === 1 ? ' atividade' : ' atividades');
    document.getElementById('week-progress').textContent = Math.min(100, weekPercent) + '%';
    document.getElementById('week-progress-bar').style.width = Math.min(100, weekPercent) + '%';
  }

  function renderCalendar(events, tasks) {
    var activities = events.concat(tasks.filter(function (task) {
      return task.date && !task.done;
    }));
    var grid = document.getElementById('calendar-grid');
    var monthTitle = document.getElementById('calendar-month');
    grid.replaceChildren();
    var monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(calendarMonth);
    monthTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].forEach(function (day) {
      grid.append(element('div', 'calendar-weekday', day));
    });
    var first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    var start = mondayOf(first);
    for (var index = 0; index < 42; index += 1) {
      var date = addDays(start, index);
      var key = dateKey(date);
      var isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
      var dayActivities = activities.filter(function (activity) { return activity.date === key; });
      var hasEvent = dayActivities.length > 0;
      var hasTask = dayActivities.some(function (activity) { return activity.type === 'task'; });
      var dayClass = 'calendar-day' + (isCurrentMonth ? '' : ' other-month') + (key === today ? ' today' : '') + (hasEvent ? ' has-event' : '') + (hasTask ? ' has-task' : '');
      var day = element('div', dayClass, String(date.getDate()));
      day.setAttribute('aria-label', new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date) + (hasEvent ? ', tem atividade' : ''));
      grid.append(day);
    }
    var upcoming = activities.filter(function (activity) { return activity.date >= today; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var eventList = document.getElementById('calendar-events');
    eventList.replaceChildren();
    if (!upcoming.length) eventList.append(element('div', 'empty-state', 'Sua agenda está livre por enquanto.'));
    upcoming.forEach(function (event) {
      var isTask = event.type === 'task';
      var line = element('div', 'event-line' + (isTask ? ' is-task' : ''));
      var description = element('span', 'event-description');
      description.append(element('strong', 'event-kind', isTask ? 'Tarefa' : 'Evento'), element('span', 'event-title', event.title));
      line.append(description, element('span', 'event-date', formatShortDate(event.date)));
      eventList.append(line);
    });
  }

  function renderGoals(goals) {
    var list = document.getElementById('goal-list');
    list.replaceChildren();
    if (!goals.length) {
      list.append(element('div', 'empty-state', 'Todo objetivo começa com uma ideia. Que tal guardar a sua?'));
      return;
    }
    goals.forEach(function (goal) {
      var card = element('article', 'goal-card');
      var heading = element('h2', '', goal.title);
      var description = element('p', '', goal.detail || 'Um passo de cada vez.');
      var progressLine = element('div', 'goal-progress-line');
      var advance = element('button', '', 'Avançar 10%');
      advance.type = 'button';
      advance.style.cssText = 'padding:0;border:0;color:#58745b;background:none;cursor:pointer;font:inherit';
      advance.addEventListener('click', function () {
        goal.progress = Math.min(100, (goal.progress || 0) + 10);
        saveEntries();
        render();
      });
      progressLine.append(advance, element('strong', '', (goal.progress || 0) + '%'));
      var progress = element('div', 'goal-progress');
      var fill = element('span');
      fill.style.width = Math.min(100, Math.max(0, goal.progress || 0)) + '%';
      progress.append(fill);
      card.append(heading, description, progressLine, progress);
      list.append(card);
    });
  }

  function renderHistory(tasks) {
    var history = document.getElementById('activity-history');
    history.replaceChildren();
    for (var offset = 0; offset < 7; offset += 1) {
      var date = addDays(new Date(), -offset);
      var key = dateKey(date);
      var count = tasks.filter(function (task) { return task.done && task.doneDate === key; }).length;
      var line = element('div', 'history-row');
      var label = offset === 0 ? 'Hoje' : new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric' }).format(date);
      line.append(element('span', '', label), element('strong', '', count + (count === 1 ? ' atividade' : ' atividades')));
      history.append(line);
    }
  }

  function formatShortDate(key) {
    if (!key) return '';
    var parts = key.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function render() {
    var tasks = entries.filter(function (entry) { return entry.type === 'task'; });
    var notes = entries.filter(function (entry) { return entry.type === 'note'; });
    var goals = entries.filter(function (entry) { return entry.type === 'goal'; });
    var events = entries.filter(function (entry) { return entry.type === 'event'; });
    var todayTasks = tasks.filter(function (task) { return !task.date || task.date <= today; });
    var pendingToday = todayTasks.filter(function (task) { return !task.done; });
    var completedToday = todayTasks.filter(function (task) { return task.done; });
    var todayPercent = todayTasks.length ? Math.round((completedToday.length / todayTasks.length) * 100) : 0;

    renderTaskList(document.getElementById('home-task-list'), todayTasks.slice(0, 4), 'Seu dia está livre. Aproveite ou adicione algo novo.');
    var filteredTasks = tasks.filter(function (task) {
      return activeFilter === 'all' || (activeFilter === 'done' ? task.done : !task.done);
    });
    renderTaskList(document.getElementById('all-task-list'), filteredTasks, activeFilter === 'done' ? 'Ainda não há tarefas concluídas.' : 'Nenhuma tarefa por aqui. Você pode aproveitar a calma ou adicionar uma.');
    document.getElementById('task-view-count').textContent = tasks.length + (tasks.length === 1 ? ' tarefa' : ' tarefas');
    document.getElementById('today-task-total').textContent = pendingToday.length;
    document.getElementById('today-done-copy').textContent = completedToday.length ? completedToday.length + (completedToday.length === 1 ? ' passo concluído hoje' : ' passos concluídos hoje') : 'Tudo começa com um passo';
    document.getElementById('sidebar-task-count').textContent = tasks.filter(function (task) { return !task.done; }).length;
    document.getElementById('note-total').textContent = notes.length;
    renderNotes(document.getElementById('home-note-list'), notes.slice(0, 2), 'Suas boas ideias vão aparecer aqui.');
    renderNotes(document.getElementById('all-note-list'), notes, 'Suas boas ideias vão aparecer aqui.');
    renderWeek(tasks);
    renderCalendar(events, tasks);
    renderGoals(goals);
    renderHistory(tasks);
    document.getElementById('today-progress-label').textContent = todayPercent === 100 ? 'Você cuidou de tudo por hoje!' : pendingToday.length ? 'Só mais ' + pendingToday.length + (pendingToday.length === 1 ? ' passo para terminar seu dia.' : ' passos para terminar seu dia.') : 'Seu dia está começando';
    document.getElementById('today-progress-bar').style.width = todayPercent + '%';
    document.getElementById('today-progress-value').textContent = todayPercent + '%';
    document.getElementById('today-progress-tasks').textContent = completedToday.length + (completedToday.length === 1 ? ' tarefa concluída' : ' tarefas concluídas');
    document.getElementById('progress-message').textContent = completedToday.length ? 'Você está indo bem. Cada passo conta.' : 'Todo grande caminho começa com um pequeno passo.';
  }

  var dateNode = document.getElementById('today-date');
  dateNode.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
  document.querySelector('.today-block .eyebrow').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase();

  document.querySelectorAll('[data-view]').forEach(function (button) {
    button.addEventListener('click', function () { setView(button.dataset.view); });
  });
  document.querySelectorAll('[data-go]').forEach(function (button) {
    button.addEventListener('click', function () { setView(button.dataset.go); });
  });
  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(function (filter) { filter.classList.toggle('active', filter === button); });
      render();
    });
  });

  var dialog = document.getElementById('entry-dialog');
  var form = document.getElementById('entry-form');
  var typeInput = document.getElementById('entry-type');
  var titleInput = document.getElementById('entry-title');
  var detailInput = document.getElementById('entry-detail');
  var dateInput = document.getElementById('entry-date');
  var detailLabel = document.getElementById('detail-label');
  var dateLabel = document.getElementById('date-label');
  var dialogTitle = document.getElementById('dialog-title');
  var typeTitles = { task: 'Nova tarefa', note: 'Nova anotação', goal: 'Novo objetivo', event: 'Novo evento' };

  function openDialog(type) {
    form.reset();
    typeInput.value = type || 'task';
    dateInput.value = today;
    updateDialogFields();
    dialog.showModal();
    titleInput.focus();
  }

  function updateDialogFields() {
    var type = typeInput.value;
    dialogTitle.textContent = typeTitles[type];
    var hasDate = type === 'task' || type === 'event';
    dateLabel.hidden = !hasDate;
    dateInput.hidden = !hasDate;
    detailLabel.hidden = type === 'event';
    detailInput.hidden = type === 'event';
    detailInput.placeholder = type === 'note' ? 'Escreva uma ideia, lista ou lembrete...' : type === 'goal' ? 'O que esse objetivo significa para você?' : 'Adicione um detalhe, se ajudar...';
  }

  document.querySelectorAll('.add-trigger').forEach(function (button) {
    button.addEventListener('click', function () { openDialog(button.dataset.addType || 'task'); });
  });
  typeInput.addEventListener('change', updateDialogFields);
  document.getElementById('dialog-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var type = typeInput.value;
    var entry = {
      id: makeId(), type: type, title: titleInput.value.trim(),
      detail: detailInput.value.trim(), date: dateInput.value || today
    };
    if (!entry.title) return;
    if (type === 'task') entry.done = false;
    if (type === 'goal') entry.progress = 0;
    if (type === 'note') entry.category = '✎  ANOTAÇÃO';
    entries.unshift(entry);
    saveEntries();
    dialog.close();
    render();
  });

  document.getElementById('month-prev').addEventListener('click', function () {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    render();
  });
  document.getElementById('month-next').addEventListener('click', function () {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    render();
  });
  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
  });

  render();
});
