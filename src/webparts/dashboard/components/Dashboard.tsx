import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import DashboardService from '../services/DashboardService';
import { IKnowledgeArticle, IArticleAccessLog } from '../model/IDashboard';

interface IDashboardState {
  articles: IKnowledgeArticle[];
  logs: IArticleAccessLog[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  lastUpdated: Date | null;
}

interface ICategoryCount {
  name: string;
  count: number;
}

interface IArticleCount {
  id: number | string;
  name: string;
  count: number;
}

export default class Dashboard extends React.Component<IDashboardProps, IDashboardState> {

  private service: DashboardService;
  private refreshTimer: number | undefined;

  private readonly chartColor: string = '#0070AD';

  constructor(props: IDashboardProps) {
    super(props);
    this.service = new DashboardService(props.context);
    this.state = {
      articles: [],
      logs: [],
      loading: true,
      refreshing: false,
      error: '',
      lastUpdated: null
    };
  }

  public componentDidMount(): void {
    void this.loadDashboard();
    // Near-real-time refresh. This is polling, not push notification.
    this.refreshTimer = window.setInterval(() => {
      void this.loadDashboard(true);
    }, 30000);
  }

  public componentWillUnmount(): void {
    if (this.refreshTimer !== undefined) {
      window.clearInterval(this.refreshTimer);
    }
  }

  private loadDashboard = async (backgroundRefresh: boolean = false): Promise<void> => {
    this.setState({ loading: !backgroundRefresh, refreshing: backgroundRefresh });
    try {
      const [articles, logs] = await Promise.all([
        this.service.getKnowledgeArticles(),
        this.service.getArticleAccessLogs()
      ]);
      this.setState({
        articles,
        logs,
        loading: false,
        refreshing: false,
        error: '',
        lastUpdated: new Date()
      });
    } catch (error) {
      this.setState({
        loading: false,
        refreshing: false,
        error: error instanceof Error ? error.message : 'Unable to load dashboard data.'
      });
    }
  };

  private formatDateTime = (value?: string): string => {
    if (!value) return 'Date not available';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Date not available';
    return date.toLocaleString();
  };

  private getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
  };

  private getCategoryCounts = (
    articles: IKnowledgeArticle[],
    logs: IArticleAccessLog[]
  ): ICategoryCount[] => {

    const categories: string[] = Array.from(
      new Set(
        articles
          .map(article => article.ArticleType)
          .filter((category): category is string => !!category)
      )
    );

    // Include categories found in access logs as well.
    logs.forEach(log => {
      if (log.Category && categories.indexOf(log.Category) === -1) {
        categories.push(log.Category);
      }
    });

    return categories.map(category => ({
      name: category,
      count: logs.filter(
        log => log.Category === category
      ).length
    })).sort((a, b) => b.count - a.count);
  };

