import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  generateHtml(visit: any, patient: any, doctorName?: string): string {
    const currentDate = new Date().toLocaleDateString();

    const medicationsHtml =
      visit.medication
        ?.map(
          (med: any) => `
      <div class="medication-item">
        <h4>${med.name}</h4>
        <p><strong>Dosage:</strong> ${med.dosage}</p>
        <p><strong>Frequency:</strong> ${med.frequency}</p>
        ${
          med.startDate
            ? `<p><strong>Start Date:</strong> ${new Date(
                med.startDate
              ).toLocaleDateString()}</p>`
            : ''
        }
        ${
          med.endDate
            ? `<p><strong>End Date:</strong> ${new Date(
                med.endDate
              ).toLocaleDateString()}</p>`
            : ''
        }
        ${med.purpose ? `<p><strong>Purpose:</strong> ${med.purpose}</p>` : ''}
        ${
          med.prescribingProvider
            ? `<p><strong>Prescribing Provider:</strong> ${med.prescribingProvider}</p>`
            : ''
        }
      </div>
    `
        )
        .join('') || '<p>No medications prescribed.</p>';

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Medical Prescription</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      padding: 20px;
    }
    .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 20px; }
    .doctor-info { float: right; text-align: right; }
    .patient-info { float: left; }
    .prescription-date { clear: both; text-align: right; margin-top: 10px; }
    .prescription-title { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 30px 0 20px; }
    .medication-item { margin-bottom: 15px; }
    .signature { margin-top: 50px; border-top: 1px solid #333; padding-top: 20px; text-align: right; }
    .footer { margin-top: 30px; font-size: 12px; text-align: center; }
    .no-print-button { text-align: center; margin: 20px 0; }
    @media print { .no-print-button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h2>MEDICAL PRESCRIPTION</h2>
  </div>
  <div class="doctor-info">
    <p><strong>Provider:</strong> ${doctorName || 'N/A'}</p>
  </div>
  <div class="patient-info">
    <p><strong>Patient:</strong> ${patient?.firstName || ''} ${
      patient?.lastName || ''
    }</p>
    <p><strong>Patient ID:</strong> ${patient?.id || 'N/A'}</p>
    <p><strong>DOB:</strong> ${
      patient?.dateOfBirth
        ? new Date(patient.dateOfBirth).toLocaleDateString()
        : 'N/A'
    }</p>
  </div>
  <div class="prescription-date">
    <p><strong>Date:</strong> ${currentDate}</p>
  </div>
  <div class="prescription-title">PRESCRIBED MEDICATIONS</div>
  ${medicationsHtml}
  <div class="signature">
    <p>Provider's Signature: __________________________</p>
    <p>${doctorName || ''}</p>
  </div>
  <div class="footer">
    <p>This prescription is valid for 30 days from the date of issue.</p>
  </div>
  <div class="no-print-button">
    <button onclick="window.print(); setTimeout(() => window.close(), 500);">Print Prescription</button>
  </div>
</body>
</html>
    `;
  }
}
