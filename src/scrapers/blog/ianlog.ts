import { chromium } from "playwright";
import type { BlogPost, BlogScraper } from "../types";
import { BlogSource } from "../types";

const IANLOG_BLOG_URL = "https://ianlog.me/blog";
const BASE_URL = "https://ianlog.me";

export class IanlogBlogScraper implements BlogScraper {
  async scrape(): Promise<BlogPost[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      console.log("Ianlog 블로그 스크래핑 중...");

      await page.goto(IANLOG_BLOG_URL, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      // JavaScript 렌더링 대기
      await page.waitForTimeout(2000);

      // 블로그 포스트 데이터 추출
      const posts = await page.$$eval("a[href*='/blog/']", (links) => {
        return links.map((link) => {
          // 제목 추출 (h2 요소에서)
          const h2El = link.querySelector("h2");
          const title = h2El?.textContent?.trim() || "";

          // URL 추출
          const url = link.getAttribute("href") || "";

          // 날짜 추출 (부모 요소에서 time 요소 찾기)
          let dateText = "";
          let parent = link.parentElement;
          while (parent && parent.tagName !== "BODY") {
            const timeEl = parent.querySelector("time");
            if (timeEl) {
              dateText =
                timeEl.getAttribute("datetime") ||
                timeEl.textContent?.trim() ||
                "";
              break;
            }
            parent = parent.parentElement;
          }

          return {
            title,
            url,
            date: dateText,
          };
        });
      });

      const validPosts: BlogPost[] = posts
        .filter((post) => post.title && post.url)
        .map((post) => ({
          ...post,
          url: post.url.startsWith("http")
            ? post.url
            : `${BASE_URL}${
                post.url.startsWith("/") ? post.url : "/" + post.url
              }`,
          date: post.date || new Date().toISOString(),
          source: BlogSource.IANLOG,
        }))
        .slice(0, 5);

      console.log(`Ianlog 블로그 글 ${validPosts.length}개 발견`);
      return validPosts;
    } catch (error) {
      console.error("Ianlog 블로그 스크래핑 실패:", error);
      return [];
    } finally {
      await browser.close();
    }
  }
}
