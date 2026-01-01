import { db } from "./db";
const now = () => new Date().toISOString();

export async function updatePageTitle(pageId, Title) {
  const trimmedTitle = Title.trim();
  const finalTitle = trimmedTitle === "" ? "New Page" : trimmedTitle;

  return await db.pages.update(pageId, {
    title: finalTitle,
    updatedAt: now(),
  });
}

export async function deletePage(page) {
  const widgets = await db.widgets.where({ pageId: page }).toArray();

  for (const widget of widgets) {
    await db.links.where({ widgetId: widget.id }).delete();
  }

  await db.widgets.where({ pageId: page }).delete();
  await db.pages.delete(page);
}

export async function addPage(newPageTitle, maxOrder, pageUUID) {
  await db.pages.add({
    uuid: pageUUID,
    title: newPageTitle,
    order: maxOrder + 1,
    createdAt: now(),
    updatedAt: now(),
  });
}
