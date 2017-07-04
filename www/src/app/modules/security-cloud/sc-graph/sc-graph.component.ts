// Global modules
import { Component, Input, Output,
OnInit, OnChanges, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import {NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

// Local modules
import { ProfileMap, Channel } from '../modules/Profile';
import { TimeSpecs, TimeSelection, TimeView, ResolutionTable } from '../modules/TimeSpecs';
import { RRDVariables } from '../modules/RRDVariables';
import { Utility } from '../modules/Utility';
import { ScGraphRenderComponent } from './sc-graph-render/sc-graph-render.component';

export class ChannelSettings {
    name: string;
    checked: boolean;
    color: string;
}

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
    @ViewChild('RenderComponent') renderComponent: ScGraphRenderComponent;

    /* 2-WAY DATA BINDING */
    @Input() time: TimeSpecs;
    @Output() timeChange = new EventEmitter(); // this.timeChange.emit(this.time)

    /* INTERNAL VARIABLES */
    selectedVar = 0; ///< Index to RRDVariables
    channels: ChannelSettings[]; ///< ngModel for channel checkboxes
    pickerDate; ///< ngModel for datepicker
    resolutionTable = ResolutionTable; ///< Make the table visible to template
    selectedResolution = 0; ///< Auxiliary handle for ngModel. Only graph-render can modify view.res

    renderSettings = 'stacked';

    constructor(dpconf: NgbDatepickerConfig) {
        const date = new Date();
        
        dpconf.maxDate = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    }

    ngOnInit() {
        this.selectedResolution = this.time.view.res;
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
    ngOnChanges(changes: SimpleChanges) {
        for (let x in changes) {
            if (x === 'selectedProfile') {
                this.buildChannels();
            }
        }
    }
    
    generateChannelColors() {
        const step: number = 360 / this.channels.length;
        let i = 0;
        
        for (let channel of this.channels) {
            channel.color = 'hsl(' + String(step * i) + ', 75%, 50%';
            i++;
        }
    }

    /**
     *  @brief Create control array for filtering channels displayed in graph
     *
     *  @details Checkboxes for filtering displayed channels are bound to
     *  this.channels. It's a list of names of a current profile and
     *  a boolean values meaning displayed/hidden.
     */
    buildChannels() {
        // Get list of channels of a current profile
        const rawChannels: Channel[] = this.profiles.getProfile(this.selectedProfile).channels;

        // Forget any previous content, create new array
        this.channels = new Array<ChannelSettings>();
        for (let channel of rawChannels) {
            this.channels.push({name: channel.name, checked: true, color: '#000'});
        }
        
        this.generateChannelColors();
    }

    /**
     *  @brief Method for ensuring 2-way data binding across the component tree
     *
     *  @details This method emits events for variables time and timeUpdated
     */
    triggerEmitters() {
        this.timeChange.emit(this.time);
    }

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

    resolutionChanged(newResolution) {
        this.selectedResolution = newResolution;
        this.renderComponent.changeResolution(true, this.selectedResolution);
    }
    
    getRRDConstant() {
        return RRDVariables[this.selectedVar];
    }
}
