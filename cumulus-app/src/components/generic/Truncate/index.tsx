import "./Truncate.scss"


export default function Truncate({ children }: { children: string })
{
    if (children.length < 2) {
        return <span title={children}>{children}</span>
    }

    let middle = Math.floor(children.length / 2);
    
    return <span
        className="truncated"
        title={children}
        data-content-start={children.substring(0,middle)}
        data-content-end={children.substring(middle)}
    />
}
