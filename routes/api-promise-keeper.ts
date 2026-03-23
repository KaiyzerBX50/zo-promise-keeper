
import type { Context } from "hono";
import { readFileSync, writeFileSync, existsSync } from "fs";

const DATA_PATH = "/home/workspace/promise-keeper-data/promises.json";

interface Promise {
  id: number;
  promise: string;
  personId: number | null;
  personName: string;
  category: string;
  datePromised: string;
  dueDate: string;
  status: string;
  priority: string;
  source: string;
  nextAction: string;
  notes: string;
  emotionalWeight: string;
  followUpDrafted: boolean;
  completedOn: string;
  createdAt: string;
  updatedAt: string;
}

interface Person {
  id: number;
  name: string;
  relationshipType: string;
  lastContact: string;
  needsFollowUp: boolean;
  importantNotes: string;
  preferredComm: string;
  importantDates: string;
  warmth: string;
  nextTouchpoint: string;
  createdAt: string;
  updatedAt: string;
}

interface Data {
  promises: Promise[];
  people: Person[];
  nextPromiseId: number;
  nextPersonId: number;
}

function loadData(): Data {
  try {
    if (existsSync(DATA_PATH)) {
      return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
    }
  } catch {}
  return { promises: [], people: [], nextPromiseId: 1, nextPersonId: 1 };
}

function saveData(data: Data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export default async (c: Context) => {
  const method = c.req.method;
  const url = new URL(c.req.url);
  const action = url.searchParams.get("action");

  if (method === "GET") {
    const data = loadData();
    const openPromiseCounts: Record<number, number> = {};
    for (const p of data.promises) {
      if (p.personId && !["Done", "Dropped"].includes(p.status)) {
        openPromiseCounts[p.personId] = (openPromiseCounts[p.personId] || 0) + 1;
      }
    }
    return c.json({ ...data, openPromiseCounts });
  }

  if (method === "POST") {
    const body = await c.req.json();
    const data = loadData();

    if (action === "add-promise") {
      const now = new Date().toISOString();
      const promise: Promise = {
        id: data.nextPromiseId++,
        promise: body.promise || "",
        personId: body.personId || null,
        personName: body.personName || "",
        category: body.category || "Do",
        datePromised: body.datePromised || now.split("T")[0],
        dueDate: body.dueDate || "",
        status: body.status || "Inbox",
        priority: body.priority || "Normal",
        source: body.source || "",
        nextAction: body.nextAction || "",
        notes: body.notes || "",
        emotionalWeight: body.emotionalWeight || "Light",
        followUpDrafted: body.followUpDrafted || false,
        completedOn: "",
        createdAt: now,
        updatedAt: now,
      };
      data.promises.push(promise);
      saveData(data);
      return c.json({ ok: true, promise });
    }

    if (action === "update-promise") {
      const idx = data.promises.findIndex((p) => p.id === body.id);
      if (idx === -1) return c.json({ error: "Not found" }, 404);
      const prev = data.promises[idx];
      const updated = { ...prev, ...body, updatedAt: new Date().toISOString() };
      if (body.status === "Done" && prev.status !== "Done") {
        updated.completedOn = new Date().toISOString().split("T")[0];
      }
      data.promises[idx] = updated;
      saveData(data);
      return c.json({ ok: true, promise: updated });
    }

    if (action === "delete-promise") {
      data.promises = data.promises.filter((p) => p.id !== body.id);
      saveData(data);
      return c.json({ ok: true });
    }

    if (action === "add-person") {
      const now = new Date().toISOString();
      const person: Person = {
        id: data.nextPersonId++,
        name: body.name || "",
        relationshipType: body.relationshipType || "Other",
        lastContact: body.lastContact || "",
        needsFollowUp: body.needsFollowUp || false,
        importantNotes: body.importantNotes || "",
        preferredComm: body.preferredComm || "",
        importantDates: body.importantDates || "",
        warmth: body.warmth || "Steady",
        nextTouchpoint: body.nextTouchpoint || "",
        createdAt: now,
        updatedAt: now,
      };
      data.people.push(person);
      saveData(data);
      return c.json({ ok: true, person });
    }

    if (action === "update-person") {
      const idx = data.people.findIndex((p) => p.id === body.id);
      if (idx === -1) return c.json({ error: "Not found" }, 404);
      data.people[idx] = { ...data.people[idx], ...body, updatedAt: new Date().toISOString() };
      saveData(data);
      return c.json({ ok: true, person: data.people[idx] });
    }

    if (action === "delete-person") {
      data.people = data.people.filter((p) => p.id !== body.id);
      saveData(data);
      return c.json({ ok: true });
    }

    return c.json({ error: "Unknown action" }, 400);
  }

  return c.json({ error: "Method not allowed" }, 405);
};
