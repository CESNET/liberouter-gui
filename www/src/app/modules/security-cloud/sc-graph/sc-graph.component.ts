// Global modules
import { Component, Input, Output,
OnInit, OnChanges, EventEmitter, SimpleChanges } from '@angular/core';

// Local modules
import { ProfileMap, Channel } from '../modules/Profile';
import { TimeSpecs, TimeSelection, TimeView } from '../modules/TimeSpecs';
import { RRDVariables } from '../modules/RRDVariables';
import { Utility } from '../modules/Utility';

export class ChannelSettings {
    name: string;
    checked: boolean;
}

@Component({
    selector: 'sc-graph',
    templateUrl: './sc-graph.component.html',
    styleUrls: ['./sc-graph.component.scss']
})
export class ScGraphComponent implements OnInit, OnChanges {
    /* EXTERNAL VARIABLES */
    @Input() profiles: ProfileMap;
    @Input() selectedProfile: string;

    /* 2-WAY DATA BINDING */
    @Input() time: TimeSpecs;
    @Output() timeChange = new EventEmitter(); // this.timeChange.emit(this.time)
    @Input() timeUpdated: boolean;
    @Output() timeUpdatedChange = new EventEmitter();

    /* INTERNAL VARIABLES */
    selectedVar = 0; ///< Index to RRDVariables
    channels: ChannelSettings[]; ///< ngModel for channel checkboxes
    pickerDate; ///< ngModel for datepicker

    renderSettings = 'stacked';

    constructor() { }

    ngOnInit() { }

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
            this.channels.push({name: channel.name, checked: true});
        }
    }

    /**
     *  @brief Method for ensuring 2-way data binding across the component tree
     *
     *  @details This method emits events for variables time and timeUpdated
     */
    triggerEmitters() {
        this.timeChange.emit(this.time);
        this.timeUpdated = !this.timeUpdated;
        this.timeUpdatedChange.emit(this.timeUpdated);
    }

    /**
     *  @brief Handle for updating selected times based on datepicker
     *
     *  @param [in] event Object with attributes year, month, day. There specify
     *  new selected timeslot
     *
     *  @details View frame must be aligned in a way that selected interval is
     *  in the middle.
     */
    pickerChanged(event: any) {
        // Selecting only single timeslot
        this.time.sel.bgn = new Date(event.year, event.month, event.day).getTime();
        this.time.sel.end = this.time.sel.bgn;

        // Cursor will be in center of the view
        this.time.view.bgn = this.time.sel.bgn - this.time.view.res / 2;
        this.time.view.end = this.time.sel.bgn + this.time.view.res / 2;

        // Since ngOnChanges does not catch update from the inside
        this.triggerEmitters();
    }

    getRRDConstant() {
        return RRDVariables[this.selectedVar];
    }
}
