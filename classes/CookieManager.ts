import * as http from "http";
import Cookie from "./Cookie";
import Manager from "./Manager";

export function parseCookies(request: http.IncomingMessage): Cookie[] {
  const list: Cookie[] = [];
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);

    list.push(new Cookie({
      name: name?.trim(),
      value: rest.join(`=`).trim(),
    }))
  });

  return list;
}

export default class CookieManager extends Manager {
  /**
   * Returns cookie by it's name
   * If cookie doesn't exist returns undefined
 * @returns {Cookie | undefined}
 * @param {http.IncomingMessage} request Incoming http request
 * @param {string} name Cookie name
 */
  getCookie(request: http.IncomingMessage, name: string): Cookie | undefined {
    return parseCookies(request).find((cookie) => cookie.data.name === name)
  }
}