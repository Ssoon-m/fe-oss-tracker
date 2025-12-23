import type { BlogPost } from "../scrapers/types.js";
import { BlogSource } from "../scrapers/types.js";

export interface DiscordEmbed {
  title: string;
  url: string;
  description: string;
  color: number;
  timestamp: string;
  footer: {
    text: string;
  };
}

/**
 * BlogPost를 Discord Embed 형식으로 변환하는 인터페이스
 */
export interface EmbedFormatter {
  format(post: BlogPost): DiscordEmbed;
}

/**
 * Next.js 블로그용 Embed Formatter
 */
export class NextJsEmbedFormatter implements EmbedFormatter {
  format(post: BlogPost): DiscordEmbed {
    return {
      title: "🚀 새로운 Next.js 블로그 글!",
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      color: 0x000000,
      timestamp: this.formatDate(post.date),
      footer: {
        text: "Next.js Blog",
      },
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

/**
 * React 블로그용 Embed Formatter
 */
export class ReactEmbedFormatter implements EmbedFormatter {
  format(post: BlogPost): DiscordEmbed {
    return {
      title: "⚛️ 새로운 React 블로그 글!",
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      color: 0x61dafb,
      timestamp: this.formatDate(post.date),
      footer: {
        text: "React Blog",
      },
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

/**
 * BlogPost의 source에 따라 적절한 Formatter를 반환
 */
export class EmbedFormatterFactory {
  private formatters: Map<BlogSource, EmbedFormatter>;

  constructor() {
    this.formatters = new Map<BlogSource, EmbedFormatter>();
    this.formatters.set(BlogSource.NEXTJS, new NextJsEmbedFormatter());
    this.formatters.set(BlogSource.REACT, new ReactEmbedFormatter());
  }

  getFormatter(source: BlogSource): EmbedFormatter {
    const formatter = this.formatters.get(source);
    if (!formatter) {
      throw new Error(`지원하지 않는 블로그 소스입니다: ${source}`);
    }
    return formatter;
  }

  registerFormatter(source: BlogSource, formatter: EmbedFormatter): void {
    this.formatters.set(source, formatter);
  }
}
