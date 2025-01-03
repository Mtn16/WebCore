import ICookie from "../interfaces/ICookie";
import ICookieData from "../interfaces/ICookieData";

export default class Cookie implements ICookie {
     data: ICookieData;

     constructor(data: ICookieData) {
          this.data = data
     }

     toString() {
          if(this.data.options)
          {
               const optionsString = Object.entries(this.data.options)
               .map(([key, val]) => (val === true ? key : `${key}=${val}`))
               .join("; ");
               return `${this.data.name}=${this.data.value}; ${optionsString}`;
          } else {
               return `${this.data.name}=${this.data.value};`;
          }
          
          
     }
}