  private getMostViewedArticles = (
    articles: IKnowledgeArticle[],
    logs: IArticleAccessLog[]
  ): IArticleCount[] => {

    const articleCounts: IArticleCount[] = [];

    logs.forEach(log => {
      const articleId = Number(log.ArticleID);

      const matchedArticle = articles.find(
        article => article.Id === articleId
      );

      const articleTitle =
        log.ArticleTitle ||
        log.Title ||
        (matchedArticle ? matchedArticle.ArticleName : '') ||
        (articleId ? `Article #${articleId}` : 'Untitled Article');

      const key: number | string = articleId || articleTitle;

      const existing = articleCounts.find(
        item => item.id === key
      );

      if (existing) {
        existing.count += 1;
      } else {
        articleCounts.push({
          id: key,
          name: articleTitle,
          count: 1
        });
      }
    });

    return articleCounts
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  private renderCategoryChart = (
    categoryCounts: ICategoryCount[]
  ): React.ReactElement => {

    const maxValue = Math.max(
      1,
      ...categoryCounts.map(item => item.count)
    );

    const maxScale = Math.max(
      5,
      Math.ceil(maxValue / 5) * 5
    );

    const ticks = [
      maxScale,
      Math.round(maxScale * 0.75),
      Math.round(maxScale * 0.5),
      Math.round(maxScale * 0.25),
      0
    ];

    return (
      <div className={styles.barChartContainer}>

        {/* Y Axis */}
        <div className={styles.yAxis}>
          {ticks.map((tick, index) => (
            <span key={index}>{tick}</span>
          ))}
        </div>

        {/* Vertical Chart */}
        <div className={styles.barChart}>

          <div className={styles.chartGrid}>
            {ticks.map((tick, index) => (
              <div
                key={index}
                className={styles.gridLine}
                style={{
                  bottom: `${(tick / maxScale) * 100}%`
                }}
              />
            ))}
          </div>

          <div className={styles.barsWrapper}>

            {categoryCounts.map((item, index) => {

              const barHeight =
                (item.count / maxScale) * 100;

              const color = this.chartColor;

              return (
                <div
                  className={styles.barColumn}
                  key={item.name}
                >

                  <span className={styles.barValue}>
                    {item.count}
                  </span>

                  <div className={styles.barArea}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: color
                      }}
                      title={`${item.name}: ${item.count} views`}
                    />
                  </div>

                  <span
                    className={styles.barLabel}
                    title={item.name}
                  >
                    {item.name}
                  </span>

                </div>
              );
            })}

          </div>
        </div>
      </div>
    );
  };

  public render(): React.ReactElement<IDashboardProps> {
    const { articles, logs, loading, refreshing, error, lastUpdated } = this.state;

    const totalArticles = articles.length;
    const totalViews = logs.length;
    const activeSince = Date.now() - 24 * 60 * 60 * 1000;
    const activeUsers = new Set(
      logs
        .filter(log => log.ViewedAt && new Date(log.ViewedAt).getTime() >= activeSince)
        .map(log => log.ViewedBy && log.ViewedBy.Id ? String(log.ViewedBy.Id) : log.ViewedBy?.Title || '')
        .filter(Boolean)
    ).size;
    const categories = Array.from(new Set(articles.map(a => a.ArticleType).filter((x): x is string => !!x)));
    const categoryCounts = categories.map(category => ({
      name: category,
      count: logs.filter(log => log.Category === category).length
    })).sort((a, b) => b.count - a.count);
    const maxCategoryCount = Math.max(1, ...categoryCounts.map(item => item.count));

    const articleCounts = articles.map(article => ({
      name: article.ArticleName,
      count: logs.filter(log => log.ArticleID === article.Id).length
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return (
      <section className={styles.dashboard}>
        <div className={styles.header}>
          <div>
            <h2>Knowledge Dashboard</h2>
            <p>Knowledge repository usage and article engagement</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.live}><span className={styles.liveDot}></span> Live activity</span>
            <button className={styles.refreshButton} onClick={() => void this.loadDashboard(true)}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}<br />Check list names, column internal names, and current user's list permissions.</div>}

        {loading ? (
          <div className={styles.loading}>Loading dashboard data...</div>
        ) : (
          <>
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <span className={styles.kpiLabel}>Total Articles</span>
                <strong>{totalArticles}</strong>
                <small>Articles in Knowledge list</small>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiLabel}>Total Views</span>
                <strong>{totalViews}</strong>
                <small>Recorded access events</small>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiLabel}>Active Users</span>
                <strong>{activeUsers}</strong>
                <small>Unique users in last 24 hours</small>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiLabel}>Article Categories</span>
                <strong>{categories.length}</strong>
                <small>Categories in Knowledge list</small>
              </div>
            </div>

            {/* Article Views by Category */}
            <div className={styles.chartpanel}>
              <h3>Article Views by Category</h3>

              {categoryCounts.length === 0 ? (
                <p className={styles.empty}>
                  No categories found.
                </p>
              ) : (
                this.renderCategoryChart(categoryCounts)
              )}

              {/* <p className={styles.note}>
                Counts are calculated from Article Access Logs.
              </p> */}
            </div>


            {/* Most Viewed Articles + Recent Activity */}
            <div className={styles.activityGrid}>

              {/* LEFT SIDE - Most Viewed Articles */}
              <div className={styles.activepanel}>
                <h3>Most Viewed Articles</h3>

                {articleCounts.length === 0 || totalViews === 0 ? (
                  <p className={styles.empty}>
                    No article views recorded yet.
                  </p>
                ) : (
                  articleCounts.map(item => (
                    <div
                      className={styles.topArticle}
                      key={item.name}
                    >
                      <span title={item.name}>
                        {item.name}
                      </span>

                      <b>{item.count} views</b>
                    </div>
                  ))
                )}
              </div>

              {/* RIGHT SIDE - Recent Article Access Activity */}
              <div className={styles.panel}>

                <div className={styles.activityHeader}>
                  <div>
                    <h3>Recent Article Access Activity</h3>
                    <p>Latest users accessing knowledge articles</p>
                  </div>

                  <span className={styles.updated}>
                    Updated: {
                      lastUpdated
                        ? lastUpdated.toLocaleTimeString()
                        : '-'
                    }
                  </span>
                </div>

                {logs.length === 0 ? (
                  <p className={styles.empty}>
                    No access records found. Open an article from
                    the Knowledge Repository to create the first record.
                  </p>
                ) : (
                  <div className={styles.activityList}>
                    {logs.slice(0, 10).map(log => {
                      const person =
                        log.ViewedBy?.Title || 'Unknown user';

                      return (
                        <div
                          className={styles.activityItem}
                          key={log.Id}
                        >
                          <div className={styles.avatar}>
                            {this.getInitials(person)}
                          </div>

                          <div className={styles.activityDetails}>
                            <strong>{person}</strong>

                            <span>
                              Accessed <b>
                                {log.ArticleTitle ||
                                  log.Title ||
                                  `Article #${log.ArticleID || ''}`}
                              </b>
                            </span>

                            <small>
                              {log.Category || 'Uncategorized'}
                            </small>
                          </div>

                          <time>
                            {this.formatDateTime(log.ViewedAt)}
                          </time>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          </>
        )}
        {/* <div className={styles.footer}>Dashboard refreshes automatically every 30 seconds.</div> */}
      </section>
    );
  }
}
