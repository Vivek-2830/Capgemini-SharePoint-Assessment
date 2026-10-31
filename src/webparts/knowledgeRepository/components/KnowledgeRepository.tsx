import * as React from 'react';
import styles from './KnowledgeRepository.module.scss';
import type { IKnowledgeRepositoryProps } from './IKnowledgeRepositoryProps';
import { escape } from '@microsoft/sp-lodash-subset';
import welcomeDark from '../assets/welcome-dark.png';
import welcomeLight from '../assets/welcome-light.png';
import { IKnowledgeInfo } from '../model/IKnowledgeModels';
import { KnowledgeArticleServices } from '../services/KnowledgeArticleService';

interface IKnowledgeRepositoryState {
  Articles: IKnowledgeInfo[];
  ArticleTypes: string[];
  selectedArticle: IKnowledgeInfo | null;
  loading: boolean;
  error: string;
  searchText: string;
  typeValue: string;
  sortValue: string;
  filter: {
    search: string;
    type: string;
    sort: string;
  };
}

const formatDate = (value: string): string => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getImageUrl = (value: any): string => {
  if (!value) return '';

  try {
    // SharePoint may return an object or JSON string
    const image = typeof value === 'string'
      ? JSON.parse(value)
      : value;

    // SharePoint Image column
    if (image.serverRelativeUrl) {
      if (image.serverUrl) {
        return image.serverUrl + image.serverRelativeUrl;
      }

      return window.location.origin + image.serverRelativeUrl;
    }

    // Alternative image URL formats
    if (image.Url) return image.Url;
    if (image.url) return image.url;

    return '';
  } catch (error) {
    // If the value is already a direct image URL
    if (typeof value === 'string' &&
        (value.startsWith('https://') || value.startsWith('/'))) {
      return value.startsWith('/')
        ? window.location.origin + value
        : value;
    }

    console.error('Image URL error:', error, value);
    return '';
  }
};


export default class KnowledgeRepository extends React.Component<IKnowledgeRepositoryProps, IKnowledgeRepositoryState> {

  private article: KnowledgeArticleServices;

  constructor(props: IKnowledgeRepositoryProps, state: IKnowledgeRepositoryState) {
    super(props);

    this.article = new KnowledgeArticleServices(props.context);

    this.state = {
      Articles: [],
      ArticleTypes: [],
      selectedArticle: null,
      loading: true,
      error: '',
      searchText: '',
      typeValue: '',
      sortValue: 'newest',
      filter: { search: '', type: '', sort: 'newest' }
    };
  }

  public componentDidMount(): void {
    void this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {
      const [articles, articleTypes] = await Promise.all([
        this.article.getArticleInfo(),
        this.article.getArticleTypes()
      ]);

      console.log('Articles:', articles);
      console.log('Dynamic Article Types:', articleTypes);

      this.setState({
        Articles: articles,
        ArticleTypes: articleTypes,
        loading: false,
        error: ''
      });

    } catch (error) {
      console.error('Error loading repository:', error);

      this.setState({
        Articles: [],
        ArticleTypes: [],
        loading: false,
        error: 'Unable to load repository data.'
      });
    }
  }

