# CardBird — Full Telegram WebApp CardPack Game

Этот репозиторий содержит полностью рабочую структуру для Telegram WebApp игры «CardPack».
Положи свои карточки в `webapp/assets/cards/` (например `Legendary.png`, `Epic.png`, `Rare.png`, `Common.png`).

## Быстрый старт (локально)

1. Установи зависимости:
```bash
npm install
```

2. Установи переменные окружения:
- `BOT_TOKEN` — токен Telegram-бота.
- `WEBAPP_URL` — публичный HTTPS URL после деплоя (необязательно локально).

Windows PowerShell:
```powershell
$env:BOT_TOKEN="YOUR_TOKEN"
$env:WEBAPP_URL="https://your.deploy.url"
npm start
```

Linux / macOS:
```bash
export BOT_TOKEN="YOUR_TOKEN"
export WEBAPP_URL="https://your.deploy.url"
npm start
```

> ВНИМАНИЕ: если `BOT_TOKEN` не установлен, бот не будет запускаться — но WebApp и API будут доступны локально.

## Деплой (Render)
1. Создай репозиторий на GitHub и запушь код.
2. В Render -> New -> Web Service выбери репозиторий.
3. Build command: `npm install`
4. Start command: `npm start`
5. Добавь в Environment Variables: `BOT_TOKEN` и (по желанию) `WEBAPP_URL`.
6. Deploy.

После деплоя вставь публичный HTTPS URL в `WEBAPP_URL` (или пропиши его в Render env); бот при старте будет использовать его в WebApp кнопке.

## Структура
- backend/ — сервер и логика
- webapp/ — frontend WebApp (HTML/CSS/JS)
- webapp/assets/cards/ — помещай сюда изображения карт

Если хочешь, могу помочь запушить репозиторий в GitHub и задеплоить на Render.
