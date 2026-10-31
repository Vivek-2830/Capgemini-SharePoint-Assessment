export interface IKnowledgeArticle {
  Id: number;
  ArticleName: string;
  ArticleType?: string;
  ArticleDescription?: string;
  PublishDate?: string;
  ViewCount?: number;
}

export interface IArticleAccessLog {
  Id: number;
  Title?: string;
  ArticleTitle?: string;
  ArticleID?: number;
  ViewedAt?: string;
  Category?: string;
  ViewedBy?: {
    Id?: number;
    Title?: string;
  };
}

export interface IDashboardData {
  articles: IKnowledgeArticle[];
  accessLogs: IArticleAccessLog[];
}
