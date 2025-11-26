import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openai = createOpenAI({
  baseURL: "https://api.6r33n.kr/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractKeywords = async (text: string): Promise<string[]> => {
  try {
    const { text: response } = await generateText({
      model: openai.chat("gpt-5-mini"),
      prompt: `다음 텍스트에서 뉴스 검색에 사용할 핵심 키워드를 1-3개 추출하세요.
키워드는 명사 위주로, 검색에 효과적인 단어를 선택하세요.
응답은 키워드만 쉼표로 구분해서 출력하세요. 다른 설명은 하지 마세요.

텍스트: "${text}"

키워드:`,
    });

    const keywords = response
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0 && k.length < 20);

    return keywords.slice(0, 3);
  } catch (error) {
    console.error("Error extracting keywords:", error);
    return text
      .split(/\s+/)
      .filter((word) => word.length >= 2)
      .slice(0, 2);
  }
};
