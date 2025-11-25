import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 30;

const customFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await fetch(input, init);

  if (!response.ok || !response.body) {
    return response;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (buffer.trim()) {
              controller.enqueue(encoder.encode(buffer + "\n"));
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            controller.enqueue(encoder.encode(processLine(line) + "\n"));
          }
        }
      } catch (err) {
        controller.error(err);
      }

      controller.close();
    },
  });

  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  headers.delete("Content-Encoding");

  return new Response(stream, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
};

const processLine = (line: string): string => {
  if (!line.startsWith("data: ")) return line;

  const dataStr = line.slice(6);
  if (dataStr === "[DONE]") return line;

  try {
    const data = JSON.parse(dataStr);

    if (Array.isArray(data.choices)) {
      for (const choice of data.choices) {
        if (
          choice.delta?.annotations &&
          !Array.isArray(choice.delta.annotations)
        ) {
          delete choice.delta.annotations;
        }
      }
    }

    return `data: ${JSON.stringify(data)}`;
  } catch {
    return line;
  }
};

const openai = createOpenAI({
  baseURL: "https://api.6r33n.kr/v1",
  apiKey: process.env.OPENAI_API_KEY,
  fetch: customFetch,
});

const JSON_STRUCTURE = `{
  "verdict": "true" | "false" | "controversial",
  "confidence": number (0-100),
  "summary": "string",
  "sources": [
    { "title": "string", "desc": "string", "url": "string", "type": "news" | "data" }
  ]
}`;

const SYSTEM_PROMPTS = {
  "fake-news":
    "You are a fake news detector. Analyze the input and return a STRICT JSON object.",
  "crowd-psychology":
    "You are a crowd psychology analyst. Analyze the input and return a STRICT JSON object.",
} as const;

type Mode = keyof typeof SYSTEM_PROMPTS;

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    const normalizedMessages = Array.isArray(messages)
      ? messages.map((message) => {
          if (message.parts) return message;
          if (message.content) {
            return {
              ...message,
              parts: [{ type: "text", text: message.content }],
            };
          }
          return message;
        })
      : [];

    const systemPrompt =
      SYSTEM_PROMPTS[mode as Mode] || SYSTEM_PROMPTS["fake-news"];

    const result = await streamText({
      model: openai.chat("gpt-5-mini"),
      messages: convertToModelMessages(normalizedMessages),
      system: `${systemPrompt}

IMPORTANT: You must respond ONLY with a valid JSON object matching this structure:
${JSON_STRUCTURE}

- Do not wrap the JSON in markdown code blocks.
- Do not include any text before or after the JSON.
- Respond in Korean language for the summary and content.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);

    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
