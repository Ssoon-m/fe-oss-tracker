import fetch from 'node-fetch';
import type { BlogPost } from '../scrapers/types.js';

interface DiscordEmbed {
  title: string;
  url: string;
  description: string;
  color: number;
  timestamp: string;
  footer: {
    text: string;
  };
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

/**
 * Discord Webhook을 통해 블로그 글 알림을 전송
 */
export class DiscordWebhook {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendPost(post: BlogPost): Promise<void> {
    try {
      const embed = this.createEmbed(post);
      const payload: DiscordWebhookPayload = {
        embeds: [embed]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Discord API 에러: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Discord 전송 완료: ${post.title}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Discord 전송 실패: ${post.title}`, error);
      throw error;
    }
  }

  async sendPosts(posts: BlogPost[]): Promise<void> {
    for (const post of posts) {
      await this.sendPost(post);
    }
  }

  private createEmbed(post: BlogPost): DiscordEmbed {
    const isNextJs = post.source === 'nextjs';

    return {
      title: `${isNextJs ? '🚀' : '⚛️'} 새로운 ${isNextJs ? 'Next.js' : 'React'} 블로그 글!`,
      url: post.url,
      description: `**${post.title}**\n\n[자세히 보기 →](${post.url})`,
      color: isNextJs ? 0x000000 : 0x61DAFB,
      timestamp: this.formatDate(post.date),
      footer: {
        text: `${isNextJs ? 'Next.js' : 'React'} Blog`
      }
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
