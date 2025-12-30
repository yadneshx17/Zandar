import { db } from "../schema";
import { BACKUP_VERSION, FILE_PREFIX, DATE_FORMAT_OPTIONS } from "../../../constants/backup";

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