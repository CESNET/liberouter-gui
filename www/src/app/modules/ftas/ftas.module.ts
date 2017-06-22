import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from 'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { FtasComponent } from './ftas.component';
import { FtasModalComponent } from './ftas-modal/ftas-modal.component'

const ftasRoutes: Routes = [{
    path : 'ftas',
    component : FtasComponent,
    canActivate : [AuthGuard],
    data : {
        role : 10,
        name : 'FTAS',
        description : 'Flow-based Traffic Analysis System',
        icon : 'fa-first-order'
    }
}]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SafePipeModule,
    NgbModule.forRoot(),
    RouterModule.forChild(ftasRoutes)
  ],
  declarations: [
    FtasComponent,
    FtasModalComponent
  ],
  providers : [
    SafePipe
  ],
  entryComponents : [
    FtasModalComponent
  ]
})
export class FtasModule { }
