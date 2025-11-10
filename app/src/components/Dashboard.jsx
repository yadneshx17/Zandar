// import React, { useState, useEffect } from "react";
// import {
//   Plus, Edit2, Trash2, ChevronDown, ChevronRight, Grip, AlertTriangle
// } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";
// import { useLiveQuery } from "dexie-react-hooks";
// import { db } from "../db";

// // [*] CHANGE: Added activePage prop to receive current page from parent
// const Dashboard = ({ activePage = "home" }) => {
//   const dbWidgets = useLiveQuery(() => db.widgets.toArray(), []);
//   const dbLinks = useLiveQuery(() => db.links.toArray(), []);
//   const dbPages = useLiveQuery(() => db.pages.toArray(), [])

//   const [widgets, setWidgets] = useState([]);
//   const [dragged, setDragged] = useState(null);
//   const [showAddLink, setShowAddLink] = useState(null);
//   const [editingWidget, setEditingWidget] = useState(null);

//   const now = () => new Date().toISOString();

//   const [newLink, setNewLink] = useState({
//     uuid: uuidv4(),
//     name: "",
//     url: "",
//     createdAt: now(),
//     updatedAt: now(),
//     favicon: "",
//   });

//   const [confirmDialog, setConfirmDialog] = useState({
//     show: false,
//     title: "",
//     message: "",
//     onConfirm: null,
//   });

//   const showConfirmDialog = (title, message, onConfirm) =>
//     setConfirmDialog({ show: true, title, message, onConfirm });

//   const handleConfirm = () => {
//     confirmDialog.onConfirm?.();
//     closeConfirm();
//   };

//   const closeConfirm = () =>
//     setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });

//   // Auto favicon finder
//   const getFavicon = (url) => {
//     try {
//       const domain = new URL(url).origin;
//       return `${domain}/favicon.ico`;
//     } catch {
//       return "";
//     }
//   };

//   // [*] CHANGE: Filter widgets by active page
//   useEffect(() => {
//     if (dbWidgets && dbLinks) {
//       // Only show widgets that belong to the active page
//       const pageWidgets = dbWidgets.filter(widget => widget.pageId === activePage);
      
//       const data = pageWidgets.map((widget) => ({
//         ...widget,
//         links: dbLinks.filter((link) => link.widgetId === widget.id),
//       }));
//       setWidgets(data);
//     }
//   }, [dbWidgets, dbLinks, activePage]); // [*] Added activePage dependency


//   // LINKS
//   // [*] CHANGE: Add Link with pageId
//   const addLink = async (widgetId) => {
//     if (!newLink.name.trim() || !newLink.url.trim()) {
//       alert("Please fill in name & URL");
//       return;
//     }

//     let url = newLink.url.trim();
//     if (!url.startsWith("http")) url = `https://${url}`;

//     try {
//       await db.links.add({
//         uuid: uuidv4(),
//         name: newLink.name,
//         url,
//         widgetId,
//         pageId: activePage, // [*] Associate link with current page
//         favicon: getFavicon(url),
//         createdAt: now(),
//         updatedAt: now(),
//       });
//     } catch (e) {
//       console.error("Failed to add link:", e);
//     }

//     setNewLink({ uuid: uuidv4(), name: "", url: "", favicon: "" });
//     setShowAddLink(null);
//   };

//   // Delete Link
//   const deleteLink = (id) =>
//     showConfirmDialog("Delete Link", "This cannot be undone", () => {
//       db.links.delete(id);
//     });

//   // Delete Widget + all its links
//   const deleteWidget = (widgetId) =>
//     showConfirmDialog("Delete Widget", "This will delete all links too", async () => {
//       const links = await db.links.where({ widgetId }).toArray();
//       await Promise.all(links.map((l) => db.links.delete(l.id)));
//       await db.widgets.delete(widgetId);
//     });

