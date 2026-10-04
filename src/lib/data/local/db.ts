/**
 * Minimal promise wrapper over IndexedDB for solves and replays. Everything
 * stays in this browser; nothing is sent to a server.
 */

const DB_NAME = "cubemonke"
const DB_VERSION = 1

export type StoreName = "solves" | "replays"

let dbPromise: Promise<IDBDatabase> | null = null

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("solves"))
        db.createObjectStore("solves", { keyPath: "id" })
      if (!db.objectStoreNames.contains("replays"))
        db.createObjectStore("replays", { keyPath: "id" })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })
  return dbPromise
}

const run = async <T>(
  store: StoreName,
  mode: IDBTransactionMode,
  operation: (objectStore: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode)
    const request = operation(tx.objectStore(store))
    let result: T | undefined
    if (request) request.onsuccess = () => (result = request.result)
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"))
  })
}

export const getAll = async <T>(store: StoreName): Promise<T[]> =>
  ((await run<T[]>(store, "readonly", (s) => s.getAll())) ?? []) as T[]

export const getOne = async <T>(store: StoreName, id: string) =>
  ((await run<T>(store, "readonly", (s) => s.get(id))) ?? null) as T | null

export const put = async <T>(store: StoreName, value: T) => {
  await run(store, "readwrite", (s) => s.put(value))
}

export const remove = async (store: StoreName, id: string) => {
  await run(store, "readwrite", (s) => s.delete(id))
}

export const clear = async (store: StoreName) => {
  await run(store, "readwrite", (s) => s.clear())
}
