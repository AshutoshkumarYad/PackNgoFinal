import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found in " + envPath);
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const activeQuery = "udaipur";
const prompt = `Analyze this travel query: "${activeQuery}".
If the query is a broad theme, region, or general idea (e.g. "beaches in Asia" or "adventure trips"), generate exactly 8 highly diverse, phenomenal travel destinations matching it.
HOWEVER, if the query is a specific, singular city, town, or exact location (e.g. "Delhi", "Paris, France", "Tokyo"), generate EXACTLY 1 card for that specific destination and STOP. DO NOT generate multiple variations of the same city.

Filter Strictness: (Budget: All Budgets, Region: All Regions, Type: All Types).
Return a STRICT JSON array of exact objects matching this schema precisely: 
[{"id": 1, "city": "Exact World Town/City", "tag": "Style (e.g. Adventure)", "reviews": 1500, "rating": 4.8, "days": "4-7 Days", "budget": "Mid Range", "region": "Asia"}]`;

model.generateContent(prompt)
.then(result => {
    console.log("Raw text:");
    try {
        const text = result.response.text();
        console.log(text);
        const parsed = JSON.parse(text);
        console.log("Parsed correctly as array of length", parsed.length);
    } catch(e) {
        console.error("Failed to parse JSON", e);
    }
})
.catch(err => {
    console.error("Failed generation", err);
});
