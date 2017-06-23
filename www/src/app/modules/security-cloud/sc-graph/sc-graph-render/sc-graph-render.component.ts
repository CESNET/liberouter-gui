// Global modules
import { Component, OnInit, OnChanges,
Input, Output, SimpleChanges, EventEmitter,
ViewChild, ElementRef } from '@angular/core';

// Local modules
import { RRDVariables } from '../../modules/RRDVariables';
import { ScGraphService} from './sc-graph-render.service';
import { TimeSpecs } from '../../modules/TimeSpecs';
import { Utility } from '../../modules/Utility';

// Services
import { ChannelSettings } from '../sc-graph.component';

/*
    NOTE: Dygraph module is not exactly prepared for angular2/typescript
    This constant ensures that typescript type and name control passes for this
    file with the actual Dygraph object being automatically imported in
    resulting js files.
*/
declare const Dygraph: any;

@Component({
    selector: 'sc-graph-render',
    templateUrl: './sc-graph-render.component.html',
    styleUrls: ['./sc-graph-render.component.scss'],
    providers: [ScGraphService],
    host: {
        '(window:resize)': 'onResize($event)'
    }
})
export class ScGraphRenderComponent implements OnInit, OnChanges {
    /* EXTERNAL VARIABLES */
    @Input() selectedProfile: string;
    @Input() selectedVar: number;
    @Input() channels: ChannelSettings[];
    @Input() renderSettings: string;
    @ViewChild('chart') chart: ElementRef;
    @ViewChild('dygraphsWrapper') wrapper: ElementRef;

    /* 2-WAY DATA BINDING */
    @Input() time: TimeSpecs;
    @Output() timeChange = new EventEmitter();
    @Input() timeUpdated: boolean;
    @Output() timeUpdatedChange = new EventEmitter();

    /* PRIVATE VARIABLES */
    private _g: any;

    /* INTERNAL VARIABLES */
    error: any = null;

    constructor(private api: ScGraphService) {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        let reloadData = false;
        let reloadChan = false;

        for (let x in changes) {
            if (x === 'selectedProfile' || x === 'selectedVar' || x === 'timeUpdated') {
                reloadData = true;
            }
            else if (x === 'channels') {
                reloadChan = true;
            }
        }

        if (reloadData) {
            this.getData();
        }
        // if (reloadChan) this.setChan();
    }

    onResize(event: any) {
        this._g.resize(this.wrapper.nativeElement.clientWidth
        , this.wrapper.nativeElement.clientHeight);
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
     *  @brief Request to api for graph data
     */
    getData() {
        const points = 1000;
        this.api.graph(this.time.view.bgn, this.time.view.end, this.selectedProfile
        , RRDVariables[this.selectedVar].id, points).subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error));
    }

    /* TODO: This function should be implemented on the higher level component
       because there are other components that want to know colours of channels.
       also - better algorithm would be nice */
    generateColors(num: number): string[] {
        let result: string[] = new Array<string>(num);

        const step: number = 360 / num;

        for (let i = 0; i < num; i++) {
            result[i] = 'hsl(' + String(step * i) + ', 75%, 50%';
        }

        return result;
    }

    /**
     *  @brief Handle for processing retrieved graph data
     *
     *  @param [in] any Object containg all data relevant to dygraphs
     *
     *  @details Timestamps in the data array are UNIX, they have to be converted
     *  to JS timestamps. Also options for dygraph should be specified here.
     */
    processData(data: any) {
        for (let i of data['data']) {
            // First item of each timeslot is UNIX timestamp
            // Convert it to JS timestamp
            i[0] = new Date(i[0] * 1000);
        }

        let legend = data['meta']['legend'];
        legend.unshift('x');

        const options = {
            colors: this.generateColors(legend.length - 1),
            labels: legend,
            ylabel: RRDVariables[this.selectedVar].name,
            axes : {
                y : { axisLabelWidth: 70 },
                x : {
                    valueFormatter: function(d) {
                        return Utility.JStimestampToNiceReadable(d);
                    }
                }
            },
            stackedGraph: this.renderSettings === 'stacked',
            fillGraph: this.renderSettings === 'stacked',
            labelsKMG2: true,
            labelsUTC: true, // TODO: Local vs UTC
            highlightCircleSize: 5,
            panEdgeFraction: 0.1,
            interactionModel: {},
        };

        // NOTE: Creating and destroying dygraph each time new data are received
        // is needlessly expensive, differentiate between init and update
        this._g = new Dygraph(this.chart.nativeElement, data['data'], options);
        this.onResize(null);
    }

    /**
     *  @brief Handle for processing errors from graph data retrieval
     *
     *  @param [in] error Object containing error message
     */
    processError(error: any) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving graph:');
        console.error(error);
    }
}
