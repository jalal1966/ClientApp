export enum AppointmentType {
  CheckUp = 0,
  FollowUp = 1,
  Consultation = 2,
  Emergency = 3,
  Vaccination = 4,
  Procedure = 5,
  Regular = 6,
  Urgent = 7,
}

export enum AppointmentStatus {
  Scheduled = 0,
  Confirmed = 1,
  Waiting = 2,
  InProgress = 3,
  Completed = 4,
  CheckedIn = 5,
  Cancelled = 6,
  NoShow = 7,
}

export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Overdue = 'Overdue',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}
