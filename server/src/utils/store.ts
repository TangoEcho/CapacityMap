import fs from 'fs-extra';
import path from 'path';
import { Bank, Project, Settings, DEFAULT_SETTINGS } from '../types';

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

async function ensureDataDir() {
  await fs.ensureDir(DATA_DIR);
}

async function readJson<T>(name: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const fp = filePath(name);
  if (await fs.pathExists(fp)) {
    return fs.readJson(fp);
  }
  await fs.writeJson(fp, fallback, { spaces: 2 });
  return fallback;
}

async function writeJson<T>(name: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeJson(filePath(name), data, { spaces: 2 });
}

export async function getBanks(): Promise<Bank[]> {
  return readJson<Bank[]>('banks', []);
}

export async function saveBanks(banks: Bank[]): Promise<void> {
  return writeJson('banks', banks);
}

export async function getProjects(): Promise<Project[]> {
  return readJson<Project[]>('projects', []);
}

export async function saveProjects(projects: Project[]): Promise<void> {
  return writeJson('projects', projects);
}

export async function getSettings(): Promise<Settings> {
  return readJson<Settings>('settings', DEFAULT_SETTINGS);
}

export async function saveSettings(settings: Settings): Promise<void> {
  return writeJson('settings', settings);
}
