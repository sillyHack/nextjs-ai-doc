import OpenAI from "openai";

export const openai_custom = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
    // baseURL: "https://api.perplexity.ai"
});