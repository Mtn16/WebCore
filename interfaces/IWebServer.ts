import Manager from "../classes/Manager";
import WebContext from "../classes/WebContext";

export default interface IWebServer {
     port: number;
     contexts?: WebContext[];
     managers: Manager[];
     bannedIPs: string[];
     accessDeniedPage: WebContext | undefined;
     notFoundPage: WebContext | undefined;
}
