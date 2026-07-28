import type { ProjectSettings, WorkspaceImage } from '@/types/editor';

const DB_NAME = 'nowhere-mark';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const AUTOSAVE_KEY = 'latest';

export interface StoredImage {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  width: number;
  height: number;
  sourceBlob: Blob;
  backgroundBlob?: Blob;
}

export interface StoredProject {
  id: string;
  updatedAt: number;
  settings: ProjectSettings;
  images: StoredImage[];
  watermarkBlob?: Blob;
  watermarkName?: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local project operation failed'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Local project transaction failed'));
    };
  });
}

export async function saveLocalProject(input: {
  settings: ProjectSettings;
  images: WorkspaceImage[];
  watermarkFile?: File;
  watermarkName?: string;
}) {
  const project: StoredProject = {
    id: AUTOSAVE_KEY,
    updatedAt: Date.now(),
    settings: input.settings,
    images: input.images.map((image) => ({
      id: image.id,
      name: image.name,
      type: image.file.type,
      lastModified: image.file.lastModified,
      width: image.width,
      height: image.height,
      sourceBlob: image.file,
      backgroundBlob: image.backgroundBlob,
    })),
    watermarkBlob: input.watermarkFile,
    watermarkName: input.watermarkName,
  };

  await withStore('readwrite', (store) => store.put(project));
  return project.updatedAt;
}

export function loadLocalProject() {
  return withStore<StoredProject | undefined>('readonly', (store) => store.get(AUTOSAVE_KEY));
}

export function deleteLocalProject() {
  return withStore<undefined>('readwrite', (store) => store.delete(AUTOSAVE_KEY));
}
