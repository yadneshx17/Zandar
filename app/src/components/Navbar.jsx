// import React, { useState, useEffect } from "react";
// import {
//   PanelRight,
//   X,
//   Pencil,
//   Home,
//   FileText,
//   Settings,
//   Plus,
//   Search,
//   Edit3,
//   User,
// } from "lucide-react";
// import { db } from "../db";
// // [*] CHANGE: Import useLiveQuery for reactive database queries
// import { useLiveQuery } from 'dexie-react-hooks';

// export default function NavigationBar() {
//   const [activeTab, setActiveTab] = useState("");

//   // Load pages from IndexedDB.
//   const dbPages = useLiveQuery(() => db.pages.toArray(), []);
//   const [pages, setPages] = useState([]);
  
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);  
//   const [newPageDialog, setNewPageDialog] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState(false);
//   const [newPage, setNewPage] = useState({ name: "", description: "" });

//   // [*] CHANGE: Sync IndexedDB pages to local state
//   useEffect(() => {
//     if (dbPages) {
//       // console.log(dbPages[0])
//       setPages(dbPages);
//     }
//   }, [dbPages]);

//   // [*] CHANGE: Updated delete function to work with IndexedDB
//   const handleDeletePage = async (pageToDelete) => {
//     try {
//       // Delete from IndexedDB
//       await db.pages.delete(pageToDelete.id);
      
//       // Update active tab if deleted page was active
//       if (activeTab === pageToDelete.name) {
//         const remainingPages = pages.filter(p => p.id !== pageToDelete.id);
//         setActiveTab(remainingPages.length > 0 ? remainingPages[0].name : "home");
//       }
      
//       setDeleteConfirm(null);
//     } catch (error) {
//       console.error("Failed to delete page:", error);
//       alert("Error: Failed to delete page");
//     }
//   };

//   // [*] CHANGE: Updated addPage to close dialog and clear form properly
//   const addPage = async () => {
//     if (!newPage.name.trim() || !newPage.description.trim()) {
//       alert("Please fill in both name and description");
//       return;
//     }
//     try {
//       await db.pages.add({
//         name: newPage.name,
//         description: newPage.description,
//       });

//       setNewPage({ name: "", description: "" });
//       setNewPageDialog(false); // [*] Close dialog after adding
//     } catch (error) {
//       console.error("Failed to add page:", error);
//       alert("Error: Failed to add page");
//     }
//   };

