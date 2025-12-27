import "dotenv/config";
import { scrapeAllBlogs } from "./scrapers/registry.js";
import { DiscordWebhook } from "./discord/webhook.js";
import { FileCache } from "./storage/cache.js";
import { EmbedFormatterFactory } from "./discord/embed-formatter.js";

async function main() {
  console.log("🤖 블로그 Discord 알림봇 시작");
  console.log("================================\n");

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!discordWebhookUrl) {
    console.error("❌ DISCORD_WEBHOOK_URL 환경 변수가 필요합니다");
    process.exit(1);
  }

  try {
    const discord = new DiscordWebhook(discordWebhookUrl);
    const cache = new FileCache();
    const { posts: allPosts, urls: allUrls } = await scrapeAllBlogs();

    const newUrls = await cache.compareAndUpdate(allUrls);

    // 1. 캐시 변경사항 없을 경우 알람 생략
    if (newUrls.length === 0) {
      console.log("👀 새로운 글이 없습니다");
      return;
    }

    // 2. 새로운 URL에 해당하는 포스트만 필터링
    const newUrlSet = new Set(newUrls);
    const newPosts = allPosts.filter((post) => newUrlSet.has(post.url));

    console.log("새로운 글 목록:\n");
    newPosts.forEach((post) => {
      console.log(`  - [${post.source.toUpperCase()}] ${post.title}`);
      console.log(`    ${post.url}\n`);
    });

    // 3. Discord로 전송
    console.log("📤 Discord로 전송 중...\n");
    for (const post of newPosts) {
      await discord.sendPost(
        EmbedFormatterFactory.createFormatter(post.source).formatEmbed(post)
      );
    }

    console.log("\n✅ 완료!");
  } catch (error) {
    console.error("\n❌ 에러 발생:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("main 함수 실행 에러:", error);
  process.exit(1);
});
