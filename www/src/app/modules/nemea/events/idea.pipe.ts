import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name : 'idea'
})
export class IdeaPipe implements PipeTransform {
    transform(idea: Object): string {
        let content = '<div class="idea-event">';

        for (const key in idea) {
            if (idea.hasOwnProperty(key)) {

                content = content + '<div class="idea-item">';

                if (typeof idea[key] === 'object') {
                    if (key === '_id') {
                        content = content + '<em>' + key + '</em>: <span>' + idea[key]['$oid'] + '</span>';
                        continue;
                    }

                    if (idea[key]['$date'] > 10000000) {
                        content = content + '<em>' + key + '</em>: <span>' + new Date(idea[key]['$date']) + '</span>';
                        continue;
                    }

                    if (Number(key) !== NaN) {
                        content = content + '<em>' + key + '</em>: ';
                    }

                    content = content + '<div class="sub">' + this.transform(idea[key]) + '</div>';

                } else {
                    if ((typeof key !== 'number')) {
                        content = content + '<em>' + key + '</em>: <span>' + idea[key] + '</span>';
                    }
                }

                content = content + '</div>';
            }
        }

        content = content + '</div>';

        return content;
    }
}
