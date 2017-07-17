import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RRDVariables } from '../../modules/RRDVariables';
import { TimeSpecs, TimeSelection, TimeView, ResolutionTable } from '../../modules/TimeSpecs';
import { ScThumbsService } from './sc-graph-thumbs.service';
import { ScThumbRendererComponent } from './sc-thumb-renderer/sc-thumb-renderer.component';

class Thumbnail {
    label: string;
    data: any;
};

@Component({
  selector: 'sc-graph-thumbs',
  templateUrl: './sc-graph-thumbs.component.html',
  styleUrls: ['./sc-graph-thumbs.component.scss'],
  providers: [ScThumbsService],
})
export class ScGraphThumbsComponent {
    @Input() time: TimeSpecs;
    @Input() selectedProfile: string;
    @Input() selectedVar: number;
    @Output() onVarSelect = new EventEmitter<number>();

    thumbnails = null;
    error = null;

    constructor(public modalService: NgbModal, private api: ScThumbsService) {}

    /**
     *  @brief Initializes the thumbnails array and request SVG data
     *
     *  @details Details
     */
    getThumbnails() {
        this.thumbnails = new Array<Thumbnail>(RRDVariables.length);

        for (let i = 0; i < RRDVariables.length; i++) {
            this.thumbnails[i] = { label: RRDVariables[i].name, data: null};

            this.api.thumb(
                this.time.view.bgn,
                this.time.view.end,
                this.selectedProfile,
                RRDVariables[i].id,
                100
            ).subscribe(
                (data: Object) => this.processThumbnailData(data, i),
                (error: Object) => this.processError(error)
            );
        }
    }

    getRRDConstant() {
        return RRDVariables[this.selectedVar];
    }

    /**
     *  @brief Processes retrieved thumbnail data
     *
     *  @param [in] data JSON containing SVG data
     *  @param [in] index index of thumbnail
     */
    processThumbnailData(data: any, index: number) {
        this.thumbnails[index].data = data['data'];
    }

    /**
     *  @brief Processes thumbnail retrieval error
     */
    processError(error: any) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving graph:');
        console.error(error);
    }

    changeSelectedVar(index: number) {
        this.onVarSelect.emit(index);
    }
}
