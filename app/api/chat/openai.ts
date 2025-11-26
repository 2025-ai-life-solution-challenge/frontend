import { createOpenAI } from "@ai-sdk/openai";

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

export const openai = createOpenAI({
  baseURL: "https://api.6r33n.kr/v1",
  apiKey: process.env.OPENAI_API_KEY,
  fetch: customFetch,
});
