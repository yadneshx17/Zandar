import {db} from "./schema";

// dexie handles transactions automatically :).

export async function saveImage(key, blob) {
    try {
        await db.image.put(blob, key);
    } catch (error) {
        console.error("Error saving image:", error);
    }
}

export async function getImageBlob(key) {
    try {
        return await db.image.get(key);
    } catch (error) {
        console.error("Error getting image:", error);
        return null;
    }
}