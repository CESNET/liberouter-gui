// Global modules
import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';

// Local modules
import { ProfileMap } from '../modules/Profile';
import { TimeSelection } from '../modules/TimeSpecs';
import { ChannelSettings, ChannelSettingsBuilder } from '../modules/ChannelSettings';
import { AppConfig } from '../modules/AppConfig';

// Services
import { ScDbqryService } from './sc-dbqry.service';

@Component({
    selector: 'sc-dbqry',
    templateUrl: './sc-dbqry.component.html',
    styleUrls: ['./sc-dbqry.component.scss'],
    providers: [ ScDbqryService ]
})
export class ScDbqryComponent implements OnInit, OnChanges {
    /* EXTERNAL VARIABLES */
    @Input() profiles: ProfileMap;
    @Input() selectedProfile: string;
    @Input() sel: TimeSelection;
    @Input() config: AppConfig;
    @Input() filter: string; ///< Filter textarea model
    @ViewChild('IPLookup') iplookupComponent;

    /* INTERNAL VARIABLES */
    channels: ChannelSettings[] = null; ///< Channel checkboxes model

    limitto = [ ///< LimitTo dropdown model
        {value: '-l 10', desc: '10 records'},
        {value: '-l 20', desc: '20 records'},
        {value: '-l 50', desc: '50 records'},
        {value: '-l 100', desc: '100 records'},
        {value: '-l 200', desc: '200 records'},
        {value: '-l 500', desc: '500 records'},
        {value: '-l 1000', desc: '1000 records'},
        {value: '-l 2000', desc: '2000 records'},
        {value: '-l 5000', desc: '5000 records'},
        {value: '-l 10000', desc: '10000 records'}
    ];
    selectedLimit = '-l 10'; ///< Selection index to limitto
    fields = null; ///< Aggregation model
    selectedOrderBy = '';
    selectedOrderDir = '';
    selectedAggregation = '';
    selectedOutputFmt = 'pretty';
    nosummary = false; ///< No summary checkbox model
    customOpts: string = null;

    btnQuery = {
        label: 'Start query',
        querying: true,
        style: 'btn btn-secondary btn-block'
    };
    instanceID: string = null; ///< Identifier of the browser tab
    progressStyle; ///< Styler of progress bar
    timer = null; ///< Handle for setInterval trigger

    toPrint_command: string = null; ///< Result text model
    toPrint_stdout: string = null; ///< Result text model
    toPrint_stderr: string = null; ///< Result text model

    error: any = null;

