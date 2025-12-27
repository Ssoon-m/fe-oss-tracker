# Add Blog Scraper (RSS 미지원 - Playwright)

RSS를 지원하지 않는 블로그를 Playwright로 스크래핑하여 프로젝트에 추가합니다.
HTML 구조를 분석하고 최적의 셀렉터를 선택합니다.

---

## 필수: playwright 설치

```bash
npm install playwright
pnpm add playwright

# 브라우저 설치 (처음 한 번만)
npx playwright install chromium
```

---

## 셀렉터 탐지 로직

다음 순서로 자동으로 셀렉터를 결정합니다:

### 1단계: 일반적인 HTML 패턴 우선순위

**포스트 목록 (ARTICLE_SELECTOR):**

1. `article`
2. `.post`
3. `.blog-post`
4. `.entry`
5. `.story`
6. `[class*="post"]`
7. `[class*="article"]`
8. `[class*="story"]`

**제목 (TITLE_SELECTOR):**

1. `h2`
2. `h3`
3. `.title`
4. `.post-title`
5. `[class*="title"]`
6. `h1` (포스트 내부)

**링크 (LINK_SELECTOR):**

1. `a`
2. `h2 a`
3. `h3 a`
4. `.title a`

**날짜 (DATE_SELECTOR):**

1. `time`
2. `.date`
3. `.post-date`
4. `[datetime]`
5. `[class*="date"]`
6. `[class*="time"]`

### 2단계: 자동 검증

각 셀렉터 조합을 테스트하여:

- 포스트 5개 이상 추출 성공 → 사용
- 제목과 URL이 모두 존재 → 유효
- 실패 → 다음 패턴 시도

### 3단계: 폴백 처리

모든 패턴 실패 시:

- 사용자에게 복잡한 구조 안내
- `npx playwright codegen [URL]` 사용 제안

---

## src/scrapers/blog/[소문자블로그명].ts 생성

```typescript
import { chromium } from "playwright";
import type { BlogPost, BlogScraper } from "../types";
import { BlogSource } from "../types";

const [대문자블로그명]_BLOG_URL = "[BLOG_URL]";

export class [블로그명]BlogScraper implements BlogScraper {
  async scrape(): Promise<BlogPost[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      console.log("[블로그명] 블로그 스크래핑 중...");

      await page.goto([대문자블로그명]_BLOG_URL, {
        waitUntil: "networkidle",
        timeout: 60000
      });

      // AI가 자동으로 선택한 셀렉터
      const posts = await page.$$eval("[ARTICLE_SELECTOR]", (articles) => {
        return articles.map((article) => {
          const titleEl = article.querySelector("[TITLE_SELECTOR]");
          const linkEl = article.querySelector("[LINK_SELECTOR]");
          const dateEl = article.querySelector("[DATE_SELECTOR]");

          return {
            title: titleEl?.textContent?.trim() || "",
            url: linkEl?.getAttribute("href") || "",
            date:
              dateEl?.getAttribute("datetime") ||
              dateEl?.textContent?.trim() ||
              "",
          };
        });
      });

      const validPosts: BlogPost[] = posts
        .filter((post) => post.title && post.url)
        .map((post) => ({
          ...post,
          url: post.url.startsWith("http")
            ? post.url
            : `[BASE_URL]${post.url.startsWith("/") ? post.url : "/" + post.url}`,
          date: post.date || new Date().toISOString(),
          source: BlogSource.[대문자블로그명],
        }))
        .slice(0, 5);

      console.log(`[블로그명] 블로그 글 ${validPosts.length}개 발견`);
      return validPosts;
    } catch (error) {
      console.error("[블로그명] 블로그 스크래핑 실패:", error);
      return [];
    } finally {
      await browser.close();
    }
  }
}
```

---

## 실제 예시

### 예시 1: Dev.to

```typescript
const posts = await page.$$eval(".crayons-story", (articles) => {
  return articles.map((article) => {
    const titleEl = article.querySelector("h2.crayons-story__title a");
    const linkEl = article.querySelector("h2.crayons-story__title a");
    const dateEl = article.querySelector("time");

    return {
      title: titleEl?.textContent?.trim() || "",
      url: linkEl?.getAttribute("href") || "",
      date: dateEl?.getAttribute("datetime") || "",
    };
  });
});
```

### 예시 2: Medium

```typescript
const posts = await page.$$eval("article", (articles) => {
  return articles.map((article) => {
    const titleEl = article.querySelector("h2");
    const linkEl = article.querySelector("a");
    const dateEl = article.querySelector("time");

    return {
      title: titleEl?.textContent?.trim() || "",
      url: linkEl?.getAttribute("href") || "",
      date: dateEl?.getAttribute("datetime") || "",
    };
  });
});
```

### 예시 3: 일반적인 블로그

```typescript
const posts = await page.$$eval(".blog-post", (articles) => {
  return articles.map((article) => {
    const titleEl = article.querySelector(".post-title a");
    const linkEl = article.querySelector(".post-title a");
    const dateEl = article.querySelector(".post-date");

    return {
      title: titleEl?.textContent?.trim() || "",
      url: linkEl?.getAttribute("href") || "",
      date: dateEl?.textContent?.trim() || "",
    };
  });
});
```

---

## src/discord/embed-formatter.ts 수정

**switch 문에 case 추가:**

```typescript
case BlogSource.[대문자블로그명]:
  return new [블로그명]EmbedFormatter();
```

**Formatter 클래스 추가:**

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

---

## AI 자동 실행 프로세스

### 1. 페이지 접근 및 분석

```typescript
// 내부 로직 (자동 실행)
const patterns = {
  article: ['article', '.post', '.blog-post', '.entry', '.story'],
  title: ['h2', 'h3', '.title', '.post-title'],
  link: ['a', 'h2 a', 'h3 a'],
  date: ['time', '.date', '.post-date', '[datetime]']
};

// 모든 조합 테스트
for (const articleSel of patterns.article) {
  for (const titleSel of patterns.title) {
    const result = await testSelectors(articleSel, titleSel, ...);
    if (result.posts.length >= 5 && result.hasValidData) {
      // 성공! 이 셀렉터 사용
      return { articleSel, titleSel, ... };
    }
  }
}
```

### 2. 자동 생성 및 테스트

1. **파일 생성**: 4개 파일 자동 수정
2. **컴파일**: `npm run build` 실행
3. **검증**: 타입 에러 확인
4. **보고**: 성공 여부 사용자에게 알림

### 3. 실패 시 폴백

```
⚠️ 자동 셀렉터 탐지 실패

복잡한 HTML 구조로 자동 감지 실패했습니다.
다음 명령어로 셀렉터 확인 필요:

npx playwright codegen [BLOG_URL]

셀렉터 정보를 제공하시면 수동 설정 가능합니다.
```

---

## 변수 치환 규칙

- `[블로그명]`: PascalCase (예: DevTo, Medium)
- `[대문자블로그명]`: UPPER_CASE (예: DEVTO, MEDIUM)
- `[소문자블로그명]`: lowercase (예: devto, medium)
- `[BLOG_URL]`: 블로그 URL (예: https://dev.to)
- `[BASE_URL]`: 블로그 기본 URL (예: https://dev.to)
- `[색상]`: hex 코드 (예: 0x0A0A0A)

### 자동 결정 변수

- `[ARTICLE_SELECTOR]`: 탐지한 포스트 셀렉터
- `[TITLE_SELECTOR]`: 탐지한 제목 셀렉터
- `[LINK_SELECTOR]`: 탐지한 링크 셀렉터
- `[DATE_SELECTOR]`: 탐지한 날짜 셀렉터
