<div align="center">

<img src="https://media.base44.com/images/public/69f679c9c1acbda8bad7f375/b31fd0525_generated_image.png" alt="EMS AI Technologies" width="100" />

# EMS AI Technologies
### OmniClimate BMS

**AI-Powered Building Management & HVAC Environmental Control**

*Built for HVAC engineers, MEP firms, and commercial facility operators*

[![Live App](https://img.shields.io/badge/🌐%20Live%20App-Visit%20Dashboard-0ea5e9?style=for-the-badge)](https://untitled-app-b4dd68a2.base44.app)
[![ASHRAE](https://img.shields.io/badge/ASHRAE-55%20%7C%2062.1%20%7C%2090.1-22c55e?style=for-the-badge)](https://www.ashrae.org)
[![AI Powered](https://img.shields.io/badge/AI-GPT--4o%20Powered-a855f7?style=for-the-badge)](https://openai.com)
[![Stack](https://img.shields.io/badge/React%2018-Vite%20%7C%20Tailwind-38bdf8?style=for-the-badge)](https://vitejs.dev)

</div>

---

## ✦ What is OmniClimate BMS?

**OmniClimate BMS** is a professional-grade intelligent Building Management System that gives engineers and facility managers real-time visibility, AI-assisted design, and automated compliance monitoring across commercial HVAC environments.

Upload a floor plan and the AI extracts your entire building — zones, square footage, and ASHRAE-compliant setpoints — in seconds. Connect your sensor hardware and get continuous monitoring, threshold alerts, and daily health reports without writing a single line of integration code.

---

## ⚡ Core Features

<table>
<tr>
<td width="50%" valign="top">

### 🌡️ Real-Time Environmental Monitoring
Live temperature, humidity, CO₂, air quality index, and pressure readings across every zone — auto-refreshed every 10 minutes via Metasys-compatible sensor polling.

### 🤖 AI HVAC Design Assistant
Automated load calculations, equipment selection, duct sizing, and energy predictions powered by GPT-4o. Upload specs and get a full engineering report in seconds.

### 📐 Blueprint Import
Upload any floor plan image. AI reads dimensions, identifies spaces, classifies zone types, and auto-provisions ASHRAE setpoints and occupancy schedules — no manual entry required.

</td>
<td width="50%" valign="top">

### ⚡ ASHRAE Compliance Engine
Continuous threshold monitoring against **ASHRAE 55, 62.1, and 90.1**. Violations are detected in real time, logged as severity-graded alerts, and trigger instant email notifications.

### 📊 Energy Intelligence
ML-driven energy forecasts identifying 15–35% cost savings. Daily building health reports delivered to your inbox every morning at 7:00 AM.

### 🏗️ Lead & Contractor CRM
Built-in pipeline for onboarding HVAC contractors and engineering firms — with automated 4-step drip email sequences from free trial to paid subscription.

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Base44 — managed serverless backend + entity database |
| **AI / Vision** | OpenAI GPT-4o — blueprint analysis, load calcs, design assistant |
| **Sensor Integration** | Generic REST API + Metasys-compatible polling engine |
| **Automations** | Base44 CRON — ASHRAE checks every 10 min, daily reports at 7 AM ET |
| **Email** | Gmail OAuth — alert notifications + lead nurture sequences |
| **Auth** | Base44 — built-in user management and row-level security |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Base44](https://app.base44.com) account
- An OpenAI API key (for AI features)

### 1 — Clone & Install

```bash
git clone https://github.com/collins73/HVAC-climate-bms.git
cd HVAC-climate-bms
npm install
2 — Configure Environment
Create a .env.local file in the project root:

VITE_BASE44_APP_ID=69f679c9c1acbda8bad7f375
VITE_BASE44_APP_BASE_URL=https://untitled-app-b4dd68a2.base44.app
Your OPENAI_API_KEY is stored securely in Base44's backend environment — never in the frontend.

3 — Run Locally
npm run dev
# App available at http://localhost:5173
4 — Deploy
git add .
git commit -m "your changes"
git push origin main
Then open [app.base44.com](https://app.base44.com) and click Publish.

🔌 Sensor Ingestion API
Push readings from any BMS hardware — Johnson Controls Metasys, Siemens Desigo, Honeywell Niagara, or any HTTP-capable sensor gateway.

POST https://untitled-app-b4dd68a2.base44.app/functions/ingestSensorReading
Content-Type: application/json
{
  "zone_id":           "zone-uuid",
  "building_id":       "building-uuid",
  "temperature":       72.4,
  "humidity":          45.2,
  "co2_ppm":           820,
  "air_quality_index": 42,
  "pressure":          1013.25,
  "source":            "JohnsonControls_Metasys"
}
📐 Blueprint Import — How It Works
  ┌──────────────────┐     ┌──────────────────┐     ┌────────────────────────┐
  │  Upload Floor    │────▶│  GPT-4o Vision   │────▶│  Auto-Provisioned      │
  │  Plan Image      │     │  Analyzes Plan   │     │  Building + Zones +    │
  │  (PNG/JPG/PDF)   │     │  Extracts Zones  │     │  ASHRAE Setpoints +    │
  └──────────────────┘     └──────────────────┘     │  Occupancy Schedules   │
                                                     └────────────────────────┘
Navigate to Import from Blueprint in the top nav
Drop any architectural floor plan or CAD export
AI extracts dimensions, zones, sq ft, and HVAC requirements
Review and confirm — entire building registered in one click
⚙️ Automated Workflows
Automation	Trigger	What It Does
🔁 Metasys Sensor Poll	Every 10 min	Pushes occupancy-aware readings for all active zones
🔍 ASHRAE Threshold Checker	Every 10 min	Evaluates readings vs. ASHRAE 55/62.1/90.1; auto-creates alerts
📧 Critical Alert Email	On alert create	Instant email for any Critical severity event
📊 Daily Health Report	7:00 AM ET daily	Full building health summary emailed every morning
🎯 Lead Email Sequence	On lead create	4-step drip: Day 0 welcome → Day 2 demo → Day 5 value → Day 14 pitch
📬 ASHRAE Monitoring Thresholds
Parameter	Standard	⚠️ Warning	🔴 Critical
Temperature	ASHRAE 55	< 68°F or > 78°F	< 60°F or > 85°F
Humidity	ASHRAE 55	< 30% or > 65% RH	< 20% or > 75% RH
CO₂	ASHRAE 62.1	> 1,000 ppm	> 1,500 ppm
Air Quality Index	EPA / ASHRAE	> 100	> 150
🗄️ Data Model
Entity	Description
Building	Commercial building registry — address, floors, sq ft, status
Zone	HVAC zones within buildings — type, floor, area, status
ThermostatSetting	Per-zone setpoints, fan mode, schedule overrides
EnvironmentReading	Time-series sensor readings — temp, humidity, CO₂, AQI, pressure
Alert	ASHRAE breach events — severity, status, resolution tracking
Schedule	Occupancy-based HVAC schedules per zone
Lead	Contractor/firm CRM — stage, trial dates, interest level
EmailSequence	Automated drip email log per lead
📁 Project Structure
HVAC-climate-bms/
├── pages/
│   ├── Dashboard.jsx         # Live environmental dashboard
│   ├── Buildings.jsx         # Building registry
│   ├── BuildingDetail.jsx    # Per-building zone overview
│   ├── Zones.jsx             # Zone management
│   ├── ZoneControl.jsx       # Thermostat & schedule control
│   ├── Alerts.jsx            # ASHRAE alert management
│   ├── BlueprintImport.jsx   # AI floor plan analysis
│   └── Leads.jsx             # Contractor CRM pipeline
│
├── functions/
│   ├── analyzeBlueprint.ts       # GPT-4o vision — floor plan extraction
│   ├── hvacDesignAssistant.ts    # AI load calcs & equipment selection
│   ├── ingestSensorReading.ts    # Sensor data ingestion endpoint
│   ├── metasysPoller.ts          # Metasys-compatible sensor simulation
│   ├── sendAlertEmail.ts         # Gmail alert notification sender
│   └── sendEmailSequence.ts      # Lead nurture email dispatcher
│
├── entities/                     # Data model JSON schemas
└── .env.local                    # Environment variables (not committed)
🔐 Environment Variables
Variable	Where	Description
VITE_BASE44_APP_ID	.env.local	Base44 application ID
VITE_BASE44_APP_BASE_URL	.env.local	Deployed app base URL
OPENAI_API_KEY	Base44 backend secrets	GPT-4o API key for AI features
📖 Resources
Resource	Link
🌐 Live App	[untitled-app-b4dd68a2.base44.app](https://untitled-app-b4dd68a2.base44.app)
📚 Base44 Docs	[docs.base44.com](https://docs.base44.com)
💬 Support	[app.base44.com/support](https://app.base44.com/support](https://app.base44.com/support))
<div align="center">
EMS AI Technologies — Real-time BMS monitoring × AI-driven HVAC engineering × ASHRAE compliance

Built on Base44 · © 2026 EMS AI Technologies. All rights reserved.

</div> ```
