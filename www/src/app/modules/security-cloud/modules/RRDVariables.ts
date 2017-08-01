export class RRDVariable {
    id: string; ///< Identifier of variable within .rrd files
    name: string; ///< Human understandable
}

export const RRDVariables: RRDVariable[] = [
    {id: 'flows', name: 'Flows/s Any'},
    {id: 'flows_tcp', name: 'Flows/s TCP'},
    {id: 'flows_udp', name: 'Flows/s UDP'},
    {id: 'flows_icmp', name: 'Flows/s ICMP'},
    {id: 'flows_other', name: 'Flows/s Other'},
    {id: 'packets', name: 'Packets/s Any'},
    {id: 'packets_tcp', name: 'Packets/s TCP'},
    {id: 'packets_udp', name: 'Packets/s UDP'},
    {id: 'packets_icmp', name: 'Packets/s ICMP'},
    {id: 'packets_other', name: 'Packets/s Other'},
    {id: 'traffic', name: 'Byte/s Any'},
    {id: 'traffic_tcp', name: 'Bytes/s TCP'},
    {id: 'traffic_udp', name: 'Bytes/s UDP'},
    {id: 'traffic_icmp', name: 'Bytes/s ICMP'},
    {id: 'traffic_other', name: 'Bytes/s Other'},
    {id: 'packets_max', name: 'Max packets in one flow'},
    {id: 'traffic_max', name: 'Max bytes/s in one flow'},
    {id: 'packets_avg', name: 'Average packets per flow'},
    {id: 'traffic_avg', name: 'Average bytes/s per flow'}
];
