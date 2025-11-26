export interface NewsArticle {
  title: string;
  url: string;
  content: string;
  source: string;
}

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const buildNaverNewsSearchUrl = (keyword: string): string => {
  const today = getTodayDate();
  const encodedKeyword = encodeURIComponent(keyword);
  return `https://search.naver.com/search.naver?ssc=tab.news.all&query=${encodedKeyword}&sm=tab_opt&sort=1&photo=0&field=0&pd=-1&ds=${today}&de=${today}&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Add%2Cp%3Aall&is_sug_officeid=0&office_category=0&service_area=0`;
};

const extractNewsLinks = (html: string): string[] => {
  const links: string[] = [];

  const naverNewsPattern =
    /href="(https?:\/\/n\.news\.naver\.com\/[^"]+|https?:\/\/news\.naver\.com\/[^"]+)"/g;

  let match = naverNewsPattern.exec(html);
  while (match !== null) {
    const url = match[1];
    if (!links.includes(url) && links.length < 5) {
      links.push(url);
    }
    match = naverNewsPattern.exec(html);
  }

  if (links.length === 0) {
    const generalPattern = /href="(https?:\/\/[^"]*(?:news|article)[^"]*)"/gi;
    let generalMatch = generalPattern.exec(html);
    while (generalMatch !== null) {
      const url = generalMatch[1];
      if (
        !links.includes(url) &&
        links.length < 5 &&
        !url.includes("search.naver")
      ) {
        links.push(url);
      }
      generalMatch = generalPattern.exec(html);
    }
  }

  return links.slice(0, 3);
};

const extractTitle = (html: string): string => {
  const patterns = [
    /<h2[^>]*class="[^"]*media_end_head_headline[^"]*"[^>]*>([^<]+)<\/h2>/i,
    /<title>([^<]+)<\/title>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, " ");
    }
  }

  return "제목 없음";
};

const extractSource = (html: string): string => {
  const patterns = [
    /<a[^>]*class="[^"]*media_end_head_top_logo[^"]*"[^>]*title="([^"]+)"/i,
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,
    /<em[^>]*class="[^"]*media_end_linked_more_point[^"]*"[^>]*>([^<]+)<\/em>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return "알 수 없음";
};

const extractContent = (html: string): string => {
  const articlePatterns = [
    /<article[^>]*id="dic_area"[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*id="articleBodyContents"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*newsct_article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  let content = "";

  for (const pattern of articlePatterns) {
    const match = html.match(pattern);
    if (match) {
      content = match[1];
      break;
    }
  }

  if (!content) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
  }

  content = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (content.length > 2000) {
    content = `${content.slice(0, 2000)}...`;
  }

  return content;
};

const fetchArticle = async (url: string): Promise<NewsArticle | null> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch article: ${url}`);
      return null;
    }

    const html = await response.text();

    return {
      title: extractTitle(html),
      url,
      content: extractContent(html),
      source: extractSource(html),
    };
  } catch (error) {
    console.error(`Error fetching article ${url}:`, error);
    return null;
  }
};

export const searchAndCrawlNews = async (
  keyword: string,
): Promise<NewsArticle[]> => {
  try {
    const searchUrl = buildNaverNewsSearchUrl(keyword);
    console.log(`Searching news for: ${keyword}`);

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!searchResponse.ok) {
      console.error(`Search failed: ${searchResponse.status}`);
      return [];
    }

    const searchHtml = await searchResponse.text();
    const newsLinks = extractNewsLinks(searchHtml);
    console.log(`Found ${newsLinks.length} news links`);

    if (newsLinks.length === 0) {
      return [];
    }

    const articles = await Promise.all(newsLinks.map(fetchArticle));

    return articles.filter(
      (article): article is NewsArticle =>
        article !== null && article.content.length > 50,
    );
  } catch (error) {
    console.error("Error in searchAndCrawlNews:", error);
    return [];
  }
};

export const formatNewsForContext = (articles: NewsArticle[]): string => {
  if (articles.length === 0) {
    return "관련 뉴스를 찾지 못했습니다.";
  }

  return articles
    .map(
      (article, index) =>
        `[기사 ${index + 1}]
제목: ${article.title}
출처: ${article.source}
URL: ${article.url}
내용: ${article.content}`,
    )
    .join("\n\n---\n\n");
};
