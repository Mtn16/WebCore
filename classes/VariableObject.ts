import IVariableObject from "../interfaces/VariableObject";

export default class VariableObject implements IVariableObject {
    name: string;
    content: any;

    constructor(name: string, content: any) {
        this.name = name;
        this.content = content;
    }
}