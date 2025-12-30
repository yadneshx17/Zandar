import { db } from "../schema";
import { BACKUP_VERSION, FILE_PREFIX, DATE_FORMAT_OPTIONS } from "../../../constants/backup";

// Validate backup file structure
const validateBackupStructure = (backup) => {
  if (!backup.version || !backup.data) {
    return false;
  }
  
  if ( backup.version !== BACKUP_VERSION ) {
    throw new Error("Incompatible backup version");
  }

  const hasRequiredTables =
    Array.isArray(backup.data.pages) &&
    Array.isArray(backup.data.widgets) &&
    Array.isArray(backup.data.links);

  return hasRequiredTables;
};

// Parse JSON file content
const parseJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        resolve(parsed);
      } catch (error) {
        reject(new Error("Invalid JSON file", error));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

// Import database from JSON file
export const importDatabase = async (file, clearExisting = true) => {
  try {
    // 1. Validate file type
    if (!file.name.endsWith(".json")) {
      throw new Error("Please select a JSON file");
    }

    // 2. Parse file
    const backupData = await parseJsonFile(file);

    // 3. Validate structure
    if (!validateBackupStructure(backupData)) {
      throw new Error("Invalid backup file format");
    }

    const { pages, widgets, links } = backupData.data;

    // 4. THE TRANSACTION (The Safety Net)
    // 'rw' = ReadWrite transaction.
    // If ANY error happens inside here, Dexie undoes EVERYTHING (including the clear).
    const stats = await db.transaction(
      "rw",
      [db.pages, db.widgets, db.links],
      async () => {
        // A. Clear existing (if requested) default true
        // Wipe before importing ( merge could take some extra steps will try do it later. )
        if (clearExisting) {
          await Promise.all([
            db.pages.clear(),
            db.widgets.clear(),
            db.links.clear(),
          ]);
        }

        // B. Bulk Add
        await db.pages.bulkAdd(pages);
        await db.widgets.bulkAdd(widgets);
        await db.links.bulkAdd(links);

        // Return stats for the UI
        return {
          pagesImported: pages.length,
          widgetsImported: widgets.length,
          linksImported: links.length,
        };
      }
    );

    return {
      success: true,
      stats,
      backupVersion: backupData.version,
      backupTimestamp: backupData.timestamp,
    };
  } catch (error) {
    console.error("Import failed:", error);
    // The DB is still safe and untouched here because of the transaction!
    return {
      success: false,
      error: error.message,
    };
  }
};
