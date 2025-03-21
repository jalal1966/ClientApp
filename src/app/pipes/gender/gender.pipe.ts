import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {
  transform(genderID: number): string {
    return genderID === 1 ? 'Male' : 'Female';
  }
}