    /**
     *  @brief Create unique ID for this browser tab
     *
     *  @note https://stackoverflow.com/a/105074/6603609
     */
    private generateInstanceID(): string {
        function s4(): string {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    constructor(private api: ScDbqryService) { }

    ngOnInit() {
        this.api.fields().subscribe(
            (data: Object) => this.processFieldsData(data),
            (error: Object) => this.processError(error)
        );

        this.instanceID = this.generateInstanceID();
    }

    ngOnChanges(changes: SimpleChanges) {
        for (let x in changes) {
            if (x === 'selectedProfile') {
                this.channels = ChannelSettingsBuilder.init(this.profiles, this.selectedProfile);
            }
        }
    }

    /**
     *  @brief Method for changing query button from Start query to Kill query and back with proper
     *  styling and such.
     *
     *  @note Kill query button should have red color (btn-danger) to indicate potential risk for
     *  the user.
     */
    btnQueryChange() {
        if (this.btnQuery.querying) {
            this.btnQuery = {
                label: 'Kill query',
                querying: false,
                style: 'btn btn-danger btn-block'
            };
        }
        else {
            this.btnQuery = {
                label: 'Start query',
                querying: true,
                style: 'btn btn-secondary btn-block'
            };
        }
    }

    /**
     *  @brief Handle method for query button click
     *
     *  @param [in] event
     *
     *  @details If btnQuery.querying is true, then filter, arguments and channels are formatted as
     *  strings and are send to backend as query parameters. Otherwise, message for killing query
     *  is send. Proper response handles are registered.
     */
    btnQueryClick(event: any) {
        if (this.btnQuery.querying) {
            const filter: string = this.getFilter();
            let args: string;

            if (this.customOpts == null) {
                args = this.getArgs();
            }
            else {
                args = this.customOpts;
            }

            const channels: string = this.getSelectedChannels();

            this.api.queryStart(this.selectedProfile, this.instanceID, filter, args, channels).subscribe(
                (data: Object) => this.processQueryStarted(data),
                (error: Object) => this.processError(error)
            );
        }
        else { // Killing query
            this.api.queryKill(this.instanceID).subscribe(
                (data: Object) => this.processQueryKilled(data),
                (error: Object) => this.processError(error)
            );
        }
    }

    /**
     *  @brief Get contents of filter textarea
     *
     *  @return Formatted string
     */
    getFilter(): string {
        return this.filter;
    }

    /**
     *  @brief Convert JS timestamp to UNIX one (as string)
     *
     *  @param [in] number JS timestamp
     *  @return String representation of UNIX timestamp
     *
     *  @note Nfcapd files are always 1 hour behind rrdgraphs. i.e.: if you're pointing at 14:00
     *  hours, fdistdump will query file ending with 1300. This is ok when ipfixcol generates the
     *  data, but when using replay, those two times are aligned. Computing additional offset solves
     *  that issue by artificially adjusting the timestamp.
     *
     *  @details Description within the note was copied from old implementation of the SCGUI. It
     *  refers to batch of auxiliary scripts I've written that allows to generate graphs from existing
     *  nfcapd files (since when you have only nfcapd files, there's no way to replay them through
     *  ipfixcol and even if you'll do that, you'll mess original timestamps).
     */
    asUnixTimestamp(time: number): string {
        const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

        if (this.config.historicData) {
            time += MILLISECONDS_PER_HOUR;
        }

        return (time / 1000).toString();
    }

    /**
     *  @brief Get options from quick select/custom textarea boxes
     *
     *  @return Formatted string
     *
     *  @details The options are specifying limit, time range, aggregation, orderBy, order direction,
     *  and output format.
     */
    getArgs(): string {
        let result: string;

        if (this.sel.bgn === this.sel.end) {
            result = '-t ' + this.asUnixTimestamp(this.sel.bgn);
        }
        else {
            result = '-T ' + this.asUnixTimestamp(this.sel.bgn) + '#' + this.asUnixTimestamp(this.sel.end);
        }

        result += ' ' + this.selectedLimit;

        if (this.selectedAggregation !== '') {
            result += ' -a ';

            // Sanitize aggregation field
            const aux: string = this.selectedAggregation.replace(/ /g, '');
            let bgn = 0;
            let end = aux.length;

            if (aux[bgn] === ',') {
                bgn++;
            }
            else if (aux[end - 1] === ',') {
                end--;
            }

            result += aux.substr(bgn, end - bgn);
        }

        if (this.selectedOrderBy !== 'Nothing') {
            result += ' -o ' + this.selectedOrderBy;

            if (this.selectedOrderDir !== '') {
                result += this.selectedOrderDir;
            }
        }

        result += ' --output-format=' + this.selectedOutputFmt;

        result += ' --output-items=r';
        if (!this.nosummary) {
            result += ',m';
        }

        if (this.config.useLocalTime) {
            result += ' --output-ts-localtime';
        }

        return result;
    }

    /**
     *  @brief Get channels from channel checkboxes
     *
     *  @return Formatted string
     *
     *  @details All selected channels will be inserted into single string as list of their names
     *  with ':' as a delimiter.
     */
    getSelectedChannels(): string {
        let result = '';

        for (const channel of this.channels) {
            if (channel.checked) {
                if (result !== '') {
                    result += ':';
                }

                result += channel.name;
            }
        }

        return result;
    }

    /**
     *  @brief Request retrieval of fdistdump stdout and stderr
     */
    getQueryData() {
        this.api.queryResult(this.instanceID).subscribe(
            (data: Object) => this.processQueryResult(data),
            (error: Object) => this.processError(error)
        );
    }

    /**
     *  @brief Handle method for processing response of started query
     *
     *  @param [in] data Object containing formatted query command
     *
     *  @details If this response is delivered, query was succesfully started, button label should
     *  be changed to allow query killing. Also progress trigger should be started.
     */
    processQueryStarted(data: Object) {
        this.btnQueryChange();

        this.timer = setInterval(() => this.api.queryProgress(this.instanceID).subscribe(
                (data2: Object) => this.processQueryProgress(data2),
                (error: Object) => this.processError(error)
            ), 1000);

        this.toPrint_command = data['command'];
        this.toPrint_stdout = null;
        this.toPrint_stderr = null;
    }

    /**
     *  @brief Handle method for processing response of query killing
     *
     *  @details If this response is delivered, query was succesfully killed, progress trigger will
     *  not hit and there are maybe some data to be displayed. Because of this, progress trigger has
     *  to be disabled and query results should be retrieved. Also, button can be now changed to its
     *  default caption.
     */
    processQueryKilled(data: Object) {
        this.btnQueryChange();
        clearInterval(this.timer);
        this.timer = null;
        this.getQueryData();
    }

    /**
     *  @brief Process fdistdump stdout/stderr
     *
     *  @param [in] data Object consisting of two fields: out and err
     *
     *  @details out and err fields in data are copied totheir corresponding model elements.
     */
    processQueryResult(data: Object) {
        this.toPrint_stdout = data['out'];
        this.toPrint_stderr = data['err'];

        if (this.toPrint_stdout === '') {
            this.toPrint_stdout = null;
        }

        if (this.toPrint_stderr === '') {
            this.toPrint_stderr = null;
        }
    }

    /**
     *  @brief Process fdistdump progress
     *
     *  @param [in] data Object with multiple fields, but only field 'total' is mandatory and needed
     *  by this app
     *
     *  @details If 'total' is 100, clearInterval for progress retrieval and request query data. Also
     *  button label and style should be changed.
     */
    processQueryProgress(data: Object) {
        this.progressStyle = {
            'width': data['total'] + '%'
        };

        if (parseInt(data['total']) === 100) {
            clearInterval(this.timer);
            this.timer = null;
            this.btnQueryChange();
            this.getQueryData();
        }
    }

    /**
     *  @brief Handle method for processing response of nf-tool fields
     *
     *  @param [in] data Object containing field names and descriptions. Its and array of objects
     *  with members name and hint.
     *
     *  @details nf-tools fields are retrieved, angular will now automatically display related
     *  inputs. Default orderBy should be selected.
     */
    processFieldsData(data: any) {
        /* NOTE: What data look like
        [
            {'name': '...', 'hint': '...'}
        ]
        */
        data.unshift({name: 'Nothing', hint: ''});
        this.fields = data;
        this.selectedOrderBy = this.fields[0].name;
    }

    /**
     *  @brief Log error that occured on an async query
     */
    processError(error: Object) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error on database request');
        console.error(error);
    }

    /**
     *  @brief Watcher function for managing custom options
     *
     *  @param [in] NgbTabChangeEvent Parameter_Description
     *
     *  @details Based on which tab user is trying to access, this.customOpts is either filled
     *  with arguments generated as string or it is emptied.
     */
    beforeTabChange(event: NgbTabChangeEvent) {
        if (event.nextId === 'FastOptions') {
            this.customOpts = null;
        }
        else if (event.nextId === 'CustomOptions') {
            this.customOpts = this.getArgs();
        }
    }

    /*
        Following methods are designed to create typeahead 'multiselect' input.
        It's all based on typeahead from ng-bootstrap which is only supposed to select a single
        item from an array. This resulted into numerous hacks.
        First off: Array containing data that will be hinted is array of objects, even though
        I only need array of simple strings. This is why searchForAggregField() first filters the
        array and then replaces each object with only its name.
        Second: The best idea I've come up with is to use csv format and hint only currently written
        item. This is where formatter and findSearchTermBreakpoint comes into play since they help
        me identify currently typed item and the rest of the string.
    */
    /**
     *  @brief Returns index of first character after last comma within a string
     */
    findSearchTermBreakpoint(term: string): number {
        let bgn = 0;

        for (let i = 0; i < term.length - 1; i++) {
            if (term[i] === ',') {
                bgn = i + 1;
            }
        }

        return bgn;
    }

    /**
     *  @brief Formats hinted strings. Since hinted strings contain user's previous selections,
     *  those has to be cropped.
     */
    formatter = (result: string) => {
        const b = this.findSearchTermBreakpoint(result);
        return result.substr(b, result.length - b - 1); // Also crop trailing comma
    }

    /**
     *  @brief Search function for typeahead multiselect. Returns array of hint strings. Each hint
     *  contains all previously selected values in csv format. This is a hack to allow multiselect
     */
    searchForAggregField = (text: Observable<string>) =>
        map.call(distinctUntilChanged.call(debounceTime.call(text, 200)), term => {
            const b = this.findSearchTermBreakpoint(term);
            const prefix = term.substr(0, b).replace(/ /g, '');
            const suffix = term.substr(b, term.length - b).replace(/ /g, '');

            const result = term.length < 1 ? [] : this.fields.filter(v =>
                v.name.toLowerCase().indexOf(suffix) > -1
            ).slice(0, 10);

            for (let i = 0; i < result.length; i++) {
                result[i] = prefix + result[i].name + ',';
            }

            return result;
        }
    );
}
