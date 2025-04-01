import { merge } from "highcharts";
const BaseMarkdown = require("markdown-to-jsx")
import { Fragment } from "react";
import "./Markdown.scss"


export default function Markdown({ children, options = {} }: {
    children: string;
    options?: any//MarkdownToJSX.Options
}) {
    return (
        <div className="markdown">
            <BaseMarkdown options={ merge({
                overrides: {
                    a: {
                        props: {
                            className: 'link',
                            target: "_blank",
                            rel: "noreferrer noopener"
                        },
                    },
                },
                wrapper: Fragment
            }, options) }>{ children }</BaseMarkdown>
        </div>
    )
}