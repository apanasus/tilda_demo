# Tilda JS Sandbox

Интерактивная песочница для изучения всех возможностей JavaScript API на платформе Tilda.

## Быстрый старт

Откройте `index.html` в браузере. Сервер не нужен.

## Что внутри

### Секции

| Секция | Что изучается |
|--------|--------------|
| **События** | Все кастомные события Tilda: `tildaready`, `tildaformsent`, `popupshown`, `productaddedtocart` и др. |
| **Формы** | `tildaFormsCallback`, добавление UTM-меток, перехват данных перед отправкой |
| **Попапы** | `t_popup_show()`, `t_popup_hide()`, открытие по таймеру и скроллу |
| **Корзина** | `tildaShop_addToCart()`, чтение корзины из `localStorage`, счётчик товаров |
| **Zero Block** | Живой редактор HTML/CSS/JS с предпросмотром |
| **Анимации** | Классы `t-animate` / `t-animate_started`, IntersectionObserver паттерн |
| **Данные страницы** | `tildaConfig`, UTM из URL, `localStorage`, сканирование блоков |
| **Живой редактор** | Пишите и запускайте произвольный JS с 5 готовыми примерами |

### Лог событий

В нижней части экрана — постоянный лог всех событий, вызовов функций и `console.log`.

## Файлы

```
├── index.html      — разметка и структура секций
├── styles.css      — стили (Tilda-подобный дизайн)
├── tilda-mock.js   — эмуляция Tilda API (tildaConfig, t_popup_show и др.)
└── demo.js         — логика интерактивных демонстраций
```

## Эмулируемое Tilda API

```js
// Глобальный конфиг страницы
tildaConfig.project_id
tildaConfig.page_id
tildaConfig.lang
tildaConfig.currency_symbol

// Попапы
t_popup_show('blockId')
t_popup_hide('blockId')

// Корзина
tildaShop_addToCart({ uid, title, price, quantity })

// Перехват форм
window.tildaFormsCallback = function(formData) { return true; }

// События
document.addEventListener('tildaready',          handler)
document.addEventListener('tildaformsent',        handler)
document.addEventListener('popupshown',           handler)
document.addEventListener('popuphidden',          handler)
document.addEventListener('productaddedtocart',   handler)
document.addEventListener('productremovedfromcart', handler)
document.addEventListener('allanimationend',      handler)
document.addEventListener('scrollto',             handler)
```
