# Деплой на Render.com

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Войдите в свой аккаунт (или создайте новый)
3. Нажмите "+" → "New repository"
4. Назовите репозиторий, например: `credit-broker`
5. Сделайте репозиторий **Public** или **Private** (на ваш выбор)
6. Нажмите "Create repository"

## Шаг 2: Отправьте код на GitHub

Откройте терминал в папке проекта и выполните команды:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_НИК/repo-name.git
git push -u origin main
```

## Шаг 3: Подключите Render к GitHub

1. Зайдите на https://render.com
2. Зарегистрируйтесь через GitHub
3. Нажмите "New +" → "Web Service"
4. Выберите ваш репозиторий из списка
5. Заполните настройки:
   - **Name**: любое имя (будет частью URL)
   - **Region**: выберите ближайший к вам
   - **Branch**: main
   - **Root Directory**: оставьте пустым
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. Нажмите "Create Web Service"

## Шаг 4: Готово!

Через 2-5 минут сайт будет доступен по адресу:
`https://ваш-проект.onrender.com`

---

## Важно!

### База данных на Render
На бесплатном тарифе файловая система **временная**. Данные `db.json` будут сбрасываться при каждом обновлении приложения.

**Решения:**
1. Использовать внешнюю базу данных (PostgreSQL, MongoDB)
2. Или хранить данные в памяти (для демонстрации)

### Настройка email-рассылки
Для работы email-уведомлений нужно настроить SMTP в админ-панели или использовать переменные окружения.
