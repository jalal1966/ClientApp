import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-prescription-print',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './prescription-print.component.html',
  styleUrls: ['./prescription-print.component.scss'],
})
export class PrescriptionPrintComponent {
  @Input() doctorName!: string;
  @Input() patient: any;
  @Input() patientId!: string;
  @Input() currentDate: Date = new Date();
  @Input() medications: any[] = [];

  printAndClose() {
    window.print();
    setTimeout(() => window.close(), 500);
  }
}
