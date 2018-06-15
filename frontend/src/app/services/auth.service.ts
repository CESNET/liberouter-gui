import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import 'rxjs/add/operator/map'
import { catchError, tap} from "rxjs/operators";
import { SocketService } from "./socket.service";

@Injectable()
export class AuthService {

    constructor(private http: HttpClient, private socket: SocketService) { }

    login(username: string, password: string) {
        return this.http.post<object>('/authorization', { username: username, password: password })
            .pipe(
                tap((resp: object) => {
                    this.setLocalStorage(resp);
                    this.socket.send('login', resp['session_id']);
                    }),
                catchError(this.handleError)
            );
    }

    setLocalStorage(resp: object) {
        // This should probably be replaced by a more secure method.
        // Storing session id in localStorage is problematic, when XSS attack happens.
        localStorage.setItem('session_id', resp['session_id']);
        localStorage.setItem('user', JSON.stringify(resp['user']));
    }

    logout() {
        // remove user from local storage to log user out
        const user = JSON.parse(localStorage.getItem('user'));
        this.socket.send('logout');
        return this.http.delete('/authorization');
    }

    checkSession() {
        return this.http.get<object>('/authorization')
            .pipe(
                //tap((res: object) => console.log(res)),
                catchError(this.handleError)
            );
    }

    admin(user: Object) {
        return this.http.post<Object>('/setup', user)
            .catch(this.handleError);
    }

    private handleError(err: HttpResponse<any> | any) {
        return Promise.reject(err);
    }
}
