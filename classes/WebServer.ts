import { IncomingMessage, ServerResponse } from "http";
import { ContentType } from "../enums/ContentType";
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

     private staticRoutes: { [key: string]: WebContext } = {};
     private dynamicRoutes: { [key: string]: WebContext } = {};


     constructor(config: IWebServerConfig) {
          this.port = config.port;
          this.contexts = config.defaultContexts ? config.defaultContexts : [];
          config.defaultContexts?.forEach(context => {
               if (context.url.includes(":")) {
                    this.dynamicRoutes[context.url] = context
                    console.log("Dynamic")
               } else {
                    this.staticRoutes[context.url] = context
                    console.log("Static")
               }
               this.contexts.push(context)
          })
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
                              response.writeHead(HttpCode.NotFound);
                              response.end(`No context found for ${request.url}`)
                         }
                         return;
                    }
                    response.writeHead(HttpCode.NotFound, ContentType.PlainText);
                    response.end(`No context found for ${request.url}`)
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
