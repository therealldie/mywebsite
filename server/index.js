const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// База данных в JSON файле
// На Render файловая система временная, используем process.cwd() для совместимости
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db.json');

// Инициализация БД если нет
if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        config: {
            adminEmail: 'your-email@example.com',
            adminUser: 'admin',
            adminPass: 'admin123',
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                user: '',
                pass: ''
            }
        },
        numbers: {
            max: [{ value: '79001112233', limit: 5, used: 0 }],
            telegram: [{ value: '79001112233', limit: 5, used: 0 }],
            whatsapp: [{ value: '79001112233', limit: 5, used: 0 }]
        },
        leads: []
    };
    // Создаём директорию если нет
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

function getDB() {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    // Гарантируем наличие логина/пароля в памяти, если файл был создан старой версией
    if (!data.config.adminUser) data.config.adminUser = 'admin';
    if (!data.config.adminPass) data.config.adminPass = 'admin123';
    return data;
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Логика ротации
function getNextNumber(type) {
    const db = getDB();
    const numbers = db.numbers[type] || [];
    
    // Ищем первый номер, у которого used < limit
    let activeNumber = numbers.find(n => n.used < n.limit);
    
    // Если все лимиты исчерпаны, берем последний (или можно сбросить все)
    if (!activeNumber && numbers.length > 0) {
        activeNumber = numbers[numbers.length - 1];
    }
    
    if (activeNumber) {
        activeNumber.used += 1;
        saveDB(db);
        return activeNumber.value;
    }
    return '';
}

// Формирование ссылок
function formatLink(type, value) {
    if (!value) return '#';
    switch(type) {
        case 'max': return `https://max.ru/chat/${value}`; // Пример ссылки для Max
        case 'telegram': return `https://t.me/+${value}`;
        case 'whatsapp': return `https://wa.me/${value}`;
        default: return '#';
    }
}

// API для заявок
app.post('/api/leads', async (req, res) => {
    const { name, phone, amount } = req.body;
    const db = getDB();

    const lead = {
        id: Date.now(),
        name,
        phone,
        amount,
        date: new Date().toISOString()
    };

    db.leads.push(lead);
    saveDB(db);

    // Ротация номеров
    const maxNum = getNextNumber('max');
    const tgNum = getNextNumber('telegram');
    const waNum = getNextNumber('whatsapp');

    const links = {
        max: formatLink('max', maxNum),
        telegram: formatLink('telegram', tgNum),
        whatsapp: formatLink('whatsapp', waNum)
    };

    // Отправка на почту (если настроено)
    if (db.config.adminEmail && db.config.smtp.user) {
        try {
            const transporter = nodemailer.createTransport({
                host: db.config.smtp.host,
                port: db.config.smtp.port,
                auth: {
                    user: db.config.smtp.user,
                    pass: db.config.smtp.pass
                }
            });

            await transporter.sendMail({
                from: `"Landing Leads" <${db.config.smtp.user}>`,
                to: db.config.adminEmail,
                subject: "Новая заявка на кредит!",
                text: `Имя: ${name}\nТелефон: ${phone}\nСумма: ${amount} руб.`,
                html: `<p><b>Имя:</b> ${name}</p><p><b>Телефон:</b> ${phone}</p><p><b>Сумма:</b> ${amount} руб.</p>`
            });
        } catch (error) {
            console.error('Email error:', error);
        }
    }

    res.json({ success: true, links });
});

// Middleware для проверки авторизации
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const [user, pass] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const db = getDB();

    if (user === db.config.adminUser && pass === db.config.adminPass) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// API для Админки
app.get('/api/admin/config', (req, res, next) => {
    console.log('Admin config requested. Auth header:', req.headers.authorization);
    next();
}, authMiddleware, (req, res) => {
    const db = getDB();
    res.json({ numbers: db.numbers, config: db.config });
});

app.post('/api/admin/config', authMiddleware, (req, res) => {
    const { numbers, config } = req.body;
    const db = getDB();
    if (numbers) db.numbers = numbers;
    if (config) {
        // Не перезаписываем логин/пароль через общую настройку, если они не переданы явно
        db.config = { ...db.config, ...config };
    }
    saveDB(db);
    res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
    const { user, pass } = req.body;
    const db = getDB();
    console.log(`Login attempt: user=${user}, pass=${pass}. Correct is: ${db.config.adminUser}/${db.config.adminPass}`);
    if (user === db.config.adminUser && pass === db.config.adminPass) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});