// // [*] CHANGE: Add Widget with pageId
// const addWidget = async (columnIndex) => {
//   const currentPage = (dbPages || []).find(
//     (page) => page?.name === activePage || page?.id === activePage
//   );

//   // if (!currentPage) {
//   //   alert("Please select a page first");
//   //   return;
//   // }

//   await db.widgets.add({
//     uuid: uuidv4(),
//     title: "New Widget",
//     collapsed: false,
//     pageId: currentPage.id, // [*] Associate widget with current page
//     createdAt: now(),
//     updatedAt: now(),
//   });
// };

//   // UTILS
//   const toggleCollapse = (id, collapsed) =>
//     db.widgets.update(id, { collapsed: !collapsed, updatedAt: now() });

//   const updateWidgetTitle = (id, title) =>
//     db.widgets.update(id, { title, updatedAt: now() });

//   // Drag logic
//   const onDragStart = (link, widgetId) =>
//     setDragged({ link, from: widgetId });

//   const onDrop = async (targetWidgetId) => {
//     if (!dragged || dragged.from === targetWidgetId) return;
//     await db.links.update(dragged.link.id, {
//       widgetId: targetWidgetId,
//       updatedAt: now(),
//     });
//     setDragged(null);
//   };

//   return (
//     <div className="min-h-screen bg-white p-8">
//       {/* [*] CHANGE: Added page indicator */}
//       {/* <div className="max-w-7xl mx-auto mb-4">
//         <p className="text-sm text-gray-500">
//           {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'} on this page
//         </p>
//       </div> */}

//       {confirmDialog.show && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-5 shadow-xl w-80">
//             <div className="flex gap-2 items-center text-red-600 mb-3">
//               <AlertTriangle size={20} />
//               <b>{confirmDialog.title}</b>
//             </div>
//             <p className="text-sm mb-4">{confirmDialog.message}</p>

//             <div className="flex justify-end gap-2">
//               <button onClick={closeConfirm} className="px-3 py-1 text-sm bg-gray-200 rounded">
//                 Cancel
//               </button>
//               <button onClick={handleConfirm} className="px-3 py-1 text-sm bg-red-600 text-white rounded">
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-3 max-w-full gap-6 mx-auto">
//         {widgets.map((w) => (
//           <div key={w.id}
//             className="border border-gray-300 rounded-xl p-4 bg-white group"
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={() => onDrop(w.id)}
//           >
//             {/* Header */}
//             <div className="flex justify-between mb-3">
//               <div className="flex gap-2 items-center flex-1">
//                 <button onClick={() => toggleCollapse(w.id, w.collapsed)}>
//                   {w.collapsed ? <ChevronRight /> : <ChevronDown />}
//                 </button>

//                 {editingWidget === w.id ? (
//                   <input
//                     value={w.title}
//                     onChange={(e) =>
//                       setWidgets(prev =>
//                         prev.map(x => x.id === w.id ? { ...x, title: e.target.value } : x)
//                       )
//                     }
//                     onBlur={() => {
//                       updateWidgetTitle(w.id, w.title);
//                       setEditingWidget(null);
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') {
//                         updateWidgetTitle(w.id, w.title);
//                         setEditingWidget(null);
//                       }
//                     }}
//                     autoFocus
//                     className="text-sm border px-2 py-1 rounded"
//                   />
//                 ) : (
//                   <h3 className="text-sm font-semibold">{w.title}</h3>
//                 )}
//               </div>

//               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
//                 <button onClick={() => setEditingWidget(w.id)}><Edit2 size={14}/></button>
//                 <button onClick={() => deleteWidget(w.id)}><Trash2 size={14}/></button>
//                 {/* <button onClick={() => setShowAddLink(w.id)}><Plus size={14}/></button> */}
//               </div>
//             </div>

