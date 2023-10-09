import { DASH_STYLES } from "../config";

export const DEFS = {
    borderWidth: {
        name: "Border Width",
        type: "number",
        min : 0,
        max : 10,
        step: 0.1
    },
    borderRadius: {
        name: "Border Radius",
        type: "number",
        min : 0,
        max : 50,
        step: 1
    },
    lineWidth: {
        name: "Line Width",
        type: "number",
        min : 0,
        max : 50,
        step: 0.1
    },
    opacity: {
        name: "Opacity",
        type: "number",
        min : 0,
        max : 1,
        step: 0.01
    },
    dashStyle: {
        name   : "Dash Style",
        type   : "options",
        options: DASH_STYLES
    },
    fontSize: {
        name: "Font Size (em)",
        type: "number",
        min : 0.5,
        max : 3,
        step: 0.05
    },
    fontStyle: {
        name: "Font Style",
        type: "options",
        options: [
            { value: undefined, label: "unset"  },
            { value: "italic" , label: "italic" },
            { value: "normal" , label: "normal" }
        ]
    },
    fontWeight: {
        name: "Font Weight",
        type: "options",
        options: [
            { value: "normal" , label: "normal"           },
            { value: "bold"   , label: "bold"             },
            { value: "lighter", label: "lighter"          },
            { value: "bolder" , label: "bolder"           },
            { value: 100      , label: "100 (Thin)"       },
            { value: 200      , label: "200 (Extra Light)"},
            { value: 300      , label: "300 (Light)"      },
            { value: 400      , label: "400 (Normal)"     },
            { value: 500      , label: "500 (Medium)"     },
            { value: 600      , label: "600 (Semi Bold)"  },
            { value: 700      , label: "700 (Bold)"       },
            { value: 800      , label: "800 (Extra Bold)" }
        ]
    },
    fontFamily: {
        name: "Font Family",
        type: "options",
        options: [
            { label: "Generic", value: [
                { value: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif", label: "Sans-serif Narrow (default)" },
                { value: "Helvetica, Arial, sans-serif", label: "Sans-serif" },
                { value: "'Times New Roman', Times, serif", label: "Serif" },
                { value: "monospace", label: "Fixed Width" },
                { value: "inherit", label: "Inherit" },
                // { value: undefined, label: "Unset" },
            ]},
            { label: "Sans-serif", value: [
                { value: "Helvetica", label: "Helvetica" },
                { value: "Arial", label: "Arial" },
                { value: "Arial Narrow", label: "Arial Narrow" },
                { value: "Arial Black", label: "Arial Black" },
                { value: "Verdana", label: "Verdana" },
                { value: "Tahoma", label: "Tahoma" },
                { value: "Trebuchet MS", label: "Trebuchet MS" },
                { value: "Impact", label: "Impact" },
                { value: "Gill Sans", label: "Gill Sans" },

            ] },
            { label: "Serif", value: [
                { value: "Times New Roman", label: "Times New Roman" },
                { value: "Georgia", label: "Georgia" },
                { value: "Palatino", label: "Palatino" },
                { value: "Baskerville", label: "Baskerville" },
            ]},
            { label: "Monospace", value: [
                { value: "Andale Mono", label: "Andalé Mono" },
                { value: "Courier", label: "Courier" },
                { value: "Lucida Grande", label: "Lucida Grande" },
                { value: "Monaco", label: "Monaco" },
            ]},
            { label: "Cursive", value: [
                { value: "Bradley Hand", label: "Bradley Hand" },
                { value: "Brush Script MT", label: "Brush Script MT" },
                { value: "Comic Sans MS", label: "Comic Sans MS" },
            ]},
            { label: "Fantasy", value: [
                { value: "Luminari", label: "Luminari" },
            ]}
        ]
    },
    verticalAlign: {
        name   : "Y Align",
        type   : "options",
        options: ["top", "middle", "bottom"],
    },
    seriesType: {
        name: "Type",
        type: "options",
        options: [
            'line', 'spline', 'area', 'areaspline', 'arearange',
            'areasplinerange', 'bar', 'bubble', 'column',
            'columnpyramid', 'pie', 'scatter'
        ]
    },
    whiteSpace: {
        name: "White Space",
        type: "options",
        options: [
            { value: undefined     , label: "unset"        },
            { value: "break-spaces", label: "break-spaces" },
            { value: "normal"      , label: "normal"       },
            { value: "nowrap"      , label: "nowrap"       },
            { value: "pre"         , label: "pre"          },
            { value: "pre-line"    , label: "pre-line"     },
            { value: "pre-wrap"    , label: "pre-wrap"     }
        ]
    },
    textDecoration: {
        name: "Text Decoration",
        type: "options",
        options: [
            { value: undefined     , label: "unset"        },
            { value: "underline"   , label: "underline"    },
            { value: "overline"    , label: "overline"     },
            { value: "line-through", label: "line-through" }
        ]
    },
    textAlign: {
        name: "Text Align",
        type: "options",
        options: [
            { value: undefined, label: "unset"  },
            { value: "left"   , label: "left"   },
            { value: "center" , label: "center" },
            { value: "right"  , label: "right"  }
        ]
    },
    textOverflow: {
        name: "Text Overflow",
        type: "options",
        description: "SVG elements support ellipsis when a width is set.",
        options: [
            { value: undefined , label: "unset"    },
            { value: "clip"    , label: "clip"     },
            { value: "ellipsis", label: "ellipsis" }
        ]
    }
}