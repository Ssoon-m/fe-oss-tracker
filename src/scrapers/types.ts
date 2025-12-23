export interface BlogPost {
  title: string;
  url: string;
  date: string;
  source: 'nextjs' | 'react';
}

export interface BlogScraper {
  scrape(): Promise<BlogPost[]>;
}
