import Parser from "rss-parser";
import type { BlogPost, BlogScraper } from "./types.js";
import { BlogSource } from "./types.js";

const TKDODO_RSS_URL = "https://tkdodo.eu/blog/rss.xml";

export class TkdodoBlogScraper implements BlogScraper {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async scrape(): Promise<BlogPost[]> {
    try {
      console.log("TKDODO RSS 피드 가져오는 중...");
      const feed = await this.parser.parseURL(TKDODO_RSS_URL);

      const posts: BlogPost[] = feed.items.map((item) => ({
        title: item.title || "Untitled",
        url: item.link || "",
        date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: BlogSource.TKDODO,
      }));

      console.log(`TKDODO 블로그 글 ${posts.length}개 발견`);
      return posts.slice(0, 5);
    } catch (error) {
      console.error("TKDODO RSS 피드 가져오기 실패:", error);
      return [];
    }
  }
}
