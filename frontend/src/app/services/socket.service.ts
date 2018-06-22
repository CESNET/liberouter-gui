import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import * as socketIo from 'socket.io-client';

@Injectable()
export class SocketService {
    private socket;

    constructor() {
        console.log('initSocket ' + window.location.origin);
        this.socket = socketIo(window.location.origin);
    }

    send(event: string, message: any = null) {
        if (message) {
            this.socket.emit(event, message);
        } else {
            this.socket.emit(event);
        }
    }

    subscribe(event: string) {
        return new Observable<any>(observer => {
            this.socket.on(event, (data) => observer.next(data));
        });
    }

    unsubscribe(event: string) {
        this.socket.removeListener(event)
    }
}