import { create } from 'zustand';

const STORAGE_KEY = 'trello-settings';

interface PersistedSettings {
  workingDir: string;
  selectedModel: string;
}

interface SettingsState extends PersistedSettings {
  setWorkingDir: (dir: string) => void;
  setSelectedModel: (model: string) => void;
}

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        workingDir: parsed.workingDir ?? (import.meta.env.VITE_CLAUDE_RUNNER_WORKING_DIR || ''),
        selectedModel: parsed.selectedModel ?? '',
      };
    }
  } catch { /* ignore */ }
  return {
    workingDir: import.meta.env.VITE_CLAUDE_RUNNER_WORKING_DIR || '',
    selectedModel: '',
  };
}

function saveSettings(state: PersistedSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadSettings(),

  setWorkingDir: (dir) => {
    set({ workingDir: dir });
    saveSettings({ ...get(), workingDir: dir });
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model });
    saveSettings({ ...get(), selectedModel: model });
  },
}));
