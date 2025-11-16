import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  X,
  Pencil,
  Plus,
  Search,
  Edit3,
  User,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { useLiveQuery } from 'dexie-react-hooks';

export default function NavBar({ activeTab, setActiveTab }) {
  const dbPages = useLiveQuery(() => db.pages.toArray(), []);
  const [pages, setPages] = useState([]);
  const [draggedPage, setDraggedPage] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newPageDialog, setNewPageDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newPage, setNewPage] = useState({ title: "" });

  const now = () => new Date().toISOString();

  useEffect(() => {
    if (dbPages && dbPages.length > 0) {
      setPages(dbPages);
      
      if (!activeTab) {
        setActiveTab(dbPages[0].title);
      }
    }
  }, [dbPages, activeTab, setActiveTab]);

  const handleDeletePage = async (pageToDelete) => {
    try {
      const widgets = await db.widgets.where({ pageId: pageToDelete.id }).toArray();
      
      for (const widget of widgets) {
        await db.links.where({ widgetId: widget.id }).delete();
      }
      
      await db.widgets.where({ pageId: pageToDelete.id }).delete();
      await db.pages.delete(pageToDelete.id);
      
      if (activeTab === pageToDelete.title) {
        const remainingPages = dbPages.filter(p => p.id !== pageToDelete.id);
        if (remainingPages.length > 0) {
          setActiveTab(remainingPages[0].title);
        } else {
          setActiveTab("");
        }
      }
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("Error: Failed to delete page");
    }
  };

  const addPage = async () => {
    if (!newPage.title.trim()) {
      alert("Please enter a page title");
      return;
    }
    
    try {
      await db.pages.add({
        uuid: uuidv4(),
        title: newPage.title,
        createdAt: now(),
        updatedAt: now(),
      });

      setActiveTab(newPage.title);
      setNewPage({ title: "" });
      setNewPageDialog(false);
    } catch (error) {
      console.error("Failed to add page:", error);
      alert("Error: Failed to add page");
    }
  };

  // DRAG & DROP HANDLERS
  const handleDragStart = (e, page, index) => {
    setDraggedPage({ page, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedPage(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    
    if (!draggedPage || draggedPage.index === targetIndex) {
      setDraggedPage(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedPages = [...pages];
    const [removed] = reorderedPages.splice(draggedPage.index, 1);
    reorderedPages.splice(targetIndex, 0, removed);

    setPages(reorderedPages);
    setDraggedPage(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDropdownOpen(false);
        setNewPageDialog(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <nav className="bg-[#161616] font-sans text-white border-b border-gray-800">
        <div className="flex items-center justify-between h-12 px-4">
          {/* Left side - Dropdown & Tabs */}
          <div className="flex items-center gap-4">
            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 transition-colors mx-1 px-2 py-2 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.4)] bg-[#2A2A2C]"
                aria-label="Pages menu"
              >
                <ChevronDown size={18} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />

                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl z-40 overflow-hidden">
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 py-1 mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Pages
                        </span>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setNewPageDialog(true);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {pages.map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between group/item px-2 py-1.5 rounded hover:bg-gray-800"
                        >
                          <button
                            onClick={() => {
                              setActiveTab(page.title);
                              setDropdownOpen(false);
                            }}
                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                          >
                            {page.title}
                          </button>

                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(page);
                              }}
                              className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              {pages.map((page, index) => {
                const isDragging = draggedPage?.index === index;
                const isDropTarget = dragOverIndex === index && draggedPage?.index !== index;

                return (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, page, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`
                      px-5 py-2 rounded-xl cursor-move transition-all duration-200
                      ${activeTab === page.title 
                        ? "bg-white text-base text-black font-bold" 
                        : "bg-[#2A2A2C] text-sm text-white hover:text-white shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
                      }
                      ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                      ${isDropTarget ? 'ring-1 ring-gray-600' : ''}
                    `}
                  >
                    <button
                      onClick={() => setActiveTab(page.title)}
                      className="w-full"
                    >
                      {page.title}
                    </button>
                  </div>
                );
              })}

              {/* Divider */}
              <div className="h-4 w-[2px] rounded-full bg-[#2A2A2C]"></div>

              {/* Add Page Button */}
              <button
                onClick={() => setNewPageDialog(true)}
                className="text-white transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.4)] rounded-full bg-[#2A2A2C] p-2"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Right side - Icons */}
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-center gap-2">
              <button
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-800"
                aria-label="Edit mode"
              >
                <Edit3 size={18} />
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-800"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-4 w-[2px] rounded-full bg-[#2A2A2C]"></div>

            <button
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-800"
              aria-label="Account"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl w-[500px] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                className="flex-1 bg-transparent text-white outline-none text-lg placeholder-gray-500"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Page Dialog */}
      {newPageDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setNewPageDialog(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl w-96 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Create New Page
              </h2>
              <button
                onClick={() => setNewPageDialog(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ title: e.target.value })}
                  placeholder="Enter page title..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPage.title.trim()) {
                      addPage();
                    }
                  }}
                  className="w-full px-4 py-2 bg-[#0e0e0e] border border-gray-700 rounded-lg text-white outline-none focus:border-gray-500 transition-all placeholder-gray-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setNewPageDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addPage}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl w-96 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Page?
              </h3>
              <p className="text-gray-400 text-sm">
                Delete "<span className="font-semibold text-white">{deleteConfirm.title}</span>"? 
                All widgets and links will be deleted.
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
      )}
    </>
  );
}