import { DataStore } from '@/Types';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export type DataState = {
  // DATA
  dataStore: DataStore;
<<<<<<< HEAD
  system: 'PostgreSQL' | 'MySQL' | 'Microsoft SQL' | 'Oracle SQL' | 'SQLite' | DataStore;
=======
  system: 'PostgreSQL' | 'MySQL' | 'Microsoft SQL' | 'Oracle SQL';
  referenceStore: DataStore;
>>>>>>> dev

  // DATA SETTERS
  setDataStore: (dataInfo: DataStore) => void;
  setSystem: (system: DataStore) => void;
<<<<<<< HEAD
  deleteTableData: (tableName: string) => void;
=======
  setReferencesStore: (dataInfo: DataStore) => void;
>>>>>>> dev
}

const useDataStore = create<DataState>()(
  // subscribeWithSelector middleware allows components (e.g., Flow.tsx) to listen for changes in store
  subscribeWithSelector(
    // devtools middleware allows use of Redux devtool in chrome
    devtools(
      (set) => ({
        referenceStore:{},
        dataStore: {},
        system: 'PostgreSQL',
<<<<<<< HEAD
        setSystem: (system) => 
          set((state) => ({ ...state, system })),
        setDataStore: (dataInfo) => 
          set((state) => ({ ...state, dataStore: dataInfo })),
        deleteTableData: (tableName) => set((state) => {
          const newState = { ...state };
          delete newState.dataStore[tableName];
          return newState;
        }),
=======
        setSystem: (system) => set((state) => ({ ...state, system })),
        setDataStore: (dataInfo) => set((state) => ({ ...state, dataStore: dataInfo })),
        setReferencesStore: (dataInfo) => set((state) => ({ ...state, referenceStore: dataInfo })),
>>>>>>> dev
      })
    )
  )
);

export default useDataStore;
