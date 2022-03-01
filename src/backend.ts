import HttpError from "./HttpError";


export async function request<T=any>(path: string, options: RequestInit = {}): Promise<T> {
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


async function getAll<T=any[]>(table: string, query = "") {
    return request<T>(`/api/${table}${query}`);
}

async function getOne<T=any>(table: string, id: string | number, query = "") {
    return request<T>(`/api/${table}/${id}${query}`);
}

async function createOne<T=any>(table: string, payload: Record<string, any>) {
    return request<T>(`/api/${table}`, {
        method : "POST",
        body   : JSON.stringify(payload),
        headers: {
            "content-type": "application/json"
        }
    });
}

async function updateOne<T=Record<string, any>>(table: string, id: string | number, payload: Partial<T>): Promise<T> {
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

async function deleteOne<T=any>(table: string, id: string | number) {
    return request<T>(`/api/${table}/${id}`, { method: "DELETE" });
}

// VIEWS
// -----------------------------------------------------------------------------
async function getOneView(id: string | number, includeRequest : true ): Promise<{ request: app.DataRequest; view: app.View }>;
async function getOneView(id: string | number, includeRequest?: false): Promise<app.View>;
async function getOneView(id: string | number, includeRequest:boolean = false) {
    return getOne("views", id).then(view => {
        if (includeRequest) {
            return requests.getOne(view.DataRequestId).then(request => {
                return {
                    request,
                    view
                }
            })
        }
        return view
    })
}

export const views = {
    getAll(query?: string) {
        return getAll("views", query)
    },

    getOne: getOneView,
    create(payload: Partial<app.View>) {
        return createOne("views", payload)
    },
    update(id: string | number, payload: Partial<app.View>) {
        return updateOne("views", id, payload)
    },
    delete(id: string | number) {
        return deleteOne("views", id)
    }
};

export const requests = {
    getAll(query?: string) {
        return getAll<app.DataRequest[]>("requests", query)
    },
    getOne(id: string | number, query?: string): Promise<app.DataRequest> {
        return getOne("requests", id, query)
    },
    create(payload: app.DataRequest) {
        return createOne("requests", payload)
    },
    async update(id: string | number, payload: Partial<app.DataRequest>) {
        return updateOne("requests", id, payload)
    },
    delete(id: string | number) {
        return deleteOne("requests", id)
    }
};

export const requestGroups = {
    async getAll(query?: string): Promise<app.RequestGroup[]> {
        return getAll<app.RequestGroup[]>("request-groups", query)
    }
}

export const auth = {
    async login(username: string, password: string, remember = false): Promise<app.User> {
        return fetch(`/api/auth/login`, {
            mode   : "cors",
            method : "POST",
            body   : JSON.stringify({ username, password, remember }),
            credentials: "include",
            headers: {
                "content-type": "application/json"
            }
        }).then(res => {
            if (res.ok) {
                return res.json()
            }

            return res.text().then(txt => {
                throw new Error(txt)
            })
            
        });                
    },
    async logout(): Promise<{ message: string }> {
        return fetch(`/api/auth/logout`, {
            mode   : "cors",
            method : "GET",
            credentials: "include"
        }).then(res => res.json());                
    }
};
