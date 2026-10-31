import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IKnowledgeArticle, IArticleAccessLog } from '../model/IDashboard';

export default class DashboardService {
  private readonly context: WebPartContext;
  private readonly webUrl: string;

  constructor(context: WebPartContext) {
    this.context = context;
    this.webUrl = context.pageContext.web.absoluteUrl;
  }

  private async getJson<T>(url: string): Promise<T> {
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata'
        }
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`SharePoint request failed (${response.status}): ${message}`);
    }

    return response.json() as Promise<T>;
  }

  public async getKnowledgeArticles(): Promise<IKnowledgeArticle[]> {
    const url =
      `${this.webUrl}/_api/web/lists/getbytitle('Articles')/items` +
      `?$select=Id,ArticleName,ArticleType,ArticleDescription,PublishDate,ViewCount` +
      `&$top=5000`;

    const result = await this.getJson<{ value: IKnowledgeArticle[] }>(url);
    return result.value || [];
  }

  public async getArticleAccessLogs(): Promise<IArticleAccessLog[]> {
    const url =
      `${this.webUrl}/_api/web/lists/getbytitle('Article Access Logs')/items` +
      `?$select=Id,Title,ArticleTitle,ArticleID,ViewedAt,Category,ViewedBy/Id,ViewedBy/Title` +
      `&$expand=ViewedBy&$orderby=ViewedAt desc&$top=500`;

    const result = await this.getJson<{ value: IArticleAccessLog[] }>(url);
    return result.value || [];
  }

  /**
   * Call this from the Knowledge Repository when a user opens an article.
   * ViewedBy must be a SharePoint Person column; ViewedById is the user ID.
   */
  public async logArticleAccess(article: {
    Id: number;
    Title: string;
    ArticleType?: string;
  }): Promise<void> {
    const userId = this.context.pageContext.legacyPageContext.userId;
    const payload = {
      Title: article.Title,
      ArticleTitle: article.Title,
      ArticleID: article.Id,
      ViewedById: Number(userId),
      ViewedAt: new Date().toISOString(),
      Category: article.ArticleType || ''
    };

    const url = `${this.webUrl}/_api/web/lists/getbytitle('Article Access Logs')/items`;
    const response = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Could not create article access log (${response.status}): ${message}`);
    }
  }
}
