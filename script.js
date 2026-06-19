/* =====================================================================
   Руднев Консалт — интерактив главной страницы (v2)
   Без сторонних библиотек. Только разрешённые в РФ сервисы.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Мобильное меню (бургер) ---------- */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.hidden = true;
  }
  function toggleMenu() {
    if (!burger || !mobileMenu) return;
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
    mobileMenu.hidden = open;
  }
  if (burger) {
    burger.addEventListener('click', toggleMenu);
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Общие ссылки на форму/тему ---------- */
  var topicSelect = document.getElementById('topic');
  var quiz = document.getElementById('quiz');
  var form = document.getElementById('lead-form');
  var reco = document.getElementById('form-reco');

  function showForm() {
    if (quiz) quiz.hidden = true;
    if (form) form.hidden = false;
  }
  function setTopic(value) {
    if (!topicSelect || !value) return;
    var match = Array.prototype.find.call(topicSelect.options, function (o) { return o.value === value; });
    if (match) topicSelect.value = value;
  }

  /* Клик по сегменту/услуге/цене подставляет тему и открывает форму */
  document.querySelectorAll('[data-topic]').forEach(function (el) {
    el.addEventListener('click', function () {
      setTopic(el.getAttribute('data-topic'));
      showForm();
    });
  });

  /* ---------- Мини-подбор (квиз) ---------- */
  if (quiz && form) {
    var answers = { business: '', need: '', state: '' };
    var keys = ['business', 'need', 'state'];
    var current = 1;
    var panels = quiz.querySelectorAll('.quiz__panel');
    var stepLabel = document.getElementById('quiz-step');
    var bar = document.getElementById('quiz-bar');
    var backBtn = document.getElementById('quiz-back');
    var skipBtn = document.getElementById('quiz-skip');
    var total = panels.length;

    function render() {
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== current; });
      if (stepLabel) stepLabel.textContent = String(current);
      if (bar) bar.style.width = Math.round((current / total) * 100) + '%';
      if (backBtn) backBtn.hidden = current === 1;
    }

    function buildReco() {
      // Подставляем тему: приоритет у выбранного направления, иначе по типу бизнеса
      var topic = answers.need && answers.need.indexOf('Не знаю') === -1 ? answers.need : answers.business;
      setTopic(topic);

      var parts = [];
      if (answers.business) parts.push(answers.business.toLowerCase());
      var tail = '';
      if (answers.state.indexOf('Перехожу') !== -1) tail = 'Поможем перенести всё от&nbsp;текущего подрядчика без простоя.';
      else if (answers.state.indexOf('есть') !== -1) tail = 'Возьмём вашу кассу и&nbsp;учёт на&nbsp;сопровождение.';
      else if (answers.state.indexOf('нет') !== -1) tail = 'Поставим и&nbsp;настроим всё с&nbsp;нуля под&nbsp;ключ.';

      var lead = 'Подберём решение для&nbsp;«' + (answers.business || 'вашего бизнеса') + '».';
      if (reco) {
        reco.innerHTML = '<b>Спасибо!</b> ' + lead + ' ' + tail + ' Оставьте телефон, перезвоним и&nbsp;сориентируем по&nbsp;цене.';
        reco.hidden = false;
      }
    }

    quiz.querySelectorAll('.quiz__opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        answers[keys[current - 1]] = opt.getAttribute('data-value');
        if (current < total) {
          current++;
          render();
        } else {
          buildReco();
          showForm();
          var phone = document.getElementById('phone');
          if (phone) phone.focus();
        }
      });
    });

    if (backBtn) backBtn.addEventListener('click', function () {
      if (current > 1) { current--; render(); }
    });
    if (skipBtn) skipBtn.addEventListener('click', function () {
      showForm();
      var phone = document.getElementById('phone');
      if (phone) phone.focus();
    });

    render();
  }

  /* ---------- Валидация и отправка формы (обязателен только телефон) ---------- */
  var success = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.querySelector('#phone');
      var consent = form.querySelector('#consent');
      var ok = true;

      var phoneField = phone.closest('.field');
      var digits = (phone.value.match(/\d/g) || []).length;
      if (digits < 10) { phoneField.classList.add('is-invalid'); phone.setAttribute('aria-invalid', 'true'); ok = false; }
      else { phoneField.classList.remove('is-invalid'); phone.removeAttribute('aria-invalid'); }

      var consentLabel = consent.closest('.consent');
      if (!consent.checked) { consentLabel.classList.add('is-invalid'); consent.setAttribute('aria-invalid', 'true'); ok = false; }
      else { consentLabel.classList.remove('is-invalid'); consent.removeAttribute('aria-invalid'); }

      if (!ok) {
        var firstError = form.querySelector('.is-invalid');
        if (firstError) {
          var focusEl = firstError.querySelector('input, select, textarea') || firstError;
          focusEl.focus();
        }
        return;
      }

      /* ⚠ Здесь отправка на почту/в мессенджер (бэкенд или сервис форм).
         Демонстрационно показываем подтверждение. */
      if (reco) reco.hidden = true;
      if (success) {
        success.hidden = false;
        if (success.focus) success.focus();
      }
      form.querySelectorAll('input, select, textarea, button').forEach(function (el) {
        if (el.type !== 'hidden') el.setAttribute('disabled', 'disabled');
      });
    });

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field) field.classList.remove('is-invalid');
      e.target.removeAttribute('aria-invalid');
      if (e.target.id === 'consent') e.target.closest('.consent').classList.remove('is-invalid');
    });
  }

  /* ---------- Слайдер кейсов (горизонтальный) ---------- */
  var slider = document.getElementById('cases-slider');
  if (slider) {
    var arrows = document.querySelectorAll('.cases__arrow');
    function cardStep() {
      var card = slider.querySelector('.case-card');
      if (!card) return slider.clientWidth;
      var gap = parseInt(getComputedStyle(slider).columnGap || getComputedStyle(slider).gap || '28', 10) || 28;
      return card.getBoundingClientRect().width + gap;
    }
    function updateArrows() {
      var maxScroll = slider.scrollWidth - slider.clientWidth - 2;
      arrows.forEach(function (a) {
        var dir = a.getAttribute('data-dir');
        if (dir === 'prev') a.disabled = slider.scrollLeft <= 0;
        else a.disabled = Math.ceil(slider.scrollLeft) >= maxScroll;
      });
    }
    function move(dir) { slider.scrollBy({ left: dir * cardStep(), behavior: 'smooth' }); }
    arrows.forEach(function (a) {
      a.addEventListener('click', function () {
        move(a.getAttribute('data-dir') === 'next' ? 1 : -1);
      });
    });
    /* Прокрутка слайдера стрелками клавиатуры, когда он в фокусе */
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    });
    slider.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  /* ---------- Появление элементов при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Cookie-баннер (равноправные кнопки) ---------- */
  var cookie = document.getElementById('cookie');
  var STORAGE_KEY = 'rk_cookie_choice';
  var saved = null;
  try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (err) { saved = null; }

  if (cookie && !saved) { cookie.hidden = false; }
  function choose(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (err) {}
    if (cookie) cookie.hidden = true;
    /* ⚠ При 'accept' здесь инициализировать Яндекс.Метрику (не Google Analytics). */
  }
  var acceptBtn = document.getElementById('cookie-accept');
  var declineBtn = document.getElementById('cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { choose('accept'); });
  if (declineBtn) declineBtn.addEventListener('click', function () { choose('decline'); });

})();
