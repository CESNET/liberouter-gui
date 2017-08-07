// Global modules
import { Component, Input, Output,
OnInit, OnChanges, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import {NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

// Local modules
import { ProfileMap, Channel } from '../modules/Profile';
import { TimeSpecs, TimeSelection, TimeView, ResolutionTable } from '../modules/TimeSpecs';
import { RRDVariables } from '../modules/RRDVariables';
import { Utility } from '../modules/Utility';
import { ChannelSettings, ChannelSettingsBuilder } from '../modules/ChannelSettings';
import { AppConfig } from '../modules/AppConfig';
import { ScGraphRenderComponent } from './sc-graph-render/sc-graph-render.component';
import { ScGraphThumbsComponent } from './sc-graph-thumbs/sc-graph-thumbs.component';

@Component({
    selector: 'sc-graph',
    templateUrl: './sc-graph.component.html',
    styleUrls: ['./sc-graph.component.scss'],
    providers: [NgbDatepickerConfig]
})
export class ScGraphComponent implements OnInit, OnChanges {
    /* EXTERNAL VARIABLES */
    @Input() profiles: ProfileMap;
    @Input() selectedProfile: string;
    @Input() config: AppConfig;
    @Input() channels: ChannelSettings[] = null; ///< ngModel for channel checkboxes
    @ViewChild('RenderComponent') renderComponent: ScGraphRenderComponent;
    @ViewChild('ThumbsComponent') thumbsComponent: ScGraphThumbsComponent;

    /* 2-WAY DATA BINDING */
    @Input() time: TimeSpecs;
    @Output() timeChange = new EventEmitter(); // this.timeChange.emit(this.time)

    /* INTERNAL VARIABLES */
    selectedVar = 0; ///< Index to RRDVariables
    pickerDate; ///< ngModel for datepicker
    resolutionTable = ResolutionTable; ///< Make the table visible to template
    selectedResolution: string; ///< Auxiliary handle for ngModel. Only graph-render can modify view.res

    renderSettings = 'stacked';

    constructor(dpconf: NgbDatepickerConfig) {
        const date = new Date();

        dpconf.maxDate = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    }

    ngOnInit() {
        // At this point, sc-graph-render component is not created yet and thus I can't do this via
        // this.changeResolution()
        this.selectedResolution = '1';
        this.time.view.res = parseInt(this.selectedResolution, 10);
    }

    /**
     *  @brief Handle external changes to @Input based variables
     *
     *  @param [in] changes Dictionary with changed variables
     *
     *  @details If selectedProfile was changed, then ChannelSettings list must
     *  be rebuilt. If selected times were changed, then textbox for printing
     *  them has to be updated. FrameTime changes are handled by graph-render.
     */
    ngOnChanges(changes: SimpleChanges) {}

    /**
     *  @brief Method for ensuring 2-way data binding across the component tree
     *
     *  @details This method emits events for variables time and timeUpdated
     */
    triggerEmitters() {
        this.timeChange.emit(this.time);
    }

    /**
     *  @brief Handle time change propagated from graph-render
     */
    handleTimeChangePropagation(event: any) {
        this.timeChange.emit(this.time);
    }

    /**
     *  @brief Handle for updating selected times based on datepicker
     *
     *  @param [in] event Object with attributes year, month, day. There specify
     *  new selected timeslot
     *
     *  @details Calls designated method in child component
     */
    pickerChanged(event: any) {
       this.renderComponent.changeSelectedTime(event);
    }

    updateResolutionPtr(event: any) {
        this.selectedResolution = this.time.view.res.toString();
    }

    /**
     *  @brief Handle for catching emitted event from sc-graph-thumbs
     */
    changeVar(index: number) {
        this.selectedVar = index;
    }

    changeChannelVisibility(i: number) {
        this.renderComponent.changeChannelVisibility(i);
    }
}
