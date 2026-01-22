# Replit.md

## Overview

This is a **Pricing Request Management System** for Cortoba Supplies (شركة قرطبة للتوريدات), an Arabic-language business application. The system allows users to create, manage, and generate PDF documents for pricing requests sent to suppliers. It integrates with Google Sheets as a data source for parts/inventory information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7 for client-side navigation
- **Styling**: Tailwind CSS with custom Arabic font (Tajawal)
- **PDF Generation**: jsPDF + html2canvas for client-side PDF creation
- **Icons**: Lucide React

**Key Pages**:
- Login - Simple password-based authentication (stored in localStorage)
- Dashboard - Create new pricing requests with line items
- RequestsList - View and search existing requests
- PDFPreview - Generate and download PDF documents

### Backend Architecture
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Node.js with tsx for development
- **Server**: @hono/node-server for local development

**API Endpoints** (via `/api` proxy):
- `GET /api/parts/:lineItem` - Fetch part details from Google Sheets
- `GET /api/pricing-requests` - List all pricing requests
- `GET /api/pricing-requests/:id` - Get single request details

### Data Storage
- **Google Sheets Integration**: Primary data source for parts/inventory lookup
  - Spreadsheet ID: `1GYlz87nWa7q0W8KD7QuqiR-GCzu3C2KRmCGnYOCKZEg`
  - Uses public Google Visualization API (`gviz/tq?tqx=out:json`) for read access
  - Sheets: `data`, `requests`, `items`

- **Cloudflare D1**: Database binding configured in wrangler.json (for production deployment)
- **Cloudflare R2**: Object storage bucket configured (for file uploads)

### Authentication
- Simple client-side password authentication
- Password stored in code: `Cor@temp-2026`
- Session persistence via localStorage (`isAuthenticated` flag)
- No server-side session management

### Build & Development
- **Bundler**: Vite with React plugin
- **Dev Server**: Runs on port 5000 with API proxy to port 3001
- **TypeScript**: Multiple tsconfig files for app, node, and worker contexts
- **Linting**: ESLint with React hooks and refresh plugins

### Deployment Configuration
- **Target Platform**: Cloudflare Workers (wrangler.json configured)
- **Worker Entry**: `src/worker/index.ts`
- **Assets**: SPA mode for client-side routing

## External Dependencies

### Third-Party Services
- **Google Sheets API**: Read-only access to spreadsheet data via public visualization endpoint
- **Cloudflare D1**: SQL database (binding: `DB`)
- **Cloudflare R2**: Object storage (binding: `R2_BUCKET`)

### Key NPM Packages
- `hono` - Web framework for both Node.js and Cloudflare Workers
- `pg` - PostgreSQL client (available but may not be actively used)
- `jspdf` + `html2canvas` - Client-side PDF generation
- `pdfmake` - Alternative PDF generation library
- `zod` - Schema validation
- `react-router` - Client-side routing

### Fonts & Assets
- Google Fonts: Tajawal (Arabic font family)
- Company logo stored in `src/react-app/assets/images/`