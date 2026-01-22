
CREATE TABLE pricing_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  responsible_person TEXT NOT NULL,
  issue_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_requests_request_number ON pricing_requests(request_number);
CREATE INDEX idx_pricing_requests_issue_date ON pricing_requests(issue_date);

CREATE TABLE pricing_request_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pricing_request_id INTEGER NOT NULL,
  line_item TEXT NOT NULL,
  part_number TEXT NOT NULL,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_request_items_request_id ON pricing_request_items(pricing_request_id);
