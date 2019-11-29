import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeWords'
})
export class CapitalizeWordsPipe implements PipeTransform {

  transform(value: string): string {
    if (value) {
      const words = value.split(' ');
      return words.map(word => this._capitalize(word)).join(' ');
    } else {
      return '';
    }
  }

  _capitalize(word: string): string {
    return word[ 0 ].toUpperCase() + word.slice(1).toLowerCase();
  }

}
