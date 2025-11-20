import React, { useState, useRef } from "react";
import { Download, Upload, Database, AlertCircle, CheckCircle } from "lucide-react";
import { exportDatabase, importDatabase, getDatabaseStats } from "../services/db/backup";

const BackupManager = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  const showNotification = (type, message, details = null) => {
    setNotification({ type, message, details });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportDatabase();
      
      if (result.success) {
        showNotification(
          "success",
          "Backup exported successfully",
          `${result.metadata.totalPages} pages, ${result.metadata.totalWidgets} widgets, ${result.metadata.totalLinks} links`
        );
      } else {
        showNotification("error", "Export failed", result.error);
      }
    } catch (error) {
      showNotification("error", "Export failed", error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importDatabase(file, true);
      
      if (result.success) {
        showNotification(
          "success",
          "Backup imported successfully",
          `${result.stats.pagesImported} pages, ${result.stats.widgetsImported} widgets, ${result.stats.linksImported} links`
        );
        
        // Refresh page to reload data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showNotification("error", "Import failed", result.error);
      }
    } catch (error) {
      showNotification("error", "Import failed", error.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const loadStats = async () => {
    const dbStats = await getDatabaseStats();
    setStats(dbStats);
  };

  React.useEffect(() => {
    loadStats();
  }, [stats]);

  return (
    <div className="flex justify-center relative z-50 mt-72">
      <div className="bg-[#18181b] rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3 mb-6">
        <Database size={24} className="text-gray-400" />
        <h2 className="text-xl font-semibold text-white">Backup & Restore</h2>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#27272a] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.pages}</div>
            <div className="text-xs text-gray-400">Pages</div>
          </div>
          <div className="bg-[#27272a] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.widgets}</div>
            <div className="text-xs text-gray-400">Widgets</div>
          </div>
          <div className="bg-[#27272a] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.links}</div>
            <div className="text-xs text-gray-400">Links</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {isExporting ? "Exporting..." : "Export Backup"}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex-1 flex items-center justify-center gap-2 bg-[#27272a] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3f3f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={18} />
          {isImporting ? "Importing..." : "Import Backup"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
          notification.type === "success" 
            ? "bg-green-500/10 border border-green-500/30" 
            : "bg-red-500/10 border border-red-500/30"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className={`font-medium ${
              notification.type === "success" ? "text-green-400" : "text-red-400"
            }`}>
              {notification.message}
            </div>
            {notification.details && (
              <div className="text-sm text-gray-400 mt-1">
                {notification.details}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-[#27272a] rounded-lg">
        <p className="text-xs text-gray-400">
          💡 <strong>Tip:</strong> Export creates a backup file. Import replaces all current data with backup data.
        </p>
      </div>
    </div>
    </div>
  );
};

export default BackupManager;