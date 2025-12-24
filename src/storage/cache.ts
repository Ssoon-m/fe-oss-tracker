import { promises as fs } from 'fs';
import * as path from 'path';

interface CacheData {
  seenUrls: string[];
  lastUpdated: string;
}

/**
 * 로컬 파일시스템을 사용하여 이미 알림 보낸 글의 URL을 저장/조회
 * GitHub Actions Cache와 함께 사용하여 중복 알림 방지
 */
export class FileCache {
  private cacheDir: string;
  private cacheFile: string;

  constructor(cacheDir: string = '.cache') {
    this.cacheDir = cacheDir;
    this.cacheFile = path.join(cacheDir, 'blog-cache.json');
  }

  async getSeenUrls(): Promise<Set<string>> {
    try {
      console.log('캐시 파일에서 데이터 가져오는 중...');
      const content = await fs.readFile(this.cacheFile, 'utf-8');
      const data: CacheData = JSON.parse(content);
      console.log(`캐시에서 ${data.seenUrls.length}개의 URL 로드 완료`);
      return new Set(data.seenUrls);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('캐시 파일이 없습니다. 빈 캐시로 시작합니다.');
      } else {
        console.error('캐시 읽기 실패:', error);
      }
      return new Set();
    }
  }

  async updateCache(seenUrls: Set<string>): Promise<void> {
    try {
      console.log('캐시 파일 업데이트 중...');

      // 디렉토리가 없으면 생성
      await fs.mkdir(this.cacheDir, { recursive: true });

      const data: CacheData = {
        seenUrls: Array.from(seenUrls),
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(this.cacheFile, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ 캐시 업데이트 완료: ${data.seenUrls.length}개 URL`);
    } catch (error) {
      console.error('캐시 업데이트 실패:', error);
      throw error;
    }
  }
}
