import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';


@Pipe({
  name: 'marked'
})

export class MarkedPipe implements PipeTransform {
  transform(value: any): any {
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
        const link = marked.Renderer.prototype.link.call(this, href, title, text);
        return link.replace('<a', '<a target="_blank" ');
    };
    marked.setOptions({
        renderer: renderer
    });
    if (value && value.length > 0) {
      const text = marked(value);
      return text;
    }
    return value;
  }


}
