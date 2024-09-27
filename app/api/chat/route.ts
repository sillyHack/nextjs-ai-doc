import { getNeon } from "@/lib/neon";
import { openai } from "@ai-sdk/openai";
import {
	streamText,
	convertToCoreMessages,
	embed,
	StreamData,
} from "ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
// import { openai_custom } from "@/lib/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_MESSAGE = `
	Context:
	You are a super clever NextJS Docs GPT. A chatbot that knows up to date information about NextJS.
	You explain things in a very enjoyful and detailed way.
	Your task is to create simple, easy to understand explanations about NextJS concepts.
	You are good in pedagogy and you know how to explain complex things in a simple way.
	You are a senior NextJS developer and you know the framework inside out.

	Goal:
	Create a response to the user's question about NextJS.

	Criteria:
	To answer the question, you will be given a context of the documentation of the NextJS framework.
	You need to use this context to generate a response to the user's question.
	If the user asks for questions that are not related to NextJS, you should respond with "I'm sorry, I can only answer questions about NextJS".

	Response format:
	* short
	* to the point
	* with examples
	* with metaphores
	* using markdown
	* space separated
`;

export async function POST(req: Request) {
	const { messages } = await req.json();

	const lastMessage = messages[messages.length - 1];
	const userPrompt = lastMessage.content;

	const embeddingModel = openai.embedding("text-embedding-ada-002");
	const { embedding } = await embed({
		model: embeddingModel,
		value: userPrompt,
	});

	const promptEmbedding = embedding;
	const promptEmbeddingFormatted = promptEmbedding
		.toString()
		.replace(/\.\.\./g, "");

	const insertQuery = `
		SELECT text, file_path
		FROM (
		  SELECT text, n_tokens, embeddings, file_path,
		  (embeddings <=> '[${promptEmbeddingFormatted}]') AS distances,
		  SUM(n_tokens) OVER (ORDER BY (embeddings <=> '[${promptEmbeddingFormatted}]')) as cum_n_tokens
		  FROM documents
		) subquery
		WHERE cum_n_tokens <= $1
		ORDER BY distances ASC;
	  `;

	const sql = getNeon();

	const queryParams = [1700];

	const sqlResult = (await sql(insertQuery, queryParams)) as {
		text: string;
		file_path: string;
	}[];

	console.log("SQL RES", sqlResult);

	const formattedResult = sqlResult.map((r) => {
		return {
			url: r.file_path.replaceAll("_", "/").replace(".txt", ""),
			content: r.text,
		};
	});

	const context = formattedResult
		.map((r) => {
			return `${r.url}: ${r.content}`;
		})
		.join("\n\n");

	const otherMessages = messages.slice(0, messages.length - 1).map((m) => {
		const mess: ChatCompletionMessageParam = {
			role: m.role as "assistant" | "user",
			content: String(m.content),
		};

		return mess;
	});

	const finalMessages = [
		{
			role: "system",
			content: SYSTEM_MESSAGE,
		},
		...otherMessages,
		{
			role: "system",
			content: `Context: ${context}  `,
		},
		{
			role: "user",
			content: userPrompt,
		},
	];

	// Create a new StreamData
	const data = new StreamData();

	// Append additional data
	data.append({ sources: `${formattedResult.map((r) => `* [${r.url}](${r.url})\n`).join("")}`}); 

	const result = await streamText({
		model: openai("gpt-4-turbo"),
		onFinish() {
			data.close();
		},
		messages: convertToCoreMessages(finalMessages),
	});

	return result.toDataStreamResponse({data});
}
