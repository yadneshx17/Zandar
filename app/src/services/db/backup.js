import { db } from "./schema";

// Export Configuration
const BACKUP_VERSION = "1.0.0";
const FILE_PREFIX = "zandar-backup";
const DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

// Generate Timestamp for filename
const generateTimestamp = () => {
  const now = new Date();
  return now
    .toLocaleString("en-US", DATE_FORMAT_OPTIONS) // Format Date
    .replace(/[/:,\s]/g, "-"); // Replace special characters
};

// Generate Backup Filename
const generateBackupFilename = () => {
  const timestamp = generateTimestamp();
  return `${FILE_PREFIX}-${timestamp}.json`;
};


// https://dexie.org/docs/Dexie/Dexie.transaction()#transaction-scope
// Fetch all data from database tables
// WRAPPED IN TRANSACTION: Ensures a consistent snapshot ("Point-in-time")
// returns promise which gets resolved when the transction has commited. -> gets resolved with return value of the callback.
// if transaction fail's or aborted the promise will reject. :)
const fetchAllDatabaseData = () => {
  // 'r' -> Read Only transaction
  return db.transaction("r", [db.pages, db.widgets, db.links], async () => {
    const [pages, widgets, links] = await Promise.all([
      db.pages.toArray(),
      db.widgets.toArray(),
      db.links.toArray(),
    ]);

    return { pages, widgets, links };
  });
};

// Backup JSON format
// Create backup object with metadata
const createBackupObject = (data) => {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    appName: "Zandar",
    data: {
      pages: data.pages,
      widgets: data.widgets,
      links: data.links,
    },
    metadata: {
      totalPages: data.pages.length,
      totalWidgets: data.widgets.length,
      totalLinks: data.links.length,
    },
  };
};

// Convert object to JSON blob
const createJsonBlob = (data) => {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: "application/json" });
};

// Trigger file download in browser
const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export all database data to JSON file
export const exportDatabase = async () => {
  try {
    const databaseData = await fetchAllDatabaseData();
    const backupObject = createBackupObject(databaseData);
    const jsonBlob = createJsonBlob(backupObject);
    const filename = generateBackupFilename();

    triggerDownload(jsonBlob, filename);

    return {
      success: true,
      filename,
      metadata: backupObject.metadata,
    };
  } catch (error) { 
    console.error("Export failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

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
        reject(new Error("Invalid JSON file"));
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

// Get current database statistics
export const getDatabaseStats = async () => {
  try {
    const [pagesCount, widgetsCount, linksCount] = await Promise.all([
      db.pages.count(),
      db.widgets.count(),
      db.links.count(),
    ]);

    return {
      pages: pagesCount,
      widgets: widgetsCount,
      links: linksCount,
      total: pagesCount + widgetsCount + linksCount,
    };
  } catch (error) {
    console.error("Failed to get stats:", error);
    return null;
  }
};

// Create a quick backup snapshot
export const createBackupSnapshot = async () => {
  try {
    const data = await fetchAllDatabaseData();
    return createBackupObject(data);
  } catch (error) {
    console.error("Failed to create snapshot:", error);
    throw error;
  }
};