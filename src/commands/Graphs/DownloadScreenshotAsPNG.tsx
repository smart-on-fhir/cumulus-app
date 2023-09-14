import { Command }            from "../Command"
import { downloadScreenshot } from "../lib"
import { app }                from "../../types"
import { escapeForFileName }  from "../../utils"


export class DownloadScreenshotAsPNG extends Command
{
    private _view: Partial<app.View>
    private _working?: boolean

    constructor(view: Partial<app.View>) {
        super()
        this._view = view
    }

    label() {
        return "Download PNG Image"
    }

    description() {
        return "Make a screenshot of the chart and download it as PNG Image"
    }

    icon() {
        return <span className="material-icons-round">insert_photo</span>
    }

    available() {
        return !!this._view.settings;
    }

    enabled() {
        return !this._working && !!this._view.settings && !!this._view.name;
    }

    active() {
        return !!this._working;
    }

    async execute() {
        this._working = true
        await downloadScreenshot({
            type: "image/png",
            quality: 0.75,
            fileName: escapeForFileName(this._view.name + "")
        }).finally(() => this._working = false)
    }
}
