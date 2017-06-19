export const environment = {
  production: false,
  /**
  	* Path to configuration file
  	*/
  configPath : "assets/config.json",
  /**
  	* Used only when fetching config.json failed
  	*/
  apiUrl : "/libapi",
  securityCloud : {
    /**
      * simple URL (without protocol) to FTAS instance
      */
    url : undefined,
    /**
      * Full URL to filtering script (usually "example.com/ftas/stat.pl")
      * Specify URL without URL (https is forced)
      * If this option is not set, url must be.
      * If both are set, fullUrl is used.
      */
    fullUrl : "/scgui",
    /**
      * Set resolution of the graph output
      * Default: 2
      */
    resolution : 2
  }
};
