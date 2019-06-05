import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from 'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';
import { ExampleComponent } from './example.component';

const routes: Routes = [{
    path: 'example',
    component: ExampleComponent,
    canActivate: [AuthGuard],
    data: {
        role: 10,
        name: 'Example',
        description: 'desc',
        icon: 'fa-graduation-cap',
    },
    children: []
}]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SafePipeModule,
        RouterModule.forChild(routes),
        NgbModule,
    ],
    declarations: [
	    ExampleComponent
    ],
    providers: [
        SafePipe
    ]
})
export class ExampleModule {}
