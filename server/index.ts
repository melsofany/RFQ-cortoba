import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = new Hono();

app.use("/*", cors());

app.get("/api/parts/:lineItem", async (c) => {
  const lineItem = c.req.param("lineItem");

  if (!lineItem) {
    return c.json({ error: "Line item is required" }, 400);
  }

  try {
    const spreadsheetId = "1GYlz87nWa7q0W8KD7QuqiR-GCzu3C2KRmCGnYOCKZEg";
    const sheetName = "data";

    const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

    try {
      const response = await fetch(publicUrl);
      const text = await response.text();

      const jsonString = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonString) as any;

      const rows = data.table.rows;
      for (const row of rows) {
        const cells = row.c;
        if (cells && cells[2]?.v === lineItem) {
          return c.json({
            lineItem: cells[2]?.v || "",
            partNumber: cells[3]?.v || "",
            description: cells[4]?.v || "",
            unit: cells[1]?.v || "",
          });
        }
      }

      return c.json({ error: "Line item not found" }, 404);
    } catch (publicError) {
      console.error("Error fetching from Google Sheets:", publicError);
      return c.json(
        {
          error:
            "Unable to access Google Sheet. Please ensure the sheet is publicly accessible.",
        },
        500
      );
    }
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/api/pricing-requests", async (c) => {
  try {
    const body = await c.req.json();
    const {
      supplierName,
      dueDate,
      responsiblePerson,
      responsiblePhone,
      lineItems,
    } = body;

    if (
      !supplierName ||
      !dueDate ||
      !responsiblePerson ||
      !responsiblePhone ||
      !lineItems ||
      lineItems.length === 0
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const today = new Date().toISOString().split("T")[0];
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM pricing_requests WHERE issue_date = $1",
      [today]
    );

    const count = parseInt(countResult.rows[0]?.count || "0", 10);
    const requestNumber = `PR-${today.replace(/-/g, "")}-${String(count + 1).padStart(3, "0")}`;

    const requestResult = await pool.query(
      "INSERT INTO pricing_requests (request_number, supplier_name, due_date, responsible_person, responsible_phone, issue_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [
        requestNumber,
        supplierName,
        dueDate,
        responsiblePerson,
        responsiblePhone,
        today,
      ]
    );

    const requestId = requestResult.rows[0].id;

    for (const item of lineItems) {
      await pool.query(
        "INSERT INTO pricing_request_items (pricing_request_id, line_item, part_number, description, unit, quantity) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          requestId,
          item.lineItem,
          item.partNumber,
          item.description,
          item.unit,
          item.quantity,
        ]
      );
    }

    return c.json(
      {
        id: requestId,
        requestNumber,
        issueDate: today,
      },
      201
    );
  } catch (error) {
    console.error("Error creating pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/pricing-requests", async (c) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pricing_requests ORDER BY created_at DESC"
    );
    return c.json(result.rows);
  } catch (error) {
    console.error("Error fetching pricing requests:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/pricing-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const requestResult = await pool.query(
      "SELECT * FROM pricing_requests WHERE id = $1",
      [id]
    );

    if (requestResult.rows.length === 0) {
      return c.json({ error: "Pricing request not found" }, 404);
    }

    const request = requestResult.rows[0];

    const itemsResult = await pool.query(
      "SELECT * FROM pricing_request_items WHERE pricing_request_id = $1",
      [id]
    );

    return c.json({
      ...request,
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/api/pricing-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const requestResult = await pool.query(
      "SELECT * FROM pricing_requests WHERE id = $1",
      [id]
    );

    if (requestResult.rows.length === 0) {
      return c.json({ error: "Pricing request not found" }, 404);
    }

    await pool.query(
      "DELETE FROM pricing_request_items WHERE pricing_request_id = $1",
      [id]
    );

    await pool.query("DELETE FROM pricing_requests WHERE id = $1", [id]);

    return c.json({ message: "Pricing request deleted successfully" });
  } catch (error) {
    console.error("Error deleting pricing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
