import { db } from "./db";
const now = () => new Date().toISOString();

export async function deleteWidget(widgetId) {
    const links = await db.links.where({ widgetId }).toArray();
    await Promise.all(links.map((l) => db.links.delete(l.id)));
    await db.widgets.delete(widgetId);
    return 
}

export async function updateWidgetTitle(id, title) { 
  const trimmedTitle = title.trim();
  if (trimmedTitle === "") {
    db.widgets.update(id, { title: "New Widget", updatedAt: now() });
  } else {
    db.widgets.update(id, { title: trimmedTitle, updatedAt: now() });
  }
}