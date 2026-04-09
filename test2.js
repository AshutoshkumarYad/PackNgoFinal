import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyBRKM4Mq-mKWnDUpfvUiJskcVhN7UVeiQA");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
model.generateContent('Return exactly [{"city":"udaipur"}]').then(res => console.log(res.response.text())).catch(console.error);
