import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from 'app/services/app-config.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    modules: Array<Object> = [];
    enabledModules : Object;

    constructor(private router: Router,
               private appConfig : AppConfigService) {}

    ngOnInit() {
        // Inspect all available routes and find all modules
        this.appConfig.get().subscribe(data => {
            this.enabledModules = data['modules'];
            for (const route of this.router.config ) {
                if (route.data && route.data['name']) {
                    route.data['path'] = route.path;
                    this.modules.push(route.data);
                }
            }
        })
    }
}
