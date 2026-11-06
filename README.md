# Ozer Business PWA

Веб-копия приложения для **исполнителей** Ozer: React + Vite, ставится на телефон как PWA. Бэкенд тот же, что у нативного клиента: `https://ozer-5d2a2a16a914.herokuapp.com/`.

Исходный мобильный проект: [stdunko/ozer-business](https://github.com/stdunko/ozer-business). Клиентская PWA: [stdunko/ozer-pwa](https://github.com/stdunko/ozer-pwa).

## Локальный запуск

```bash
npm install
npm run dev
```

Сборка и локальный прод-сервер:

```bash
npm run build
npm start
```

Переменная `API_BASE_URL` (опционально) — адрес API. По умолчанию прокси идёт на существующий Heroku-бэкенд. Браузер ходит на `/api`, сервер проксирует запросы дальше, поэтому CORS с другого origin не нужен.

Вход исполнителя: `POST /auth/login/executor`, регистрация `/auth/register/executor`, OTP `/auth/verify-otp/executor`. Для теста SMS-код: номер телефона + `dev`.

## Деплой

- GitHub: репозиторий `ozer-business-pwa`
- Heroku: Node-приложение, `Procfile` → `web: node server.js`, после `npm install` выполняется `vite build`, затем Express раздаёт `dist/` и проксирует `/api`

```bash
heroku create ozer-business-pwa
heroku buildpacks:set heroku/nodejs
git push heroku main
```

# Что работает

Полный сценарий исполнителя, перенесённый с React Native:

- Онбординг (язык + 3 слайда, один раз)
- Вход по телефону + OTP из SMS, выбор страны по флагу (SVG)
- Профиль: имя, email, телефон, УНП, адрес, шаббат, категории, карта зоны и радиус
- Список заказов: принять, завершить, отказаться, геопозиция, чат с заказчиком
- Чаты Firestore: список, переписка, вложения-картинки, галочки прочтения
- RU / EN / HE / AR, RTL для иврита и арабского
- Установка как PWA (Chrome / Android; Safari «На экран Домой»)
- Сессия в `localStorage`

# Что не работает из-за переезда на веб

Это ограничения платформы, а не «недоделанные экраны»:

| Возможность | Почему |
|---|---|
| Push-уведомления FCM | Нужен Web Push + VAPID-ключ и домен в Firebase Console. Не перенесено. |
| Google Maps (`react-native-maps`) | В PWA стоит OpenStreetMap. Внешний вид и POI другие. |
| Автоподстановка OTP из SMS | В браузере работает только Web OTP на HTTPS. Обычно код вводят руками. |
| Камера / галерея как native picker | В чате — `<input type="file" accept="image/*">`. |
| Офлайн-режим API | PWA кэширует оболочку. Заказы, логин и Firestore без сети не работают. |
| iOS: установка только через Safari | Ограничения iOS. |
| Иконки PWA maskable | Используется тот же `icon.png`, без безопасной зоны под круг Android. |

# Что нужно пофиксить вручную (я не смогу с этой машины)

1. **Firebase Authorized domains**  
   Firebase Console → Authentication → Settings → Authorized domains. Добавить хост Heroku. Без этого Firestore с продакшен-домена может быть заблокирован. `localhost` уже обычно разрешён.

2. **Firestore indexes / rules**  
   Те же, что у нативного приложения. Если чаты падают с ошибкой index — открыть ссылку из консоли браузера и создать индекс.

3. **Google Maps вместо OSM (по желанию)**  
   Нативный ключ, скорее всего, ограничен Android/iOS. Для JS Maps API нужен ключ с HTTP-referrer нового домена.

4. **Web Push**  
   Firebase Console → Cloud Messaging → Web Push certificates → VAPID. На бэкенде слать web-токены отдельно от Android/iOS.

5. **GitHub CLI**  
   Если репозиторий не создался автоматически: [github.com/new](https://github.com/new) → имя `ozer-business-pwa`.

6. **Heroku billing / имя приложения**  
   Имя `ozer-business-pwa` может быть занято. Eco/Hobby dyno должен быть включён. После деплоя: `heroku open`.

7. **PWA-иконки 192/512**  
   Сейчас лежит исходный `icon.png`. Для установки лучше вырезать квадратные PNG 192 и 512.

# Стек

React 19, Vite 6, React Router 7, Redux Toolkit, i18next, Firebase JS SDK, Leaflet, Express (статика + `/api` proxy), `vite-plugin-pwa`.
