import { type NextRequest, NextResponse } from "next/server";
import { extractKeywords } from "../chat/keywords";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text 필드가 필요합니다." },
        { status: 400 },
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "텍스트는 5000자를 초과할 수 없습니다." },
        { status: 400 },
      );
    }

    const keywords = await extractKeywords(text);

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("Keyword extraction error:", error);
    return NextResponse.json(
      { error: "키워드 추출 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
