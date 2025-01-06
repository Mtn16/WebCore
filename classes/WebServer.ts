import { IncomingMessage, ServerResponse } from "http";
import { HttpCode } from "../enums/HttpCode";
import IWebServer from "../interfaces/IWebServer";
import IWebServerConfig from "../interfaces/IWebServerConfig";
import CookieManager from "./CookieManager";
import HeaderManager from "./HeaderManager";
import Manager from "./Manager";
import SessionManager from "./SessionManager";
import WebContext from "./WebContext";
import * as http from "http";
import RequestManager from "./RequestManager";
import VariableManager from "./VariableManager";

export let WS: WebServer;

export default class WebServer implements IWebServer {
     port: number;
     contexts: WebContext[];
     managers: Manager[];
     bannedIPs: string[];
     accessDeniedPage: WebContext | undefined;
     notFoundPage: WebContext | undefined;

     private staticRoutes: { [key: string]: WebContext } = {};
     private dynamicRoutes: { [key: string]: WebContext } = {};


     constructor(config: IWebServerConfig) {
          this.port = config.port;
          this.bannedIPs = [];
          this.contexts = config.defaultContexts ? config.defaultContexts : [];
          config.defaultContexts?.forEach(context => {
               if (context.url.includes(":")) {
                    this.dynamicRoutes[context.url] = context
               } else {
                    this.staticRoutes[context.url] = context
               }
          })

          config.bannedIPs?.forEach(IP => {
               if (IP === "localhost" || IP === "127.0.0.1" || IP === "::1") {
                    this.bannedIPs.push("::1")
                    return
               }
               if (/(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/gm.test(IP)) {
                    this.bannedIPs.push(IP)
               } else {
                    console.log(`[WARN] Invalid IP provided: ${IP}`)
               }
          })

          if (config.accessDeniedPage) {
               this.accessDeniedPage = config.accessDeniedPage
          }

          if (config.notFoundPage) {
               this.notFoundPage = config.notFoundPage
          }

          this.managers = [
               new CookieManager(),
               new SessionManager(),
               new HeaderManager(),
               new RequestManager(),
               new VariableManager()
          ]
     }
     createContext(context: WebContext) {
          if (context.url.includes(":")) {
               this.dynamicRoutes[context.url.toLocaleLowerCase()] = context
          }
          this.staticRoutes[context.url.toLocaleLowerCase()] = context
          this.contexts.push(context)
     }

     startServer() {
          WS = this;
          const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {
               if (this.bannedIPs.filter(IP => IP === request.socket.remoteAddress).length > 0) {
                    if (this.accessDeniedPage) {
                         this.accessDeniedPage.handle(request, response)
                    } else {
                         response.writeHead(HttpCode.Forbidden)
                         response.end("<h1>Access denied</h1><p>The owner of this website has banned your IP address.<p>")
                    }
                    return
               }
               const url = request.url || '/';
               const [path, queryString] = url.split('?');

               try {
                    if (this.staticRoutes[path.toLocaleLowerCase()]) {
                         this.staticRoutes[path.toLocaleLowerCase()].handle(request, response);
                         return;
                    }
                    const context = this.contexts.filter(ct => path.toLocaleLowerCase().match(this.pathToRegex(ct.url)))[0]
                    if (context) {
                         //@ts-ignore
                         const params = this.extractParams(context.url, context);
                         const matchingContext: WebContext | undefined = this.contexts.find((c) => c.url === context.url.toLocaleLowerCase());
                         if (matchingContext) {
                              matchingContext.handle(request, response, params)
                         } else {

                              if (this.notFoundPage) {
                                   this.notFoundPage.handle(request, response)
                              } else {
                                   response.writeHead(HttpCode.NotFound);
                                   response.end(`No context found for ${request.url}`)
                              }
                              return
                         }
                         return;
                    }
                    if (this.notFoundPage) {
                         this.notFoundPage.handle(request, response)
                    } else {
                         response.writeHead(HttpCode.NotFound);
                         response.end(`No context found for ${request.url}`)
                    }
               } catch (error) {
                    console.log(error)
               }
               return;
          })

          server.listen(this.port, () => {
               console.log("Listening on port " + this.port);
          })
     }

     stopServer(server: http.Server) {
          this.managers = []
          server.close()
     }

     private pathToRegex(path: string): RegExp {
          return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)').replace(/\//g, '\\/') + '$');
     }


     private extractParams(routePath: string, match: RegExpMatchArray): Record<string, string> {
          const paramNames = (routePath.match(/:\w+/g) || []).map(param => param.substring(1));
          const paramValues = match.slice(1);
          return Object.fromEntries(paramNames.map((name, index) => [name, paramValues[index]]));
     }

     getManager<M extends Manager>(
          contextClass: new (...args: any[]) => M
     ): M {
          return this.managers.find(context => context instanceof contextClass) as M;
     }
}
