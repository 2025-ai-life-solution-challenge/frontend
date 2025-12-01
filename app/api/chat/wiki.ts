export interface WikiResult {
  title: string;
  summary: string;
  url: string;
  source: "wikipedia" | "namuwiki";
}

// 위키피디아 검색 (한국어)
export async function searchWikipedia(keyword: string): Promise<WikiResult[]> {
  try {
    // 위키피디아 API로 검색
    const searchUrl = `https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&format=json&origin=*&srlimit=3`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const pages = searchData.query?.search || [];

    if (pages.length === 0) return [];

    // 각 페이지의 요약 가져오기
    const results: WikiResult[] = [];

    for (const page of pages.slice(0, 2)) {
      const summaryUrl = `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`;

      try {
        const summaryRes = await fetch(summaryUrl);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          results.push({
            title: summaryData.title,
            summary: summaryData.extract || "",
            url:
              summaryData.content_urls?.desktop?.page ||
              `https://ko.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
            source: "wikipedia",
          });
        }
      } catch {
        // 개별 페이지 실패 시 스킵
      }
    }

    return results;
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return [];
  }
}

// 나무위키 검색 (웹 크롤링)
export async function searchNamuwiki(keyword: string): Promise<WikiResult[]> {
  try {
    // 나무위키 문서 직접 접근
    const url = `https://namu.wiki/w/${encodeURIComponent(keyword)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();

    // 문서 존재 확인 (리다이렉트나 404 체크)
    if (html.includes("문서가 존재하지 않습니다") || html.includes("404")) {
      return [];
    }

    // 본문에서 첫 몇 문단 추출 (간단한 방식)
    const contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (!contentMatch) return [];

    // HTML 태그 제거하고 텍스트만 추출
    let text = contentMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 첫 500자만 사용
    text = text.slice(0, 500);

    if (text.length < 50) return [];

    return [
      {
        title: keyword,
        summary: text,
        url,
        source: "namuwiki",
      },
    ];
  } catch (error) {
    console.error("Namuwiki search error:", error);
    return [];
  }
}

// 통합 위키 검색
export async function searchWiki(keywords: string[]): Promise<WikiResult[]> {
  const results: WikiResult[] = [];
  const seenTitles = new Set<string>();

  for (const keyword of keywords.slice(0, 2)) {
    // 위키피디아와 나무위키 병렬 검색
    const [wikiResults, namuResults] = await Promise.all([
      searchWikipedia(keyword),
      searchNamuwiki(keyword),
    ]);

    for (const result of [...wikiResults, ...namuResults]) {
      const normalizedTitle = result.title.toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        results.push(result);
      }
    }
  }

  return results.slice(0, 3);
}

// 위키 결과를 컨텍스트 문자열로 포맷
export function formatWikiForContext(results: WikiResult[]): string {
  if (results.length === 0) return "";

  return results
    .map(
      (r, i) =>
        `[위키 ${i + 1}] ${r.title} (${r.source === "wikipedia" ? "위키피디아" : "나무위키"})\n${r.summary}\n출처: ${r.url}`,
    )
    .join("\n\n");
}
