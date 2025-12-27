import fetch from "node-fetch";
import { DiscordEmbed } from "./embed-formatter";

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

/**
 * Discord Webhook을 통해 메시지를 전송
 */
export class DiscordWebhook {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendPost(embed: DiscordEmbed): Promise<void> {
    try {
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

      console.log(`✅ Discord 전송 완료: ${embed.title}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Discord 전송 실패: ${embed.title}`, error);
      throw error;
    }
  }
}
