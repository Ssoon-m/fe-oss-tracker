import { BlogPost, BlogSource } from "../scrapers/types";

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

export class EmbedFormatterFactory {
  static createFormatter(source: BlogSource): EmbedFormatter {
    switch (source) {
      case BlogSource.NEXTJS:
        return new NextJsEmbedFormatter();
      case BlogSource.REACT:
        return new ReactEmbedFormatter();
      case BlogSource.TKDODO:
        return new TkdodoEmbedFormatter();
      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }
}

export abstract class EmbedFormatter {
  protected formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  abstract formatEmbed(post: BlogPost): DiscordEmbed;
}

class NextJsEmbedFormatter extends EmbedFormatter {
  formatEmbed(post: BlogPost): DiscordEmbed {
    return {
      title: `[${post.source.toUpperCase()}] ${post.title}`,
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      timestamp: this.formatDate(post.date),
      color: 0x000000,
      footer: {
        text: post.source.toUpperCase(),
      },
    };
  }
}

class ReactEmbedFormatter extends EmbedFormatter {
  formatEmbed(post: BlogPost): DiscordEmbed {
    return {
      title: `[${post.source.toUpperCase()}] ${post.title}`,
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      timestamp: this.formatDate(post.date),
      color: 0x61dafb,
      footer: {
        text: post.source.toUpperCase(),
      },
    };
  }
}

class TkdodoEmbedFormatter extends EmbedFormatter {
  formatEmbed(post: BlogPost): DiscordEmbed {
    return {
      title: `[${post.source.toUpperCase()}] ${post.title}`,
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      timestamp: this.formatDate(post.date),
      color: 0x000000,
      footer: {
        text: post.source.toUpperCase(),
      },
    };
  }
}
