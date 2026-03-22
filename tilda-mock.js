/**
 * Tilda Mock API
 * Эмулирует глобальные объекты и функции Tilda
 * которые доступны на реальном сайте Tilda
 */

// ===== tildaConfig =====
window.tildaConfig = {
  project_id: '12345678',
  page_id: '98765432',
  page_alias: 'sandbox-demo',
  lang: 'ru',
  is_export: false,
  currency: 'RUB',
  currency_symbol: '₽',
  favicon: '/favicon.ico',
  seo_title: 'Tilda JS Sandbox',
  seo_descr: 'Демонстрация возможностей Tilda JS API'
};

// ===== t_popup_show / t_popup_hide =====
window.t_popup_show = function(popupId) {
  Log.event('t_popup_show("' + popupId + '")');
  var popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = 'flex';
    document.dispatchEvent(new CustomEvent('popupshown', {
      detail: { popupid: popupId }
    }));
  } else {
    Log.warn('Попап с ID "' + popupId + '" не найден');
  }
};

window.t_popup_hide = function(popupId) {
  Log.event('t_popup_hide("' + (popupId || 'all') + '")');
  if (popupId) {
    var popup = document.getElementById(popupId);
    if (popup) popup.style.display = 'none';
  } else {
    document.querySelectorAll('.t-popup-demo').forEach(function(p) {
      p.style.display = 'none';
    });
  }
  document.dispatchEvent(new CustomEvent('popuphidden', {
    detail: { popupid: popupId }
  }));
};

// ===== tildaShop_addToCart =====
window.tildaShop_addToCart = function(product) {
  Log.event('tildaShop_addToCart(' + JSON.stringify(product) + ')');
  var cart = JSON.parse(localStorage.getItem('tcart') || '[]');
  var existing = cart.find(function(item) { return item.uid === product.uid; });
  if (existing) {
    existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
  } else {
    cart.push(Object.assign({ quantity: 1 }, product));
  }
  localStorage.setItem('tcart', JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent('productaddedtocart', {
    detail: product
  }));
};

// ===== window.dataLayer (GTM mock) =====
window.dataLayer = window.dataLayer || [];
var _originalPush = Array.prototype.push;
window.dataLayer.push = function() {
  _originalPush.apply(this, arguments);
  Log.info('GTM dataLayer.push: ' + JSON.stringify(arguments[0]));
};

// ===== Tilda Forms Callback =====
window.tildaFormsCallback = null;

// ===== Перехват console для лога =====
(function() {
  var _log = console.log.bind(console);
  var _warn = console.warn.bind(console);
  var _error = console.error.bind(console);

  console.log = function() {
    _log.apply(console, arguments);
    Log.info([].slice.call(arguments).map(function(a) {
      return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
    }).join(' '));
  };
  console.warn = function() {
    _warn.apply(console, arguments);
    Log.warn([].slice.call(arguments).map(String).join(' '));
  };
  console.error = function() {
    _error.apply(console, arguments);
    Log.error([].slice.call(arguments).map(String).join(' '));
  };
})();

// ===== Log система =====
window.Log = {
  _body: null,

  _init: function() {
    if (!this._body) this._body = document.getElementById('event-log-body');
  },

  _write: function(type, msg) {
    this._init();
    if (!this._body) return;
    var time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML =
      '<span class="log-time">' + time + '</span>' +
      '<span class="log-type-' + type + '">[' + type.toUpperCase() + ']</span> ' +
      '<span class="log-msg">' + escapeHtml(String(msg)) + '</span>';
    this._body.appendChild(entry);
    this._body.scrollTop = this._body.scrollHeight;
  },

  event: function(msg) { this._write('event', msg); },
  info:  function(msg) { this._write('info', msg); },
  warn:  function(msg) { this._write('warn', msg); },
  error: function(msg) { this._write('error', msg); },
  clear: function() { this._init(); if (this._body) this._body.innerHTML = ''; }
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== Подписка на все события Tilda =====
var TILDA_EVENTS = [
  'tildaready', 'allanimationend', 'scrollto',
  'tildaformsent', 'popupshown', 'popuphidden',
  'productaddedtocart', 'productremovedfromcart',
  'showpopup', 'hidepopup'
];

TILDA_EVENTS.forEach(function(evName) {
  document.addEventListener(evName, function(e) {
    var detail = e.detail ? ' → ' + JSON.stringify(e.detail) : '';
    Log.event('event: "' + evName + '"' + detail);
  });
});
