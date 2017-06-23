export interface Box {
    /**
      * Configuration of the box itself
      */
    config: any;
    /**
      * Title of the box
      */
    title: string;
    /**
      * Content which to display below data
      */
    content: string;
    /**
      * Define type of the box
      * Value: chart|top|number
      */
    type: string;
    /**
      * Options for the graph
      */
    options: Object;
    /**
      * time from which to analyze events
      */
    beginTime: number;
    /**
      * ending time for analyzing events, usually now
      * TODO: add time offset for history views
      */
    endTime: number;
    /**
      * Time window size in hours
      */
    period: number;
    /**
      * metric for analysis
      */
    metric: string;
}
