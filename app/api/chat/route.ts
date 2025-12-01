import { generateText } from "ai";
import type { ChatRequest, ChatResponse } from "../../lib/api";
import { extractKeywords } from "./keywords";
import { formatNewsForContext, searchAndCrawlNews } from "./news";
import { openai } from "./openai";
import { SECURITY_INSTRUCTIONS, SYSTEM_PROMPTS } from "./prompts";
import { detectInjection, sanitizeUserInput } from "./security";

const BACKEND_URL = "https://api.ye0ngjae.com";

export const maxDuration = 60;

// 백엔드 API 호출 시도
async function tryBackendAPI(body: ChatRequest): Promise<ChatResponse | null> {
  try {
    const formData = new FormData();
    formData.append("content", body.content);
    formData.append("analysis_type", body.analysis_type);
    if (body.url) {
      for (const u of body.url) {
        formData.append("url", u);
      }
    }

    const response = await fetch(`${BACKEND_URL}/chat/submit`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    }
    console.warn("Backend API failed:", response.status);
    return null;
  } catch (error) {
    console.warn("Backend API error:", error);
    return null;
  }
}

// Fallback: 로컬 AI 분석
async function localAIAnalysis(body: ChatRequest): Promise<ChatResponse> {
  const content = body.content;

  // 보안 검사
  if (detectInjection(content)) {
    return {
      result: "false",
      trust_score: 0,
      result_string: "보안 정책에 의해 요청이 거부되었습니다.",
      verified_sources: [],
    };
  }

  const sanitizedContent = sanitizeUserInput(content);

  // 뉴스 검색
  let newsContext = "";
  let sources: string[] = [];

  if (body.analysis_type === "fake_detection") {
    const keywords = await extractKeywords(sanitizedContent);
    if (keywords.length > 0) {
      const results = await Promise.all(
        keywords.map((keyword) => searchAndCrawlNews(keyword)),
      );
      const articles = results.flat().slice(0, 3);
      newsContext = formatNewsForContext(articles);
      sources = articles.map((a) => a.url);
    }
  }

  const mode =
    body.analysis_type === "fake_detection" ? "fake-news" : "crowd-psychology";
  const basePrompt = SYSTEM_PROMPTS[mode];

  const systemPrompt = `${SECURITY_INSTRUCTIONS}

${basePrompt}

${newsContext ? `참고 뉴스:\n${newsContext}` : ""}

다음 JSON 형식으로만 응답하세요:
{
  "result": "true" | "false" | "controversial",
  "trust_score": number (0-100),
  "result_string": "분석 결과 요약",
  "verified_sources": ["출처 URL 목록"]
}

result 판단 기준:
- "true": 뉴스 기사로 확인된 사실
- "false": 뉴스 기사와 상반되는 허위 정보
- "controversial": 확인할 수 없거나 논란이 있는 주제`;

  const { text } = await generateText({
    model: openai.chat("gpt-5-mini"),
    system: systemPrompt,
    prompt: sanitizedContent,
  });

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|```/g, "").trim());
    const result =
      parsed.result === "true" || parsed.result === true
        ? "true"
        : parsed.result === "false" || parsed.result === false
          ? "false"
          : "controversial";
    return {
      result,
      trust_score: parsed.trust_score ?? 50,
      result_string: parsed.result_string ?? text,
      verified_sources: parsed.verified_sources ?? sources,
    };
  } catch {
    return {
      result: "controversial",
      trust_score: 50,
      result_string: text,
      verified_sources: sources,
    };
  }
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();

    // 백엔드 API 먼저 시도
    const backendResult = await tryBackendAPI(body);
    if (backendResult) {
      return Response.json(backendResult);
    }

    // Fallback: 로컬 AI 분석
    console.log("Using local AI fallback");
    const localResult = await localAIAnalysis(body);
    return Response.json(localResult);
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      { error: "An error occurred processing your request" },
      { status: 500 },
    );
  }
}