//   // Keyboard support for Escape key
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === "Escape") {
//         setSearchOpen(false);
//         setSidebarOpen(false);
//       }
//     };
//     window.addEventListener("keydown", handleEscape);
//     return () => window.removeEventListener("keydown", handleEscape);
//   }, []);

//   return (
//     <>
//       <nav className="relative">
//         <div className="border border-black">
//           <div className="flex items-center justify-between my-1">
//             {/* Left side - Pages section */}
//             <div className="flex items-center relative">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="flex items-center p-1 px-3 mx-2 hover:bg-gray-100 transition-colors rounded-md"
//                 aria-label="Toggle sidebar"
//               >
//                 <PanelRight />
//               </button>

//               {/* Pages Sidebar */}
//               {sidebarOpen && (
//                 <>
//                   {/* Backdrop */}
//                   <div
//                     className="fixed inset-0 z-30"
//                     onClick={() => setSidebarOpen(false)}
//                     aria-hidden="true"
//                   />

//                   {/* Sidebar Dropdown  */}
//                   <div
//                     className="fixed top-16 left-2 w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-40 rounded overflow-hidden"
//                     role="dialog"
//                     aria-label="Pages sidebar"
//                   >
//                     {/* Sidebar Header */}
//                     <div className="flex items-center justify-between p-4 border-b border-slate-700">
//                       <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                         Pages
//                       </h2>

//                       {/* Close btn */}
//                       <button
//                         onClick={() => setSidebarOpen(false)}
//                         className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
//                         aria-label="Close sidebar"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>

//                     {/* Sidebar Content */}
//                     <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
//                       {/* Pages List */}
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-between px-2">
//                           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                             Your Pages
//                           </p>
//                           <button
//                             onClick={() => {
//                               setSidebarOpen(false);
//                               setNewPageDialog(true);
//                             }}
//                             className="text-cyan-400 hover:text-cyan-300 transition-colors"
//                             aria-label="Add new page"
//                           >
//                             <Plus className="w-4 h-4" />
//                           </button>
//                         </div>

//                         {/* [*] CHANGE: Updated to display pages from IndexedDB with name and description */}
//                         <div>
//                           {pages.map((page, idx) => (
//                             <div
//                               className="flex items-center justify-between mx-1 group/item"
//                               key={page.id}
//                             >
//                               <button
//                                 onClick={() => {
//                                   setActiveTab(page.name);
//                                   setSidebarOpen(false);
//                                 }}
//                                 className={`w-full flex items-center gap-3 p-2 my-1 rounded-lg transition-all ${
//                                   activeTab === page.name
//                                     ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
//                                     : "text-gray-300 hover:bg-slate-700"
//                                 }`}
//                                 aria-label={`Go to ${page.name}`}
//                                 aria-current={
//                                   activeTab === page.name ? "page" : undefined
//                                 }
//                               >
//                                 <div className="flex flex-col items-start gap-1 flex-1">
//                                   <div className="flex items-center gap-2">
//                                     <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
//                                     <span className="font-medium text-sm">
//                                       {page.name}
//                                     </span>
//                                   </div>
//                                   {/* [*] CHANGE: Added description display */}
//                                   {/* {page.description && (
//                                     <span className="text-xs text-gray-400 ml-4 truncate w-full">
//                                       {page.description}
//                                     </span>
//                                   )} */}
//                                 </div>
//                               </button>

//                               <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     // TODO: Add edit functionality
//                                     // setEditPage(page);
//                                   }}
//                                   className="hover:bg-blue-500/20 p-1 rounded transition-colors group/edit"
//                                   aria-label={`Edit ${page.name}`}
//                                 >
//                                   <Pencil className="w-4 h-4 text-gray-400 group-hover/edit:text-blue-500 transition-colors" />
//                                 </button>

//                                 {/* [*] CHANGE: Pass entire page object instead of just name */}
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setDeleteConfirm(page);
//                                   }}
//                                   className="hover:bg-red-500/20 p-1 rounded transition-colors group/delete"
//                                   aria-label={`Delete ${page.name}`}
//                                 >
//                                   <X className="w-4 h-4 text-gray-400 group-hover/delete:text-red-500 transition-colors" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Sidebar Footer */}
//                     <div className="p-3 border-t border-slate-700 bg-slate-900">
//                       <button
//                         className="w-full flex items-center justify-center gap-3 p-2 text-gray-300 hover:bg-slate-700 rounded-lg transition-all"
//                         aria-label="Open settings"
//                       >
//                         <span className="text-sm">
//                           {/* [*] CHANGE: Show page count */}
//                           {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
//                         </span>
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* TABS */}
//               {/* [*] CHANGE: Updated tabs to display page names from IndexedDB */}
//               <div className="space-x-3">
//                 {pages.map((page) => (
//                   <button
//                     className={`border-2 border-black rounded-lg p-1 text-black transition-colors ${
//                       activeTab === page.name ? "bg-cyan-500 shadow-2xl shadow-cyan-500/50" : "text-gray-300 hover:bg-cyan-400"
//                     }`}
//                     key={page.id}
//                     onClick={() => setActiveTab(page.name)}
//                     aria-label={`Switch to ${page.name}`}
//                   >
//                     {page.name}
//                   </button>
//                 ))}
//               </div>

//               <button
//                 className="mx-3"
//                 onClick={() => {
//                   setNewPageDialog(true);
//                 }}
//                 aria-label="Add new page"
//               >
//                 <Plus className="border-2 border-black rounded-full border-dotted hover:bg-emerald-500 transition-colors" />
//               </button>
//             </div>

