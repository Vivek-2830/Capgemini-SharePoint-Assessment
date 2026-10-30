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

      </section>

    );
  }
}
