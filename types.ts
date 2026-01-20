
export interface Voter {
  boothNo: string;
  wardNo: string;
  voterNo: string;
  houseNo: string;
  svn: string;
  name: string;
  relativeName: string;
  gender: string;
  age: string;
  aadhaar: string;
  dob: string;
  calculatedAge: string;
  photo: string;
  isNew?: boolean;
}

export enum DeleteReason {
  MARRIAGE = 'शादी',
  DEATH = 'मृत्यु',
  DUPLICATE = 'डुप्लीकेट',
  MIGRATION = 'पलायन'
}

export interface GASResponse {
  success: boolean;
  message?: string;
  data?: Voter[];
}
