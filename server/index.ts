import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

app.use("/*", cors());

// Spreadsheet configuration
const SPREADSHEET_ID = "1GYlz87nWa7q0W8KD7QuqiR-GCzu3C2KRmCGnYOCKZEg";
const DATA_SHEET_NAME = "data";
const REQUESTS_SHEET_NAME = "requests";
const ITEMS_SHEET_NAME = "items";

// Helper to fetch sheet data via public JSON API
async function fetchSheetData(sheetName: string) {
  const publicUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  const response = await fetch(publicUrl);
  const text = await response.text();
  const jsonString = text.substring(47, text.length - 2);
  return JSON.parse(jsonString) as any;
}

// API routes
app.get("/api/parts/:lineItem", async (c) => {
  const lineItem = c.req.param("lineItem");
  if (!lineItem) return c.json({ error: "Line item is required" }, 400);

  try {
    const data = await fetchSheetData(DATA_SHEET_NAME);
    const rows = data.table.rows;
    for (const row of rows) {
      const cells = row.c;
      if (cells && cells[2]?.v?.toString() === lineItem) {
        return c.json({
          lineItem: cells[2]?.v || "",
          partNumber: cells[3]?.v || "",
          description: cells[4]?.v || "",
          unit: cells[1]?.v || "",
        });
      }
    }
    return c.json({ error: "Line item not found" }, 404);
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// For requests and items, we'll try to read from their respective sheets
// Note: Writing to Google Sheets via public URL isn't possible,
// so for this MVP we'll simulate the storage or advise the user.
// However, the user asked to use Sheets as the database.
// Since the user dismissed the integration, we can't write without credentials.
// For now, we'll implement the READ logic from sheets and use a local JSON file for WRITES
// as a fallback if the user wants a "file-based" approach as requested.

const DB_FILE = path.resolve(process.cwd(), "db.json");

async function getDb() {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { requests: [], items: [] };
  }
}

async function saveDb(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

app.post("/api/pricing-requests", async (c) => {
  try {
    const body = await c.req.json();
    const { supplierName, dueDate, responsiblePerson, responsiblePhone, lineItems } = body;

    if (!supplierName || !dueDate || !responsiblePerson || !responsiblePhone || !lineItems?.length) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];
    const count = db.requests.filter((r: any) => r.issue_date === today).length;
    const requestNumber = `PR-${today.replace(/-/g, "")}-${String(count + 1).padStart(3, "0")}`;
    const requestId = Date.now();

    const newRequest = {
      id: requestId,
      request_number: requestNumber,
      supplier_name: supplierName,
      due_date: dueDate,
      responsible_person: responsiblePerson,
      responsible_phone: responsiblePhone,
      issue_date: today,
      created_at: new Date().toISOString()
    };

    db.requests.push(newRequest);

    const newItems = lineItems.map((item: any, index: number) => ({
      id: requestId + index + 1,
      pricing_request_id: requestId,
      line_item: item.lineItem,
      part_number: item.partNumber,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      created_at: new Date().toISOString()
    }));

    db.items.push(...newItems);
    await saveDb(db);

    return c.json({ id: requestId, requestNumber, issueDate: today }, 201);
  } catch (error) {
    console.error("Error creating pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/pricing-requests", async (c) => {
  try {
    const db = await getDb();
    return c.json(db.requests.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/pricing-requests/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const db = await getDb();
    const request = db.requests.find((r: any) => r.id === id);
    if (!request) return c.json({ error: "Pricing request not found" }, 404);

    const items = db.items.filter((i: any) => i.pricing_request_id === id);
    return c.json({ ...request, items });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/api/pricing-requests/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const db = await getDb();
    db.requests = db.requests.filter((r: any) => r.id !== id);
    db.items = db.items.filter((i: any) => i.pricing_request_id !== id);
    await saveDb(db);
    return c.json({ message: "Pricing request deleted successfully" });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Serve static files from the dist directory
app.use("/*", serveStatic({ root: "./dist" }));

app.get("*", async (c) => {
  try {
    const indexHtml = await fs.readFile(path.resolve(process.cwd(), "dist/index.html"), "utf-8");
    return c.html(indexHtml);
  } catch (e) {
    return c.text("Not Found", 404);
  }
});

const port = 3001;
console.log(`Server is running on port ${port}`);
serve({ fetch: app.fetch, port });
