import { useCallback, useEffect, useState } from "react"


export function useBackend<T=any>(fn: () => Promise<T>, immediate = false)
{
    const [loading, setLoading] = useState<true|false>(false);
    const [result , setResult ] = useState<T | null>(null);
    const [error  , setError  ] = useState<Error | null>(null);

    const execute = useCallback(() => {
        setLoading(true);
        setResult(null);
        setError(null);

        return fn()
            .then((result: T) => {
                setResult(result)
                setLoading(false)
            })
            .catch((error: Error) => {
                setError(error);
                setLoading(false)
            });

    }, [fn]);
    
    useEffect(() => {
        if (immediate) { 
            execute()
        }
    }, [execute, immediate]);

    return { execute, loading, result, error };
}