//             {!w.collapsed && (
//               <div className="space-y-1">
//                 {w.links.map((l) => (
//                   <div key={l.id}
//                     draggable
//                     onDragStart={() => onDragStart(l, w.id)}
//                     className="group/link flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-move"
//                   >
//                     <Grip size={14} className="text-gray-400 opacity-0 group-hover/link:opacity-100"/>
//                     <img
//                       src={l.favicon || getFavicon(l.url)}
//                       className="w-4 h-4"
//                       onError={(e) => (e.target.style.display = "none")}
//                     />
//                     <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm truncate">
//                       {l.name}
//                     </a>
//                     <button 
//                       onClick={() => deleteLink(l.id)}
//                       className="opacity-0 group-hover/link:opacity-100"
//                     >
//                       <Trash2 size={14}/>
//                     </button>
//                   </div>
//                 ))}

//                 {showAddLink === w.id && (
//                   <div className="bg-gray-50 p-2 rounded space-y-2">
//                     <input
//                       placeholder="Name"
//                       className="w-full border px-2 py-1 rounded text-sm"
//                       value={newLink.name}
//                       onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
//                     />
//                     <input
//                       placeholder="URL"
//                       className="w-full border px-2 py-1 rounded text-sm"
//                       value={newLink.url}
//                       onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
//                     />
//                     <div className="flex gap-2">
//                       <button onClick={() => addLink(w.id)} className="bg-black text-white px-3 py-1 rounded text-xs">
//                         Add
//                       </button>
//                       <button onClick={() => { setShowAddLink(null); setNewLink({ name: "", url: "" }); }}
//                         className="bg-gray-200 text-xs px-3 py-1 rounded">Cancel</button>
//                     </div>
//                   </div>
//                 )}

//                 {showAddLink !== w.id && (
//                   <button onClick={() => setShowAddLink(w.id)}
//                     className="w-full text-left text-xs text-gray-500 px-4 py-1 rounded hover:bg-gray-200 flex items-center gap-1"> 
//                     <Plus size={12}/> Add link
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}

        
//         {/* [*] CHANGE: Show empty state when no widgets on page */}
//         {widgets.length === 0 ? (
//           <div className="col-span-3 flex flex-col items-center justify-center py-12 text-gray-400">
//             <p className="mb-2 text-lg">No widgets on this page yet</p>
//             <p className="text-sm mb-6">Click "Add Widget" below to get started</p>
//             <button 
//               onClick={addWidget}
//               className="border-2 border-dashed rounded-xl p-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 min-h-[200px] min-w-[300px] transition-colors">
//               <Plus size={32}/>
//               <span className="font-medium">Add Widget</span>
//             </button>
//           </div>
//         ) : (
//           <button 
//               onClick={addWidget}
//               className="border-2 border-dashed rounded-xl p-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 min-h-[200px] min-w-[300px] transition-colors">
//               <Plus size={32}/>
//               <span className="font-medium">Add Widget</span>
//             </button>
//           )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronRight, Grip, AlertTriangle,
  X
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

