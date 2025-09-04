import { Response }   from "express"
import { AppRequest } from "../types"


interface ClientEvent {
    type: string
    data: any
}


const clients: Record<number, Response> = {}


export function longPollingHandler(request: AppRequest, response: Response) {
    const id = request.user!.id
    response.setHeader("Cache-Control", "no-cache, must-revalidate");
    clients[id] = response;
    
    const timer = setTimeout(() => {
        if (clients[id]) {
            if (!clients[id].headersSent) {
                clients[id].sendStatus(205)
            }
        }
    }, 28_000).unref()

    response.on('close', () => {
        delete clients[id];
        clearTimeout(timer)
    });
}

export function emit(event: ClientEvent, userId?: number) {
    for (let id in clients) {
        if (!userId || id === userId + "") {
            clients[id].json(event);
        }
    }
}
