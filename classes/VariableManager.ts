import Manager from "./Manager";
import VariableObject from "./VariableObject";

export default class VariableManager extends Manager {
    storage: VariableObject[] = []

    getVariable<T>(name: string, type?: new(...args: any[]) => T): T | VariableObject | undefined {
        let item = this.storage.filter(item => item.name === name)[0]
        if(item)
        {
            if(type)
            {
                return item.content as T;
            } else {
                return item
            }
        } else {
            return undefined
        }
    }

    setVariable(name: string, content: any): void {
        if(this.storage.filter(item => item.name === name))
        {
            this.storage = this.storage.filter(item => item.name !== name)
        }
        this.storage.push(new VariableObject(name, content))
    }
}