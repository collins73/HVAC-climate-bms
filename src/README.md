# 🌡️ EMS AI Technologies — Omni Climate Flow

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
   ```bash
   git clone <your-repo-url>
   cd hvac-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_API_KEY=your_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📖 Setup & Getting Started Guide

### ⚙️ Initial Dashboard Setup

**Step 1: Log In & Access the Dashboard**
1. Navigate to the app and sign in with your credentials
2. Click **Dashboard** in the left sidebar
3. You'll see the main overview with KPI cards, building summary, and zone snapshots
4. If no buildings exist yet, you'll see an empty state — this is normal

**Step 2: Configure Your Organization Profile**
1. Click your **profile icon** (top-right corner)
2. Set your **timezone** for accurate scheduling (e.g., America/New_York)
3. Enable **email notifications** for critical alerts
4. Save preferences

**Step 3: Invite Team Members** (Optional)
1. Go to **Settings** → **Team**
2. Click **+ Invite User**
3. Enter email address and assign role (Admin or User)
4. They'll receive an invite link via email

---

### 🏢 Step-by-Step: Add Your First Building

**1. Navigate to the Buildings Page**
- Click **Buildings** in the sidebar

**2. Create a New Building**
- Click **+ Add Building** (blue button, top-right)
- A modal form will appear

**3. Fill in Building Details**
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
| **Cover Image** | Optional: upload building photo | Click to upload |

**4. Save the Building**
- Click **Create Building**
- You'll be redirected to the building detail page

**5. What Happens Next?**
- The building appears in your Buildings list
- You can now add zones and sensors to this building
- The building is ready for zone configuration

---

### 🎯 Step-by-Step: Define Zones & Sensor Locations

**1. Access Building Detail Page**
- From **Buildings**, click the building card
- You'll see tabs: **Zones**, **Blueprints**, **Load Estimation**, **Sensors**

**2. Add Your First Zone**
- Click the **Zones** tab
- Click **+ Add Zone** (blue button)

**3. Configure Zone Details**
| Field | What It Means | Example |
|-------|--------------|---------|
| **Zone Name** | Human-readable name for the area | "Floor 3 East Wing" |
| **Zone Type** | Building usage type (HVAC configures automatically) | "Office" |
| **Floor** | Which floor this zone occupies | "3" |
| **Square Footage** | Area of the zone | "5000" |
| **Status** | Active, Inactive, or Maintenance | "Active" |
| **Notes** | Any special details about this zone | "High occupancy 9am–5pm" |

**Available Zone Types & Auto-Configurations:**
- **Office** → Default setpoint: 72°F cooling, 68°F heating
- **Server Room** → Strict: 68°F cooling, 65°F heating (24/7)
- **Conference Room** → Standard office settings with higher variance tolerance
- **Lobby** → Wider temperature band for comfort
- **Warehouse** → Relaxed setpoints (76°F cooling, 62°F heating)
- **Retail** → Customer comfort focus
- **Residential** → Variable based on occupancy
- **Other** → Manual configuration required

**4. Save Zone**
- Click **Create Zone**
- The zone appears in the Zones list
- Ready to add sensors

---

### 📡 Step-by-Step: Connect & Monitor Sensor Data

#### **Option A: Upload Floor Plan (Recommended for Fast Setup)**

**1. Prepare Your Blueprint**
- Have a PDF or image (JPG/PNG) of your floor plan ready
- Image should be clear, 150+ DPI, with visible room labels

**2. Upload Blueprint**
- Navigate to **Blueprint Import** (sidebar)
- Click **+ Upload Blueprint**
- Select your floor plan file
- The AI will analyze it automatically (takes ~30 seconds)

**3. Review AI-Extracted Data**
- AI will show detected zones, dimensions, and room types
- Review the suggestions and edit if needed
- Confirm or adjust zone names and types

**4. Place Sensor Pins**
- Click **Blueprints** tab on building detail
- Click on your uploaded blueprint to edit
- Click "Add Sensor Pin" and drag to place sensors on the floor plan
- Assign each pin to a zone and sensor type (Temperature, Humidity, CO₂, etc.)
- Save

**5. Start Receiving Data**
- Once sensors are pinned and zones are created, sensor data will appear on the dashboard within minutes

#### **Option B: Manual Sensor Configuration**

**1. Know Your Sensor Details**
- Sensor ID or location name
- Sensor type (Temperature, Humidity, CO₂, Air Quality, etc.)
- Which zone it monitors

**2. Add Sensor via UI**
- Go to **Zones** → click a zone
- Click **+ Add Sensor**
- Enter sensor details
- Save

**3. Verify Live Data**
- Open the zone detail page
- Check **Sensor Readout** card for real-time data
- If no data, check that sensor is powered on and connected to network

---

### 📊 Step-by-Step: Start Monitoring & Controlling

**1. View the Dashboard**
- Click **Dashboard** in sidebar
- You'll see:
  - **KPI cards** (top): Building count, average temp/humidity, open alerts
  - **Critical alerts banner** (red, if any)
  - **Building cards** (middle): Each building with zone count and status
  - **Zone snapshot grid** (bottom): Live readings for all zones

**2. Monitor a Specific Zone**
- From the zone snapshot grid, click any zone card
- You'll open the **Zone Control Panel** with:
  - **Current conditions**: Live temperature, humidity, CO₂, air quality
  - **HVAC controls**: Mode selection (Cool/Heat/Auto/Fan/Off) and setpoint sliders
  - **Alerts**: Active alerts specific to this zone
  - **Schedules**: Weekly schedules for this zone
  - **Historical chart**: 7-day temperature trend

**3. Adjust Temperature Setpoints**
- Open a zone
- Locate **Cooling Setpoint** and **Heating Setpoint** sliders
- Drag to desired temperature (e.g., 74°F for cooling)
- Click **Apply** — change takes effect immediately
- The HVAC system will adjust within 2–5 minutes

**4. Change HVAC Mode**
- From zone control panel, select mode:
  - **Cool**: Active cooling to reach setpoint
  - **Heat**: Active heating to reach setpoint
  - **Auto**: System chooses based on current conditions
  - **Fan Only**: Circulate air without heating/cooling
  - **Off**: No HVAC operation (emergency only)

**5. Enable Occupancy-Based Savings**
- Open zone settings
- Toggle **Energy Save Mode: ON**
- Set **Unoccupied Cooling Setpoint** (e.g., 80°F)
- Set **Unoccupied Heating Setpoint** (e.g., 62°F)
- When zone is empty, HVAC will relax setpoints to save energy

**6. Create Weekly Schedules**
- Click **Schedules** tab (zone detail page)
- Click **+ Add Schedule**
- Configure:
  - **Schedule Name**: "Business Hours" or "After Hours"
  - **Days of Week**: Select which days (Mon–Fri, weekends, etc.)
  - **Start Time**: When schedule begins (e.g., 08:00)
  - **End Time**: When schedule ends (e.g., 18:00)
  - **Mode**: HVAC mode for this period
  - **Cooling/Heating Setpoints**: Target temperatures
- Click **Save**
- Repeat for different time periods (e.g., night setback, weekend)

**Example Schedule:**
```
Schedule 1: Business Hours (Mon–Fri, 8am–6pm)
  → Mode: Auto, Cool setpoint: 74°F, Heat setpoint: 68°F

