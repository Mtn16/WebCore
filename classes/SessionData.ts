import ISessionData from "../interfaces/ISessionData";

export default class SessionData implements ISessionData {
    name: string;
    content: any[];

    constructor(name: string, content: any[]) {
        this.name = name;
        this.content = content;
    }
}