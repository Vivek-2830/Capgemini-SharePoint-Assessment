import { sp } from '@pnp/sp/rest';
import { IKnowledgeArticle } from './IKnowledgeArticle';

const KNOWLEDGE_INFO_LIST = 'Articles';

export class KnowledgeArticleServices {
    public async getArticleInfo() : Promise<IKnowledgeArticle> {
        const items = await sp.web.lists.getByTitle('KNOWLEDGE_INFO_LIST').items.select(
            'ID','ArticleName','ArticleDescription','ArticleType','Image','PublishDate'
        ).get()
        return items.map((r: any) => ({
            ID: r.ID,
            ArticleTitle: r.ArticleTitle,
            ArticleDescription: r.ArticleDescription,
            ArticleType: r.ArticleType,
            Image: r.Image,
            PublishDate: r.PublishDate
        }));
    }
}