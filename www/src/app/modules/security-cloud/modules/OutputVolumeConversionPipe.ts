import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'OutVolConv'})
export class OutputVolumeConversionPipe implements PipeTransform {
    transform(value: string, statType: string): string {
        const volumes: string[] = [ '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        let base = parseFloat(value);

        if (isNaN(base)) {
            return value;
        }

        let i = 0;
        while (base > 1000.0 && i < volumes.length) {
            base /= 1000.0;
            i++;
        }

        let suffix = '';
        if (statType === 'Rate') {
            suffix = '/s';
        }

        return base.toFixed(2) + volumes[i] + suffix;
    }
}
