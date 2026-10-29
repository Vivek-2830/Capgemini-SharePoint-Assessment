import * as React from 'react';
import styles from './KnowledgeRepository.module.scss';
import type { IKnowledgeRepositoryProps } from './IKnowledgeRepositoryProps';
import { escape } from '@microsoft/sp-lodash-subset';
import welcomeDark from '../assets/welcome-dark.png';
import welcomeLight from '../assets/welcome-light.png';

export default class KnowledgeRepository extends React.Component<IKnowledgeRepositoryProps> {
  public render(): React.ReactElement<IKnowledgeRepositoryProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.knowledgeRepository}`}>

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
                <img src={require('../assets/Group16128.png')} alt="Student holding a laptop" />
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
                    <img src={require('../assets/Group16130.png')} alt="Check" />
                  </span>
                  <span className={styles.feturetitle}>Seamless Scheduling</span>
                </div>

                <div className={styles.featureitem}>
                  <span className={styles.checkicon}>
                    <img className={styles.checkimg} src={require('../assets/Group16130.png')} alt="Check" />
                  </span>
                  <span>Service Guarantee</span>
                </div>

                <div className={styles.featureitem}>
                  <span className={styles.checkicon}>
                    <img src={require('../assets/Group16130.png')} alt="Check" />
                  </span>
                  <span>Integrated Collaboration</span>
                </div>
              </div>

              <a href="#" className={styles.discoverbutton}>Discover More</a>
            </div>
          </div>
        </section>

      </section>
    );
  }
}
