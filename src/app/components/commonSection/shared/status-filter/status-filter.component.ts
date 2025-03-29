import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-status-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './status-filter.component.html',
  styleUrl: './status-filter.component.scss',
})
export class StatusFilterComponent {
  @Input() selectedStatus: string = 'All'; // Default value
  @Output() statusChange = new EventEmitter<string>(); // Emits the selected status

  statusOptions: string[] = [
    'All',
    'Scheduled',
    'Confirmed',
    'CheckedIn',
    'InProgress',
    'Completed',
    'Cancelled',
    'Waiting',
    'NoShow',
  ];

  onStatusChange(newStatus: string) {
    this.statusChange.emit(newStatus);
  }
}
