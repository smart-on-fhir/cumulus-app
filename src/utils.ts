
// downloadBase64File(contentType:any, base64Data:any, fileName:any)
// {
//     const linkSource = `data:${contentType};base64,${base64Data}`;
//     const downloadLink = document.createElement("a");
//     downloadLink.href = linkSource;
//     downloadLink.download = fileName;
//     downloadLink.click();
// }



const deferMap = new WeakMap();
export function defer(fn: () => void)
{
    if (deferMap.has(fn)) {
        cancelAnimationFrame(deferMap.get(fn))
    }
    deferMap.set(fn, requestAnimationFrame(fn))
}

export function classList(map: Record<string, boolean>): string | undefined {
    let cls: string[] = [];
    for (let name in map) {
        if (map[name]) {
            cls.push(name)
        }
    }
    return cls.join(" ") || undefined
}