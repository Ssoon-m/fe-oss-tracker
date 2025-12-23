# Blog Discord Notifier

자동으로 Next.js와 React 공식 블로그의 새 글을 감지하여 Discord로 알림을 보내는 시스템입니다.

## 기능

- ✅ Next.js 공식 블로그 모니터링
- ✅ React 공식 블로그 모니터링
- ✅ Discord Webhook을 통한 예쁜 Embed 메시지
- ✅ GitHub Actions로 자동 실행 (6시간마다)
- ✅ GitHub Gist를 활용한 중복 방지
- ✅ 수동 실행 가능

## 설정 방법

### 1. Discord Webhook URL 생성

1. Discord 서버에서 알림을 받고 싶은 채널로 이동
2. 채널 설정 → 연동 → 웹후크
3. "새 웹후크" 클릭
4. 웹후크 URL 복사

### 2. GitHub Personal Access Token 생성

1. GitHub 설정 → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. Note: `Blog Notifier Gist`
4. 권한: `gist` 체크
5. 토큰 생성 후 복사 (다시 볼 수 없으니 주의!)

### 3. GitHub Gist 생성

1. https://gist.github.com 접속
2. 새 Gist 생성:
   - Filename: `blog-cache.json`
   - Content: `{"seenUrls": [], "lastUpdated": ""}`
3. "Create secret gist" 클릭
4. URL에서 Gist ID 복사 (예: `https://gist.github.com/username/abc123` → `abc123`)

### 4. Repository Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

다음 3개의 시크릿을 추가:

- `DISCORD_WEBHOOK_URL`: Discord 웹후크 URL
- `GIST_TOKEN`: GitHub Personal Access Token
- `GIST_ID`: Gist ID

### 5. Repository 생성 및 코드 푸시

```bash
cd blog-discord-notifier
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blog-discord-notifier.git
git push -u origin main
```

### 6. GitHub Actions 활성화

Repository → Actions → "I understand my workflows, go ahead and enable them"

## 로컬 실행

환경 변수를 설정하고 로컬에서 테스트할 수 있습니다:

```bash
# 의존성 설치
npm install

# 환경 변수 설정
export DISCORD_WEBHOOK_URL="your-webhook-url"
export GIST_TOKEN="your-gist-token"
export GIST_ID="your-gist-id"

# 실행
npm run check
```

또는 `.env` 파일을 생성하고:

```env
DISCORD_WEBHOOK_URL=your-webhook-url
GIST_TOKEN=your-gist-token
GIST_ID=your-gist-id
```

```bash
# .env 로드 후 실행 (별도 패키지 필요)
npm install dotenv
node -r dotenv/config dist/index.js
```

## 수동 실행

GitHub Actions에서 수동으로 실행하려면:

1. Repository → Actions
2. "Check Blogs" 워크플로우 선택
3. "Run workflow" 클릭

## 작동 방식

1. **스크래핑**: Next.js와 React 블로그 페이지를 가져와 최신 글 목록 추출
2. **캐시 확인**: GitHub Gist에서 이미 알림 보낸 글 목록 가져오기
3. **필터링**: 새로운 글만 선택
4. **Discord 전송**: 새 글을 Discord Webhook으로 전송
5. **캐시 업데이트**: 전송한 글을 Gist에 저장

## 프로젝트 구조

```
blog-discord-notifier/
├── .github/
│   └── workflows/
│       └── check-blogs.yml       # GitHub Actions 워크플로우
├── src/
│   ├── index.ts                  # 메인 로직
│   ├── scrapers/
│   │   ├── types.ts             # 타입 정의
│   │   ├── nextjs.ts            # Next.js 스크래퍼
│   │   └── react.ts             # React 스크래퍼
│   ├── discord/
│   │   └── webhook.ts           # Discord Webhook
│   └── storage/
│       └── cache.ts             # Gist 캐시
├── package.json
├── tsconfig.json
└── README.md
```

## Discord 메시지 예시

**Next.js 새 글:**
```
🚀 New Next.js Blog Post!

**Next.js 15.1 Released**

[Read more →](https://nextjs.org/blog/next-15-1)

Next.js Blog • Dec 23, 2025
```

**React 새 글:**
```
⚛️ New React Blog Post!

**React 19 Released**

[Read more →](https://react.dev/blog/react-19)

React Blog • Dec 23, 2025
```

## 커스터마이징

### 체크 빈도 변경

`.github/workflows/check-blogs.yml`에서 cron 스케줄 수정:

```yaml
schedule:
  - cron: '0 */6 * * *'  # 6시간마다
  # - cron: '0 * * * *'  # 1시간마다
  # - cron: '0 0 * * *'  # 하루 1번 (자정)
```

### 다른 블로그 추가

1. `src/scrapers/` 디렉토리에 새 스크래퍼 추가
2. `src/scrapers/types.ts`에 블로그 소스 추가
3. `src/index.ts`에서 새 스크래퍼 import 및 실행

## 문제 해결

### Actions에서 실행이 안 돼요

- Repository Settings → Actions → General → Workflow permissions 확인
- "Read and write permissions" 선택되어 있는지 확인

### Discord 메시지가 안 와요

- Discord Webhook URL이 올바른지 확인
- 채널에 봇 권한이 있는지 확인
- Actions 로그에서 에러 확인

### 중복 메시지가 와요

- Gist가 올바르게 업데이트되고 있는지 확인
- Gist Token에 `gist` 권한이 있는지 확인

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
