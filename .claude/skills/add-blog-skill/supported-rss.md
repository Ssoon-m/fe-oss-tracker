# Add Blog Scraper (RSS 지원)

## src/scrapers/blog/[소문자블로그명].ts 생성

새 Scraper 클래스 파일 생성:

```typescript
import Parser from "rss-parser";
import type { BlogPost, BlogScraper } from "../types";
import { BlogSource } from "../types";

const [대문자블로그명]_RSS_URL = "[RSS_URL]";

export class [블로그명]BlogScraper implements BlogScraper {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async scrape(): Promise<BlogPost[]> {
    try {
      console.log("[블로그명] RSS 피드 가져오는 중...");
      const feed = await this.parser.parseURL([대문자블로그명]_RSS_URL);

      const posts: BlogPost[] = feed.items.map((item) => ({
        title: item.title || "Untitled",
        url: item.link || "",
        date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: BlogSource.[대문자블로그명],
      }));

      console.log(`[블로그명] 블로그 글 ${posts.length}개 발견`);
      return posts.slice(0, 5);
    } catch (error) {
      console.error("[블로그명] RSS 피드 가져오기 실패:", error);
      return [];
    }
  }
}
```
