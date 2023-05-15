import { Component } from "react"


interface EditorListProps
{
    label   : string | JSX.Element
    list    : any[]
    onChange: (list: any[]) => void
    onAdd   : () => any
    editor  : (data: any, onChange: (data: any) => void, ...rest: any[]) => JSX.Element
}

export default class EditorList extends Component<EditorListProps>
{
    add()
    {
        const newItem = this.props.onAdd();
        this.props.onChange([ ...this.props.list, newItem ]);
    }

    remove(index: number)
    {
        const list = [ ...this.props.list ];
        list.splice(index, 1)
        this.props.onChange(list)
    }

    update(index: number, payload: Record<string, any>)
    {
        const list    = [ ...this.props.list ]
        const oldItem = list[index]
        const newItem = { ...oldItem, ...payload }
        list.splice(index, 1, newItem)
        this.props.onChange(list)
    }

    render()
    {
        const { label, list, editor } = this.props

        return (
            <div className="editor-list">
                <div className="row">
                    <div className="col middle">
                        <b className="nowrap">
                        { label } {  list.length > 0 && <b className="badge">{ list.length }</b> }
                        </b>
                    </div>
                    <div className="col col-0 middle">
                        <span className="btn small color-green btn-virtual" onClick={() => this.add()}>Add</span>
                    </div>
                </div>
                <hr />
                { list.map((item, i) => (
                    <div key={i} className="row half-gap pt-1 mb-1" style={ i > 0 ? {
                        borderTop: "1px solid #CCC"
                    } : undefined}>
                        <div className="col">
                            { editor(item, data => this.update(i, data)) }
                        </div>
                        <div className="col col-0 middle">
                            <span className="btn color-red btn-virtual" onClick={() => this.remove(i)}>
                                <i className="fas fa-trash-alt"/>    
                            </span>    
                        </div>
                    </div>
                )) }
            </div>
        )
    }
}
