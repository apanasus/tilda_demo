/**
 * Demo — интерактивные демонстрации для Tilda JS Sandbox
 */
window.Demo = {

  // ===== СОБЫТИЯ =====

  fireEvent: function(eventName, detail) {
    var event = detail
      ? new CustomEvent(eventName, { detail: detail })
      : new CustomEvent(eventName);
    document.dispatchEvent(event);
  },

  scrollToDemo: function() {
    var event = new CustomEvent('scrollto', {
      detail: { blockid: 'section-forms' }
    });
    document.dispatchEvent(event);
    // В Tilda это скроллит к блоку, здесь симулируем
    document.getElementById('section-forms').scrollIntoView({ behavior: 'smooth' });
    Log.info('Скролл к блоку section-forms');
  },

  // ===== ФОРМЫ =====

  testFormCallback: function() {
    window.tildaFormsCallback = function(formData) {
      Log.info('tildaFormsCallback вызван с данными: ' + JSON.stringify(formData));
      formData['custom_field'] = 'добавлено через callback';
      Log.info('Поле custom_field добавлено');
      return true;
    };
    // Симулируем вызов
    var fakeData = { Name: 'Иван', Email: 'ivan@example.com' };
    if (typeof window.tildaFormsCallback === 'function') {
      window.tildaFormsCallback(fakeData);
    }
  },

  submitForm: function() {
    var name    = document.getElementById('demo-name').value;
    var email   = document.getElementById('demo-email').value;
    var phone   = document.getElementById('demo-phone').value;
    var message = document.getElementById('demo-message').value;

    var formData = { Name: name, Email: email, Phone: phone, Message: message };

    // Вызываем callback если есть
    var shouldSend = true;
    if (typeof window.tildaFormsCallback === 'function') {
      shouldSend = window.tildaFormsCallback(formData);
      Log.info('tildaFormsCallback вернул: ' + shouldSend);
    }

    if (shouldSend !== false) {
      Log.info('Форма отправляется с данными: ' + JSON.stringify(formData));
      document.dispatchEvent(new CustomEvent('tildaformsent', {
        detail: { formid: 'demo-form-001', data: formData }
      }));
      // Визуальная обратная связь
      var btn = document.querySelector('.t-btn');
      var orig = btn.textContent;
      btn.textContent = 'Отправлено! ✓';
      btn.style.background = '#28a745';
      setTimeout(function() {
        btn.textContent = orig;
        btn.style.background = '';
      }, 2000);
    } else {
      Log.warn('Отправка формы отменена через tildaFormsCallback');
    }
  },

  addUtmFields: function() {
    // Симулируем UTM параметры в URL
    var fakeParams = new URLSearchParams('utm_source=google&utm_medium=cpc&utm_campaign=tilda_sandbox');
    var utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    var added = [];

    document.querySelectorAll('.t-form').forEach(function(form) {
      utmFields.forEach(function(field) {
        var val = fakeParams.get(field);
        if (val) {
          // Удалить старое если есть
          var existing = form.querySelector('input[name="' + field + '"]');
          if (existing) existing.remove();
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = field;
          input.value = val;
          form.appendChild(input);
          added.push(field + '=' + val);
        }
      });
    });

    if (added.length) {
      Log.info('UTM поля добавлены в форму: ' + added.join(', '));
    } else {
      Log.warn('Формы не найдены на странице');
    }
  },

  // ===== ПОПАПЫ =====

  showPopup: function(id) {
    t_popup_show(id);
  },

  hidePopup: function() {
    document.querySelectorAll('.t-popup-demo').forEach(function(p) {
      if (p.style.display !== 'none') {
        t_popup_hide(p.id);
      }
    });
  },

  popupOnDelay: function() {
    Log.info('Попап откроется через 2 секунды...');
    setTimeout(function() {
      t_popup_show('demo-popup');
    }, 2000);
  },

  // ===== КОРЗИНА =====

  addToCart: function() {
    var products = [
      { uid: 'p001', title: 'Курс по Tilda', price: 2900, quantity: 1, descr: 'Полный курс' },
      { uid: 'p002', title: 'Шаблон сайта',  price: 990,  quantity: 1, descr: 'Готовый шаблон' },
      { uid: 'p003', title: 'Консультация',  price: 5000, quantity: 1, descr: '1 час' }
    ];
    var product = products[Math.floor(Math.random() * products.length)];
    tildaShop_addToCart(product);
    this._updateCartCount();
  },

  showCart: function() {
    var cart = JSON.parse(localStorage.getItem('tcart') || '[]');
    if (!cart.length) {
      Log.info('Корзина пуста');
      return;
    }
    var total = cart.reduce(function(sum, item) {
      return sum + item.price * (item.quantity || 1);
    }, 0);
    Log.info('--- Корзина ---');
    cart.forEach(function(item) {
      Log.info('• ' + item.title + ' × ' + (item.quantity || 1) + ' = ' + (item.price * (item.quantity || 1)) + ' ₽');
    });
    Log.info('Итого: ' + total + ' ₽');
    this._updateCartCount();
  },

  _updateCartCount: function() {
    var cart = JSON.parse(localStorage.getItem('tcart') || '[]');
    var count = cart.reduce(function(n, i) { return n + (i.quantity || 1); }, 0);
    var el = document.getElementById('cart-count-demo');
    if (el) el.textContent = count;
  },

  // ===== ZERO BLOCK =====

  runZeroBlock: function() {
    var html = document.getElementById('zb-html').value;
    var css  = document.getElementById('zb-css').value;
    var js   = document.getElementById('zb-js').value;
    var preview = document.getElementById('zb-preview');

    // Очищаем старые стили
    var oldStyle = document.getElementById('zb-preview-style');
    if (oldStyle) oldStyle.remove();

    // Инжектим CSS
    if (css) {
      var style = document.createElement('style');
      style.id = 'zb-preview-style';
      style.textContent = css;
      document.head.appendChild(style);
    }

    // Рендерим HTML
    preview.innerHTML = html;

    // Выполняем JS
    if (js) {
      try {
        /* jshint evil:true */
        new Function(js)(); // eslint-disable-line no-new-func
        Log.info('Zero Block JS выполнен успешно');
      } catch (e) {
        Log.error('Ошибка в Zero Block JS: ' + e.message);
      }
    }
  },

  // ===== АНИМАЦИИ =====

  triggerAnimation: function() {
    var boxes = document.querySelectorAll('.anim-box.t-animate');
    boxes.forEach(function(box) {
      box.classList.remove('t-animate_started');
      void box.offsetWidth; // reflow
      setTimeout(function() {
        box.classList.add('t-animate_started');
      }, 50);
    });
    Log.info('Анимации запущены (классы t-animate → t-animate_started)');
  },

  playAnimations: function() {
    this.resetAnimations();
    setTimeout(function() {
      document.querySelectorAll('.anim-box.t-animate').forEach(function(box) {
        box.classList.add('t-animate_started');
      });
      Log.info('Все анимации запущены');
    }, 100);
  },

  resetAnimations: function() {
    document.querySelectorAll('.anim-box.t-animate').forEach(function(box) {
      box.classList.remove('t-animate_started');
    });
    Log.info('Анимации сброшены');
  },

  triggerScrollAnim: function() {
    document.querySelectorAll('.scroll-item.animate-on-scroll').forEach(function(el, i) {
      setTimeout(function() {
        el.classList.add('is-visible');
      }, i * 200);
    });
    Log.info('Scroll-анимация запущена для ' + document.querySelectorAll('.scroll-item').length + ' элементов');
  },

  // ===== ДАННЫЕ СТРАНИЦЫ =====

  showTildaConfig: function() {
    Log.info('tildaConfig:');
    Object.keys(tildaConfig).forEach(function(key) {
      Log.info('  ' + key + ': ' + JSON.stringify(tildaConfig[key]));
    });
  },

  showUrlParams: function() {
    var params = new URLSearchParams(location.search);
    if ([...params].length === 0) {
      Log.info('URL параметров нет. Попробуйте добавить ?utm_source=google&utm_medium=cpc к URL');
    } else {
      Log.info('URL параметры:');
      params.forEach(function(value, key) {
        Log.info('  ' + key + ': ' + value);
      });
    }
    Log.info('Текущий URL: ' + location.href);
  },

  showStorage: function() {
    Log.info('localStorage содержимое:');
    if (!localStorage.length) {
      Log.info('  (пусто)');
      return;
    }
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      var val = localStorage.getItem(key);
      try { val = JSON.stringify(JSON.parse(val)); } catch(e) {}
      Log.info('  ' + key + ': ' + val);
    }
  },

  scanBlocks: function() {
    var blocks = document.querySelectorAll('.sandbox-section');
    Log.info('Найдено блоков (секций): ' + blocks.length);
    blocks.forEach(function(block) {
      Log.info('  #' + block.id + ' — ' + (block.querySelector('h1') || {}).textContent);
    });
  },

  // ===== ЖИВОЙ РЕДАКТОР =====

  runCustomCode: function() {
    var code = document.getElementById('custom-code').value;
    var output = document.getElementById('custom-output');
    output.textContent = '';

    var lines = [];
    var origLog   = console.log;
    var origWarn  = console.warn;
    var origError = console.error;

    // Временно перехватываем для вывода в output
    var capture = function(prefix) {
      return function() {
        var msg = [].slice.call(arguments).map(function(a) {
          return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
        }).join(' ');
        lines.push(prefix + msg);
      };
    };
    console.log   = capture('');
    console.warn  = capture('[WARN] ');
    console.error = capture('[ERROR] ');

    try {
      /* jshint evil:true */
      new Function(code)(); // eslint-disable-line no-new-func
    } catch(e) {
      lines.push('[ERROR] ' + e.message);
      Log.error('Ошибка в коде: ' + e.message);
    } finally {
      console.log   = origLog;
      console.warn  = origWarn;
      console.error = origError;
    }

    output.textContent = lines.length ? lines.join('\n') : '// Нет вывода';
  },

  clearEditor: function() {
    document.getElementById('custom-code').value = '';
    document.getElementById('custom-output').textContent = '';
  },

  loadExample: function() {
    var examples = [
      // 0: UTM считывание
      `// Пример 1: Чтение UTM-меток из URL
var params = new URLSearchParams('?utm_source=google&utm_medium=cpc&utm_campaign=test');
var utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
utmFields.forEach(function(field) {
  var val = params.get(field);
  if (val) console.log(field + ':', val);
});`,

      // 1: Работа с корзиной
      `// Пример 2: Работа с корзиной Tilda
// Добавить товар
tildaShop_addToCart({
  uid: 'demo-001',
  title: 'Тестовый товар',
  price: 999,
  quantity: 2
});

// Прочитать корзину
var cart = JSON.parse(localStorage.getItem('tcart') || '[]');
console.log('Товаров в корзине:', cart.length);
var total = cart.reduce(function(s, i) { return s + i.price * i.quantity; }, 0);
console.log('Сумма:', total, '₽');`,

      // 2: Попапы
      `// Пример 3: Управление попапами
// Открыть попап через 1 секунду
console.log('Попап откроется через 1 секунду...');
setTimeout(function() {
  t_popup_show('demo-popup');
  console.log('Попап открыт!');

  // Закрыть через ещё 2 секунды
  setTimeout(function() {
    t_popup_hide('demo-popup');
    console.log('Попап закрыт!');
  }, 2000);
}, 1000);`,

      // 3: События
      `// Пример 4: Подписка на события Tilda
document.addEventListener('tildaformsent', function(e) {
  console.log('Форма отправлена!');
  console.log('ID формы:', e.detail.formid);
  console.log('Данные:', JSON.stringify(e.detail.data));

  // Отправка в GTM
  window.dataLayer.push({
    event: 'form_submit',
    form_id: e.detail.formid
  });
});

// Симулируем отправку формы
document.dispatchEvent(new CustomEvent('tildaformsent', {
  detail: { formid: 'rec999', data: { Name: 'Тест', Email: 'test@test.com' } }
}));`,

      // 4: tildaConfig
      `// Пример 5: Использование tildaConfig
console.log('Project ID:', tildaConfig.project_id);
console.log('Page alias:', tildaConfig.page_alias);
console.log('Язык:', tildaConfig.lang);
console.log('Валюта:', tildaConfig.currency_symbol);

// Выводим весь конфиг
Object.keys(tildaConfig).forEach(function(key) {
  console.log(key + ':', tildaConfig[key]);
});`
    ];

    var idx = Math.floor(Math.random() * examples.length);
    document.getElementById('custom-code').value = examples[idx];
    document.getElementById('custom-output').textContent = '';
    Log.info('Загружен пример ' + (idx + 1) + ' из ' + examples.length);
  }
};

// ===== Навигация: активный пункт по скроллу =====
(function() {
  var sections = document.querySelectorAll('.sandbox-section');
  var links    = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function() {
    var scrollY = window.scrollY + 80;
    var current = '';
    sections.forEach(function(section) {
      if (section.offsetTop <= scrollY) current = '#' + section.id;
    });
    links.forEach(function(link) {
      link.classList.toggle('active', link.getAttribute('href') === current);
    });
  });

  // Zero Block табы
  document.querySelectorAll('.zb-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = this.dataset.tab;
      document.querySelectorAll('.zb-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.zb-code').forEach(function(c) { c.style.display = 'none'; });
      this.classList.add('active');
      document.getElementById('zb-' + target).style.display = 'block';
    });
  });

  // Кнопка очистки лога
  document.getElementById('clear-log').addEventListener('click', function() {
    Log.clear();
  });

  // Инициализация корзины
  Demo._updateCartCount();

  // Симулируем tildaready
  setTimeout(function() {
    document.dispatchEvent(new CustomEvent('tildaready'));
    Log.info('Sandbox готов! Изучайте возможности Tilda JS API.');
  }, 300);
})();
