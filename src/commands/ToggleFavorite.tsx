import { Command } from "./Command"


export class ToggleFavorite extends Command
{
    private id: string;
    private group: string;

    /**
     * @param id ID to be added to or removed from the list
     * @param group The localStorage key
     */
    constructor(id: string | number, group: string) {
        super()
        this.id = id + ""
        this.group = group
    }

    private getList() {
        return String(window.localStorage[this.group] || "").trim().split(/\s*,\s*/)
    }

    on() {
        return this.getList().includes(this.id)
    }
    
    label() {
        return this.on() ?
            "Remove from favorites" :
            "Add to favorites"
    }

    icon() {
        return this.on() ?
            <i className="fa-regular fa-star" /> :
            <i className="fa-solid fa-star" />;
    }

    execute() {
        let list = this.getList()
        if (list.includes(this.id)) {
            list = list.filter(x => x !== this.id)
        } else {
            list = [...list, this.id].filter(Boolean)
        }
        window.localStorage[this.group] = list.join(",")
        window.dispatchEvent(new Event('localStorageUpdate'));
    }
}
