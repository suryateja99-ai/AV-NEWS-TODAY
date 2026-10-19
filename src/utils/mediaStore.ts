const PREFIX = 'av-media:';
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('av-news-media', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function storeMedia(blob: Blob) {
  const db = await database();
  const id = crypto.randomUUID();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite');
      transaction.objectStore('files').put(blob, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return PREFIX + id;
  } finally { db.close(); }
}
export async function resolveMedia(source: string) {
  if (!source.startsWith(PREFIX)) return source;
  const db = await database();
  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const request = db.transaction('files').objectStore('files').get(source.slice(PREFIX.length));
      request.onsuccess = () => request.result ? resolve(request.result) : reject(new Error('The recording is no longer stored in this browser.'));
      request.onerror = () => reject(request.error);
    });
    return URL.createObjectURL(blob);
  } finally { db.close(); }
}
export async function deleteStoredMedia(source: string) {
  if (!source.startsWith(PREFIX)) return;
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite');
      transaction.objectStore('files').delete(source.slice(PREFIX.length));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
