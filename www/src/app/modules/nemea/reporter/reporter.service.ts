import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

let test_conf = [["hoststats2idea", {"idx": 12, "status": "running", "CPU-u": 0, "MEM-rss": 24502272, "MEM-vms": 209367040, "config": "/etc/nemea/reporters/config.yaml", "CPU-s": 0, "outputs": [], "inputs": [{"messages": 1, "type": "t", "is-conn": 1, "ID": "12002", "buffers": 1}], "path": "python", "params": "/usr/bin/nemea/hoststats2idea.py --name=cz.cesnet.nemea.hoststats --config=/etc/nemea/reporters/config.yaml --verbose=1"}], ["haddrscan2idea", {"idx": 13, "status": "stopped", "CPU-u": 1, "MEM-rss": 15761408, "MEM-vms": 122785792, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/haddrscan2idea.py", "params": "--name=cz.cesnet.nemea.haddrscan --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["vportscan2idea", {"idx": 14, "status": "stopped", "CPU-u": 1, "MEM-rss": 15761408, "MEM-vms": 122785792, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/vportscan2idea.py", "params": "--name=cz.cesnet.nemea.vportscan --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["bruteforce2idea", {"idx": 15, "status": "stopped", "CPU-u": 1, "MEM-rss": 15503360, "MEM-vms": 122511360, "CPU-s": 0, "outputs": [], "inputs": [], "path": "python", "params": "/usr/bin/nemea/bruteforce2idea.py --name=cz.cesnet.nemea.bruteforce_detector --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["amplification2idea", {"idx": 16, "status": "stopped", "CPU-u": 1, "MEM-rss": 15769600, "MEM-vms": 122761216, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/amplification2idea.py", "params": "--name=cz.cesnet.nemea.amplification_detection --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["ipblacklist2idea", {"idx": 17, "status": "stopped", "CPU-u": 1, "MEM-rss": 15785984, "MEM-vms": 122806272, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/ipblacklist2idea.py", "params": "--name=cz.cesnet.nemea.ipblacklistfilter --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["voipfraud2idea", {"idx": 22, "status": "stopped", "CPU-u": 0, "MEM-rss": 0, "MEM-vms": 0, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/voipfraud2idea.py", "params": "--name=org.tf-csirt.nemea.voipfraud_detection --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["sipbf2idea", {"idx": 25, "status": "stopped", "CPU-u": 0, "MEM-rss": 0, "MEM-vms": 0, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/sipbf2idea.py", "params": "--name=org.tf-csirt.nemea.sip_bf_detector --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["haddrscan2idea2", {"idx": 27, "status": "stopped", "CPU-u": 0, "MEM-rss": 0, "MEM-vms": 0, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/haddrscan2idea.py", "params": "--name=org.tf-csirt.nemea.haddrscan --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["vportscan2idea2", {"idx": 28, "status": "stopped", "CPU-u": 0, "MEM-rss": 0, "MEM-vms": 0, "CPU-s": 0, "outputs": [], "inputs": [], "path": "/usr/bin/nemea/vportscan2idea.py", "params": "--name=org.tf-csirt.nemea.vportscan --mongodb=nemeadb --mongodb-coll=alerts_new"}], ["hoststats2idea2", {"idx": 34, "status": "stopped", "CPU-u": 0, "MEM-rss": 0, "MEM-vms": 0, "CPU-s": 0, "outputs": [], "inputs": [], "path": "python", "params": "/usr/bin/nemea/hoststats2idea.py --name=org.tf-csirt.nemea.hoststats --mongodb=nemeadb --mongodb-coll=alerts_new"}]];

let test_rep_config = `custom_actions:
- id: warden1
  type: warden
  warden:
    url: https://warden1
- id: mongo1
  type: mongo
  host: localhost
  #port: 1234
  db: nemea_test
  collection: alerts
- id: marktest
  type: mark
  mark:
    path: Mark
    value: test
- id: markwhitelisted
  type: mark
  mark:
    path: _CESNET.Whitelisted
    value: 'True'
addressgroups:
- id: main_whitelist
  file: "whitelists/whitelist1"
- id: whitelist2
  list:
  - 1.1.0.0/24
  - 1.2.3.4
rules:
- id: 1
  condition: Source.IP4 in main_whitelist or Target.IP4 in main_whitelist
  actions:
  - markwhitelisted
  - mongo1
  elseactions:
  - mongo1`


@Injectable()
export class ReporterService {

    constructor(private http : Http) { }

    reporters_dummy() {
        return test_conf;
    }

    reporters() {
        return this.http.get('/nemea/reporters').map(
            (response : Response) => {
                return response.json();
            })
            .catch(this.handleError);
    }

    config_dummy(idx) {
        if (idx < 0)
            throw "Index not set";

        console.debug("Should get id " + idx)
        return test_rep_config;
    }

    save(idx : number, conf : string) {
        if (idx < 0)
            throw "Index not set";

        if (conf == '')
            throw "Configuration is empty"

        console.log(idx);
        console.log(conf);
    }

    private handleError(err : Response | any) {
        return Promise.reject(err);
    }

}
