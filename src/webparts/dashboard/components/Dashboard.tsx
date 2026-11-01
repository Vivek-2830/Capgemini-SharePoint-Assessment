import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import DashboardService from '../services/DashboardService';
import { IKnowledgeArticle, IArticleAccessLog } from '../model/IDashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

import SearchIcon from '../assets/Search.png';
import CartIcon from '../assets/cart_normal.png';
import Notification from '../assets/Noti_Normal.png';
import ProfileIcon from '../assets/Profile.png';
import CompanyIcon from '../assets/LOGO.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

    const chartData = {
      labels: categoryCounts.map(item => item.name),

      datasets: [
        {
          label: 'Article Views',
          data: categoryCounts.map(item => item.count),

          backgroundColor: [
            '#00D4CF',
            '#0070AD'
          ],

          borderColor: [
            '#00D4CF',
            '#0070AD'
          ],

          borderWidth: 1,
          borderRadius: 5,
          barThickness: 45
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },

        title: {
          display: false
        },

        tooltip: {
          enabled: true,
          callbacks: {
            label: (context: any) =>
              `${context.parsed.y} views`
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0
          },

          grid: {
            color: '#eeeeee'
          },

          title: {
            display: true,
          }
        },

        x: {
          grid: {
            display: false
          },

          title: {
            display: true,
            text: 'Article Categories'
          }
        }
      }
    };

    return (
      <div className={styles.chartJsContainer}>
        <Bar
          data={chartData}
          options={chartOptions}
        />
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
      <>
        <div className={styles.headerContainer}>

          <div className={styles.header}>

            <div className={styles.headerLogo}>
              <img
                src={CompanyIcon}
                alt="Capgemini"
              />
            </div>

            <div className={styles.headerRight}>

              <div className={styles.headerActions}>

                <div className={styles.searchBox}>
                  <input type="text" className={styles.searchInput} />

                  <button className={styles.searchButton} aria-label="Search">
                    <img src={SearchIcon} alt="" />
                  </button>
                </div>

                <button className={styles.ticketButton}> Raise a Ticket <span>→</span> </button>

                <button className={styles.iconButton} aria-label="Shopping cart">
                  <img src={CartIcon} alt="" />
                </button>

                <button className={styles.iconButton} aria-label="Notifications">
                  <img src={Notification} alt="" />
                </button>

                <div className={styles.profile}>
                  <img src={ProfileIcon} alt="User Profile" />
                </div>

              </div>

              <nav className={styles.headerNavigation}>
                <a href="https://87twts.sharepoint.com/sites/Assessment">Home</a>
                <span>|</span>
                <a href="https://87twts.sharepoint.com/sites/Assessment/SitePages/KnowledgeRepository.aspx">Knowledge Repository</a>
                <span>|</span>
                <a href="https://87twts.sharepoint.com/sites/Assessment/SitePages/Dashboard.aspx">Dashboard</a>
              </nav>

            </div>

          </div>
        </div>

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
              </div>

              {/* Most Viewed Articles + Recent Activity */}
              <div className={styles.activityGrid}>

                {/* Most Viewed Articles */}
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

                {/* Recent Article Access Activity */}
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
                      {logs.slice(0, 5).map(log => {
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

        </section>
      </>


    );
  }
}
