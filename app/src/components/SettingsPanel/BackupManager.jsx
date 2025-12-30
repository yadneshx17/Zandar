import React, { useState, useRef } from "react";
import { Download, Upload, Database, AlertCircle, CheckCircle } from "lucide-react";
import { exportDatabase, getDatabaseStats } from "../../core/db/backup/export";
import { importDatabase } from "../../core/db/backup/import";

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
        
        // setTimeout(() => window.location.reload(), 1500);
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
    <div className="bg-[#232323] rounded-lg p-2 sm:p-3">
      {/* Header */}
      {/* <div className="flex items-center gap-1.5 mb-3">
        <Database size={16} className="text-gray-400" />
        <h2 className="text-xs font-semibold text-white">Backup & Restore</h2>
      </div>*/}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-1.5 mb-2 sm:mb-3">
          <div className="border border-[#8E8E8E]/25 bg-neutral-800 text-white rounded-lg py-1.5 sm:py-2 text-center">
            <div className="text-sm sm:text-base font-bold text-white">{stats.pages}</div>
            <div className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">Pages</div>
          </div>
          <div className="border border-[#8E8E8E]/25 bg-neutral-800 text-white  rounded-lg py-1.5 sm:py-2 text-center">
            <div className="text-sm sm:text-base font-bold text-white">{stats.widgets}</div>
            <div className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">Widgets</div>
          </div>
          <div className="border border-[#8E8E8E]/25 bg-neutral-800 text-white rounded-lg py-1.5 sm:py-2 text-center">
            <div className="text-sm sm:text-base font-bold text-white">{stats.links}</div>
            <div className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">Links</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-1.5 mb-2 sm:mb-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-1.5 bg-white text-black px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={12} className="sm:w-[14px] sm:h-[14px]" />
          <span className="text-xs py-0.5">{isExporting ? "Exporting..." : "Export Backup"}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full flex items-center justify-center gap-1.5 bg-white text-black px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={12} className="sm:w-[14px] sm:h-[14px]" />
          <span className="text-xs py-0.5">{isImporting ? "Importing..." : "Import Backup"}</span>
        </button>

        {/* file imporrt */}
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
        <div className={`p-2 sm:p-2.5 rounded-lg flex items-start gap-2 mb-2 sm:mb-3 ${
          notification.type === "success" 
            ? "bg-green-500/10 border border-green-500/30" 
            : "bg-red-500/10 border border-red-500/30"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px] text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={12} className="sm:w-[14px] sm:h-[14px] text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] sm:text-[11px] font-medium ${
              notification.type === "success" ? "text-green-400" : "text-red-400"
            }`}>
              {notification.message}
            </div>
            {notification.details && (
              <div className="text-[8px] sm:text-[9px] text-gray-400 mt-1">
                {notification.details}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-1.5 sm:p-2 bg-[#27272a] rounded-lg">
        <p className="text-[8px] sm:text-[9px] text-gray-400 leading-relaxed">
          💡 <span className="font-medium">Tip:</span> Export creates a backup file. Import replaces all current data.
        </p>
      </div>
    </div>
  );
};

export default BackupManager;