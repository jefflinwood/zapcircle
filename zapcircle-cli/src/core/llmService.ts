import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";


const model = new ChatOpenAI({ model: process.env.LLM_MODEL || "gpt-4o-mini" });

export async function invokeLLM(prompt: string) {
    const response = await model.invoke(prompt);
    return response.content.toString();
}