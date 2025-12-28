import { create } from "zustand";

interface ConnectedDatabase {
  databaseId: string;
  dbName: string;
  source: string;
}

interface DatabaseStore {
  refreshTrigger: number;
  triggerRefresh: () => void;

  connectedDatabase: ConnectedDatabase | null;
  setConnectedDatabase: (db: ConnectedDatabase) => void;
  clearConnectedDatabase: () => void;
}

export const useDatabaseStore = create<DatabaseStore>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  connectedDatabase: null,
  setConnectedDatabase: (db) =>
    set({
      connectedDatabase: db,
    }),

  clearConnectedDatabase: () =>
    set({
      connectedDatabase: null,
    }),
}));
