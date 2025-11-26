import React, { useState, useContext } from "react";
import {
  Plus, 
  Trash2, 
  Edit2,
  ChevronDown, 
  ChevronRight, 
  AlertTriangle
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/db/schema.js";
import {SettingsContext} from "./SettingsProvider.jsx"

const Widget = ({ widget, widgets, setWidgets }) => {
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingWidgetTitle, setEditingWidgetTitle] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // ADD THIS
  const [collapsed, setCollapsed] = useState(widget.collapsed);
  
  const [draggedLink, setDraggedLink] = useState(null);
  const [dragOverLink, setDragOverLink] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(null);

  const now = () => new Date().toISOString();
  
  const { widgetOpacity } = useContext(SettingsContext);

  const widgetStyle = {
    backgroundColor: `rgba(23, 23, 23, ${widgetOpacity / 100})`, 
    borderColor: `rgba(38, 38, 38, ${widgetOpacity / 100})`, 
  };
  
  const [newLink, setNewLink] = useState({
    name: "",
    url: "",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showConfirmDialog = (title, message, onConfirm) =>
    setConfirmDialog({ show: true, title, message, onConfirm });

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    closeConfirm();
  };

  const closeConfirm = () =>
    setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });

  // Add Link
  const addLink = async (widgetId) => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      alert("Please fill in name & URL");
      return;
    }

    let url = newLink.url.trim();
    if (!url.startsWith("http")) url = `https://${url}`;

    const maxOrder = widget.links.length > 0 
      ? Math.max(...widget.links.map(l => l.order || 0))
      : -1;

    try {
      await db.links.add({
        uuid: uuidv4(),
        name: newLink.name,
        url,
        widgetId,
        order: maxOrder + 1,
        createdAt: now(),
        updatedAt: now(),
      });
    } catch (e) {
      console.error("Failed to add link:", e);
    }

    setNewLink({ name: "", url: "" });
    setShowAddLink(false);
  };

  // Delete Link
  const deleteLink = (id) =>
    showConfirmDialog("Delete Link", "This cannot be undone", () => {
      db.links.delete(id);
    });

  // Delete Widget + all its links
  const deleteWidget = (widgetId) =>
    showConfirmDialog("Delete Widget", "This will delete all links too", async () => {
      const links = await db.links.where({ widgetId }).toArray();
      await Promise.all(links.map((l) => db.links.delete(l.id)));
      await db.widgets.delete(widgetId);
    });

  // Toggle Collapse
  const toggleCollapse = (id, collapsed) =>
    db.widgets.update(id, { collapsed: !collapsed, updatedAt: now() });

  // Update Widget Title
  const updateWidgetTitle = (id, title) => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      db.widgets.update(id, { title: "New Widget", updatedAt: now() });
    } else {
      db.widgets.update(id, { title: trimmedTitle, updatedAt: now() });
    }
  };

  // LINK DRAG & DROP HANDLERS

  const handleLinkDragStart = (e, link) => {
    setDraggedLink(link);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("linkId", link.id.toString());
  };

  const handleLinkDragEnd = () => {
    setDraggedLink(null);
    setDragOverLink(null);
  };

  const handleLinkDragOver = (e, targetLink) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedLink || draggedLink.id === targetLink.id) return;
    
    setDragOverLink(targetLink.id);
  };

  const handleLinkDrop = async (e, targetLink) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedLink || draggedLink.id === targetLink.id) return;

    if (draggedLink.widgetId === targetLink.widgetId) {
      // Reorder within same widget
      const widgetLinks = widget.links.sort((a, b) => (a.order || 0) - (b.order || 0));
      const draggedIndex = widgetLinks.findIndex(l => l.id === draggedLink.id);
      const targetIndex = widgetLinks.findIndex(l => l.id === targetLink.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const reordered = [...widgetLinks];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, removed);
        
        const updates = reordered.map((link, index) => 
          db.links.update(link.id, { order: index, updatedAt: now() })
        );
        
        await Promise.all(updates);
      }
    } else {
      // Move to different widget
      const targetWidgetLinks = widgets
        .find(w => w.id === targetLink.widgetId)?.links || [];
      
      const targetIndex = targetWidgetLinks.findIndex(l => l.id === targetLink.id);
      
      await db.links.update(draggedLink.id, {
        widgetId: targetLink.widgetId,
        order: targetIndex,
        updatedAt: now(),
      });
    }
    
    setDraggedLink(null);
    setDragOverLink(null);
  };

  // Drop on widget (when not dropping on a specific link)
  const handleWidgetDrop = async (e) => {
    e.preventDefault();
    
    if (!draggedLink || dragOverLink) return;
    
    if (draggedLink.widgetId !== widget.id) {
      const maxOrder = widget.links.length > 0 
        ? Math.max(...widget.links.map(l => l.order || 0))
        : -1;
      
      await db.links.update(draggedLink.id, {
        widgetId: widget.id,
        order: maxOrder + 1,
        updatedAt: now(),
      });
    }
    
    setDraggedLink(null);
  };

  // Sort links by order
  const sortedLinks = [...widget.links].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <>
      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#18181b] border border-gray-800 rounded-xl p-6 shadow-2xl w-80">
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
      )}

      {/* Widget Container */}
      <div 
        className="bg-[#161616] rounded-xl p-5 transition-all font-instrument shadow-[0_4px_15px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleWidgetDrop}
        style={widgetStyle}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center flex-1">
            {editingWidgetTitle ? (
              <input
                value={widget.title}
                onChange={(e) =>
                  setWidgets(prev =>
                    prev.map(x =>
                      x.id === widget.id ? { ...x, title: e.target.value } : x
                    ))
                }
                onBlur={() => {
                  const w = widgets.find(x => x.id === widget.id);
                  if (w) {
                    updateWidgetTitle(widget.id, w.title);
                  }
                  setEditingWidgetTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const w = widgets.find(x => x.id === widget.id);
                    if (w) {
                      updateWidgetTitle(widget.id, w.title);
                    }
                    setEditingWidgetTitle(false);
                  }
                  if (e.key === 'Escape') {
                    setEditingWidgetTitle(false);
                  }
                }}
                autoFocus
                className="flex-1 mr-6 bg-[#27272a] text-white text-base font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#767676]/50"
              />
            ) : (
              <button 
                onClick={() => toggleCollapse(widget.id, widget.collapsed)}
                className="flex items-center gap-2 flex-1 text-left group/title"
              >
                <h3 
                  className="text-base font-medium text-white group-hover/title:text-gray-200"
                  onDoubleClick={() => setEditingWidgetTitle(true)}
                >
                  {widget.title}
                </h3>
                <ChevronDown 
                  size={18} 
                  className={`transition-transform ${widget.collapsed ? '-rotate-90 text-gray-400' : '+rotate-90 text-gray-400'} ${isHovered ? 'opacity-100' : 'opacity-0'} `}
                />
              </button>
            )}
          </div>

          {/* Widget Actions - USE isHovered STATE */}
          <div className={`flex gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={() => setEditingWidgetTitle(true)}
              className="text-gray-400 hover:text-white hover:bg-[#27272a] p-1.5 rounded transition-colors"
            >
              <Edit2 size={14}/>
            </button>
            <button 
              onClick={() => deleteWidget(widget.id)}
              className="text-gray-400 hover:text-red-400 hover:bg-[#27272a] p-1.5 rounded transition-colors"
            >
              <Trash2 size={14}/>
            </button>
          </div>

        </div>

        {/* Widget Content */}
        {!widget.collapsed && (
          <div className="">
            {sortedLinks.map((l) => {
              const isDragging = draggedLink?.id === l.id;
              const isDropTarget = dragOverLink === l.id;

              return (
                <div 
                  key={l.id}
                  draggable
                  onDragStart={(e) => handleLinkDragStart(e, l)}
                  onDragEnd={handleLinkDragEnd}
                  onDragOver={(e) => handleLinkDragOver(e, l)}
                  onDrop={(e) => handleLinkDrop(e, l)}
                  className={`
                    group/link flex items-center gap-3 my-1 rounded-lg
                    hover:text-white  hover:underline cursor-move transition-all
                    text-sm
                    ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                    ${isDropTarget ? 'bg-[#27272a]' : ''}
                    `}
                  onMouseDown = { () => setIsMouseDown(l.id)}
                  onMouseUp={() => setIsMouseDown(null)}
                  onMouseLeave={() => setIsMouseDown(null)}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${l.url}&sz=32`}
                    className="w-4 h-4 flex-shrink-0"
                    alt=""
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <a 
                    href={l.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex-1 text-gray-300 hover:text-white truncate transition-all
                    ${isMouseDown === l.id ? "scale-[0.97] opacity-70" : "scale-100 opacity-100"}
                    `}
                  >
                    {l.name}
                  </a>
                  <button 
                    onClick={() => deleteLink(l.id)}
                    className="opacity-0 group-hover/link:opacity-100 text-gray-500 hover:text-red-400 p-1 rounded transition-all"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              );
            })}

            {showAddLink ? (
              <div className="bg-[#27272a] p-3 rounded-lg space-y-2 mt-2">
                <input
                  placeholder="Name"
                  className="w-full bg-[#18181b] text-white border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  autoFocus
                />
                <input
                  placeholder="URL"
                  className="w-full bg-[#18181b] text-white border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => addLink(widget.id)} 
                    className="flex-1 bg-white text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => { 
                      setShowAddLink(false); 
                      setNewLink({ name: "", url: "" }); 
                    }}
                    className="px-3 py-2 bg-[#18181b] text-gray-400 rounded-lg text-sm hover:bg-[#27272a] hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddLink(true)}
                className={`w-full text-left text-xs text-neutral-500 py-2 rounded-lg opacity-0 ${isHovered ? 'opacity-100' : ''} hover:text-white/75 flex items-center gap-2 mt-1 transition-all`}
              > 
                <Plus size={14}/> Add link
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Widget;