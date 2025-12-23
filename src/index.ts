import { NextJsBlogScraper } from "./scrapers/nextjs.js";
import { ReactBlogScraper } from "./scrapers/react.js";
import { DiscordWebhook } from "./discord/webhook.js";
import { EmbedFormatterFactory } from "./discord/embed-formatter.js";
import { GistCache } from "./storage/cache.js";

async function main() {
  console.log("🤖 블로그 Discord 알림봇 시작");
  console.log("================================\n");

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const gistToken = process.env.GIST_TOKEN;
  const gistId = process.env.GIST_ID;

  if (!discordWebhookUrl) {
    console.error("❌ DISCORD_WEBHOOK_URL 환경 변수가 필요합니다");
    process.exit(1);
  }

  if (!gistToken) {
    console.error("❌ GIST_TOKEN 환경 변수가 필요합니다");
    process.exit(1);
  }

  if (!gistId) {
    console.error("❌ GIST_ID 환경 변수가 필요합니다");
    process.exit(1);
  }

  try {
    const nextjsScraper = new NextJsBlogScraper();
    const reactScraper = new ReactBlogScraper();
    const formatterFactory = new EmbedFormatterFactory();
    const discord = new DiscordWebhook(discordWebhookUrl, formatterFactory);
    const cache = new GistCache(gistToken, gistId);

    const seenUrls = await cache.getSeenUrls();

    console.log("\n📡 블로그 확인 중...\n");
    const [nextjsPosts, reactPosts] = await Promise.all([
      nextjsScraper.scrape(),
      reactScraper.scrape(),
    ]);

    const allPosts = [...nextjsPosts, ...reactPosts];
    console.log(`\n📊 총 ${allPosts.length}개의 글 발견`);

    const newPosts = allPosts.filter((post) => !seenUrls.has(post.url));

    if (newPosts.length === 0) {
      console.log("✨ 새로운 글이 없습니다");
      return;
    }

    console.log(`\n🆕 새로운 글 ${newPosts.length}개 발견:\n`);
    newPosts.forEach((post) => {
      console.log(`  - [${post.source.toUpperCase()}] ${post.title}`);
      console.log(`    ${post.url}\n`);
    });

    console.log("📤 Discord로 전송 중...\n");
    await discord.sendPosts(newPosts);

    newPosts.forEach((post) => seenUrls.add(post.url));
    await cache.updateCache(seenUrls);

    console.log("\n✅ 완료!");
  } catch (error) {
    console.error("\n❌ 에러 발생:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("치명적 에러:", error);
  process.exit(1);
});
