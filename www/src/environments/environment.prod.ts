export const environment = {
  production: false,
  apiUrl : "/libapi",
  ftas : {
    /**
      * simple URL (without protocol) to FTAS instance
      */
    url : "ftas.cesnet.cz",
    /**
      * Full URL to filtering script (usually "example.com/ftas/stat.pl")
      * Specify URL without URL (https is forced)
      * If this option is not set, url must be.
      * If both are set, fullUrl is used.
      */
    fullUrl : undefined,
    /**
      * Specify which output machines will be used
      * Can be a list (as string): "1,2,5,10"
      */
    output : "1402"
  }
};
