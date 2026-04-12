import { GoogleGenerativeAI } from "@google/generative-ai";

const activeQuery = "udaipur";
const run = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
        
        const prompt = `Analyze this travel query: "${activeQuery}".
If the query is a broad theme, region, or general idea (e.g. "beaches in Asia" or "adventure trips"), generate exactly 8 highly diverse, phenomenal travel destinations matching it.
HOWEVER, if the query is a specific, singular city, town, or exact location (e.g. "Delhi", "Paris, France", "Tokyo"), generate EXACTLY 1 card for that specific destination and STOP. DO NOT generate multiple variations of the same city.

Filter Strictness: (Budget: All Budgets, Region: All Regions, Type: All Types).
Return a STRICT JSON array of exact objects matching this schema precisely: 
[{"id": 1, "city": "Exact World Town/City", "tag": "Style (e.g. Adventure)", "reviews": 1500, "rating": 4.8, "days": "4-7 Days", "budget": "Mid Range", "region": "Asia"}]`;

        const result = await model.generateContent(prompt);
        console.log(result.response.text());
    } catch(err) {
        console.error("Error:", err);
    }
}
run();
