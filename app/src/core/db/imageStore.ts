import {db} from "./schema";

// dexie handles transactions automatically :).
// These thing in muli-comment is JSDoc.
// its standard way to document JS/TS code
// i got to know today hehe.

/**
* Saves an image blob to the IndexedDB
* @param key - The unique string key (e.g., "background-image")
* @param blob - The standard JS Blob object
*/ 
export async function saveImage(key: string, blob: Blob): Promise<void> {
  try {
    await db.image.put(blob, key); // .put(value, key) matches the store definition
  } catch (error) {
    console.error(`Error saving image [${key}]:`, error);
    throw error;
  }
}

/**
 * Retrieves an image blob from the IndexedDB
 * @param key - The unique string key
 * @returns The Blob if found, or undefined if not
 */
export async function getImageBlob(key: string): Promise<Blob | undefined> {
  try {
    return await db.image.get(key);
  } catch (error) {
    console.error(`Error getting image [${key}]:`, error);
    return undefined;
  }
}