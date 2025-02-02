import html2canvas, { Options } from "html2canvas"


export async function getScreenShot(
    options: Partial<Options> = {},
    {
        type = "image/png",
        quality = 0.75
    }: {
        type?: "image/jpeg" | "image/png",
        quality?: number
    } = {})
{
    const el = document.querySelector("#chart .highcharts-container") as HTMLElement;
    const canvas: HTMLCanvasElement = await html2canvas(el, {
        scale: 1,
        logging: false,
        ...options,
        ignoreElements: el => el.classList.contains("highcharts-exporting-group")
    });
    return canvas.toDataURL(type, quality);
}

export async function downloadScreenshot({
    type    = "image/png",
    quality = 0.75,
    fileName
}: {
    type?: "image/jpeg" | "image/png",
    quality?: number,
    fileName?: string
} = {})
{
    const screenShot = await getScreenShot({ scale: 4 }, { type, quality });
    const a = document.createElement("a");
    a.href = screenShot;
    a.download = (fileName?.trim() || "chart") + "." + type.split("/").pop();
    a.click();
}

