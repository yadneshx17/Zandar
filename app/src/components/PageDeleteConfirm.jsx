import React from "react";

export default function PageDeleteConfirm ({deleteConfirm, setDeleteConfirm, handleDeletePage}) {

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={() => setDeleteConfirm(null)}
    >
      <div
        className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl w-full max-w-sm p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            Delete Page?
          </h3>
          <p className="text-gray-400 text-sm">
            Delete "
            <span className="font-semibold text-white">
              {deleteConfirm.title}
            </span>
            "? All widgets and links will be deleted.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeletePage(deleteConfirm)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
