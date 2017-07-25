// Global modules
import { Component, OnInit, OnChanges,
Input, Output, SimpleChanges, EventEmitter,
ViewChild, ElementRef } from '@angular/core';

// Local modules
import { RRDVariables } from '../../modules/RRDVariables';
import { ChannelSettings } from '../../modules/ChannelSettings';
import { TimeSpecs, ResolutionTable } from '../../modules/TimeSpecs';
import { Utility } from '../../modules/Utility';
import { AppConfig } from '../../modules/AppConfig';

// Services
import { ScGraphService} from './sc-graph-render.service';

/*
    NOTE: Dygraph module is not exactly prepared for angular2/typescript
    This constant ensures that typescript type and name control passes for this
    file with the actual Dygraph object being automatically imported in
    resulting js files.
*/
declare const Dygraph: any;

/*
    NOTE: This component renders the graph and allow it to be controlled with custom cursor. This
    cursor relies on onmouse event callbacks placed on DOM elements. But those callbacks need
    direct access to methods and attributes of this compoment. Following global pointer (or rather
    reference, regarding JS language nature) lets me to provide access to needed resources in
    callbacks.
*/
let GraphComponentPtr: any = null;

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
    @Input() renderSettings: string;
    @Input() channels: ChannelSettings[];
    @Input() config: AppConfig;
    @ViewChild('Chart') chart: ElementRef;
    @ViewChild('DygraphsWrapper') wrapper: ElementRef;
    @ViewChild('GraphAreaCursor1') cursor1: ElementRef;
    @ViewChild('GraphAreaCurSpan') curspan: ElementRef;
    @ViewChild('GraphAreaCursor2') cursor2: ElementRef;

    /* 2-WAY DATA BINDING */
    @Input() time: TimeSpecs;
    @Output() timeChange = new EventEmitter();
    @Output() resolutionChange = new EventEmitter();

    /* PRIVATE VARIABLES */
    private _g: any = null;

    /* INTERNAL VARIABLES */
    error: any = null;

    /* CURSOR VARIABLES */
    area: any; ///< Graph area (without labels, axiis and such)
    rows: number; ///< Number of rows
    ppr: number; ///< Pixels per row
    timeOffsetBgn: number; ///< Timestamp of first data point
    timeOffsetStep: number; ///< Timestamp difference between data points

    constructor(private api: ScGraphService) {}

    setDefaultTimeValues() {
        this.time.view.res = 1;
        this.time.view.end = this.getCurrentTimestamp();
        this.time.view.bgn = this.time.view.end - ResolutionTable[this.time.view.res].value;
        this.time.sel.bgn = this.time.view.end - ResolutionTable[this.time.view.res].value / 2;
        this.time.sel.end = this.time.sel.bgn;
    }

    /**
     *  @brief Initializes the time windows and graph object
     *
     *  @details Details
     */
    ngOnInit() {
        // Default case: Time selection was not set by url
        if (this.time.sel.bgn === - 1 && this.time.sel.end === -1) {
            this.setDefaultTimeValues();
        }
        // Time selection (and maybe something more) was set by url
        else {
            // Check whether resolution is set to valid value
            if (this.time.view.res < 0 || this.time.view.res >= ResolutionTable.length) {
                // If not, use default one
                this.time.view.res = 1;
            }

            // Then check whether that resolution can fit selected area
            if ((this.time.sel.end - this.time.sel.bgn) > ResolutionTable[this.time.view.res].value) {
                // If not, expand it
                let mindif: number = this.time.sel.end - this.time.sel.bgn;
                for (let i = this.time.view.res + 1; i < ResolutionTable.length; i++) {
                    if (mindif < ResolutionTable[i].value) {
                        this.time.view.res = i;
                        // Mark as success
                        mindif = 1;
                        break;
                    }
                }

                // No suitable resolution was found
                if (mindif !== 1) {
                    this.setDefaultTimeValues();
                }
            }

            // Finally check whether time window is ok (time selection is within it and resolution
            // fits the time window range)
            if ((this.time.view.end - this.time.view.bgn) !== ResolutionTable[this.time.view.res].value
                || this.time.sel.bgn < this.time.view.bgn || this.time.sel.end > this.time.view.end) {
                // If it is not, centerize
                this.centerizeTimeWindow();
            }
        }

        // Initialize callback reference
        GraphComponentPtr = this;

        this.getData();
    }

    /**
     *  @brief Intercepts update to global variables
     *
     *  @param [in] changes Object with changed variables references
     *
     *  @details Since ngOnChanges triggers before ngOnInit there has to be a
     *  test for skiping this method until graph object is initialized.
     */
    ngOnChanges(changes: SimpleChanges) {
        if (this._g == null) {
            return;
        }

        let reloadData = false;

        for (const x in changes) {
            if (x === 'selectedProfile' || x === 'selectedVar') {
                reloadData = true;
            }
            else if (x === 'renderSettings' && this._g != null) {
                this.changeRenderMode();
            }
        }

        if (reloadData) {
            this.getData();
        }
    }

    /**
     *  @brief Properly set graph object size based on its designated wrapper
     *
     *  @param [in] event Event object for possible debugging
     */
    onResize(event: any) {
        this._g.resize(this.wrapper.nativeElement.clientWidth,
            this.wrapper.nativeElement.clientHeight);

        this.initAreaValues();

        // Set cursors height (this will never change)
        this.cursor1.nativeElement.style.height = this.area.h + 'px';
        this.cursor2.nativeElement.style.height = this.area.h + 'px';
        this.curspan.nativeElement.style.height = this.area.h + 'px';
    }

    /**
     *  @brief Method for ensuring 2-way data binding across the component tree
     *
     *  @details This method emits events for variables time and timeUpdated
     */
    triggerEmitters() {
        this.timeChange.emit(this.time);
    }

    /**
     *  @brief Request to api for graph data
     */
    getData() {
        const LABELS_WIDTH = 70;
        const points = this.wrapper.nativeElement.clientWidth - LABELS_WIDTH;

        this.api.graph(
            this.time.view.bgn,
            this.time.view.end,
            this.selectedProfile,
            RRDVariables[this.selectedVar].id,
            points
        ).subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error)
        );
    }

    /**
     *  @brief Sanitize data format produced by rrdtool to be compatible with
     *  dygraphs library
     *
     *  @param [in] data Data returned from backend (rrdtool)
     *  @return Sanitized data object
     *
     *  @details First column of each data row are UNIX timestamps, convert them
     *  to JS dates. Also prepend dummy label which internally represent column
     *  with timestamps.
     */
    sanitizeData(data: any) {
        // First item of each timeslot is UNIX timestamp
        // Convert it to JS timestamp
        for (const i of data['data']) {
            i[0] = new Date(i[0] * 1000);
        }

        // Create dummy label for first column containing timestamps
        data['meta']['legend'].unshift('x');

        return data;
    }

    /**
     *  @brief Handle for processing retrieved graph data
     *
     *  @param [in] data Object containg all data relevant to dygraphs
     *
     *  @details Data have to be sanitized. If dygraph object is not
     *  initialized, call initGraph, otherwise call updateGraph.
     */
    processData(data: any) {
        data = this.sanitizeData(data);

        if (this._g == null) {
            this.initGraph(data);

            // Register basic callback for setting cursor position
            this.chart.nativeElement.onmousedown = this.moveCursor;
        }
        else {
            this.updateGraph(data);
        }

        const DATA_LEN = data['data'].length;

        this.onResize(null);
        this.initTimeOffsets(data['data'][0][0], data['data'][DATA_LEN - 1][0]);
        this.initCursor();
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

    /**
     *  @brief Create new graph object and pass new data to it
     *
     *  @param [in] data Sanitized data
     *
     *  @details This function is supposed to be called only once when everything is created and
     *  set up. At that point, graph object does not exist and does not have its dimensions defined.
     *  Because of this, this method not only creates the graph object, but also calls the onResize
     *  method to properly set up graph size within its designated wrapper.
     */
    initGraph(data: any) {
        const options = {
            colors: this.getChannelColors(),
            labels: data['meta']['legend'],
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
            // NOTE: labelsUTC: !this.config.useLocalTime,
            labelsUTC: false,
            highlightCircleSize: 5,
            panEdgeFraction: 0.1,
            interactionModel: {},
        };

        this._g = new Dygraph(this.chart.nativeElement, data['data'], options);
    }

    /**
     *  @brief Pass new data to existing graph object
     *
     *  @param [in] data Sanitized data
     *
     *  @details Data, legend, label and render mode are updated.
     */
    updateGraph(data: any) {
        this._g.updateOptions({
            file: data['data'],
            labels: data['meta']['legend'],
            ylabel: RRDVariables[this.selectedVar].name,
            stackedGraph: this.renderSettings === 'stacked',
            fillGraph: this.renderSettings === 'stacked'
        });
    }

    /**
     *  @brief Retrieve array of channel colors from the whole channel array
     *
     *  @return Array with extracted colors
     */
    getChannelColors(): string[] {
        const result: string[] = new Array<string>(this.channels.length);

        for (const i in this.channels) {
            result[i] = this.channels[i].color;
        }

        return result;
    }

    /**
     *  @brief Change visibility of a channel based on control checkboxes from the parent component
     *
     *  @param [in] index Index of channel
     *
     *  @details This method is called from parent component where somehow this method is triggered
     *  prior to actually changing the value of channel checkbox. That's why I have to negate value
     *  of the this.channels[index].checked variable to get the actual current value.
     */
    changeChannelVisibility(index: number) {
        this._g.setVisibility(index, !this.channels[index].checked);
    }

    /**
     *  @brief Changes rendering mode of graph
     *
     *  @details Graph is either stacked with colored areas belonging to each channel or it is in
     *  comparative mode, where channels are only symbolised by lines and all start on the same
     *  level, allowing for quick visual comparison of magnitude of each channel.
     */
    changeRenderMode() {
        this._g.updateOptions({
            stackedGraph: this.renderSettings === 'stacked',
            fillGraph: this.renderSettings === 'stacked'
        });
    }

    /**
     *  @brief Retrieve graph area and initialize auxiliary cursor values
     *
     *  @details We need to know number of displayed rows and distance (in pixels) between them to
     *  properly position cursors.
     */
    initAreaValues() {
        this.area = this._g.getArea();
        this.rows = this._g.numRows();
        this.ppr = this.area.w / (this.rows - 1);
    }


    /**
     *  @brief Initialize auxiliary variables for computing timestamps
     *
     *  @param [in] begin Graph leftmost timestamp (theoretically time.view.bgn)
     *  @param [in] end Graph rightmost timestamp (theoretically time.view.end)
     */
    initTimeOffsets(begin, end) {
        this.timeOffsetBgn = begin.getTime();
        this.timeOffsetStep = (end.getTime() - begin.getTime()) / (this.rows - 1);
    }

    /**
     *  @brief Position cursors based on selected.
     */
    initCursor() {
        this.placeCursorByTime(this.cursor1, this.time.sel.bgn);
        this.placeCursorByTime(this.cursor2, this.time.sel.end);
        this.showHighlight();
    }

    /**
     *  @brief Place highlighting span between both cursors
     *
     *  @param [in] number Parameter_Description
     *  @param [in] number Parameter_Description
     *  @return Return_Description
     *
     *  @details Details
     */
    showHighlight() {
        const rowA = Math.floor((this.time.sel.bgn - this.timeOffsetBgn) / this.timeOffsetStep);
        const rowB = Math.floor((this.time.sel.end - this.timeOffsetBgn) / this.timeOffsetStep);

        this.placeCursor(this.curspan, rowA);
        this.curspan.nativeElement.style.width = ((rowB - rowA) * this.ppr) + 'px';
    }

    /**
     *  @brief Place a cursor to specific row
     *
     *  @param [in] cursor Reference to cursor DOM object
     *  @param [in] row Index of a row
     *
     *  @details If time.sel specifies single timeslot and that timeslot is in border 5% of the
     *  graph, make the current sel a new time window center and reload the whole graph.
     */
    placeCursor(cursor: ElementRef, row: number) {
        cursor.nativeElement.style.left = (this.area.x + row * this.ppr) + 'px';
    }

    /**
     *  @brief Work out new cursor position based on timestamp
     *
     *  @param [in] cursor Reference to cursor DOM object
     *  @param [in] time Timestamp of new cursor position
     */
    placeCursorByTime(cursor: ElementRef, time: number) {
        const row = Math.floor((time - this.timeOffsetBgn) / this.timeOffsetStep);
        this.placeCursor(cursor, row);
    }

    /**
     *  @brief Work out new cursor position based on row and also compute time.sel
     *
     *  @param [in] cursor Reference to cursor DOM object
     *  @param [in] row Index of a row
     */
    placeCursorByRow(cursor: ElementRef, row: number) {
        this.placeCursor(cursor, row);

        this.rowToTime(cursor, row);
    }

    /**
     *  @brief Compute a timestamp from a graph row index and save the result into sel.bgn or sel.end
     *
     *  @param [in] cursor Reference to left/right cursor object
     *  @param [in] row Row index
     *
     *  @details If cursor === cursor1, then result is written to sel.bgn, if cursor === cursor2
     *  then result is written to sel.end
     */
    rowToTime(cursor: ElementRef, row: number) {
        const newtime: number = this.timeOffsetBgn + this.timeOffsetStep * row;

        if (cursor === this.cursor1) {
            this.time.sel.bgn = newtime;
        }
        else if (cursor === this.cursor2) {
            this.time.sel.end = newtime;
        }
    }

    /**
     *  @brief Recenters the graph and reloads the data
     *
     *  @details This method does not care whether interval or single slot is selected, it just
     *  recenters the graph around that.
     */
    centerizeTimeWindow() {
        const now: number = this.getCurrentTimestamp();

        const axis: number = (this.time.sel.end + this.time.sel.bgn) / 2;

        this.time.view.bgn = axis - ResolutionTable[this.time.view.res].value / 2;
        this.time.view.end = axis + ResolutionTable[this.time.view.res].value / 2;

        if (this.time.view.end > now) {
            this.time.sel.bgn = now;
            this.time.sel.end = now;
            this.time.view.end = now;
            this.time.view.bgn = now - ResolutionTable[this.time.view.res].value;
        }

        this.getData();
    }

    /**
     *  @brief Test position of a cursor for border 5%
     *
     *  @details If only single timeslot is selected, the test is performed. If it succeeds, graph
     *  is recentered and reloaded.
     */
    testWindowBoundaries() {
        if (this.time.sel.bgn === this.time.sel.end) {
            const ratio: number = (this.time.sel.bgn - this.time.view.bgn)
                / (this.time.view.end - this.time.view.bgn);

            if (ratio < 0.05 || (ratio > 0.95 && this.time.view.end !== this.getCurrentTimestamp())) {
                this.centerizeTimeWindow();
            }
        }
    }

    /**
     *  @brief Method for handling cursor manipulation via mouse
     *
     *  @details This method is bound by onInit to chart DOM element. Whenever mouse key is pressed
     *  when hovering over graph, mouse position is retrieved. This position is then send to graph
     *  object and timeslot is returned. Cursor is then bound to this timeslot. If the key is not
     *  immediately released, user can drag the mouse and select an interval. When the mouse is
     *  released, signal is sent to rest of the GUI components to make their job (refresh stats etc).
     *  Now if only single timeslot is selected, then this timeslot is tested for position within
     *  the graph. If that position is in border 5% of the area, then this slot will become new
     *  center of the graph and time view is modified accordingly and data are reloaded.
     */
    moveCursor() {
        // Get closest row to current mouse position
        const row: number = GraphComponentPtr._g.getSelection();

        // Assume that user only selected a single timeslot (which is achieved when sel.bgn == sel.end)
        GraphComponentPtr.placeCursorByRow(GraphComponentPtr.cursor1, row);
        GraphComponentPtr.placeCursorByRow(GraphComponentPtr.cursor2, row);
        GraphComponentPtr.showHighlight();

        // Auxiliary handle for right-to-left selection
        let swapped = false;

        // Register drag event function
        GraphComponentPtr.chart.nativeElement.onmousemove = function(eventE) {
            // Get closest row to current mouse position
            const row2: number = GraphComponentPtr._g.getSelection();

            // Check whether user is moving mouse to the left from the first cursor or to the right
            if ((row2 < row && !swapped) || (row2 > row && swapped)) {
                swapped = !swapped; // Set the flag
            }

            // Display cursors at the right positions
            GraphComponentPtr.placeCursorByRow(GraphComponentPtr.cursor1, swapped ? row2 : row);
            GraphComponentPtr.placeCursorByRow(GraphComponentPtr.cursor2, swapped ? row : row2);
            GraphComponentPtr.showHighlight();
        }
        // Register mouse released event function - This stops the cursor movement
        GraphComponentPtr.chart.nativeElement.onmouseup = function() {
            GraphComponentPtr.chart.nativeElement.onmousemove = null;

            // Time selection most probably had changed, propagate
            GraphComponentPtr.triggerEmitters();

            // Test whether cursor is in border 5% of the graph and recenterize if true
            GraphComponentPtr.testWindowBoundaries();
        }
    }

    /**
     *  @brief Change resolution of the time window
     *
     *  @param [in] absolute Whether the value is absolute or relative
     *  @param [in] value Modifier value for time.view.res
     *
     *  @details After properly setting up new resolution (and boundary checks), a single time slot
     *  is selected (axis of current selection) and then graph is recentered and redrawn.
     *
     *  @note I *cannot* keep the selected time window intact simply becase new resolution might be
     *  smaller than selected time window and that would break the app. Hence the selecting single
     *  time slot.
     *
     *  @note This method is supposed to be called from parent component
     */
    changeResolution(absolute: boolean, input: string) {
        const value = parseInt(input, 10);

        if (absolute) {
            this.time.view.res = value;
        }
        else {
            this.time.view.res += value;

            if (this.time.view.res < 0) {
                this.time.view.res = 0;
            }
            else if (this.time.view.res >= ResolutionTable.length) {
                this.time.view.res = ResolutionTable.length - 1;
            }
        }

        const axis: number = (this.time.sel.end + this.time.sel.bgn) / 2;
        this.time.sel.bgn = axis;
        this.time.sel.end = axis;

        this.resolutionChange.emit();

        this.centerizeTimeWindow();
    }

    /**
     *  @brief Retrieve timestamp of the timeslot happening right now
     */
    getCurrentTimestamp(): number {
        const FIXED_TIMESLOT_SIZE = 300000;

        let now: number = new Date().getTime();
        now = now - (now % FIXED_TIMESLOT_SIZE) - FIXED_TIMESLOT_SIZE;

        return now;
    }

    /**
     *  @brief Change position of time window
     *
     *  @param [in] value How to change time window
     *
     *  @details If value is 0, move view to left by size
     *
     *  @note This method is supposed to be called from parent component
     */
    changeTimeWindow(value: number) {
        const now: number = this.getCurrentTimestamp();

        switch (value) {
        case 0: // Move view to left
            this.time.view.bgn -= ResolutionTable[this.time.view.res].value;
            this.time.view.end -= ResolutionTable[this.time.view.res].value;
            this.time.sel.bgn -= ResolutionTable[this.time.view.res].value;
            this.time.sel.end -= ResolutionTable[this.time.view.res].value;
            break;

        case 1: // Move view to right
            this.time.view.bgn += ResolutionTable[this.time.view.res].value;
            this.time.view.end += ResolutionTable[this.time.view.res].value;
            this.time.sel.bgn += ResolutionTable[this.time.view.res].value;
            this.time.sel.end += ResolutionTable[this.time.view.res].value;
            break;

        case 2: // Move view to now
            this.time.sel.bgn = now;
            this.time.sel.end = now;
            this.time.view.end = now;
            this.time.view.bgn = now - ResolutionTable[this.time.view.res].value;
            break;
        }

        this.getData();
    }


    /**
     *  @brief Changes selected time by selecting a single timeslot at a specied day at 00:00
     *
     *  @param [in] event A tuple (year, month, day)
     *
     *  @details Year-Month-Day 00:00 is selected, graph is centerized around that and reloaded.
     */
    changeSelectedTime(event: any) {
        this.time.sel.bgn = new Date(event.year, event.month - 1, event.day).getTime();
        this.time.sel.end = this.time.sel.bgn;

        this.centerizeTimeWindow();
    }
}
