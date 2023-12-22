import { Response }   from "express"
import { AppRequest } from "../types"


interface ClientEvent {
    type: string
    data: any
}


const clients: Record<number, Response> = {}


export function longPollingHandler(request: AppRequest, response: Response) {
    response.setHeader("Cache-Control", "no-cache, must-revalidate");
    clients[request.user!.id] = response;
    response.on('close', () => { delete clients[request.user!.id]; });
}

export function emit(event: ClientEvent, userId?: number) {
    for (let id in clients) {
        if (!userId || id === userId + "") {
            clients[id].json(event);
        }
    }
}
