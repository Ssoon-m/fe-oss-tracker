import fetch from 'node-fetch';

interface CacheData {
  seenUrls: string[];
  lastUpdated: string;
}

/**
 * GitHub Gist를 사용하여 이미 알림 보낸 글의 URL을 저장/조회
 * 중복 알림 방지 역할
 */
export class GistCache {
  private gistToken: string;
  private gistId: string;
  private filename = 'blog-cache.json';

  constructor(gistToken: string, gistId: string) {
    this.gistToken = gistToken;
    this.gistId = gistId;
  }

  async getSeenUrls(): Promise<Set<string>> {
    try {
      console.log('Gist에서 캐시 가져오는 중...');
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        headers: {
          'Authorization': `token ${this.gistToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Gist를 찾을 수 없습니다. 빈 캐시로 시작합니다.');
          return new Set();
        }
        throw new Error(`GitHub API 에러: ${response.status} ${response.statusText}`);
      }

      const gist = await response.json() as any;
      const file = gist.files[this.filename];

      if (!file || !file.content) {
        console.log('캐시 파일을 찾을 수 없습니다. 빈 캐시로 시작합니다.');
        return new Set();
      }

      const data: CacheData = JSON.parse(file.content);
      console.log(`캐시에서 ${data.seenUrls.length}개의 URL 로드 완료`);
      return new Set(data.seenUrls);
    } catch (error) {
      console.error('캐시 읽기 실패:', error);
      return new Set();
    }
  }

  async updateCache(seenUrls: Set<string>): Promise<void> {
    try {
      console.log('Gist 캐시 업데이트 중...');
      const data: CacheData = {
        seenUrls: Array.from(seenUrls),
        lastUpdated: new Date().toISOString()
      };

      const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.gistToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            [this.filename]: {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API 에러: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ 캐시 업데이트 완료: ${data.seenUrls.length}개 URL`);
    } catch (error) {
      console.error('캐시 업데이트 실패:', error);
      throw error;
    }
  }
}
