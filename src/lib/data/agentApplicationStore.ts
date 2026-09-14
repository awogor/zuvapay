import fs from 'fs';
import path from 'path';

export interface AgentApplication {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  state: string;
  businessType: string;
  dailyVolume: string;
  message?: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

const AGENTS_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'agentApplications.json');

const SEED_APPLICATIONS: AgentApplication[] = [];

let inMemoryApps: AgentApplication[] | null = null;

export function getAgentApplicationsSync(): AgentApplication[] {
  if (inMemoryApps) return inMemoryApps;

  try {
    if (fs.existsSync(AGENTS_FILE_PATH)) {
      const content = fs.readFileSync(AGENTS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        inMemoryApps = parsed;
        return inMemoryApps;
      }
    }
  } catch (err) {
    console.warn('Failed to read agent applications file', err);
  }

  inMemoryApps = [];
  return inMemoryApps;
}

export async function getAgentApplications(): Promise<AgentApplication[]> {
  return getAgentApplicationsSync();
}

export async function saveAgentApplications(apps: AgentApplication[]): Promise<void> {
  inMemoryApps = apps;
  try {
    const dir = path.dirname(AGENTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AGENTS_FILE_PATH, JSON.stringify(inMemoryApps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write agent applications to file', err);
  }
}

export async function addAgentApplication(data: Omit<AgentApplication, 'id' | 'status' | 'createdAt'>): Promise<AgentApplication> {
  const apps = await getAgentApplications();
  const newApp: AgentApplication = {
    ...data,
    id: `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  apps.unshift(newApp);
  await saveAgentApplications(apps);
  return newApp;
}