Schedule 2: After Hours (Mon–Fri, 6pm–8am)
  → Mode: Off, Cool setpoint: 80°F, Heat setpoint: 62°F

Schedule 3: Weekend (Sat–Sun, 24 hours)
  → Mode: Off, Cool setpoint: 80°F, Heat setpoint: 62°F
```

---

### 🚨 Step-by-Step: Monitor & Respond to Alerts

**1. View Active Alerts**
- Click **Alerts** in sidebar
- You'll see all open, acknowledged, and resolved alerts

**2. Filter Alerts**
- Use **Status** tabs: Open, Acknowledged, Resolved
- Use **Severity** filter: Critical (red), High (orange), Medium (yellow), Low (blue)
- Use **Search**: Find alerts by zone name or alert type

**3. Respond to an Alert**
- Click any open alert card
- **Read the Details**: Alert type, affected zone, current value, threshold
- Click **Acknowledge** → Mark that you're aware of the issue
- When fixed, click **Resolve** → Close the alert

**4. Create Alert Thresholds**
- Go to a zone's settings
- Click **Alert Rules**
- Set thresholds:
  - High Temperature Alert: 78°F
  - Low Temperature Alert: 65°F
  - High CO₂ Alert: 1000 ppm
- When sensor exceeds threshold, alert fires automatically

---

### 🔗 Step-by-Step: Integrate with External Systems

**1. Generate an API Key**
- Click **API Keys** in sidebar
- Click **+ Generate New Key**
- Fill in:
  - **Key Name**: "Mobile App", "Integration Server", etc.
  - **Description**: What this key is used for
  - **Scopes**: Check boxes for what the key can access
    - `buildings:read` — List and view buildings
    - `zones:read` — View zone data
    - `zones:write` — Modify zone settings
    - `readings:read` — Access sensor readings
    - `alerts:read` — View alerts
  - **Facilities** (optional): Leave empty for all, or select specific buildings
  - **Expiration** (optional): Set an expiration date for security
- Click **Generate**
- **Copy the key immediately** — you won't see it again

**2. Use the API Key in Your Code**
```bash
# REST API Example
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.hvac.example.com/v1/facilities

# Python SDK Example
from hvac_sdk import HVACClient
client = HVACClient(api_key="YOUR_API_KEY")
zones = client.get_zone(zone_id="zone_123")
print(zones.temperature, zones.humidity)
```

**3. Set Up Webhooks for Real-Time Alerts**
- Click **Webhooks** in sidebar
- Click **+ Add Webhook**
- Configure:
  - **Webhook URL**: Where alerts should POST (e.g., `https://yourserver.com/alerts`)
  - **Event Type**: What triggers the webhook (e.g., "alert.created")
  - **Signing Secret**: Auto-generated for security verification
- Click **Create**
- Your system will now receive alerts in real-time

---

### 📈 Monitoring Best Practices

