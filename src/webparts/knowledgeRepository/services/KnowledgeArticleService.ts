import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IKnowledgeInfo } from '../model/IKnowledgeModels';
import BannerImage from '../assets/Banner.png'

const KNOWLEDGE_INFO_LIST = 'Articles';

export class KnowledgeArticleServices {
  private sp: SPFI;
  private context: WebPartContext;

  public constructor(context: WebPartContext) {
    this.context = context;
    this.sp = spfi().using(SPFx(context));
  }

  public async getArticleInfo(): Promise<IKnowledgeInfo[]> {
    const items = await this.sp.web.lists
      .getByTitle(KNOWLEDGE_INFO_LIST)
      .items.select('ID', 'ArticleName', 'ArticleDescription', 'ArticleType', 'Image', 'PublishDate', 'ArticleContent', 'ViewCount').expand("AttachmentFiles")();


    return items.map((item: any): IKnowledgeInfo => {
      // let imageUrl = '';

      // if (typeof item.Image === 'string') {
      //   try {
      //     const parsed = JSON.parse(item.Image);
      //     imageUrl = parsed.serverRelativeUrl || parsed.url || '';
      //   } catch {
      //     imageUrl = item.Image;
      //   }
      // } else if (item.Image && typeof item.Image === 'object') {
      //   imageUrl = item.Image.serverRelativeUrl || item.Image.url || '';
      // }

      return {
        ID: item.ID,
        ArticleName: item.ArticleName || item.Title || '',
        ArticleType: typeof item.ArticleType === 'string'
          ? item.ArticleType
          : (item.ArticleType && item.ArticleType.Value) || '',
        ArticleDescription: item.ArticleDescription || '',
        Image: item.AttachmentFiles.length > 0
          ? item.AttachmentFiles[0].ServerRelativeUrl
          : BannerImage,
        PublishDate: item.PublishDate || '',
        ArticleContent: item.ArticleContent || '',
        ViewCount: Number(item.ViewCount) || 0
      };
    });
  }

  public async getArticleTypes(): Promise<string[]> {
    try {
      const field: any = await this.sp.web.lists
        .getByTitle(KNOWLEDGE_INFO_LIST)
        .fields
        .getByInternalNameOrTitle('ArticleType')
        .select('ID', 'InternalName', 'TypeAsString', 'Choices')();

      console.log('Article Type Field:', field);
      console.log('Article Type Choices:', field.Choices);

      return field.Choices || [];

    } catch (error) {
      console.error('Error fetching Article Type choices:', error);
      return [];
    }
  }

  public async incrementArticleViewCount(articleId: number): Promise<number> {
    const articleItem = this.sp.web.lists
      .getByTitle(KNOWLEDGE_INFO_LIST)
      .items.getById(articleId);

    const item: any = await articleItem.select('ViewCount')();

    const newCount = (Number(item.ViewCount) || 0) + 1;

    await articleItem.update({
      ViewCount: newCount
    });

    return newCount;
  }

  public async logArticleAccess(article: IKnowledgeInfo): Promise<void> {

  const userId = Number(
    this.context.pageContext.legacyPageContext.userId
  );

  await this.sp.web.lists
    .getByTitle('Article Access Logs')
    .items.add({
      Title: article.ArticleName,
      ArticleTitle: article.ArticleName,
      ArticleID: article.ID,
      ViewedById: userId,
      ViewedAt: new Date().toISOString(),
      Category: article.ArticleType || ''
    });

}

}
