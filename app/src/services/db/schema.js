import Dexie from "dexie";
import { v4 as uuidv4 } from "uuid";

export const db = new Dexie("bookmarkdb");

/**
 * Version 1 — initial schema
 */
db.version(1).stores({
  pages: "++id, uuid, title, createdAt, updatedAt",
  widgets: "++id, uuid, pageId, columnId, order, title, collapsed, createdAt, updatedAt",
  links: "++id, uuid, widgetId, order, name, url, createdAt, updatedAt"
});

/**
 * Future example migration
 * db.version(2).stores({ ... }).upgrade(tx => { migrate data })
 */


// Populating the Defaults.
db.on("populate", async () => {

  const now = new Date().toISOString();

  // Create default page
  const pageId = await db.pages.add({
    uuid: "c95f9bcf-2a55-4784-8a9b-637cbe8efba0",
    title: "Home",
    createdAt: now,
    updatedAt: now
  });

  // Testing multiple pages 
  // // Create default page
  // const pageId = await db.pages.bulkAdd([
  //   {
  //     uuid: "c95f9bcf-2a55-4784-8a9b-637cbe8efba0",
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },  
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   },
  //   {
  //     uuid: uuidv4(),
  //     title: "Home",
  //     createdAt: now,
  //     updatedAt: now
  //   }
  // ]);

  // Default widget
  
  await db.widgets.bulkAdd([
    {
      uuid: uuidv4(),
      id: 1,
      title: "Developer Essentials (default)",
      pageId,
      columnId: 1,
      order: 0,
      collapsed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 2,
      title: "Socials (default)",
      pageId,
      columnId: 2,
      order: 0,
      collapsed: false,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 3,
      title: "VibeCoding (default)",
      pageId,
      columnId: 3,
      order: 0,
      collapsed: false,
      createdAt: now,
      updatedAt: now
    }
  ])

  // Default links
  await db.links.bulkAdd([
    {
      uuid: uuidv4(),
      id: 1,
      name: "Github",
      url: "https://github.com",
      widgetId: 1,
      order: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 2,
      name: "MDN Web Docs",
      url: "https://developer.mozilla.org",
      widgetId: 1,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 3,
      name: "X",
      url: "https://x.com",
      widgetId: 2,
      order: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 4,
      name: "Reddit",
      url: "https://www.reddit.com/",
      widgetId: 2,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 5,
      name: "Youtube",
      url: "https://www.youtube.com/",
      widgetId: 2,
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      id: 6,
      name: "ChatGPT",
      url: "https://chat.openai.com",
      widgetId: 3,
      order: 0,
      createdAt: now,
      updatedAt: now  
    },
    {
      uuid: uuidv4(),
      id: 7,
      name: "Claude",
      url: "https://claude.ai",
      widgetId: 3,
      order: 1,
      createdAt: now,
      updatedAt: now  
    },
    {
      uuid: uuidv4(),
      id: 8,
      name: "Lovable",
      url: "https://lovable.dev/",
      widgetId: 3,
      order: 2,
      createdAt: now,
      updatedAt: now  
    },
  ]);
});