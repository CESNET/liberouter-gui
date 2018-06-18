/**
 * Globally used functions for JSON operations.
 */

export class JSONHelper {

    /**
     * Parse JSON returned from server. Fixes problems caused by Python JSON formatting.
     */
    public static parsePythonJSON(s: string): object {
        s = s.replace(/'/g,'"')
            .replace(/True/g,"true")
            .replace(/False/g, "false");
        return JSON.parse(s);
    }
}
