export interface Bank {
  id: string;
  name: string;
  logoUrl?: string;
  creditRating?: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  maxTenor?: number;
  averagePrice?: number;
  countries: string[];
  regions: string[];
  sensitiveSubjects?: string[];
  lastUpdated: string;
}

export interface BankInput {
  name: string;
  logoUrl?: string;
  creditRating?: string;
  totalCapacity: number;
  usedCapacity: number;
  maxTenor?: number;
  averagePrice?: number;
  countries: string[];
  sensitiveSubjects?: string[];
}

export interface Project {
  id: string;
  name: string;
  country: string;
  capacityNeeded: number;
  tenorRequired?: number;
  projectType?: string[];
  minimumCreditRating?: string;
  status: 'Planned' | 'Issued';
  plannedIssuanceDate?: string;
  issuanceDate?: string;
  allocatedBankId?: string;
}

export interface ProjectInput {
  name: string;
  country: string;
  capacityNeeded: number;
  tenorRequired?: number;
  projectType?: string[];
  minimumCreditRating?: string;
  status: 'Planned' | 'Issued';
  plannedIssuanceDate?: string;
  issuanceDate?: string;
  allocatedBankId?: string;
}

export interface Settings {
  weights: {
    capacityHeadroom: number;
    priceCompetitiveness: number;
    creditRating: number;
  };
  sensitiveSubjects: string[];
  theme: 'light' | 'dark';
  hideCapacity: boolean;
}

export interface CountryInfo {
  code: string;
  name: string;
  region: string;
}

export interface RankedBank extends Bank {
  score: number;
  capacityScore: number;
  priceScore: number;
  ratingScore: number;
  isLocalBank: boolean;
  eligible: boolean;
  disqualifyReasons: string[];
}

export interface OptimizationResult {
  projectId: string;
  projectName: string;
  recommendedBankId: string;
  recommendedBankName: string;
  score: number;
  accepted?: boolean;
  forced?: boolean;
}

export interface ExcelImportRow {
  bank: Partial<Bank>;
  errors: string[];
}
