import { useCallback, useEffect, useReducer } from "react"

interface State<T = any> {
    loading: boolean
    error  : Error | null
    result : T | null
}

function reducer(state: State, payload: Partial<State>): State {
    return { ...state, ...payload };
}

export function useBackend<T=any>(fn: () => Promise<T>, immediate = false)
{
    const [state, dispatch] = useReducer(reducer, {
        loading: immediate,
        error: null,
        result: null
    });

    const execute = useCallback(() => {
        dispatch({ loading: true });
        return fn().then(
            (result: T) => dispatch({ loading: false, result, error: null }),
            (error: Error) => dispatch({ loading: false, error, result: null })
        );
    }, [fn]);
    
    useEffect(() => {
        if (immediate) { 
            execute()
        }
    }, [execute, immediate]);

    return {
        execute,
        loading: state.loading,
        result: state.result as (T | null),
        error: state.error
    };
}

