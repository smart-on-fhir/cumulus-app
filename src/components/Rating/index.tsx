import { useState } from "react";
import { classList } from "../../utils";
import "./Rating.scss"

export function StaticRating({
    value = 0,
    votes = 0
}: {
    value?: number
    votes?: number
}) {
    const stars = [];

    for (let i = 0; i < 5; i++) {
        stars.push(
            <Star
                key={i}
                fill={ value > i + 0.5 ? "full" : value > i ? "half" : "none" }
            />
        );
    }
    
    return (
        <div className="rating-static">
            <div className="stars">{ stars }</div>
            <div className="rating-meassage">
                { value } out of 5 from { votes } votes
            </div>
        </div>
    )
}


export default function Rating({
    value = 0,
    votes = 0,
    loading,
    onVote,
    onClear
}: {
    value?: number
    votes?: number
    onVote?: (n: number) => void
    onClear?: () => void
    loading?: boolean
}) {
    const [curValue, setCurValue] = useState(value);
    
    const stars = [];

    for (let i = 0; i < 5; i++) {
        stars.push(
            <Star
                key={i}
                fill={ curValue > i + 0.5 ? "full" : curValue > i ? "half" : "none" }
                onMouseOver={() => setCurValue(i + 1)}
            />
        )
    }

    return (
        <>
            <div className={ classList({
                rating: true,
                "grey-out": !!loading
             })} onClick={ e => e.preventDefault() }>
                <b className="value">
                    Rating: { value } of {votes} votes
                </b>
                <div
                    title="Click to vote"
                    className="stars"
                    onClick={onVote ? () => onVote(curValue) : undefined}
                    onMouseLeave={() => setCurValue(value)}
                >
                    <span onMouseOver={() => setCurValue(0)}/>
                { stars }
                { onClear && <i
                    className="fa-solid fa-delete-left"
                    title="Reset rating"
                    onClick={e => { e.stopPropagation(); onClear() }}
                /> }
                </div>
            </div>
            <div className="rating-meassage">
                Click on the stars to rate this view.
            </div>
        </>
    )
}

function Star({
    fill = "none",
    onMouseOver
}: {
    fill?: "full" | "half" | "none"
    onMouseOver?: () => void
}) {
    return (
        <svg version="1.0" shapeRendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg" viewBox="60 -62 309 309" className={fill}
        onMouseOver={e => { e.stopPropagation(); onMouseOver && onMouseOver() }}>
            <polygon className="star" points="281.1,129.8 364,55.7 255.5,46.8 214,-59 172.5,46.8 64,55.4 146.8,129.7 121.1,241 212.9,181.1 213.9,181 306.5,241"/>
            <polygon className={ fill !== "none" ? "star-left"  : "blank" } points="281.1,129.8 364,55.7 255.5,46.8 214,-59 172.5,46.8 64,55.4 146.8,129.7 121.1,241 213.9,181.1 213.9,181 306.5,241"/>
            <polygon className={ fill === "half" ? "star-right" : "blank" } points="364,55.7 255.5,46.8 214,-59 213.9,181 306.5,241 281.1,129.8"/>
        </svg>
    )
}