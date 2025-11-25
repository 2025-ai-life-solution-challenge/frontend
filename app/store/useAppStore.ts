import { create } from "zustand";

type AppMode = "fake-news" | "crowd-psychology";

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "fake-news",
  setMode: (mode) => set({ mode }),
}));
