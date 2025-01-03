import { IncomingMessage } from "http";
import Manager from "./Manager";
import { HttpProtocol } from "../enums/HttpProtocol";

export default class RequestManager extends Manager {
     getHeader(request: IncomingMessage, header: string): string | undefined {
          const headerValue = request.headers[header]
          if (typeof headerValue === "string") {
               return headerValue
          } else {
               return undefined
          }
     }

     /**
      * 
      * @param request Incoming http request
      * @param header Header name
      * @returns {string}
      */

     getBearerToken(request: IncomingMessage, header?: string) {
          if(!header) {
               header = "authorization"
          }

          return this.getHeader(request, header)?.split("Bearer ")[1]
     }

     /**
      * Returns used protocol
      * Requires reverse proxy to work (without reverse proxy returns undefined)
      * 
      * @returns {HttpProtocol}
      */
     getProtocol(req: IncomingMessage): HttpProtocol | undefined {
          const forwardedProto = req.headers['x-forwarded-proto'];
          if(!forwardedProto) { return undefined }
          if (forwardedProto === 'https') {
               return HttpProtocol.HTTPS;
          }
          return HttpProtocol.HTTP;
     }

}