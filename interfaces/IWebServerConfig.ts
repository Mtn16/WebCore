import WebContext from "../classes/WebContext";

export default interface IWebServerConfig{
     port: number;
     defaultContexts?: WebContext[];
     bannedIPs?: string[];
}
