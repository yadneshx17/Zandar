import React, { useState, useEffect, useContext } from "react";
import {
  X,
  Pencil,
  Plus,
  Search,
  Edit3,
  Menu,
  Settings2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/db/schema.js";
import { useLiveQuery } from 'dexie-react-hooks';
import SettingsPanel from "./SettingsPanel/SettingsPanel";
import {SettingsContext} from "../contexts/SettingsProvider"

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
  // const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPageTitleById, setEditingPageTitleById] = useState(null);

  const { widgetOpacity, settingsOpen, setSettingsOpen } = useContext(SettingsContext);

  const now = () => new Date().toISOString();

  useEffect(() => {
    if (dbPages && dbPages.length > 0) {
      setPages(dbPages);
      
      if (!activeTab) {
        setActiveTab(dbPages[0].uuid);
      }
    }
  }, [dbPages, activeTab, setActiveTab]);

  const updatePageTitle = async (pageId, Title) => {
    const trimmedTitle = Title.trim();
    const finalTitle = trimmedTitle === "" ? "New Page" : trimmedTitle;

    try {
      await db.pages.update(pageId, {
        title: finalTitle,
        updatedAt: now()
      })
    } catch (error) {
      alert("Error: Failed to update page title");
    }
  }

  const handleDeletePage = async (pageToDelete) => {
    try {
      const widgets = await db.widgets.where({ pageId: pageToDelete.id }).toArray();
      
      for (const widget of widgets) {
        await db.links.where({ widgetId: widget.id }).delete();
      }
      
      await db.widgets.where({ pageId: pageToDelete.id }).delete();
      await db.pages.delete(pageToDelete.id);
      
      if (activeTab === pageToDelete.uuid) {
        const remainingPages = dbPages.filter(p => p.id !== pageToDelete.id);
        if (remainingPages.length > 0) {
          setActiveTab(remainingPages[0].uuid);
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

      setActiveTab(newPage.uuid);
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
      {/* <nav className="bg-[#161616] font-sans text-white border-b border-gray-800"> */}
      <nav 
        className="border-gray-200"
        style={{ backgroundColor: `rgba(10, 10, 10, ${Math.max(0.8, widgetOpacity / 100)})` }}
      >
        <div className="flex items-center justify-between h-12 px-4">
          {/* Left side - Dropdown & Tabs */}
          <div className="flex items-center gap-4">
            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 mx-1 px-2 py-2 hover:border border-1  rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.4)] bg-[#2A2A2C] transition-colors"
                aria-label="Pages menu"
              >
                <Menu size={18} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
              <>
                {/* Subtle backdrop */}
                <div
                  className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
                  onClick={() => setDropdownOpen(false)}
                />

                {/* Dropdown with depth layers */}
                <div 
                className="absolute top-full left-0 mt-4 w-80 z-40 bg-[#161616] border border-white/[0.08] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.6),0_4px_0px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
                >
                  
                  {/* Header with subtle top light */}
                  <div className="relative px-4 py-3">
                    <div className="absolute top-0 left-0 right-0 h-px"></div>
                    
                    <div className="flex items-center justify-between"> 
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers-icon lucide-layers"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>

                        <span className="text-sm font-md text-neutral-200 font-semibold tracking-wider ml-2">
                          My Pages
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setNewPageDialog(true);
                        }}
                        className="text-neutral-200 hover:text-white hover:bg-white/[0.05] p-1.5 rounded-lg transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Pages List */}
                  <div className="p-2 max-h-[400px] overflow-y-auto">
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setActiveTab(page.uuid);
                          setDropdownOpen(false);
                        }}
                        className={`
                          w-full group/item relative flex items-center justify-between 
                          py-2 px-3 mb-1 rounded-lg transition-all duration-200 
                          ${activeTab === page.uuid 
                            ? 'bg-gradient-to-b from-white/[0.12] to-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.4)]' 
                            : 'text-white/50 hover:bg-white/[0.03] hover:text-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                          }
                        `}
                      >
                        {editingPageTitleById === page.id ? (
                          <input
                            value={page.title}
                            onChange={(e) =>
                              setPages(prev =>
                                prev.map(p =>
                                  p.id === page.id ? { ...p, title: e.target.value } : p
                                )
                              )
                            }
                            onBlur={() => {
                              const currentPage = pages.find(p => p.id === page.id);
                              if (currentPage) {
                                updatePageTitle(page.id, currentPage.title);
                              }
                              setEditingPageTitleById(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const currentPage = pages.find(p => p.id === page.id);
                                if (currentPage) {
                                  updatePageTitle(page.id, currentPage.title);
                                }
                                setEditingPageTitleById(null);
                              }
                              if (e.key === 'Escape') {
                                setEditingPageTitleById(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="flex-1 bg-[#27272a] text-white text-sm font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                          />
                        ) : (
                          <span className={`
                            text-sm font-medium flex-1 text-left
                            ${activeTab === page.uuid ? 'text-white' : 'text-neutral-500'}
                          `}>
                            {page.title}
                          </span>
                        )}

                        {/* Action Buttons - INSIDE button element */}
                        {!editingPageTitleById && (
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPageTitleById(page.id);
                              }}
                              className="text-neutral-500 hover:text-white hover:bg-white/[0.08] p-1.5 rounded-lg transition-all"
                              aria-label="Edit page title"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(page);
                              }}
                              className="text-neutral-500 hover:text-red-400 hover:bg-white/[0.08] p-1.5 rounded-lg transition-all"
                              aria-label="Delete page"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="relative px-4 py-2.5">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#161616]"></div>
                    <div className="text-center text-xs text-neutral-600 select-none">
                      {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                    </div>
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
                      ${activeTab === page.uuid 
                        ? "bg-white text-sm text-black font-bold" 
                        : "bg-[#2A2A2C] text-sm text-white hover:text-white shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
                      }
                      ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                      ${isDropTarget ? 'ring-1 ring-gray-600' : ''}
                    `}
                  >
                    <button
                      onClick={() => setActiveTab(page.uuid)}
                      className="w-full"
                    >
                      {page.title}
                    </button>
                  </div>
                );
              })}

              {/* Divider */}
              <div className="h-4 w-[2px] rounded-full bg-[#343436]"></div>

              {/* Add Page Button */}
              <button
                onClick={() => setNewPageDialog(true)}
                className="text-white transition-colors hover:border border-1 shadow-[0_4px_10px_rgba(0,0,0,0.4)] rounded-full bg-[#2A2A2C] p-2"
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
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-800"
            >
              <Settings2 size={18} />
            </button>
            {/* <SettingsPanel 
              isOpen={settingsOpen} 
              onClose={() => setSettingsOpen(false)} 
            /> */}

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