import HttpError from "./HttpError";
import { app }   from "./types"


export async function request<T=any>(path: string, options: RequestInit = {}): Promise<T> {
    path = path.replace(/^\//, (process.env.REACT_APP_BACKEND_HOST || "") + "/");
    const res = await fetch(path, {
        mode: "cors",
        credentials: "include",
        ...options
    });
    
    let type = res.headers.get("Content-Type") + "";

    let body = await res.text();

    if (!res.ok) {
        throw new HttpError(res.status, body || res.statusText)
        // throw new Error(body || res.statusText)
    }

    if (body.length && type.match(/\bjson\b/i)) {
        body = JSON.parse(body);
    }

    // @ts-ignore
    return body;
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
            credentials: "include",
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