//             {/* Right side - Search, Edit, Account */}
//             <div className="flex items-center space-x-4 mx-3">
//               {/* Search Icon */}
//               <button
//                 onClick={() => setSearchOpen(true)}
//                 className="hover:bg-gray-100 p-2 rounded-md transition-colors"
//                 aria-label="Open search"
//               >
//                 <Search className="w-5 h-5 text-gray-700" />
//               </button>

//               <button
//                 className="hover:bg-gray-100 p-2 rounded-md transition-colors"
//                 aria-label="Edit mode"
//               >
//                 <Edit3 className="w-5 h-5 text-gray-700" />
//               </button>

//               <button
//                 className="hover:bg-gray-100 p-2 rounded-md transition-colors"
//                 aria-label="Account settings"
//               >
//                 <User className="w-5 h-5 text-gray-700" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Search Modal Overlay */}
//       {searchOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setSearchOpen(false)}
//           role="dialog"
//           aria-modal="true"
//           aria-label="Search dialog"
//         >
//           <div
//             className="bg-white rounded-lg shadow-2xl w-96 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center border-b-2 border-gray-300 pb-2">
//               <Search className="w-5 h-5 text-gray-500" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 autoFocus
//                 className="ml-3 outline-none text-lg w-full"
//                 aria-label="Search input"
//               />
//               <button
//                 onClick={() => setSearchOpen(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//                 aria-label="Close search"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/*  New Page Dialog */}
//       {newPageDialog && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setNewPageDialog(false)}
//           role="dialog"
//           aria-modal="true"
//           aria-label="New page dialog"
//         >
//           <div
//             className="bg-white rounded-lg shadow-2xl w-96 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Header with close button */}
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Create New Page
//               </h2>
//               <button
//                 onClick={() => setNewPageDialog(false)}
//                 className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
//                 aria-label="Close dialog"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Form content */}
//             <div className="space-y-5">
//               {/* Title input */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Title
//                 </label>
//                 <input
//                   type="text"
//                   value={newPage.name}
//                   onChange={(e) =>
//                     setNewPage({ ...newPage, name: e.target.value })
//                   }
//                   placeholder="Enter title (e.g. Study, Socials, etc.)"
//                   autoFocus
//                   className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
//                   aria-label="Page title"
//                 />
//               </div>

//               {/* Description input */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={newPage.description}
//                   onChange={(e) =>
//                     setNewPage({ ...newPage, description: e.target.value })
//                   }
//                   placeholder="About this page..."
//                   rows="3"
//                   className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all resize-none"
//                   aria-label="Page description"
//                 />
//               </div>

//               {/* Action buttons */}
//               {/* [*] CHANGE: Fixed button to properly call addPage */}
//               <div className="flex gap-3 pt-4">
//                 <button
//                   onClick={() => setNewPageDialog(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={addPage}
//                   className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-lg shadow-cyan-500/30"
//                 >
//                   Create
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {/* [*] CHANGE: Updated to work with page object instead of just name */}
//       {deleteConfirm && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setDeleteConfirm(null)}
//           role="dialog"
//           aria-modal="true"
//           aria-label="Delete confirmation"
//         >
//           <div
//             className="bg-white rounded-lg shadow-2xl w-96 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="mb-4">
//               <h3 className="text-xl font-bold text-gray-900 mb-2">
//                 Delete Page?
//               </h3>
//               <p className="text-gray-600">
//                 Are you sure you want to delete "
//                 <span className="font-semibold">{deleteConfirm.name}</span>"? This
//                 action cannot be undone.
//               </p>
//             </div>

//             <div className="flex gap-3 justify-end">
//               <button
//                 onClick={() => setDeleteConfirm(null)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleDeletePage(deleteConfirm)}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

//  -------------------------------------------------------------------

// import React, { useState, useEffect } from "react";
// import {
//   PanelRight,
//   X,
//   Pencil,
//   Plus,
//   Search,
//   Edit3,
//   User,
// } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";
// import { db } from "../db";
// import { useLiveQuery } from 'dexie-react-hooks';

// // [*] CHANGE: Accept activeTab and setActiveTab as props
// export default function NavigationBar({ activeTab, setActiveTab }) {
//   // Load pages from IndexedDB
//   const dbPages = useLiveQuery(() => db.pages.toArray(), []);
//   const [pages, setPages] = useState([]);
  
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);  
//   const [newPageDialog, setNewPageDialog] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState(false);
//   const [newPage, setNewPage] = useState({ title: "", description: "" }); // [*] Changed 'name' to 'title'

