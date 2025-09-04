import { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { useAuth } from "./auth";
import { Command } from "./commands/Command";
import LocalStorageNS from "./LocalStorageNS";

interface State<T = any> {
    loading: boolean
    error  : Error | null
    result : T | null
}

function reducer(state: State, payload: Partial<State>): State {
    return { ...state, ...payload };
}

export function useBackend<T=any>(fn: (signal?: AbortSignal) => Promise<T>, immediate = false)
{
    const { logout } = useAuth()

    const [state, dispatch] = useReducer(reducer, {
        loading: immediate,
        error: null,
        result: null
    });

    const abortController = useMemo(() => new AbortController(), [])

    const execute = useCallback(() => {
        dispatch({ loading: true, result: null, error: null });
        return fn(abortController.signal).then(
            (result: T) => {
                if (!abortController.signal.aborted) {
                    dispatch({ loading: false, result })
                }
            },
            async (error: Error) => {
                // @ts-ignore
                if (error.code === 401) {
                    await logout()
                }

                if (!abortController.signal.aborted) {
                    dispatch({ loading: false, error })
                }
            }
        );
    }, [fn, abortController.signal, logout]);
    
    useEffect(() => {
        if (immediate) { 
            execute()
        }
    }, [execute, immediate]);

    useEffect(() => () => abortController.abort(), [ abortController ]);

    return {
        execute,
        loading: state.loading,
        result: state.result as (T | null),
        error: state.error
    };
}

type eventHandler = (payload?: any) => void

const eventHandlers: Record<string, eventHandler[]> = {}

const emitter = {
    emit(eventType: string, ...args: any[]) {
        (eventHandlers[eventType] || []).forEach(listener => listener(...args));
    },
    on(eventType: string, callback: eventHandler) {
        (eventHandlers[eventType] = eventHandlers[eventType] || []).push(callback);
        return () => {
            eventHandlers[eventType] = eventHandlers[eventType].filter(cb => cb !== callback);
        }
    },
    off(eventType: string, callback: eventHandler) {
        eventHandlers[eventType] = eventHandlers[eventType].filter(cb => cb !== callback);
    }
}

export function useServerEvent() {
    return emitter.on
}

async function ping() {
    try {
        let response = await fetch(`${VITE_APP_PREFIX ? "/" + VITE_APP_PREFIX : ""}/api/sse`);
        if (response.status === 502) {
            await ping(); // reconnect after timeout!
        } else if (response.status !== 200) {
            // console.error(response.statusText);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await ping();
        } else {
            let { type, data } = await response.json();
            eventHandlers[type]?.forEach(cb => cb(data))
            await ping();
        }
    } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ping();
    }
}

ping()

export function useCommand(command: Command) {
    const [working, setWorking] = useState(false)
    const [error  , setError  ] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setError(null)
        setWorking(true)
        try {
            await command.execute()
        } catch (error) {
            setError(error as Error)
        } finally {
            setWorking(false)
        }
    }, [command]);

    return {
        working,
        error,
        execute,
        label      : command.label      ({ working, error }),
        icon       : command.icon       ({ working, error }),
        available  : command.available  ({ working, error }),
        enabled    : command.enabled    ({ working, error }),
        active     : command.active     ({ working, error }),
        description: command.description({ working, error })
    }
}

export function useLocalStorage(storageKey: string) {
    const [storageValue, setStorageValue] = useState(LocalStorageNS.getItem(storageKey));

    useEffect(() => {
        const handleStorageChange = (event: any) => {
            if (event.key === storageKey) {
                setStorageValue(event.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // For same tab changes
        const handleSameTabChange = () => {
            setStorageValue(LocalStorageNS.getItem(storageKey));
        };

        window.addEventListener('localStorageUpdate', handleSameTabChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorageUpdate', handleSameTabChange);
        };
    }, [storageKey])

    return [storageValue, (val: string) => {
        setStorageValue(val)
        window.dispatchEvent(new Event('localStorageUpdate'));
    }]
}