  private getVisibleArticles(): IKnowledgeInfo[] {
    const { search, type, sort } = this.state.filter;
    const query = search.trim().toLowerCase();

    const list: IKnowledgeInfo[] = this.state.Articles.filter((article: IKnowledgeInfo) =>
      (!type || article.ArticleType === type) &&
      (!query || `${article.ArticleName} ${article.ArticleDescription}`.toLowerCase().indexOf(query) !== -1)
    );

    list.sort((a: IKnowledgeInfo, b: IKnowledgeInfo) => {
      if (sort === 'az') return a.ArticleName.localeCompare(b.ArticleName);
      if (sort === 'za') return b.ArticleName.localeCompare(a.ArticleName);
      const dateA = new Date(a.PublishDate).getTime() || 0;
      const dateB = new Date(b.PublishDate).getTime() || 0;
      return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }

  private onFilter = (): void => {
    const { searchText, typeValue, sortValue } = this.state;
    this.setState({ filter: { search: searchText, type: typeValue, sort: sortValue } });
  };

  private onReset = (): void => {
    this.setState({
      searchText: '',
      typeValue: '',
      sortValue: 'newest',
      filter: { search: '', type: '', sort: 'newest' }
    });
  };

  private onReadMore = (article: IKnowledgeInfo): void => {
    this.setState({
      selectedArticle: article
    });
  };

  // Close Article Details Dialog
  private closeArticleDialog = (): void => {
    this.setState({
      selectedArticle: null
    });
  };

  private handleDialogKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    if (event.key === 'Escape') {
      this.closeArticleDialog();
    }
  };


  public render(): React.ReactElement<IKnowledgeRepositoryProps> {
    const { searchText, typeValue, sortValue, loading, error, selectedArticle } = this.state;
    const visible: IKnowledgeInfo[] = this.getVisibleArticles();

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

            <select
              id="kh-type"
              value={typeValue}
              onChange={(e) =>
                this.setState({ typeValue: e.target.value })
              }
            >
              <option value="">All article types</option>

              {this.state.ArticleTypes.map((type: string) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="kh-sort">Sorting</label>
            <select
              id="kh-sort"
              value={sortValue}
              onChange={(e) => this.setState({ sortValue: e.target.value })}
            >
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

        {/* Article Cards */}
        {loading ? (
          <div className={styles.loadingMessage}>
            Loading articles...
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>
            {error}
          </div>
        ) : visible.length === 0 ? (
          <div className={styles.noArticles}>
            No articles found.
          </div>
        ) : (

          <div className={styles.cardGrid}>

            {visible.map((a: IKnowledgeInfo) => (
              <article key={a.ID} className={styles.card}>

                <div className={styles.cardImage}>
                  {getImageUrl(a.Image) ? (
                    <img
                      src={getImageUrl(a.Image)}
                      alt={a.ArticleName}
                    />
                  ) : (
                    <span>
                      {a.ArticleName ? a.ArticleName.charAt(0) : 'A'}
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>

                  {a.ArticleType && (
                    <span className={styles.typeTag}>
                      {a.ArticleType}
                    </span>
                  )}

                  <h2 className={styles.cardTitle}>
                    {a.ArticleName}
                  </h2>

                  <p className={styles.cardDescription}>
                    {a.ArticleDescription}
                  </p>

                  <div className={styles.cardMeta}>
                    <span>
                      {formatDate(a.PublishDate)}
                    </span>

                    <button
                      type="button"
                      className={styles.readMoreBtn}
                      onClick={() => this.onReadMore(a)}
                    >
                      Read More
                      <span> →</span>
                    </button>
                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

        {/* Article Details Dialog */}
        {selectedArticle && (

          <div
            className={styles.modalOverlay}
            onClick={this.closeArticleDialog}
          >

            <div
              className={styles.articleDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="article-dialog-title"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={this.handleDialogKeyDown}
              tabIndex={-1}
            >

              {/* Dialog Header */}
              <div className={styles.dialogHeader}>

                <h2>Article Details</h2>

                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={this.closeArticleDialog}
                  aria-label="Close dialog"
                >
                  ×
                </button>

              </div>

              {/* Dialog Body */}
              <div className={styles.dialogContent}>

                {/* Left Side - Article Image */}
                <div className={styles.dialogImage}>

                  {getImageUrl(selectedArticle.Image) ? (
                    <img
                      src={getImageUrl(selectedArticle.Image)}
                      alt={selectedArticle.ArticleName}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      No Image Available
                    </div>
                  )}

                </div>

                {/* Right Side - Article Content */}
                <div className={styles.dialogArticle}>

                  {selectedArticle.ArticleType && (
                    <span className={styles.dialogType}>
                      {selectedArticle.ArticleType}
                    </span>
                  )}

                  <h1 id="article-dialog-title">
                    {selectedArticle.ArticleName}
                  </h1>

                  <div className={styles.dialogType}>
                    Publish Date: {formatDate(selectedArticle.PublishDate)}
                  </div>

                  <p className={styles.dialogDescription}>
                    {selectedArticle.ArticleDescription}
                  </p>

                  <div className={styles.articleContent}>
                    <strong>Article Content :-</strong> <br/><br />
                    {selectedArticle.ArticleContent ? (
                      selectedArticle.ArticleContent
                    ) : (
                      <p>Article content is not available.</p>
                    )}

                  </div>

                </div>

              </div>

              {/* Dialog Footer */}
              <div className={styles.dialogFooter}>

                <button
                  type="button"
                  className={styles.closeDialogBtn}
                  onClick={this.closeArticleDialog}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

      </section>
    );
  }
}
