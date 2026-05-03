import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const README_CONTENT = `# 🌡️ EMS AI Technologies — Omni Climate Flow

A **professional-grade building climate management system** for monitoring, controlling, and optimizing HVAC systems across multiple facilities in real time.

---

## 🎯 Quick Overview

**Omni Climate Flow** is an enterprise HVAC management platform that empowers facility managers, building operators, and engineers to:

- ✅ **Monitor** real-time environmental conditions (temperature, humidity, CO₂, air quality)
- ✅ **Control** thermostats remotely from any device (desktop, tablet, mobile)
- ✅ **Automate** zone schedules with smart occupancy-based setbacks
- ✅ **Alert** on critical system faults, equipment failures, and threshold violations
- ✅ **Integrate** with external systems via REST API, Python SDK, CLI, and webhooks
- ✅ **Analyze** energy consumption patterns and get AI-powered optimization recommendations

Perfect for **multi-building portfolios**, **data centers**, **commercial real estate**, and **healthcare facilities**.

---

## 🚀 Key Features

### Dashboard & Monitoring
- **Multi-building overview** — track all facilities at a glance
- **Real-time KPIs** — average temperature, humidity, CO₂ levels, open alerts
- **Zone snapshot grid** — drill into any zone for detailed sensor data
- **Critical alerts banner** — see high-severity issues immediately

### Zone Control
- **HVAC mode selection** — Cool, Heat, Auto, Fan Only, Off
- **Setpoint management** — drag sliders to adjust heating/cooling targets
- **Live sensor readouts** — temperature, humidity, CO₂, air quality, pressure
- **Occupancy awareness** — automatic energy-saving setbacks when zones are empty
- **Custom overrides** — manually override schedule for immediate needs

### Scheduling & Automation
- **Weekly schedules** — set different HVAC modes per zone by day-of-week
- **Business hours profiles** — standard occupied/unoccupied setpoints
- **Server room modes** — 24/7 cooling with strict temperature bands
- **One-click activation** — enable/disable schedules without deleting them

### Blueprint & Facility Management
- **AI floor plan analysis** — upload blueprints, auto-extract zones and dimensions
- **Sensor pin placement** — visually mark sensor locations on floor plans
- **Zone assignment** — tie sensors to HVAC zones with drag-and-drop
- **ASHRAE defaults** — auto-configure thermostat setpoints per zone type

### Intelligent Alerting
- **Severity-based filtering** — Critical, High, Medium, Low
- **Status tracking** — Open, Acknowledged, Resolved
- **Bulk actions** — acknowledge or resolve multiple alerts at once
- **Direct zone navigation** — click alert to jump straight to zone control

### API & Integrations
- **REST API** — list facilities, zones, readings, and thermostat settings
- **Python SDK** — programmatic access from your own scripts
- **CLI tool** — command-line facility management
- **Docker support** — containerized integration workflows
- **Webhooks** — push alerts to Slack, email, or custom endpoints
- **API credentials** — granular scopes and optional expiration dates

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + React Router + TypeScript |
| **Styling** | Tailwind CSS + Shadcn/UI components |
| **State** | TanStack React Query (data fetching & caching) |
| **Backend** | Deno (serverless functions) + Base44 SDK |
| **Database** | Base44 Entities (multi-tenant data management) |
| **Authentication** | Base44 Auth (OAuth + role-based access) |
| **Charts** | Recharts (environmental trend visualization) |
| **Maps** | React Leaflet (facility location mapping) |
| **Animations** | Framer Motion (smooth UI transitions) |

---

## 📦 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control
- A **Base44 account** (https://base44.app)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/collins73/HVAC-climate-bms.git
   cd HVAC-climate-bms
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a \`.env\` file in the root directory:
   \`\`\`bash
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_API_KEY=your_api_key
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The app will be available at \`http://localhost:5173\`

5. **Build for production**
   \`\`\`bash
   npm run build
   \`\`\`

---

## 🏢 Adding Your First Building

### Step 1: Navigate to the Buildings Page
- Click **Buildings** in the sidebar

### Step 2: Create a New Building
- Click **+ Add Building** (blue button, top-right)
- A modal form will appear

### Step 3: Fill in Building Details

| Field | Instructions | Example |
|-------|--------------|---------|
| **Building Name** | Name of your facility | "Austin HQ Tower" |
| **Address** | Street address | "123 Main St, Austin, TX" |
| **City** | City name | "Austin" |
| **State** | Two-letter state code | "TX" |
| **Zip Code** | Five-digit postal code | "78701" |
| **Number of Floors** | Total floors in building | "12" |
| **Total Sq Ft** | Gross square footage | "250000" |
| **Status** | Set to "Active" for operational buildings | "Active" |

### Step 4: Save the Building
- Click **Create Building**
- You'll be redirected to the building detail page

---

## 📡 Connecting Sensor Data

### Option A: Upload Floor Plan (Recommended)

1. Navigate to **Blueprint Import** (sidebar)
2. Click **+ Upload Blueprint**
3. Select your floor plan file (PDF/JPG/PNG)
4. The AI will analyze it automatically (~30 seconds)
5. Review and confirm extracted zones
6. Place sensor pins on the blueprint
7. Assign pins to zones and sensor types

### Option B: Manual Configuration

1. Go to **Zones** → click a zone
2. Click **+ Add Sensor**
3. Enter sensor details
4. Save and verify live data appears

---

## 📊 Core Monitoring Features

### 1. Real-Time Dashboard
- **KPI cards** — Building count, average temp/humidity, open alerts
- **Critical alerts banner** — High-severity issues
- **Building cards** — Each building with zone count and status
- **Zone snapshot grid** — Live readings for all zones

### 2. Zone Control Panel
- **Current conditions** — Live temperature, humidity, CO₂, air quality
- **HVAC controls** — Mode selection and setpoint sliders
- **Alerts** — Zone-specific alerts
- **Schedules** — Weekly schedules
- **Historical chart** — 7-day temperature trend

### 3. Adjust Temperature Setpoints
- Open a zone
- Locate **Cooling Setpoint** and **Heating Setpoint** sliders
- Drag to desired temperature (e.g., 74°F for cooling)
- Click **Apply** — change takes effect immediately

### 4. Change HVAC Mode
Select from:
- **Cool** — Active cooling to reach setpoint
- **Heat** — Active heating to reach setpoint
- **Auto** — System chooses based on conditions
- **Fan Only** — Circulate air without heating/cooling
- **Off** — No HVAC operation

### 5. Enable Occupancy-Based Savings
- Toggle **Energy Save Mode: ON**
- Set **Unoccupied Cooling Setpoint** (e.g., 80°F)
- Set **Unoccupied Heating Setpoint** (e.g., 62°F)
- HVAC will relax setpoints when zone is empty

### 6. Create Weekly Schedules
- Click **Schedules** tab
- Click **+ Add Schedule**
- Configure name, days, times, mode, and setpoints
- Save and repeat for different periods

---

## 🚨 Alert Management

- Click **Alerts** in sidebar to view all alerts
- Filter by **Status** (Open, Acknowledged, Resolved)
- Filter by **Severity** (Critical, High, Medium, Low)
- Search alerts by zone name
- Click to **Acknowledge** or **Resolve** alerts

---

## 🔌 API Documentation

Full documentation at \`/api-docs\` after logging in.

### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| \`GET\` | \`/api/v1/facilities\` | List all buildings |
| \`GET\` | \`/api/v1/facilities/{id}\` | Get building details + zones |
| \`GET\` | \`/api/v1/zones/{id}/readings\` | Get zone sensor history |
| \`POST\` | \`/api/v1/zones/{id}/thermostat\` | Update thermostat setpoint |
| \`GET\` | \`/api/v1/alerts\` | List open alerts |

### Generate an API Key
- Click **API Keys** in sidebar
- Click **+ Generate New Key**
- Enter key name, description, and scopes
- Copy immediately — won't be shown again

---

## 🛠️ Development Commands

| Command | Purpose |
|---------|---------|
| \`npm run dev\` | Start dev server (localhost:5173) |
| \`npm run build\` | Production build |
| \`npm run lint\` | Run ESLint checks |
| \`npm run preview\` | Preview production build locally |

---

## 📄 License

Proprietary — EMS AI Technologies. All rights reserved.

---

## 📞 Support

For questions, bugs, or feature requests:
- Email: support@emsai.tech
- Dashboard Help: Click the **?** icon in the app

---

**Version:** 2.0 | **Last Updated:** May 2026

Made with ❤️ by **EMS AI Technologies**`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get GitHub connector (app user connector)
    const connectorId = "69e6ef79b8560c81acb30cf1";
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

    // Get current README to check if it exists
    const getRes = await fetch('https://api.github.com/repos/collins73/HVAC-climate-bms/contents/README.md', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    let sha = null;
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    // Encode content to base64
    const encodedContent = btoa(README_CONTENT);

    // Create or update README
    const updateRes = await fetch('https://api.github.com/repos/collins73/HVAC-climate-bms/contents/README.md', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Add comprehensive README documentation',
        content: encodedContent,
        ...(sha && { sha })
      })
    });

    if (!updateRes.ok) {
      const error = await updateRes.json();
      return Response.json({ error: error.message }, { status: updateRes.status });
    }

    const result = await updateRes.json();
    return Response.json({ 
      success: true, 
      message: 'README pushed to GitHub successfully',
      commit: result.commit.sha 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});