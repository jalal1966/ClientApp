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

export enum VaccineNames {
  // COVID-19 Vaccines
  PfizerBioNTech = 'Pfizer-BioNTech',
  Moderna = 'Moderna',
  AstraZeneca = 'AstraZeneca',
  JohnsonAndJohnson = 'Johnson & Johnson',
  Sinovac = 'Sinovac',
  SputnikV = 'Sputnik V',
  Sinopharm = 'Sinopharm',
  Novavax = 'Novavax',
  Covaxin = 'Covaxin',
  Covishield = 'Covishield',
  CanSino = 'CanSino',
  CoronaVac = 'CoronaVac',
  COVID19 = 'COVID‑19',

  // Standard Childhood/Adult Vaccines
  BCG = 'BCG', // Tuberculosis
  HepB_Birth = 'HepB (Birth dose)',
  HepB = 'HepB',
  Hepatitis = 'Hepatitis',
  HepA = 'HepA',
  DTaP = 'DTaP', // Diphtheria, Tetanus, Pertussis
  DTP = 'DTP',
  Tdap = 'Tdap', // Adolescent/adult booster
  IPV = 'IPV', // Inactivated Polio Vaccine
  Polio = 'Polio',
  Hib = 'Hib', // Haemophilus influenzae type b
  PCV = 'PCV', // Pneumococcal Conjugate Vaccine
  Pneumococcal = 'Pneumococcal',
  Rotavirus = 'Rotavirus',
  MMR = 'MMR', // Measles, Mumps, Rubella
  Varicella = 'Varicella', // Chickenpox
  Influenza = 'Influenza',
  HPV = 'HPV', // Human Papillomavirus
  MenACWY = 'MenACWY', // Meningococcal ACWY
  MenB = 'MenB', // Meningococcal B
  RSV = 'RSV', // Respiratory Syncytial Virus
}

export enum VaccineLotNumber {
  AB1234 = 'AB1234',
  CD5678 = 'CD5678',
  EF9012 = 'EF9012',
  GH3456 = 'GH3456',
  IJ7890 = 'IJ7890',
  KL1234 = 'KL1234',
  MN5678 = 'MN5678',
  OP9012 = 'OP9012',
  QR3456 = 'QR3456',
  ST7890 = 'ST7890',
}
export enum VaccineManufacturer {
  Pfizer = 'Pfizer',
  Moderna = 'Moderna',
  JohnsonAndJohnson = 'Johnson & Johnson',
  AstraZeneca = 'AstraZeneca',
  Novavax = 'Novavax',
  Sinovac = 'Sinovac',
  Sinopharm = 'Sinopharm',
  BharatBiotech = 'Bharat Biotech',
  SerumInstituteOfIndia = 'Serum Institute of India',
  GSK = 'GlaxoSmithKline',
  Sanofi = 'Sanofi Pasteur',
  Merck = 'Merck',
}

export enum LabTestName {
  // Blood Tests
  CBC = 'Complete Blood Count',
  CMP = 'Comprehensive Metabolic Panel',
  LipidPanel = 'Lipid Panel',
  A1C = 'Hemoglobin A1C',
  TSH = 'Thyroid Stimulating Hormone',
  FreeT4 = 'Free T4',
  FreeT3 = 'Free T3',
  PSA = 'Prostate Specific Antigen',
  Ferritin = 'Ferritin',
  VitaminD = 'Vitamin D, 25-Hydroxy',
  VitaminB12 = 'Vitamin B12',
  PT = 'Prothrombin Time',
  INR = 'International Normalized Ratio',

  // Urine Tests
  UrinalysisComplete = 'Urinalysis Complete',
  UrineCulture = 'Urine Culture',

  // Cardiovascular Tests
  TroponinI = 'Troponin I',
  BNP = 'B-type Natriuretic Peptide',
  CRP = 'C-Reactive Protein',

  // Liver Tests
  LiverPanel = 'Liver Function Panel',
  HepatitisPanel = 'Hepatitis Panel',

  // Kidney Tests
  BUN = 'Blood Urea Nitrogen',
  Creatinine = 'Creatinine',
  eGFR = 'Estimated Glomerular Filtration Rate',

  // Electrolytes
  Electrolytes = 'Electrolyte Panel',
  Sodium = 'Sodium',
  Potassium = 'Potassium',
  Chloride = 'Chloride',
  CO2 = 'Carbon Dioxide',

  // Imaging
  XRay = 'X-Ray',
  CTScan = 'CT Scan',
  MRI = 'MRI',
  Ultrasound = 'Ultrasound',

  // Specialized Tests
  COVID19 = 'COVID-19 PCR',
  COVID19Antibody = 'COVID-19 Antibody',
  StreptTest = 'Streptococcus A, Rapid Screen',
  FIT = 'Fecal Immunochemical Test',

  // Sexually Transmitted Infections
  STIPanel = 'STI Panel',
  HIV = 'HIV',

  // Genetic Testing
  GeneticPanel = 'Genetic Panel',

  // Other
  Other = 'Other',
}

export enum AllergyType {
  Drug = 'Drug',
  Food = 'Food Allergy',
  Medication = 'Medication Allergy',
  Environmental = 'Environmental Allergy',
  Insect = 'Insect Allergy',
  Latex = 'Latex Allergy',
  Animal = 'Animal Allergy',
  Seasonal = 'Seasonal Allergy',
  Contact = 'Contact Allergy',
  Chemical = 'Chemical Sensitivity',
  Other = 'Other',
}

export enum AllergyName {
  Penicillin = 'Penicillin',
  SulfaDrugs = 'SulfaDrugs',
  Aspirin = 'Aspirin',
  Latex = 'Latex',
  Peanuts = 'Peanuts',
  Shellfish = 'Shellfish',
  Eggs = 'Eggs',
  Milk = 'Milk',
  Soy = 'Soy',
  Wheat = 'Wheat',
  BeeVenom = 'BeeVenom',
  InsectStings = 'InsectStings',
  Mold = 'Mold',
  Pollen = 'Pollen',
  DustMites = 'DustMites',
  AnimalDander = 'AnimalDander',
}
