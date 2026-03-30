const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require("readline");

// Вставь сюда свой API ключ
const genAI = new GoogleGenerativeAI("AIzaSyBOki6xIBqdMULNsHW8KlSzDcTa9QYnFSg");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function start() {
    console.log("\x1b[36m--- Gemini 2.5 Flash Terminal ---\x1b[0m\n");
    const ask = () => {
        rl.question("\x1b[32mВы: \x1b[0m", async (input) => {
            if (input.toLowerCase() === 'exit') process.exit();
            try {
                const result = await model.generateContent(input);
                console.log("\x1b[35m\nGemini:\x1b[0m", result.response.text(), "\n");
            } catch (e) {
                console.log("\x1b[31mОшибка:\x1b[0m", e.message);
            }
            ask();
        });
    };
    ask();
}

start();