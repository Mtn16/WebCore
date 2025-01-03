import { randomUUID } from "crypto";
import ISession from "../interfaces/ISession";
import SessionData from "./SessionData";

export default class Session implements ISession{
     id: string;
     data: SessionData[];

     constructor(){
          this.id = randomUUID();
          this.data = []
          return this;
     }
}