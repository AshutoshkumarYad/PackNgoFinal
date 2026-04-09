import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from parent directory
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : process.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

const prompt = `Analyze this travel query: "Delhi, India".
If the query is a broad theme, region, or general idea (e.g. "beaches in Asia" or "adventure trips"), generate exactly 8 highly diverse, phenomenal travel destinations matching it.
HOWEVER, if the query is a specific, singular city, town, or exact location (e.g. "Delhi", "Paris, France", "Tokyo"), generate EXACTLY 1 card for that specific destination and STOP. DO NOT generate multiple variations of the same city.

Filter Strictness: (Budget: All Budgets, Region: All Regions, Type: All Types). If filters are set, enforce them rigidly.
Return a STRICT JSON array of exact objects matching this schema precisely: 
[{"id": 1, "city": "Extremely Accurate Real World Town/City, Country", "tag": "Style of Trip (e.g. Adventure)", "reviews": 1500, "rating": 4.8, "days": "4-7 Days", "budget": "Luxury/Mid Range/Budget Friendly", "region": "Europe/Asia/Americas/etc"}]`;

model.generateContent(prompt)
  .then(res => {
     console.log('--- RAW AI RESPONSE ---');
     console.log(res.response.text());
  })
  .catch(err => {
     console.error('--- AI COMPLETELY FAILED ---');
     console.error(err.message);
  });
