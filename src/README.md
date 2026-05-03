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

## 📖 Core Workflows

### 1️⃣ Add Your First Building

1. Navigate to **Buildings** → **+ Add Building**
2. Enter building name, address, number of floors, and square footage
3. Upload an optional cover image
4. Click **Create**

### 2️⃣ Define Zones

1. Open building detail page
2. Click **+ Add Zone**
3. Set zone name, type (Office, Server Room, etc.), floor, and square footage
4. ASHRAE defaults apply automatically
5. Save

### 3️⃣ Connect Sensors

1. Upload a blueprint via **Blueprint Import**
2. AI extracts zone boundaries and dimensions
3. Drag sensor pins onto the floor plan
4. Link sensors to zones and define their type (temperature, humidity, CO₂)
5. Start receiving live readings

### 4️⃣ Monitor & Control

1. View live sensor data on the **Dashboard**
2. Open any zone to adjust HVAC setpoints
3. Set up schedules for weekdays, weekends, and holidays
4. Create alerts for high/low temperature thresholds
5. Track alerts in the **Alerts** tab with bulk acknowledge/resolve

### 5️⃣ Integrate with External Systems

**REST API:**
```bash
curl -X GET "https://api.hvac.example.com/v1/facilities?api_key=YOUR_KEY"
```

**Python SDK:**
```python
from hvac_sdk import HVACClient
client = HVACClient(api_key="YOUR_KEY")
facilities = client.list_facilities()
```

**CLI:**
```bash
hvac list
hvac get FACILITY_ID
hvac readings ZONE_ID --limit 50
```

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