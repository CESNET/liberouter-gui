export class Utility {
    public static JStimestampToNiceReadable(timestamp: number): string {
        const d = new Date(timestamp);
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
        + ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2)
        + ':' + ('0' + d.getMinutes()).slice(-2);
    }
}