1. **Check Dashboard Daily**: Review KPIs and alert counts
2. **Set Aggressive Alert Thresholds**: Catch issues early (e.g., 76°F for high temp alert)
3. **Schedule Regular Maintenance Windows**: Use "Maintenance" zone status when servicing equipment
4. **Use Occupancy Awareness**: Enable energy-save mode to reduce waste during unoccupied hours
5. **Review Weekly Summaries**: Dashboard emails a summary every Monday morning
6. **Archive Resolved Alerts**: Clean up old alerts monthly for clarity

---

## 🔌 API Documentation

Full API documentation available at `/api-docs` after logging in.

### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/facilities` | List all buildings |
| `GET` | `/api/v1/facilities/{id}` | Get building details + zones |
| `GET` | `/api/v1/zones/{id}/readings` | Get zone sensor history |
| `POST` | `/api/v1/zones/{id}/thermostat` | Update thermostat setpoint |
| `GET` | `/api/v1/alerts` | List open alerts |

See **API Docs** page for full endpoint reference, code examples, and authentication.

---

## 🗂️ Project Structure

```
src/
├── pages/                    # Full-page components
│   ├── Landing.jsx          # Marketing homepage
│   ├── Dashboard.jsx        # Main monitoring dashboard
│   ├── Buildings.jsx        # Building management
│   ├── Zones.jsx            # Zone overview & control
│   ├── Alerts.jsx           # Alert management
│   ├── APIManagement.jsx    # API key generation
│   ├── Integrations.jsx     # Third-party integrations
│   └── ...
├── components/              # Reusable UI components
│   ├── Layout.jsx           # Sidebar + main layout
│   ├── ui/                  # Shadcn/UI primitives
│   ├── shared/              # Common components (StatusBadge, SensorReadout)
│   ├── buildings/           # Building-specific components
│   ├── zones/               # Zone-specific components
│   └── ...
├── functions/               # Deno backend functions
│   ├── generateAPIKey.js    # Create API credentials
│   ├── facilitiesAPI.js     # REST API handler
│   ├── analyzeBlueprint.js  # AI floor plan analysis
│   └── ...
├── entities/                # Data schema definitions (JSON)
│   ├── Building.json
│   ├── Zone.json
│   ├── EnvironmentReading.json
│   ├── Alert.json
│   └── ...
├── lib/                     # Utilities & helpers
│   ├── utils.js
│   ├── query-client.js
│   └── AuthContext.jsx
└── App.jsx                  # Main router
```

---

## 🔐 Security & Best Practices

- **API keys are hashed** — never stored in plain text
- **Role-based access** — Admin, User, and custom roles
- **Scoped credentials** — limit API keys to specific resources and operations
- **Expiring keys** — set optional expiration dates for temporary access
- **Webhook signatures** — verify incoming webhooks with HMAC-SHA256

---

## 🧠 AI Features

### Blueprint Analysis
- Upload floor plan images → AI extracts zones, dimensions, and layout
- Automatic zone type detection (Office, Server Room, Conference Room, etc.)
- Sensor position suggestions based on zone geometry

### Energy Optimization
- Historical data analysis → AI identifies energy waste patterns
- ML forecasting → predict cooling/heating demand
- Actionable recommendations → save cost with smart scheduling

### Equipment Selection
- Input building parameters → AI recommends HVAC equipment specs
- ASHRAE climate zone integration → standards-compliant sizing
- ROI analysis → payback period for upgrades

---

## 📊 Monitoring & Analytics

### Real-Time Dashboards
- KPI cards with live system status
- Zone snapshot grid showing all active zones
- Trend charts for temperature, humidity, and CO₂
- Alert heatmaps highlighting problem areas

### Historical Analysis
- 30/60/90-day trend comparison
- Peak load identification
- Seasonal pattern detection
- Cost per zone calculations

### Reporting
- Weekly facility summaries (auto-emailed)
- Export to PDF/CSV for compliance
- Custom date range analysis

---

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables (Production)
```bash
VITE_BASE44_APP_ID=prod_app_id
VITE_BASE44_API_KEY=prod_api_key
SLACK_CLIENT_ID=slack_client_id
SLACK_REDIRECT_URI=https://yourapp.com/oauth/slack/callback
```

### Docker
```bash
docker build -t hvac-platform:latest .
docker run -p 3000:5173 hvac-platform:latest
```

---

## 🛠️ Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:5173) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build locally |

---

## 📚 Additional Resources

- **[API Documentation](/api-docs)** — Full endpoint reference
- **[Python SDK Guide](/python-sdk)** — SDK methods & examples
- **[CLI Reference](./cli/README.md)** — Command-line tool documentation
- **[Webhook Setup](/api-webhooks)** — Configure alerts to external systems

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📄 License

Proprietary — EMS AI Technologies. All rights reserved.

---

## 📞 Support

For questions, bugs, or feature requests:
- Email: support@emsai.tech
- Dashboard Help: Click the **?** icon in the app
- API Issues: Check `/api-docs` troubleshooting section

---

**Version:** 2.0 | **Last Updated:** May 2026

Made with ❤️ by **EMS AI Technologies**