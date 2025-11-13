import Dexie from "dexie";
import { v4 as uuidv4 } from "uuid";

export const db = new Dexie("bookmarkdb");

/**
 * Version 1 — initial schema
 */
db.version(1).stores({
  pages: "++id, uuid, title, createdAt, updatedAt",
  widgets: "++id, uuid, pageId, columnId, title, collapsed, createdAt, updatedAt",
  links: "++id, uuid, widgetId, pageId, name, url, createdAt, updatedAt"
});

/**
 * Future example migration
 * db.version(2).stores({ ... }).upgrade(tx => { migrate data })
 */

db.on("populate", async () => {
  const now = new Date().toISOString();


  // Create default page
  const pageId = await db.pages.add({
    uuid: uuidv4(),
    title: "Home",
    createdAt: now,
    updatedAt: now
  });

  // Default widget
  const widgetId = await db.widgets.add({
    uuid: uuidv4(),
    pageId,
    title: "My Links",
    collapsed: false,
    createdAt: now,
    updatedAt: now
  });

  // Default links
  await db.links.bulkAdd([
    {
      uuid: uuidv4(),
      widgetId,
      name: "ChatGPT",
      url: "https://chatgpt.com",
      createdAt: now,
      updatedAt: now
    },
    {
      uuid: uuidv4(),
      widgetId,
      name: "Google",
      url: "https://google.com",
      createdAt: now,
      updatedAt: now
    }
  ]);

  // Widget add
  // await db.widgets.bulkAdd(
  //   [
  //     {
  //       uuid: uuidv4(),
  //       pageId:

  //     }
  //   ]
  // )
});