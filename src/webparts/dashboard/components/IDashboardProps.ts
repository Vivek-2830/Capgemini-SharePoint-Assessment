import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IDashboardProps {
  context: WebPartContext;
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  userDisplayName: string;
}
