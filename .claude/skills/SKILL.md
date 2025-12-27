---
name: 블로그 스크래핑 추가
description: 4단계 워크플로우로 새 블로그 소스를 추가합니다: types 정의 → scraper 구현 → Discord formatter 추가 → registry 등록. RSS/HTML 파싱 모두 지원합니다.
---

## 사용법

```
Vue 블로그 추가해줘
```

또는

```
Svelte 블로그 스크래핑 추가
- RSS URL: https://svelte.dev/blog/rss.xml
- 색상: #FF3E00
```

## 필요한 정보

사용자에게 다음 정보를 요청하세요:

1. **블로그 이름** (예: Vue, Vite, Svelte)

   - 소문자로 변환하여 enum 값으로 사용
   - 대문자는 클래스명에 사용

2. **RSS 피드 또는 블로그 URL** (예: https://blog.vuejs.org/feed.rss)

## 실행 단계

### 1. src/scrapers/types.ts 수정

BlogSource enum에 새 블로그 추가:

```typescript
export enum BlogSource {
  NEXTJS = "nextjs",
  REACT = "react",
  TKDODO = "tkdodo",
  [대문자블로그명] = "[소문자블로그명]", // 예: VUE = "vue"
}
```

### 2. src/scrapers/blog/[소문자블로그명].ts 생성

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

**rss 지원을 하지 않을 경우**

- 반드시 [unsupported-rss.md](unsupported-rss.md) 를 참고해서 작업.

### 3. src/discord/embed-formatter.ts 수정

**3-1) EmbedFormatterFactory.createFormatter() switch 문에 case 추가:**

```typescript
case BlogSource.[대문자블로그명]:
  return new [블로그명]EmbedFormatter();
```

**3-2) 파일 끝에 새 Formatter 클래스 추가:**

```typescript
class [블로그명]EmbedFormatter extends EmbedFormatter {
  formatEmbed(post: BlogPost): DiscordEmbed {
    return {
      title: `[${post.source.toUpperCase()}] ${post.title}`,
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      timestamp: this.formatDate(post.date),
      color: [색상],
      footer: {
        text: post.source.toUpperCase(),
      },
    };
  }
}
```

### 4. src/scrapers/registry.ts 수정

**4-1) import 추가:**

```typescript
import { [블로그명]BlogScraper } from "./blog/[소문자블로그명]";
```

**4-2) ALL_SCRAPERS 배열에 추가:**

```typescript
export const ALL_SCRAPERS: BlogScraper[] = [
  new NextJsBlogScraper(),
  new ReactBlogScraper(),
  new TkdodoBlogScraper(),
  new [블로그명]BlogScraper(),  // 추가
];
```

## 완료 후

1. `npm run build` 실행하여 TypeScript 컴파일 확인
2. 사용자에게 추가 완료 메시지와 함께 수정된 파일 목록 제공

## 예시

**입력:** "Vue 블로그 추가해줘, RSS는 https://blog.vuejs.org/feed.rss, 색상은 0x42b883"

**결과:**

- `types.ts`: `VUE = "vue"` 추가
- `blog/vue.ts`: VueBlogScraper 클래스 생성
- `embed-formatter.ts`: VueEmbedFormatter 추가
- `registry.ts`: new VueBlogScraper() 추가
