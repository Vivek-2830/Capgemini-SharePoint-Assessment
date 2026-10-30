import * as React from 'react';
import styles from './LandingPage.module.scss';
import type { ILandingPageProps } from './ILandingPageProps';
import { escape } from '@microsoft/sp-lodash-subset';
import welcomeDark from '../assets/welcome-dark.png';
import welcomeLight from '../assets/welcome-light.png';

export default class LandingPage extends React.Component<ILandingPageProps> {
  public render(): React.ReactElement<ILandingPageProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      userDisplayName
    } = this.props;

    return (
        <>
          <div className={styles.headerContainer}>

            <div className={styles.headerTop}>

              <div className={styles.headerRight}>

                <div className={styles.headerActions}>

                  <div className={styles.searchBox}>
                    <input type="text" className={styles.searchInput} />

                    <button className={styles.searchButton} aria-label="Search">
                      <img src={`require('../assets/Search.png')`} alt="" />
                    </button>
                  </div>

                  <button className={styles.ticketButton}> Raise a Ticket <span>→</span> </button>

                  <button className={styles.iconButton} aria-label="Shopping cart">
                    <img src={`require('../assets/cart_normal.png')`} alt="" />
                  </button>

                  <button className={styles.iconButton} aria-label="Notifications">
                    <img src={`require('../assets/Noti_Normal.png')`} alt="" />
                  </button>

                  <div className={styles.profile}>
                    <img src={`require('../assets/Profile.png')`} alt="User Profile" />
                  </div>

                </div>

                <nav className={styles.headerNavigation}>
                  <a href="#">Home</a>
                  <span>|</span>
                  <a href="#">Overview</a>
                  <span>|</span>
                  <a href="#">Dashboard</a>
                  <span>|</span>
                  <a href="#">Administration</a>
                </nav>

              </div>

            </div>
          </div>

          <section className={`${styles.landingPage}`}>

            <section className={styles.heroSection}>
              <div className={styles.contentBox}>

                <span className={styles.badge}>
                  100% Satisfaction Guarantee
                </span>

                <h1>
                  Start Your Learning
                  <br />
                  Journey Today
                </h1>

                <div className={styles.description}>
                  <p>
                    Growth with our comprehensive online learning
                    platform. Whether you're looking to advance
                    your career, explore new interests.
                  </p>
                </div>

              </div>
            </section>

            <section className={styles.learningsection}>
              <div className={styles.learningcontainer}>
                <div className={styles.learningimages}>

                  <div className={`${styles.imagecard} ${styles.studentimage}`}>
                    <img src={`require('../assets/Group16128.png')`} alt="Student holding a laptop" />
                  </div>

                </div>

                <div className={styles.learningcontent}>
                  <span className={styles.sectionlabel}>Get To Know About Us</span>

                  <h1>
                    Discover Our Online<br />
                    Learning Programs
                  </h1>

                  <p className={styles.learningdescription}>
                    Dive into a rich array of courses meticulously crafted to cater
                    to your educational aspirations and professional growth.
                    Explore diverse subjects, from business.
                  </p>

                  <div className={styles.features}>
                    <div className={styles.featureitem}>
                      <span className={styles.checkicon}>
                        <img className={styles.checkimg} src={`require('../assets/Group16130.png')`} alt="Check" />
                      </span>
                      <span className={styles.feturetitle}>Seamless Scheduling</span>
                    </div>

                    <div className={styles.featureitem}>
                      <span className={styles.checkicon}>
                        <img className={styles.checkimg} src={`require('../assets/Group16130.png')`} alt="Check" />
                      </span>
                      <span className={styles.feturetitle}>Service Guarantee</span>
                    </div>

                    <div className={styles.featureitem}>
                      <span className={styles.checkicon}>
                        <img className={styles.checkimg} src={`require('../assets/Group16130.png')`} alt="Check" />
                      </span>
                      <span className={styles.feturetitle}>Integrated Collaboration</span>
                    </div>
                  </div>

                  <a href="#" className={styles.discoverbutton}>Discover More</a>
                </div>
              </div>
            </section>

            <section className={styles.blogSection}>
              <div className={styles.container}>

                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>
                    Get To Know About Us
                  </span>

                  <h2>Our Latest News &amp; Blog</h2>

                  <p>
                    Explore insightful articles, industry trends, and exciting updates curated just for you.
                  </p>
                </div>

                <div className={styles.blogGrid}>

                  <div className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      <img
                        src={`require('../assets/01.png')`}
                        alt="Professional working at a desk"
                      />
                    </div>

                    <div className={styles.blogContent}>
                      <span className={styles.category}>Business</span>

                      <h3>Top 10 Skills to Thrive in the Digital Age</h3>

                      <div className={styles.blogMeta}>
                        <span>
                          <img src={`require('../assets/People.png')`} />
                          By John
                        </span>

                        <span>
                          <img src={`require('../assets/Calendar.png')`} />
                          August 25, 2023
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      <img
                        src={`require('../assets/02.png')`}
                        alt="Colleagues working together"
                      />
                    </div>

                    <div className={styles.blogContent}>
                      <span className={styles.category}>Finance</span>

                      <h3>Navigating the Future of Remote Learning</h3>

                      <div className={styles.blogMeta}>
                        <span>
                          <img src={`require('../assets/People.png')`} />
                          By Natasha
                        </span>

                        <span>
                          <img src={`require('../assets/Calendar.png')`} />
                          June 12, 2023
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      <img
                        src={`require('../assets/03.png')`}
                        alt="Business team meeting"
                      />
                    </div>

                    <div className={styles.blogContent}>
                      <span className={styles.category}>Data Science</span>

                      <h3>What Leonardo Teach us About Web Design</h3>

                      <div className={styles.blogMeta}>
                        <span>
                          <img src={`require('../assets/People.png')`} />
                          By William
                        </span>

                        <span>
                          <img src={`require('../assets/Calendar.png')`} />
                          July 29, 2023
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            <section className={styles.aboutSection}>
              <div className={styles.aboutWrapper}>

                <div className={styles.aboutContent}>
                  <span className={styles.aboutTag}>
                    Get To Know About Us
                  </span>

                  <h1>
                    Find Your Path with<br />
                    Our Online Courses
                  </h1>

                  <p className={styles.aboutDescription}>
                    Embark on a personalized journey of growth and discovery with our
                    online courses. Whether you're charting a new career path, seeking to
                    expand your skills.
                  </p>

                  <div className={styles.aboutFeatures}>
                    <div className={styles.aboutfeatureItem}>
                      <span className={styles.aboutcheckIcon}><img className={styles.aboutImage} src={`require('../assets/Group16130.png')`} alt="Check" /></span>
                      <span>Personalized Learning Paths</span>
                    </div>

                    <div className={styles.aboutfeatureItem}>
                      <span className={styles.aboutcheckIcon}><img className={styles.aboutImage} src={`require('../assets/Group16130.png')`} alt="Check" /></span>
                      <span>Interactive Course Materials</span>
                    </div>

                    <div className={styles.aboutfeatureItem}>
                      <span className={styles.aboutcheckIcon}><img className={styles.aboutImage} src={`require('../assets/Group16130.png')`} alt="Check" /></span>
                      <span>Expert Instructor Support</span>
                    </div>
                  </div>

                  <a href="#" className={styles.aboutButton}>
                    Discover More
                  </a>
                </div>

                <div className={styles.aboutVisual}>

                  <div>
                    <img
                      src={`require('../assets/Group16129.png')`} alt="Smiling woman" />
                  </div>
                </div>

              </div>
            </section>

          </section>
        </>
    );
  }
}
