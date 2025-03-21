import { Pipe, PipeTransform } from '@angular/core';
import { differenceInYears } from 'date-fns/differenceInYears';

@Pipe({
  name: 'age',
})
export class AgePipe implements PipeTransform {
  transform(dob: string | Date): number {
    return differenceInYears(new Date(), new Date(dob));
  }
}
