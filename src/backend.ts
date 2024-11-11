import HttpError from "./HttpError";
import { app }   from "./types"

interface RequestOptions extends RequestInit {
    includeResponse?: boolean
    
    /**
     * If set, and if there is another pending request with the same label,
     * the pending one will be aborted before the new one is started.
     */
    label?: string
}

const pendingRequests = new Map<string, AbortController>()

export async function request<T=any>(path: string, options: RequestOptions = {}): Promise<T> {
    
    path = path.replace(/^\//, (process.env.REACT_APP_BACKEND_HOST || "") + "/");

    const abortController = new AbortController()

    const job = fetch(path, {
        mode       : "cors",
        credentials: "same-origin",
        ...options,
        signal: abortController.signal
    }).then(async (res) => {
        let type = res.headers.get("Content-Type") + "";

        let body = await res.text();

        if (body.length && type.match(/\bjson\b/i)) {
            body = JSON.parse(body);
        }

        if (options.includeResponse) {
            return { body, response: res } as T;
        }

        if (!res.ok) {
            // @ts-ignore
            throw new HttpError(res.status, body?.message || body || res.statusText)
            // throw new Error(body || res.statusText)
        }

        return body as T;
    })
    .catch(ex => {
        if (abortController.signal.aborted) {
            return abortController.signal.reason
        }
        throw ex
    })
    .finally(() => {
        if (label) pendingRequests.delete(label)
    }) as Promise<T>;

    const label = options.label
    
    if (label) {
        const pendingController = pendingRequests.get(label)
        if (pendingController) {
            pendingController.abort(job)
        }
        pendingRequests.set(label, abortController)
    }
    
    return job;
}

export async function createOne<T=Record<string, any>>(table: string, payload: Partial<T>) {
    return request<T>(`/api/${table}`, {
        method : "POST",
        body   : JSON.stringify(payload),
        headers: {
            "content-type": "application/json"
        }
    });
}

export async function updateOne<T=Record<string, any>>(table: string, id: string | number, payload: Partial<T>): Promise<T> {
    const data = { ...payload }
    if ("id" in data) {
        // @ts-ignore
        delete data.id
    }
    return request<T>(`/api/${table}/${id}`, {
        method : "PUT",
        body   : JSON.stringify(data),
        headers: {
            "content-type": "application/json"
        }
    });
}

export async function deleteOne<T=any>(table: string, id: string | number) {
    return request<T>(`/api/${table}/${id}`, { method: "DELETE" });
}

export const auth = {
    async login(username: string, password: string, remember = false): Promise<app.User> {
        return request(`/api/auth/login`, {
            mode   : "cors",
            method : "POST",
            body   : JSON.stringify({ username, password, remember }),
            headers: {
                "content-type": "application/json"
            }
        });                
    },
    async logout(): Promise<{ message: string }> {
        return request(`/api/auth/logout`, {
            mode   : "cors",
            method : "GET",
            credentials: "include"
        });
    }
};
