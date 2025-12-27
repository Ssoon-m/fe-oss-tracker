export enum BlogSource {
  NEXTJS = "nextjs",
  REACT = "react",
  TKDODO = "tkdodo",
}

export interface BlogPost {
  title: string;
  url: string;
  date: string;
  source: BlogSource;
}

export interface BlogScraper {
  scrape(): Promise<BlogPost[]>;
}