//   const now = () => new Date().toISOString();

//   // [*] CHANGE: Sync IndexedDB pages to local state and set initial active tab
//   useEffect(() => {
//     if (dbPages && dbPages.length > 0) {
//       setPages(dbPages);
      
//       // [*] Set first page as active if no active tab is set
//       if (!activeTab && dbPages.length > 0) {
//         setActiveTab(dbPages[0].title);
//       }
//     }
//   }, [dbPages]);

//   // [*] CHANGE: Updated delete function with proper cleanup
//   const handleDeletePage = async (pageToDelete) => {
//     try {
//       // Delete all widgets on this page
//       const widgets = await db.widgets.where({ pageId: pageToDelete.id }).toArray();
      
//       // Delete all links in those widgets
//       for (const widget of widgets) {
//         await db.links.where({ widgetId: widget.id }).delete();
//       }
      
//       // Delete all widgets on this page
//       await db.widgets.where({ pageId: pageToDelete.id }).delete();
      
//       // Delete the page itself
//       await db.pages.delete(pageToDelete.id);
      
//       // Update active tab if deleted page was active
//       if (activeTab === pageToDelete.title) {
//         const remainingPages = pages.filter(p => p.id !== pageToDelete.id);
//         setActiveTab(remainingPages.length > 0 ? remainingPages[0].title : "");
//       }
      
//       setDeleteConfirm(null);
//     } catch (error) {
//       console.error("Failed to delete page:", error);
//       alert("Error: Failed to delete page");
//     }
//   };

//   // [*] CHANGE: Updated addPage to use 'title' instead of 'name'
//   const addPage = async () => {
//     if (!newPage.title.trim()) {
//       alert("Please enter a page title");
//       return;
//     }
    
//     try {
//       const pageId = await db.pages.add({
//         uuid: uuidv4(),
//         title: newPage.title, // [*] Using 'title' to match schema
//         createdAt: now(),
//         updatedAt: now(),
//       });

//       // [*] Set newly created page as active
//       setActiveTab(newPage.title);
      
//       setNewPage({ title: "", description: "" });
//       setNewPageDialog(false);
//     } catch (error) {
//       console.error("Failed to add page:", error);
//       alert("Error: Failed to add page");
//     }
//   };

