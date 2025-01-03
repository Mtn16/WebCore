import Cookie from "./Cookie";
import CookieManager from "./CookieManager";
import Manager from "./Manager";
import Session from "./Session";
import * as http from "http"
import { WS } from "./WebServer";
import { HttpHeader } from "../enums/HttpHeader";
import SessionData from "./SessionData";

let sessions: Session[] = [];

export default class SessionManager extends Manager {
     private createSession(): Session {
          const session = new Session();
          sessions.push(session);
          return session;
     }

     getSession(request: http.IncomingMessage, response: http.ServerResponse): Session {
          const matchingCookie: Cookie | undefined = WS.getManager(CookieManager).getCookie(request, "session");
          if (matchingCookie) {
               const session: Session | undefined = sessions.find((session) => session.id === matchingCookie.data.value);
               if (session) {
                    return session;
               } else {
                    const session: Session = this.createSession();
                    response.setHeader(HttpHeader.SetCookie, new Cookie({ name: "session", value: session.id, options: { Path: "/", HttpOnly: true, } }).toString());
                    return session;
               }
          } else {
               const session: Session = this.createSession();
               response.setHeader(HttpHeader.SetCookie, new Cookie({ name: "session", value: session.id, options: { Path: "/", HttpOnly: true, } }).toString());
               return session;
          }
     }

     getSessionData<T>(session: Session, name: string, type?: new (...args: any[]) => T): T | SessionData | undefined {
          let item = session.data.filter(item => item.name === name)[0]
          if (item) {
               if (!type) {
                    return item
               } else {
                    return item.content as T
               }
          } else {
               return undefined
          }

     }

     setSessionData(session: Session, data: SessionData) {
          if (session.data.filter(item => item.name === data.name)) {
               session.data = session.data.filter(item => item.name !== data.name)
          }
          session.data.push(data)
     }
}