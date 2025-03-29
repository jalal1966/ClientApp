// job-title.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { JopTitleID } from '../../models/user';

@Pipe({ name: 'jobTitle' })
export class JobTitlePipe implements PipeTransform {
  transform(value: JopTitleID | number | undefined | null): string {
    if (value === undefined || value === null) {
      return 'Unknown';
    }
    return JopTitleID[value as JopTitleID] || 'Unknown';
  }
}