//   // Keyboard support for Escape key
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === "Escape") {
//         setSearchOpen(false);
//         setSidebarOpen(false);
//         setNewPageDialog(false);
//       }
//     };
//     window.addEventListener("keydown", handleEscape);
//     return () => window.removeEventListener("keydown", handleEscape);
//   }, []);

//   return (
//     <>
//       <nav className="relative">
//         <div className="border border-black">
//           <div className="flex items-center justify-between my-1">
//             {/* Left side - Pages section */}
//             <div className="flex items-center relative">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="flex items-center p-1 px-3 mx-2 hover:bg-gray-100 transition-colors rounded-md"
//                 aria-label="Toggle sidebar"
//               >
//                 <PanelRight />
//               </button>

//               {/* Pages Sidebar */}
//               {sidebarOpen && (
//                 <>
//                   {/* Backdrop */}
//                   <div
//                     className="fixed inset-0 z-30"
//                     onClick={() => setSidebarOpen(false)}
//                     aria-hidden="true"
//                   />

//                   {/* Sidebar Dropdown  */}
//                   <div
//                     className="fixed top-16 left-2 w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-40 rounded overflow-hidden"
//                     role="dialog"
//                     aria-label="Pages sidebar"
//                   >
//                     {/* Sidebar Header */}
//                     <div className="flex items-center justify-between p-4 border-b border-slate-700">
//                       <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                         Pages
//                       </h2>

//                       <button
//                         onClick={() => setSidebarOpen(false)}
//                         className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
//                         aria-label="Close sidebar"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>

//                     {/* Sidebar Content */}
//                     <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-between px-2">
//                           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                             Your Pages
//                           </p>
//                           <button
//                             onClick={() => {
//                               setSidebarOpen(false);
//                               setNewPageDialog(true);
//                             }}
//                             className="text-cyan-400 hover:text-cyan-300 transition-colors"
//                             aria-label="Add new page"
//                           >
//                             <Plus className="w-4 h-4" />
//                           </button>
//                         </div>

//                         {/* [*] CHANGE: Use page.title instead of page.name */}
//                         <div>
//                           {pages.map((page) => (
//                             <div
//                               className="flex items-center justify-between mx-1 group/item"
//                               key={page.id}
//                             >
//                               <button
//                                 onClick={() => {
//                                   setActiveTab(page.title);
//                                   setSidebarOpen(false);
//                                 }}
//                                 className={`w-full flex items-center gap-3 p-2 my-1 rounded-lg transition-all ${
//                                   activeTab === page.title
//                                     ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
//                                     : "text-gray-300 hover:bg-slate-700"
//                                 }`}
//                                 aria-label={`Go to ${page.title}`}
//                                 aria-current={
//                                   activeTab === page.title ? "page" : undefined
//                                 }
//                               >
//                                 <div className="flex flex-col items-start gap-1 flex-1">
//                                   <div className="flex items-center gap-2">
//                                     <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
//                                     <span className="font-medium text-sm">
//                                       {page.title}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </button>

//                               <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     // TODO: Add edit functionality
//                                   }}
//                                   className="hover:bg-blue-500/20 p-1 rounded transition-colors group/edit"
//                                   aria-label={`Edit ${page.title}`}
//                                 >
//                                   <Pencil className="w-4 h-4 text-gray-400 group-hover/edit:text-blue-500 transition-colors" />
//                                 </button>

//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setDeleteConfirm(page);
//                                   }}
//                                   className="hover:bg-red-500/20 p-1 rounded transition-colors group/delete"
//                                   aria-label={`Delete ${page.title}`}
//                                 >
//                                   <X className="w-4 h-4 text-gray-400 group-hover/delete:text-red-500 transition-colors" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Sidebar Footer */}
//                     <div className="p-3 border-t border-slate-700 bg-slate-900">
//                       <div className="text-center text-sm text-gray-400">
//                         {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* TABS */}
//               {/* [*] CHANGE: Use page.title instead of page.name */}
//               <div className="space-x-3">
//                 {pages.slice(0, 5).map((page) => (
//                   <button
//                     className={`border-2 border-black rounded-lg px-3 py-1 transition-colors ${
//                       activeTab === page.title 
//                         ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50" 
//                         : "text-gray-700 hover:bg-cyan-400 hover:text-white"
//                     }`}
//                     key={page.id}
//                     onClick={() => setActiveTab(page.title)}
//                     aria-label={`Switch to ${page.title}`}
//                   >
//                     {page.title}
//                   </button>
//                 ))}
//                 {pages.length > 5 && (
//                   <span className="text-gray-400 text-sm">+{pages.length - 5} more</span>
//                 )}
//               </div>

//               <button
//                 className="mx-3"
//                 onClick={() => {
//                   setNewPageDialog(true);
//                 }}
//                 aria-label="Add new page"
//               >
//                 <Plus className="border-2 border-black rounded-full border-dotted hover:bg-emerald-500 transition-colors" />
//               </button>
//             </div>

//             {/* Right side - Search, Edit, Account */}
//             <div className="flex items-center space-x-4 mx-3">
//               <button
//                 onClick={() => setSearchOpen(true)}
//                 className="hover:bg-gray-100 p-2 rounded-md transition-colors"
//                 aria-label="Open search"
//               >
//                 <Search className="w-5 h-5 text-gray-700" />
//               </button>

//               <button
//                 className="hover:bg-gray-100 p-2 rounded-md transition-colors"
//                 aria-label="Edit mode"
//               >
//                 <Edit3 className="w-5 h-5 text-gray-700" />
//               </button>

//               <button
//                 className="hover:bg-gray-100 p-2 rounded-md transition-colors"
//                 aria-label="Account settings"
//               >
//                 <User className="w-5 h-5 text-gray-700" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Search Modal */}
//       {searchOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setSearchOpen(false)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="bg-white rounded-lg shadow-2xl w-96 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center border-b-2 border-gray-300 pb-2">
//               <Search className="w-5 h-5 text-gray-500" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 autoFocus
//                 className="ml-3 outline-none text-lg w-full"
//               />
//               <button
//                 onClick={() => setSearchOpen(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* New Page Dialog */}
//       {newPageDialog && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setNewPageDialog(false)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="bg-white rounded-lg shadow-2xl w-96 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Create New Page
//               </h2>
//               <button
//                 onClick={() => setNewPageDialog(false)}
//                 className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="space-y-5">
//               {/* [*] CHANGE: Use 'title' instead of 'name' */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Page Title
//                 </label>
//                 <input
//                   type="text"
//                   value={newPage.title}
//                   onChange={(e) =>
//                     setNewPage({ ...newPage, title: e.target.value })
//                   }
//                   placeholder="Enter page title (e.g. Work, Personal, etc.)"
//                   autoFocus
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter' && newPage.title.trim()) {
//                       addPage();
//                     }
//                   }}
//                   className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
//                 />
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   onClick={() => setNewPageDialog(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={addPage}
//                   className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-lg shadow-cyan-500/30"
//                 >
//                   Create
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteConfirm && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//           onClick={() => setDeleteConfirm(null)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="bg-white rounded-lg shadow-2xl w-96 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="mb-4">
//               <h3 className="text-xl font-bold text-gray-900 mb-2">
//                 Delete Page?
//               </h3>
//               <p className="text-gray-600">
//                 Are you sure you want to delete "
//                 <span className="font-semibold">{deleteConfirm.title}</span>"? 
//                 This will also delete all widgets and links on this page.
//               </p>
//             </div>

//             <div className="flex gap-3 justify-end">
//               <button
//                 onClick={() => setDeleteConfirm(null)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
                // onClick={() => handleDeletePage(deleteConfirm)}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  PanelRight,
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

// [*] CHANGE: Accept activeTab and setActiveTab as props
export default function NavBar({ activeTab, setActiveTab }) {
  // Load pages from IndexedDB
  const dbPages = useLiveQuery(() => db.pages.toArray(), []);
  const [pages, setPages] = useState([]);
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [newPageDialog, setNewPageDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // [*] FIX: Changed from false to null
  const [newPage, setNewPage] = useState({ title: "" }); // [*] FIX: Removed description

  const now = () => new Date().toISOString();

  // [*] CHANGE: Sync IndexedDB pages to local state and set initial active tab
  useEffect(() => {
    if (dbPages && dbPages.length > 0) {
      setPages(dbPages);
      
      // [*] Set first page as active if no active tab is set
      if (!activeTab) {
        setActiveTab(dbPages[0].title);
      }
    }
  }, [dbPages, activeTab, setActiveTab]); // [*] FIX: Added dependencies

  // [*] CHANGE: Updated delete function with proper cleanup
  const handleDeletePage = async (pageToDelete) => {
    try {
      // Delete all widgets on this page
      const widgets = await db.widgets.where({ pageId: pageToDelete.id }).toArray();
      
      // Delete all links in those widgets
      for (const widget of widgets) {
        await db.links.where({ widgetId: widget.id }).delete();
      }
      
      // Delete all widgets on this page
      await db.widgets.where({ pageId: pageToDelete.id }).delete();
      
      // Delete the page itself
      await db.pages.delete(pageToDelete.id);
      
      // Update active tab if deleted page was active
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

  // [*] FIX: Updated addPage to match schema
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

      // [*] Set newly created page as active
      setActiveTab(newPage.title);
      
      setNewPage({ title: "" });
      setNewPageDialog(false);
    } catch (error) {
      console.error("Failed to add page:", error);
      alert("Error: Failed to add page");
    }
  };

  // Keyboard support for Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSidebarOpen(false);
        setNewPageDialog(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <nav className="relative">
        <div className="border border-black">
          <div className="flex items-center justify-between my-1">
            {/* Left side - Pages section */}
            <div className="flex items-center relative">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center p-1 px-3 mx-2 hover:bg-gray-100 transition-colors rounded-md"
                aria-label="Toggle sidebar"
              >
                <PanelRight />
              </button>

              {/* Pages Sidebar */}
              {sidebarOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Sidebar Dropdown  */}
                  <div
                    className="fixed top-16 left-2 w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-40 rounded overflow-hidden"
                    role="dialog"
                    aria-label="Pages sidebar"
                  >
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Pages
                      </h2>

                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
                        aria-label="Close sidebar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Your Pages
                          </p>
                          <button
                            onClick={() => {
                              setSidebarOpen(false);
                              setNewPageDialog(true);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label="Add new page"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          {pages.map((page) => (
                            <div
                              className="flex items-center justify-between mx-1 group/item"
                              key={page.id}
                            >
                              <button
                                onClick={() => {
                                  setActiveTab(page.title);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-2 my-1 rounded-lg transition-all ${
                                  activeTab === page.title
                                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
                                    : "text-gray-300 hover:bg-slate-700"
                                }`}
                                aria-label={`Go to ${page.title}`}
                                aria-current={
                                  activeTab === page.title ? "page" : undefined
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                  <span className="font-medium text-sm">
                                    {page.title}
                                  </span>
                                </div>
                              </button>

                              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Add edit functionality
                                  }}
                                  className="hover:bg-blue-500/20 p-1 rounded transition-colors group/edit"
                                  aria-label={`Edit ${page.title}`}
                                >
                                  <Pencil className="w-4 h-4 text-gray-400 group-hover/edit:text-blue-500 transition-colors" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm(page);
                                  }}
                                  className="hover:bg-red-500/20 p-1 rounded transition-colors group/delete"
                                  aria-label={`Delete ${page.title}`}
                                >
                                  <X className="w-4 h-4 text-gray-400 group-hover/delete:text-red-500 transition-colors" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-900">
                      <div className="text-center text-sm text-gray-400">
                        {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TABS */}
              <div className="flex items-center space-x-3">
                {pages.slice(0, 5).map((page) => (
                  <button
                    className={`border-2 border-black rounded-lg px-3 py-1 text-sm transition-colors ${
                      activeTab === page.title 
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50" 
                        : "text-gray-700 hover:bg-cyan-400 hover:text-white"
                    }`}
                    key={page.id}
                    onClick={() => setActiveTab(page.title)}
                    aria-label={`Switch to ${page.title}`}
                  >
                    {page.title}
                  </button>
                ))}
                {pages.length > 5 && (
                  <span className="text-gray-400 text-sm">+{pages.length - 5} more</span>
                )}
              </div>

              <button
                className="mx-3"
                onClick={() => setNewPageDialog(true)}
                aria-label="Add new page"
              >
                <Plus className="w-6 h-6 border-2 border-black rounded-full border-dotted hover:bg-emerald-500 transition-colors p-0.5" />
              </button>
            </div>

            {/* Right side - Search, Edit, Account */}
            <div className="flex items-center space-x-4 mx-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="hover:bg-gray-100 p-2 rounded-md transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              <button
                className="hover:bg-gray-100 p-2 rounded-md transition-colors"
                aria-label="Edit mode"
              >
                <Edit3 className="w-5 h-5 text-gray-700" />
              </button>

              <button
                className="hover:bg-gray-100 p-2 rounded-md transition-colors"
                aria-label="Account settings"
              >
                <User className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-96 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b-2 border-gray-300 pb-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                className="ml-3 outline-none text-lg w-full"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setNewPageDialog(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-96 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Page
              </h2>
              <button
                onClick={() => setNewPageDialog(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) =>
                    setNewPage({ title: e.target.value })
                  }
                  placeholder="Enter page title (e.g. Work, Personal, etc.)"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPage.title.trim()) {
                      addPage();
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setNewPageDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addPage}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-lg shadow-cyan-500/30"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-96 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Page?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete "
                <span className="font-semibold">{deleteConfirm.title}</span>"? 
                This will also delete all widgets and links on this page.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
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