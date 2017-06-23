import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { EventsService } from './events.service';

import { EventItemComponent } from './event-item/event-item.component';

@Component({
    selector: 'nemea-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.scss'],
    providers : [EventsService]
})
export class EventsComponent implements OnInit {

    events: any;
    remaining: Object = {
        total : -1
    }

    from_date: NgbDateStruct;
    from_time: NgbTimeStruct;
    to_date: NgbDateStruct;
    to_time: NgbTimeStruct;

    private now = new Date();

    query: Object;

    loadBtn = 'LOAD';
    error;
    totalWhitelisted = 0;
    public hideWhitelisted = false;

    constructor(private eventsService: EventsService,
                private router: Router,
                private route: ActivatedRoute) { }

    ngOnInit() {
        this.loadBtn = 'LOADING...';

        // Get all URL params
        this.route.queryParams.subscribe((params: Params) => {
            this.reset(params);

            // none are set, we can continue to fetch last 100 events
            if (!Object.keys(params).length) {
                this.eventsService.last_events(100).subscribe(
                    (data) => {
                        this.events = data;
                        this.loadBtn = 'LOAD';
                        this.countWhitelisted();
                    },
                    (error: Object) => this.processError(error)
                );
            } else {
                this.runQuery();
            }
        });
    }

    private processData(data: any) {
        this.remaining = data.pop();
        this.events = data;
        this.loadBtn = 'LOAD';
        this.countWhitelisted();
    }

    private appendData(data: any) {
        this.remaining = data.pop();
        this.events = this.events.concat(data);
        this.loadBtn = 'LOAD';
        this.countWhitelisted();
    }


    private processError(error: Object) {
        console.log(error);
        this.error = error;
        this.loadBtn = 'LOAD';
        this.setParams();
    }

    /**
      * generate params to query and route, this includes navigating to same route which
      * doesn't trigger reloading of the route
      *
      * The dates are kept in miliseconds since we are working in JS and only
      * when going to the API they are floored to seconds
      */
    private params() {
        console.log('setting params');

        const fromDate = this.createDate(this.query['from']);
        const toDate = this.createDate(this.query['to']);

        // Date is ommitted and will be deducted from the 'from' field
        return {
            from : fromDate.getTime(),
            to : toDate.getTime(),
            description : this.query['description'] || null,
            category : this.query['category'] || null,
            orderby : this.query['orderby'] || null,
            dir : this.query['dir'],
            limit : this.query['limit'],
            scrip : this.query['srcip'] || null,
            dstip : this.query['dstip'] || null
        }

    }

    /**
      * Navigate to same route which triggers reinitialization of the route
      */
    public setParams() {
        this.router.navigate(['nemea/events'], {queryParams : this.params()});
    }

    public resetParams() {
        this.remaining['total'] = -1;

        this.router.navigate(['nemea/events'], {queryParams : {}});
    }

    reset(params = {}) {
        const from_time = params['from'] ? new Date(+params['from']) : new Date();
        const to_time = params['to'] ? new Date(+params['to']) : new Date();

        console.log(from_time)

        this.query = {
            from : {
                year: from_time.getFullYear(),
                month: from_time.getMonth(),
                day: from_time.getDate(),
                hour: (from_time.getHours() - 1),
                minute: from_time.getMinutes()
            },
            to : {
                year: to_time.getFullYear(),
                month: to_time.getMonth(),
                day: to_time.getDate(),
                hour: to_time.getHours(),
                minute: to_time.getMinutes()
            },
            description : params['description'] || '',
            category : params['category'] || '',
            orderby : params['orderby'] || 'DetectTime',
            dir : params['dir'] || -1,
            limit : params['limit'] || 100,
            srcip : params['srcip'] || '',
            dstip : params['srcip'] || ''
        }

        this.from_date = {
            year: from_time.getFullYear(),
            month: from_time.getMonth(),
            day: from_time.getDate()
        }
        this.from_time = {
            hour : (from_time.getHours() - 1),
            minute : from_time.getMinutes(),
            second : 0
        }

        this.to_date = {
            year: to_time.getFullYear(),
            month: to_time.getMonth(),
            day: to_time.getDate()
        }
        this.to_time = {
            hour : to_time.getHours(),
            minute : to_time.getMinutes(),
            second : 0
        }
    }

    runQuery(append = false) {
        this.loadBtn = 'LOADING...';

        const queryParams = this.params();
        console.log(queryParams)

        // Convert to unix timestamp (second)
        queryParams['to'] = Math.floor(queryParams['to']/1000)
        queryParams['from'] = Math.floor(queryParams['from']/1000)

        // Inital load of events and we need deeper history
        if (append) {
            queryParams['dir'] = (-1);
            queryParams['from'] = null;
        }

        console.log(queryParams);

        this.eventsService.query(queryParams).subscribe(
            (data) => {
                if (append) {
                    this.appendData(data);
                } else {
                    this.processData(data);
                }
            },
            (error: Object) => this.processError(error));
    }

    getNext(time: number) {
        console.log('getnext')
        const date = new Date(time);
        this.query['to'] = {
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate(),
                hour : date.getHours(),
                minute : date.getMinutes()
            }

        this.runQuery(true);
    }

    private countWhitelisted() {
        for (const item of this.events) {
            try {
                if (item['_CESNET']['Whitelisted'] === 'True') {
                    this.totalWhitelisted += 1;
                }
            } catch(e) {
                continue;
            }
        }
    }

    /**
      * Manually adjust date in query since we are using it as a composite
      * for both the date and time
      */
    selectDateFrom(event) {
        if (event['hour'] && event['minute']) {
            this.query['from']['hour'] = event['hour'];
            this.query['from']['minute'] = event['minute'];
        } else {
            this.query['from']['year'] = event['year'];
            this.query['from']['month'] = event['month'];
            this.query['from']['day'] = event['day'];
        }
    }

    selectDateTo(event) {
        if (event['hour'] && event['minute']) {
            this.query['to']['hour'] = event['hour'];
            this.query['to']['minute'] = event['minute'];
        } else {
            this.query['to']['year'] = event['year'];
            this.query['to']['month'] = event['month'];
            this.query['to']['day'] = event['day'];
        }
    }

    createDate(date: Object) {
        const now = new Date();
        const newdate = new Date(date['year'] || now.getFullYear(),
                       date['month'] || now.getMonth(),
                       date['day'] || now.getDate(),
                       date['hour'] || now.getHours(),
                       date['minute'] || now.getMinutes())
        return newdate;
    }
}
