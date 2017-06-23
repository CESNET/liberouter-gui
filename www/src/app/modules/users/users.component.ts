import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { UsersService } from './users.service';

@Component({
    selector : 'users',
    template : `<router-outlet></router-outlet>`
})
export class UsersComponent {};
