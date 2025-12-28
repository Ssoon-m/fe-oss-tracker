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

### 2. 새 Scraper 클래스 파일 생성:

**⚠️ 가장 먼저 블로그가 RSS를 지원하는지 반드시 확인하세요**

1. RSS URL 확인: /rss, /feed, /rss.xml, /feed.xml 등 확인
2. **해당하는 가이드 선택**

   > 주의: 해당하는 가이드 파일 하나만 읽으세요 (두 파일 모두 읽지 마세요)

- RSS 있는 경우 → [supported-rss.md](./supported-rss.md) **읽고 가이드 따르기**
- RSS 없는 경우 → [unsupported-rss.md](./unsupported-rss.md) **읽고 가이드 따르기**

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

1. `pnpm run build` 실행하여 TypeScript 컴파일 확인
2. 사용자에게 추가 완료 메시지와 함께 수정된 파일 목록 제공

## 예시

**입력:** "Vue 블로그 추가해줘, RSS는 https://blog.vuejs.org/feed.rss, 색상은 0x42b883"

**결과:**

- `types.ts`: `VUE = "vue"` 추가
- `blog/vue.ts`: VueBlogScraper 클래스 생성
- `embed-formatter.ts`: VueEmbedFormatter 추가
- `registry.ts`: new VueBlogScraper() 추가
