import { NextJsBlogScraper } from "./blog/nextjs";
import { ReactBlogScraper } from "./blog/react";
import { TkdodoBlogScraper } from "./blog/tkdodo";
import type { BlogScraper, BlogPost } from "./types.js";

/**
 * 모든 블로그 스크래퍼 목록
 * 새로운 블로그를 추가할 때는 여기에만 추가하면 됩니다!
 */
export const ALL_SCRAPERS: BlogScraper[] = [
  new NextJsBlogScraper(),
  new ReactBlogScraper(),
  new TkdodoBlogScraper(),
];

/**
 * 모든 스크래퍼를 실행하여 포스트와 URL 목록을 반환
 * @returns 모든 블로그 포스트와 URL 목록
 */
export async function scrapeAllBlogs(): Promise<{
  posts: BlogPost[];
  urls: string[];
}> {
  const allPostsArrays = await Promise.all(
    ALL_SCRAPERS.map((scraper) => scraper.scrape())
  );
  const posts = allPostsArrays.flat();
  const urls = posts.map((post) => post.url);

  return { posts, urls };
}
