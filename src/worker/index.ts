import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
  DB: D1Database;
  GOOGLE_SHEETS_API_KEY?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// Fetch part data from Google Sheets
app.get("/api/parts/:lineItem", async (c) => {
  const lineItem = c.req.param("lineItem");
  
  if (!lineItem) {
    return c.json({ error: "Line item is required" }, 400);
  }

  try {
    const spreadsheetId = "1GYlz87nWa7q0W8KD7QuqiR-GCzu3C2KRmCGnYOCKZEg";
    const sheetName = "data";

    // Always use public URL since sheet is publicly accessible
    const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    
    try {
      const response = await fetch(publicUrl);
      const text = await response.text();
      
      // Parse Google's JSON response (it's wrapped in a callback)
      const jsonString = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonString) as any;
      
      // Search for the line item in the data
      // Sheet structure: ITEM ID (0), UOM (1), LINE ITEM (2), PART NO (3), DESCRIPTION (4)
      const rows = data.table.rows;
      for (const row of rows) {
        const cells = row.c;
        // Search by LINE ITEM (index 2)
        if (cells && cells[2]?.v === lineItem) {
          return c.json({
            lineItem: cells[2]?.v || "",
            partNumber: cells[3]?.v || "",
            description: cells[4]?.v || "",
            unit: cells[1]?.v || ""
          });
        }
      }
      
      return c.json({ error: "Line item not found" }, 404);
    } catch (publicError) {
      console.error("Error fetching from Google Sheets:", publicError);
      return c.json({ 
        error: "Unable to access Google Sheet. Please ensure the sheet is publicly accessible." 
      }, 500);
    }
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create a new pricing request
app.post("/api/pricing-requests", async (c) => {
  try {
    const body = await c.req.json();
    const { supplierName, dueDate, responsiblePerson, responsiblePhone, lineItems } = body;

    if (!supplierName || !dueDate || !responsiblePerson || !responsiblePhone || !lineItems || lineItems.length === 0) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Generate request number based on today's date and count
    const today = new Date().toISOString().split('T')[0];
    const countResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM pricing_requests WHERE issue_date = ?"
    ).bind(today).first();
    
    const requestNumber = `PR-${today.replace(/-/g, '')}-${String((countResult?.count as number || 0) + 1).padStart(3, '0')}`;

    // Insert pricing request
    const requestResult = await c.env.DB.prepare(
      "INSERT INTO pricing_requests (request_number, supplier_name, due_date, responsible_person, responsible_phone, issue_date) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(requestNumber, supplierName, dueDate, responsiblePerson, responsiblePhone, today).run();

    const requestId = requestResult.meta.last_row_id;

    // Insert line items
    for (const item of lineItems) {
      await c.env.DB.prepare(
        "INSERT INTO pricing_request_items (pricing_request_id, line_item, part_number, description, unit, quantity) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        requestId,
        item.lineItem,
        item.partNumber,
        item.description,
        item.unit,
        item.quantity
      ).run();
    }

    return c.json({
      id: requestId,
      requestNumber,
      issueDate: today
    }, 201);
  } catch (error) {
    console.error("Error creating pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all pricing requests
app.get("/api/pricing-requests", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM pricing_requests ORDER BY created_at DESC"
    ).all();

    return c.json(results);
  } catch (error) {
    console.error("Error fetching pricing requests:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get a single pricing request with its items
app.get("/api/pricing-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const request = await c.env.DB.prepare(
      "SELECT * FROM pricing_requests WHERE id = ?"
    ).bind(id).first();

    if (!request) {
      return c.json({ error: "Pricing request not found" }, 404);
    }

    const { results: items } = await c.env.DB.prepare(
      "SELECT * FROM pricing_request_items WHERE pricing_request_id = ?"
    ).bind(id).all();

    return c.json({
      ...request,
      items
    });
  } catch (error) {
    console.error("Error fetching pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete a pricing request and its items
app.delete("/api/pricing-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Check if request exists
    const request = await c.env.DB.prepare(
      "SELECT * FROM pricing_requests WHERE id = ?"
    ).bind(id).first();

    if (!request) {
      return c.json({ error: "Pricing request not found" }, 404);
    }

    // Delete line items first
    await c.env.DB.prepare(
      "DELETE FROM pricing_request_items WHERE pricing_request_id = ?"
    ).bind(id).run();

    // Delete pricing request
    await c.env.DB.prepare(
      "DELETE FROM pricing_requests WHERE id = ?"
    ).bind(id).run();

    return c.json({ message: "Pricing request deleted successfully" });
  } catch (error) {
    console.error("Error deleting pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
