import IWebContext from "../interfaces/IWebContext";
import * as http from "http"
import { HttpCode } from "../enums/HttpCode";

export default class WebContext implements IWebContext {
     url: string;

     constructor(url: string){
          this.url = url;
     }

     handle(request: http.IncomingMessage, response: http.ServerResponse, params?: Record<string, string>) {
          response.writeHead(HttpCode.NotFound)
          response.end()
          throw new Error("Method 'handle' must be implemented in subclass");
     }
}