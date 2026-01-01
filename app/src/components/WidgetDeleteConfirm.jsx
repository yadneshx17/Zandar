import React from "react";
import { AlertTriangle } from "lucide-react";

export function WidgetDeleteConfirm({ confirmDialog, closeConfirm, handleConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181b] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl w-full max-w-sm">
        <div className="flex gap-3 items-center text-red-400 mb-4">
          <AlertTriangle size={20} />
          <span className="font-semibold text-lg">{confirmDialog.title}</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">{confirmDialog.message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeConfirm}
            className="px-4 py-2 text-sm bg-[#27272a] text-gray-300 rounded-lg hover:bg-[#3f3f46] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
