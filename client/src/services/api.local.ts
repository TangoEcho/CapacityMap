import { Bank, BankInput, Project, ProjectInput, Settings, CountryInfo } from '../types';
import { COUNTRIES, REGIONS } from '../utils/countriesData';
import { SEED_BANKS } from '../data/seedBanks';
import { SEED_PROJECTS } from '../data/seedProjects';

// --- localStorage helpers ---

const KEYS = {
  banks: 'cm_banks',
  projects: 'cm_projects',
  settings: 'cm_settings',
} as const;

const DEFAULT_SETTINGS: Settings = {
  weights: { capacityHeadroom: 0.5, priceCompetitiveness: 0.25, creditRating: 0.25 },
  sensitiveSubjects: ['Nuclear', 'Coal'],
  theme: 'light',
  hideCapacity: false,
};

type StoredBank = Omit<Bank, 'availableCapacity' | 'regions'>;

function readStore<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  return fallback;
}

function writeStore<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function seed(): void {
  if (!localStorage.getItem(KEYS.banks)) {
    writeStore(KEYS.banks, SEED_BANKS);
  }
  if (!localStorage.getItem(KEYS.projects)) {
    writeStore(KEYS.projects, SEED_PROJECTS);
  }
  if (!localStorage.getItem(KEYS.settings)) {
    writeStore(KEYS.settings, DEFAULT_SETTINGS);
  }
}

// Seed on module load
seed();

// --- Banks API ---

export const banksApi = {
  getAll: async (): Promise<Bank[]> => {
    return readStore<StoredBank[]>(KEYS.banks, []) as Bank[];
  },

  getById: async (id: string): Promise<Bank> => {
    const banks = readStore<StoredBank[]>(KEYS.banks, []);
    const bank = banks.find(b => b.id === id);
    if (!bank) throw new Error('Bank not found');
    return bank as Bank;
  },

  create: async (data: BankInput): Promise<Bank> => {
    const banks = readStore<StoredBank[]>(KEYS.banks, []);
    const bank: StoredBank = {
      id: crypto.randomUUID(),
      name: data.name,
      logoUrl: data.logoUrl,
      creditRating: data.creditRating,
      totalCapacity: data.totalCapacity,
      usedCapacity: data.usedCapacity,
      maxTenor: data.maxTenor,
      averagePrice: data.averagePrice ?? 50,
      countries: data.countries || [],
      sensitiveSubjects: data.sensitiveSubjects || [],
      lastUpdated: new Date().toISOString(),
    };
    banks.push(bank);
    writeStore(KEYS.banks, banks);
    return bank as Bank;
  },

  update: async (id: string, data: Partial<BankInput>): Promise<Bank> => {
    const banks = readStore<StoredBank[]>(KEYS.banks, []);
    const idx = banks.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bank not found');
    banks[idx] = { ...banks[idx], ...data, id: banks[idx].id, lastUpdated: new Date().toISOString() };
    writeStore(KEYS.banks, banks);
    return banks[idx] as Bank;
  },

  delete: async (id: string): Promise<void> => {
    const banks = readStore<StoredBank[]>(KEYS.banks, []).filter(b => b.id !== id);
    writeStore(KEYS.banks, banks);
  },
};

// --- Projects API ---

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return readStore<Project[]>(KEYS.projects, []);
  },

  getById: async (id: string): Promise<Project> => {
    const projects = readStore<Project[]>(KEYS.projects, []);
    const project = projects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    return project;
  },

  create: async (data: ProjectInput): Promise<Project> => {
    const projects = readStore<Project[]>(KEYS.projects, []);
    const project: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      country: data.country,
      capacityNeeded: data.capacityNeeded,
      tenorRequired: data.tenorRequired,
      projectType: data.projectType || [],
      minimumCreditRating: data.minimumCreditRating,
      status: data.status || 'Planned',
      plannedIssuanceDate: data.plannedIssuanceDate,
      issuanceDate: data.issuanceDate,
      allocatedBankId: data.allocatedBankId,
    };
    projects.push(project);
    writeStore(KEYS.projects, projects);
    return project;
  },

  update: async (id: string, data: Partial<ProjectInput>): Promise<Project> => {
    const projects = readStore<Project[]>(KEYS.projects, []);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...data, id: projects[idx].id };
    writeStore(KEYS.projects, projects);
    return projects[idx];
  },

  delete: async (id: string): Promise<void> => {
    const projects = readStore<Project[]>(KEYS.projects, []).filter(p => p.id !== id);
    writeStore(KEYS.projects, projects);
  },

  markIssued: async (id: string): Promise<Project> => {
    const projects = readStore<Project[]>(KEYS.projects, []);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    if (!projects[idx].allocatedBankId) {
      throw new Error('A bank must be allocated before marking as issued');
    }
    projects[idx].status = 'Issued';
    projects[idx].issuanceDate = new Date().toISOString();
    writeStore(KEYS.projects, projects);
    return projects[idx];
  },
};

// --- Settings API ---

export const settingsApi = {
  get: async (): Promise<Settings> => {
    return readStore<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  },

  update: async (data: Partial<Settings>): Promise<Settings> => {
    const settings = readStore<Settings>(KEYS.settings, DEFAULT_SETTINGS);
    const updated = { ...settings, ...data };
    writeStore(KEYS.settings, updated);
    return updated;
  },
};

// --- Countries API ---

export const countriesApi = {
  getAll: async (): Promise<CountryInfo[]> => {
    return COUNTRIES;
  },

  getRegions: async (): Promise<Record<string, string[]>> => {
    return REGIONS;
  },
};

// --- Upload API (stubs for local mode — Excel not needed for demo) ---

export const uploadApi = {
  uploadLogo: async (file: File): Promise<{ url: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string });
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  importExcel: async (_file: File, _preview = false) => {
    throw new Error('Excel import is not available in demo mode');
  },

  exportExcelUrl: '#',
  templateUrl: '#',
};
