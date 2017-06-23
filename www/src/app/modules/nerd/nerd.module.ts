import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from 'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { NerdComponent } from './nerd.component';
import { NerdModalComponent } from './nerd-modal/nerd-modal.component'

const routes: Routes = [{
    path : 'nerd',
    component : NerdComponent,
    canActivate : [AuthGuard],
    data : {
        role : 10,
        name : 'NERD',
        description : 'Network Entity Reputation Database',
        icon : 'fa-user-secret'
    }
}]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SafePipeModule,
    NgbModule.forRoot(),
    RouterModule.forChild(routes)
  ],
  declarations: [
    NerdComponent,
    NerdModalComponent
  ],
  providers : [
    SafePipe
  ],
  entryComponents : [
    NerdModalComponent
  ]
})
export class NerdModule { }
