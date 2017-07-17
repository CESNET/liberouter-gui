import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'sc-thumb-renderer',
  templateUrl: './sc-thumb-renderer.component.html',
  styleUrls: ['./sc-thumb-renderer.component.scss']
})
export class ScThumbRendererComponent implements OnInit {
    @Input() data;

    @ViewChild('Chart') chart: ElementRef;

    constructor() { }

    ngOnInit() {
        this.chart.nativeElement.innerHTML = this.data;
    }
}
