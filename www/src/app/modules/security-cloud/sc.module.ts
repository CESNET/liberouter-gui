import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from 'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { SecurityCloudComponent, ScWorkbenchComponent } from './sc.component';
import { ScGraphComponent } from './sc-graph/sc-graph.component';
import { ScStatsComponent } from './sc-stats/sc-stats.component';
import { ScDbqryComponent } from './sc-dbqry/sc-dbqry.component';
import { ScDbqryFdisthelpComponent } from './sc-dbqry/sc-dbqry-fdisthelp/sc-dbqry-fdisthelp.component';
import { OutputVolumeConversionPipe } from './modules/OutputVolumeConversionPipe';
import { ScGraphRenderComponent } from './sc-graph/sc-graph-render/sc-graph-render.component';
import { ScGraphThumbsComponent } from './sc-graph/sc-graph-thumbs/sc-graph-thumbs.component';
import { ScThumbRendererComponent } from './sc-graph/sc-graph-thumbs/sc-thumb-renderer/sc-thumb-renderer.component';
import { ScProfileManagerComponent } from './sc-profile-manager/sc-profile-manager.component';
import { ScViewModalComponent } from './sc-profile-manager/sc-view-modal/sc-view-modal.component';
import { ScCreateModalComponent } from './sc-profile-manager/sc-create-modal/sc-create-modal.component';
import { ScDeleteModalComponent } from './sc-profile-manager/sc-delete-modal/sc-delete-modal.component';
import { ScDbqryIplookupComponent } from './sc-dbqry/sc-dbqry-iplookup/sc-dbqry-iplookup.component';

const routes: Routes = [{
    path: 'security-cloud',
    component: SecurityCloudComponent,
    canActivate: [AuthGuard],
    data: {
        role: 10,
        name: 'Security Cloud',
        description: 'Distributed, highly available IP flow record collector.',
        icon: 'fa-cloud'
    },
    children: [
        {
            path: 'workbench',
            component: ScWorkbenchComponent,
            canActivate : [AuthGuard],
            data: {
                role : 10
            }
        },
        {
            path: 'profileManager',
            component: ScProfileManagerComponent,
            canActivate : [AuthGuard],
            data: {
                role : 10
            }
        }
    ]
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
        SecurityCloudComponent,
        ScWorkbenchComponent,
        ScGraphComponent,
        ScStatsComponent,
        ScDbqryComponent,
        ScDbqryFdisthelpComponent,
        OutputVolumeConversionPipe,
        ScGraphRenderComponent,
        ScGraphThumbsComponent,
        ScThumbRendererComponent,
        ScProfileManagerComponent,
        ScViewModalComponent,
        ScCreateModalComponent,
        ScDeleteModalComponent,
        ScDbqryIplookupComponent
    ],
    providers: [
        SafePipe
    ]
})
export class SecurityCloudModule { }
