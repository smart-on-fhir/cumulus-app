import { useState } from "react"


export interface CustomSelection<T> {
    forEach: (callback: (entry: T, index: number, all: T[]) => void) => void;
    toggle: (entry: T) => void;
    includes: (entry: T) => boolean;
    indexOf: (entry: T) => number;
    add: (entry: T) => boolean;
    remove: (entry: T) => boolean;
    clear: () => boolean
    size: () => number
    items: T[]
}


export function WithSelection<T=number>({
    children,
    equals = (a, b) => a === b
}: {
    equals?: (a: T, b: T) => boolean
    children: (selection: CustomSelection<T>) => JSX.Element
}) {
    const [ selection , setSelection  ] = useState<T[]>([])

    const indexOf = (entry: T) => {
        return selection.findIndex(x => equals(entry, x))
    };

    const forEach = (callback: (entry: T, index: number, all: T[]) => void) => {
        selection.forEach(callback)
    };

    const includes = (entry: T) => {
        return indexOf(entry) > -1
    };

    const add = (entry: T) => {
        if (includes(entry)) {
            return false
        }
        setSelection([...selection, entry])
        return true
    };

    const remove = (entry: T) => {
        const index = indexOf(entry)
        if (index === -1) {
            return false
        }
        const sel = [...selection]
        sel.splice(index, 1)
        setSelection(sel)
        return true
    };

    const toggle = (id: T) => {
        const index = indexOf(id)
        if (index === -1) {
            setSelection([...selection, id])
        } else {
            const sel = [...selection]
            sel.splice(index, 1)
            setSelection(sel)
        }
    };

    const clear = () => {
        if (selection.length) {
            setSelection([])
            return true
        }
        return false
    };

    const size = () => {
        return selection.length
    };

    return children({
        toggle,
        indexOf,
        forEach,
        includes,
        add,
        remove,
        clear,
        size,
        items: selection
    });
}
