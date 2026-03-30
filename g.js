
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Твой API ключ
const genAI = new GoogleGenerativeAI("AIzaSyBcajte2BzIlpuKtzRZP9ZKFQwDSdxqEwU");

async function run() {
    const prompt = process.argv.slice(2).join(" ");
    if (!prompt) return console.log("Напиши вопрос после команды!");

    try {
        // Используем модель из твоего списка
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        console.log("\n--- Gemini 2.0 ---\n" + result.response.text());
    } catch (e) {
        console.log("\n--- Ошибка ---");
        console.log(e.message);
    }
}
run();

