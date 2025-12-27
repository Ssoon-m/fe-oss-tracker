import fetch from "node-fetch";
import type { BlogPost } from "../scrapers/types.js";
import type { DiscordEmbed, EmbedFormatterFactory } from "./embed-formatter.js";

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

/**
 * Discord Webhook을 통해 메시지를 전송
 */
export class DiscordWebhook {
  private webhookUrl: string;
  private formatterFactory: EmbedFormatterFactory;

  constructor(webhookUrl: string, formatterFactory: EmbedFormatterFactory) {
    this.webhookUrl = webhookUrl;
    this.formatterFactory = formatterFactory;
  }

  async sendPost(post: BlogPost): Promise<void> {
    try {
      const formatter = this.formatterFactory.getFormatter(post.source);
      const embed = formatter.format(post);
      const payload: DiscordWebhookPayload = {
        embeds: [embed],
      };

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Discord API 에러: ${response.status} ${response.statusText}`
        );
      }

      console.log(`✅ Discord 전송 완료: ${post.title}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
}
