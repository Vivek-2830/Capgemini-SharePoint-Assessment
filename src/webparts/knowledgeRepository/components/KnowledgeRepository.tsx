import * as React from 'react';
import styles from './KnowledgeRepository.module.scss';
import type { IKnowledgeRepositoryProps } from './IKnowledgeRepositoryProps';
import { escape } from '@microsoft/sp-lodash-subset';
import welcomeDark from '../assets/welcome-dark.png';
import welcomeLight from '../assets/welcome-light.png';
import { IKnowledgeInfo } from '../model/IKnowledgeModels';
import { KnowledgeArticleServices } from '../services/KnowledgeArticleService';

interface IKnowledgeRepositoryState {
  info?: IKnowledgeInfo;
  Articles: IKnowledgeInfo[];
  loading: boolean;
  error: string;
  // controls
  searchText: string;
  typeValue: string;
  sortValue: string;
  // applied when "Filter" is clicked
  filter: { search: string; type: string; sort: string };
}

// An Image column stores JSON text: {"serverRelativeUrl":"/sites/.../image.png", ...}
const getImageUrl = (value: unknown): string => {
  if (!value) return '';
  try {
    return JSON.parse(value as string).serverRelativeUrl || '';
  } catch {
    return '';
  }
};

const formatDate = (value: string): string => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};


export default class KnowledgeRepository extends React.Component<IKnowledgeRepositoryProps, IKnowledgeRepositoryState> {

  private article: KnowledgeArticleServices;

  constructor(props: IKnowledgeRepositoryProps, state: IKnowledgeRepositoryState) {
    super(props);

    this.article = new KnowledgeArticleServices();

    this.state = {
      Articles: [],
      loading: true,
      error: '',
      searchText: '',
      typeValue: '',
      sortValue: 'newest',
      filter: { search: '', type: '', sort: 'newest' }
    };
  }

  public componentDidMount(): Promise<void> {
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    const info = await this.article.getArticleInfo();

    await new Promise<void>((resolve) => {
      this.setState({ info }, resolve);
    });
  }

  private getVisibleArticles(): IKnowledgeInfo[] {
    const { search, type, sort } = this.state.filter;
    const q = search.trim().toLowerCase();

    const list = this.state.Articles.filter((a) =>
      (!type || a.ArticleType === type) &&
      (!q || `${a.ArticleName} ${a.ArticleDescription}`.toLowerCase().indexOf(q) !== -1)
    );

    list.sort((a, b) => {
      if (sort === 'az') return a.ArticleName.localeCompare(b.ArticleName);
      if (sort === 'za') return b.ArticleName.localeCompare(a.ArticleName);
      const diff = new Date(a.PublishDate).getTime() - new Date(b.PublishDate).getTime();
      return sort === 'oldest' ? diff : -diff;
    });
    return list;
  }

  private onFilter = (): void => {
    const { searchText, typeValue, sortValue } = this.state;
    this.setState({ filter: { search: searchText, type: typeValue, sort: sortValue } });
  };

  private onReset = (): void => {
    this.setState({
      searchText: '', typeValue: '', sortValue: 'newest',
      filter: { search: '', type: '', sort: 'newest' }
    });
  };

  public render(): React.ReactElement<IKnowledgeRepositoryProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.knowledgeRepository}`}>

        <section className={styles.knowledgeHubBanner}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerText}>
              <p className={styles.welcomeText}>
                Welcome to the
              </p>

              <h1 className={styles.bannerTitle}>
                Knowledge Hub
              </h1>

              <p className={styles.bannerDescription}>
                Explore guides, policies, checklists and resources to
                <br />
                help you work smarter and stay informed.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.filterBar}>
          <div className={styles.field}>
            <label htmlFor="kh-search">Search</label>
            <input
              id="kh-search"
              type="text"
              placeholder="Search article name or description…"
              value={searchText}
              onChange={(e) => this.setState({ searchText: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') this.onFilter(); }}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="kh-type">Article Type</label>
            <select id="kh-type" value={typeValue} onChange={(e) => this.setState({ typeValue: e.target.value })}>
              <option value="">Select Article Type</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="kh-sort">Sorting</label>
            <select id="kh-sort" value={sortValue} onChange={(e) => this.setState({ sortValue: e.target.value })}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Title A–Z</option>
              <option value="za">Title Z–A</option>
            </select>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.primaryButton} onClick={this.onFilter}>Filter</button>
            <button type="button" className={styles.secondaryButton} onClick={this.onReset}>Reset</button>
          </div>
        </div>

        <div className={styles.cardGrid}>
          {visible.map((a) => (
            <article key={a.ID} className={styles.card}>
              <div className={styles.cardImage}>
                {a.Image ? <img src={a.Image} alt="" /> : <span>{a.Title.charAt(0)}</span>}
              </div>
              <div className={styles.cardBody}>
                {a.ArticleType && <span className={styles.typeTag}>{a.ArticleType}</span>}
                <h2 className={styles.cardTitle}>{a.ArticleName}</h2>
                <p className={styles.bannerDescription}>{a.ArticleDescription}</p>
                <div className={styles.cardMeta}>
                  <span>{formatDate(a.PublishDate)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </section>

    );
  }
}
