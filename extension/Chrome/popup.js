let pages = [];
let widgets = [];

// Load pages and widgets from chrome.storage
async function loadPagesAndWidgets() {
  const data = await chrome.storage.local.get(['zandar_pages', 'zandar_widgets']);
  pages = data.zandar_pages || [];
  widgets = data.zandar_widgets || [];
  
  console.log("Loadedd pages:", pages);
  console.log("Loaded widgets:", widgets);
  
  populatePageSelect();
}

// Populate page dropdown
function populatePageSelect() {
  const pageSelect = document.getElementById('pageSelect');
  pageSelect.innerHTML = '<option value="">Select a page...</option>';
  
  pages.forEach(page => {
    const option = document.createElement('option');
    option.value = page.id;
    option.textContent = page.name;
    pageSelect.appendChild(option);
  });
}

// Handle page selection change
document.getElementById('pageSelect').addEventListener('change', (e) => {
  const selectedPageId = e.target.value;
  populateWidgetSelect(selectedPageId);
});

// Populate widget dropdown based on selected page
function populateWidgetSelect(pageId) {
  const widgetSelect = document.getElementById('widgetSelect');
  
  if (!pageId) {
    widgetSelect.innerHTML = '<option value="">Select a page first</option>';
    return;
  }
  
  const pageWidgets = widgets.filter(widget => widget.pageId == pageId);
  widgetSelect.innerHTML = '<option value="">Select a widget...</option>';
  
  pageWidgets.forEach(widget => {
    const option = document.createElement('option');
    option.value = widget.id;
    option.textContent = widget.title;
    widgetSelect.appendChild(option);
  });
}

// Save link to selected widget
document.getElementById("saveBtn").addEventListener("click", async () => {
  const pageSelect = document.getElementById('pageSelect');
  const widgetSelect = document.getElementById('widgetSelect');
  const selectedPageId = pageSelect.value;
  const selectedWidgetId = widgetSelect.value;
  
  if (!selectedPageId || !selectedWidgetId) {
    // alert('Please select both a page and a widget');
    return;
  }
  
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  
  const linkData = {
    url: currentTab.url,
    title: currentTab.title,
    pageId: selectedPageId,
    widgetId: selectedWidgetId,
    timestamp: Date.now(),
  };

  // Add to queue with page/widget info
  const data = await chrome.storage.local.get("zandar_queue");
  const currentQueue = data.zandar_queue || [];
  const updatedQueue = [...currentQueue, linkData];
  await chrome.storage.local.set({ zandar_queue: updatedQueue });

  // UX feedback
  const saveBtn = document.getElementById("saveBtn");
  const originalText = saveBtn.innerText;
  saveBtn.innerText = "Saved!";
  saveBtn.style.backgroundColor = "#10b981";
  
  setTimeout(() => {
    saveBtn.innerText = originalText;
    saveBtn.style.backgroundColor = "";
  }, 1500);
  
  console.log("Link saved to queue:", linkData);
});

// Initialize on popup load
document.addEventListener('DOMContentLoaded', loadPagesAndWidgets);
