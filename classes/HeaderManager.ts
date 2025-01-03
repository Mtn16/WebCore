import { OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from "http";
import Manager from "./Manager";

export default class HeaderManager extends Manager {
     build(headers: OutgoingHttpHeaders | OutgoingHttpHeader[], response?: ServerResponse): OutgoingHttpHeaders | OutgoingHttpHeader[] {
          let existingHeaders
          if(response)
          {
               existingHeaders = response.getHeaders();
          }

          return {...existingHeaders, ...headers}
     }
}