// [*] CHANGE: Receive activePage (should be page title like "Home")
const Dashboard = ({ activePage = "Home" }) => {
  const dbWidgets = useLiveQuery(() => db.widgets.toArray(), []);
  const dbLinks = useLiveQuery(() => db.links.toArray(), []);
  const dbPages = useLiveQuery(() => db.pages.toArray(), []);

  const [widgets, setWidgets] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [showAddLink, setShowAddLink] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null); // widget id

  const now = () => new Date().toISOString();

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

  // [*] CHANGE: Get the current page ID from the page title (memoized to prevent effect thrash)
  const getCurrentPageId = useCallback(() => {
    if (!dbPages || !activePage) return null;
    const page = dbPages.find(p => p.title === activePage);
    return page ? page.id : null;
  }, [dbPages, activePage]);

  // [*] CHANGE: Filter widgets by current page ID
  useEffect(() => {
    console.log("Active Page:", activePage);
    console.log("DB Pages:", dbPages);
    console.log("DB Widgets:", dbWidgets);
    
    if (dbWidgets && dbLinks && dbPages) {
      const currentPageId = getCurrentPageId();
      
      console.log("Current Page ID:", currentPageId);
      
      if (!currentPageId) {
        setWidgets([]);
        return;
      }

      // [*] Filter widgets that belong to this page's ID
      const pageWidgets = dbWidgets.filter(widget => {
        console.log(`Widget ${widget.id} pageId: ${widget.pageId}, comparing to: ${currentPageId}`);
        return widget.pageId === currentPageId;
      });
      
      console.log("Filtered Page Widgets:", pageWidgets);
      
      const data = pageWidgets.map((widget) => ({
        ...widget,
        links: dbLinks.filter((link) => link.widgetId === widget.id),
      }));
      
      setWidgets(data);
    }
  }, [dbWidgets, dbLinks, dbPages, activePage, getCurrentPageId]); // [*] FIX: Added dependencies

  // LINKS
  // [*] CHANGE: Add Link with correct pageId
  const addLink = async (widgetId) => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      alert("Please fill in name & URL");
      return;
    }

    let url = newLink.url.trim();
    if (!url.startsWith("http")) url = `https://${url}`;

    const currentPageId = getCurrentPageId();
    if (!currentPageId) {
      alert("No page selected");
      return;
    }

    try {
      await db.links.add({
        uuid: uuidv4(),
        name: newLink.name,
        url,
        widgetId,
        createdAt: now(),
        updatedAt: now(),
      });
    } catch (e) {
      console.error("Failed to add link:", e);
    }

    setNewLink({ name: "", url: "" }); // [*] FIX: Simplified state reset
    setShowAddLink(null);
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

  // [*] CHANGE: Add Widget with correct pageId
  const addWidget = async () => {
    const currentPageId = getCurrentPageId();

    if (!currentPageId) {
      alert("Please select a page first");
      return;
    }

    await db.widgets.add({
      uuid: uuidv4(),
      title: "New Widget",
      collapsed: false,
      pageId: currentPageId,
      createdAt: now(),
      updatedAt: now(),
    });
  };

  // UTILS
  const toggleCollapse = (id, collapsed) =>
    db.widgets.update(id, { collapsed: !collapsed, updatedAt: now() });

  const updateWidgetTitle = (id, title) => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      // Prevent empty titles by using a default value
      db.widgets.update(id, { title: "New Widget", updatedAt: now() });
    } else {
      db.widgets.update(id, { title: trimmedTitle, updatedAt: now() });
    }
  }

  // Drag logic
  const onDragStart = (link, widgetId) =>
    setDragged({ link, from: widgetId });

  const onDrop = async (targetWidgetId) => {
    if (!dragged || dragged.from === targetWidgetId) return;
    await db.links.update(dragged.link.id, {
      widgetId: targetWidgetId,
      updatedAt: now(),
    });
    setDragged(null);
  };

  // [*] CHANGE: Show loading state
  if (!dbPages) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* [*] CHANGE: Debug info - remove this in production */}
      <div className="max-w-full mx-auto mb-4 text-xs text-black">
        <p>Active Page: {activePage} | Page ID: {getCurrentPageId()} | Widgets: {widgets.length}</p>
      </div>

      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 shadow-xl w-80">
            <div className="flex gap-2 items-center text-red-600 mb-3">
              <AlertTriangle size={20} />
              <b>{confirmDialog.title}</b>
            </div>
            <p className="text-sm mb-4">{confirmDialog.message}</p>

            <div className="flex justify-end gap-2">
              <button 
                onClick={closeConfirm} 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm} 
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 max-w-full mx-auto">
        {/* [*] CHANGE: Empty state OR widgets */}
        {widgets.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="mb-2 text-lg">No widgets on this page yet</p>
            <p className="text-sm mb-6">Click "Add Widget" to get started</p>
            <button 
              onClick={addWidget}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex flex-col items-center justify-center gap-3 min-h-[200px] min-w-[300px] transition-colors"
            >
              <Plus size={40}/>
              <span className="font-medium text-lg">Add Widget</span>
            </button>
          </div>
        ) : (
          <>
            {widgets.map((w) => (
              <div 
                key={w.id}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white hover:border-gray-400 transition-colors group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(w.id)}
              >
                {/* Header */}
                <div className="flex justify-between mb-3">
                  <div className="flex gap-2 items-center flex-1">
                    <button onClick={() => toggleCollapse(w.id, w.collapsed)}>
                      {w.collapsed ? <ChevronRight size={16}/> : <ChevronDown size={16}/>}
                    </button>

                    {editingWidget === w.id ? (
                      <input
                        value={w.title}
                        onChange={(e) =>
                        setWidgets(prev =>
                          prev.map(x =>
                            x.id === w.id ? { ...x, title: e.target.value } : x
                          ))
                        }
                        onBlur={(e) => {
                          const widget = widgets.find(x => x.id === w.id);
                          if (widget) {
                            updateWidgetTitle(w.id, widget.title);
                          }
                          setEditingWidget(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const widget = widgets.find(x => x.id === w.id);
                            if (widget) {
                              updateWidgetTitle(w.id, widget.title);
                            }
                            setEditingWidget(null);
                          }
                          if (e.key === 'Escape') {
                            setEditingWidget(null);
                          }
                        }}
                        autoFocus
                        className="text-sm border border-gray-300 px-2 py-1 rounded flex-1 focus:outline-none focus:border-gray-400"
                      />
                    ) : (
                      <h3 className="text-sm font-semibold">{w.title}</h3>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => setEditingWidget(w.id)}
                      className="hover:bg-gray-100 p-1 rounded"
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button 
                      onClick={() => deleteWidget(w.id)}
                      className="hover:bg-gray-100 p-1 rounded"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                {!w.collapsed && (
                  <div className="space-y-1">
                    {w.links.map((l) => (
                      <div 
                        key={l.id}
                        draggable
                        onDragStart={() => onDragStart(l, w.id)}
                        className="group/link flex items-center gap-2 px-2 rounded hover:bg-gray-50 cursor-move"
                      >
                        <Grip size={14} className="text-gray-400 opacity-0 group-hover/link:opacity-100"/>
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${l.url}&sz=32`}
                          className="w-4 h-4"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <a 
                          href={l.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 text-sm truncate hover:text-blue-600"
                        >
                          {l.name}
                        </a>
                        <button 
                          onClick={() => deleteLink(l.id)}
                          className="opacity-0 group-hover/link:opacity-100 hover:bg-gray-200 p-1 rounded"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ))}

                    {showAddLink === w.id ? (
                      <div className="bg-gray-50 p-2 rounded space-y-2 mt-2">
                        <input
                          placeholder="Name"
                          className="w-full border border-gray-300 px-2 py-1 rounded text-sm focus:outline-none focus:border-gray-400"
                          value={newLink.name}
                          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                          autoFocus
                        />
                        <input
                          placeholder="URL"
                          className="w-full border border-gray-300 px-2 py-1 rounded text-sm focus:outline-none focus:border-gray-400"
                          value={newLink.url}
                          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => addLink(w.id)} 
                            className="flex-1 bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
                          >
                            Add
                          </button>
                          <button 
                            onClick={() => { 
                              setShowAddLink(null); 
                              setNewLink({ name: "", url: "" }); 
                            }}
                            className="bg-gray-200 text-xs px-3 py-1 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowAddLink(w.id)}
                        className="w-full text-left text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100"
                      > 
                        <Plus size={12}/> Add link
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button 
              onClick={addWidget}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 min-h-[200px] transition-colors"
            >
              <Plus size={32}/>
              <span className="font-medium">Add Widget</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;