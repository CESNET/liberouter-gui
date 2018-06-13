import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map'
import {catchError} from "rxjs/operators";

export class User {
    constructor (
        public first_name = '',
        public last_name = '',
        public username = '',
        public email = '',
        public password = '',
        public role = -1) {}
}

@Injectable()
export class UsersService {

    constructor(private http: HttpClient) { }

    add(user: User) {
        return this.http.post<User>('/users', user)
            .pipe(
                catchError(UsersService.handleError)
            );
    }

    remove(id: string) {
        return this.http.delete('/users/' + id)
            .pipe(
                catchError(UsersService.handleError)
            );
    }

    list() {
        return this.http.get<User[]>('/users')
            .pipe(
                catchError(UsersService.handleError)
            );
    }

    get(id: String) {
        return this.http.get<User>('/users/' + id)
            .pipe(
                catchError(UsersService.handleError)
            );
    }

    update(id: String, user: Object) {
        return this.http.put('/users/' + id, user)
            .pipe(
                catchError(UsersService.handleError)
            );
    }
    static handleError(err: Response | any) {
        return Promise.reject(err);
    }

}

