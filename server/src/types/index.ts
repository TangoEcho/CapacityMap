export interface Bank {
  id: string;
  name: string;
  logoUrl?: string;
  creditRating?: string;
  totalCapacity: number;
  usedCapacity: number;
  maxTenor?: number;
  averagePrice?: number;
  countries: string[];
  sensitiveSubjects?: string[];
  lastUpdated: string;
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

export const DEFAULT_SETTINGS: Settings = {
  weights: {
    capacityHeadroom: 0.5,
    priceCompetitiveness: 0.25,
    creditRating: 0.25,
  },
  sensitiveSubjects: [
    'Nuclear',
    'Coal',
  ],
  theme: 'light',
  hideCapacity: false,
};
