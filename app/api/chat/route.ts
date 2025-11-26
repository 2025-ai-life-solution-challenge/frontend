import { convertToModelMessages, streamText } from "ai";
import { extractKeywords } from "./keywords";
import {
  formatNewsForContext,
  type NewsArticle,
  searchAndCrawlNews,
} from "./news";
import { openai } from "./openai";
import {
  JSON_STRUCTURE,
  type Mode,
  SECURITY_INSTRUCTIONS,
  SYSTEM_PROMPTS,
} from "./prompts";
import {
  detectInjection,
  REJECTION_RESPONSE,
  sanitizeUserInput,
} from "./security";

export const maxDuration = 60;

const getLastUserMessage = (messages: unknown[]): string => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i] as {
      role?: string;
      parts?: { type: string; text: string }[];
      content?: string;
    };
    if (msg.role === "user") {
      if (msg.parts) {
        const textPart = msg.parts.find((p) => p.type === "text");
        if (textPart) return textPart.text;
      }
      if (msg.content) return msg.content;
    }
  }
  return "";
};

const convertToSources = (articles: NewsArticle[]) =>
  articles.map((article) => ({
    title: article.title,
    desc: article.source,
    url: article.url,
    type: "news" as const,
  }));

const fetchNewsContext = async (query: string) => {
  const keywords = await extractKeywords(query);
  console.log("Keywords:", keywords);

  if (keywords.length === 0) return { context: "", sources: [] };

  const results = await Promise.all(
    keywords.map((keyword) => searchAndCrawlNews(keyword)),
  );

  const seenUrls = new Set<string>();
  const articles = results
    .flat()
    .filter((article) => {
      if (seenUrls.has(article.url)) return false;
      seenUrls.add(article.url);
      return true;
    })
    .slice(0, 3);

  console.log(`Selected ${articles.length} articles`);

  return {
    context: articles.length > 0 ? formatNewsForContext(articles) : "",
    sources: convertToSources(articles),
  };
};

const buildSystemPrompt = (
  mode: Mode,
  newsContext: string,
  sources: ReturnType<typeof convertToSources>,
) => {
  const basePrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS["fake-news"];

  const contextSection = newsContext
    ? `\n\nHere are the latest news articles for reference:\n\n${newsContext}\n\nUse the actual URLs from these articles.`
    : "";

  const sourcesSection =
    sources.length > 0
      ? `\n\nUse these news sources:\n${JSON.stringify(sources, null, 2)}`
      : "";

  return `${SECURITY_INSTRUCTIONS}

${basePrompt}${contextSection}

IMPORTANT: Respond ONLY with valid JSON matching this structure:
${JSON_STRUCTURE}
${sourcesSection}

- No markdown code blocks.
- Korean language for summary/content.
- Base verdict on provided articles when available.`;
};

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    const normalizedMessages = Array.isArray(messages)
      ? messages.map((msg) =>
          msg.parts
            ? msg
            : msg.content
              ? { ...msg, parts: [{ type: "text", text: msg.content }] }
              : msg,
        )
      : [];

    const userQuery = getLastUserMessage(normalizedMessages);

    if (detectInjection(userQuery)) {
      console.warn("Injection blocked:", userQuery.slice(0, 50));
      return Response.json(REJECTION_RESPONSE);
    }

    const sanitizedQuery = sanitizeUserInput(userQuery);

    const { context, sources } =
      mode === "fake-news" && sanitizedQuery
        ? await fetchNewsContext(sanitizedQuery)
        : { context: "", sources: [] };

    const result = await streamText({
      model: openai.chat("gpt-5-mini"),
      messages: convertToModelMessages(normalizedMessages),
      system: buildSystemPrompt(mode as Mode, context, sources),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      { error: "An error occurred processing your request" },
      { status: 500 },
    );
  }
}
