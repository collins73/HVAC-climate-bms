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
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## ✦ What is OmniClimate BMS?

**OmniClimate BMS** is a professional-grade intelligent Building Management System that gives engineers and facility managers real-time visibility, AI-assisted design, and automated compliance monitoring across commercial HVAC environments.

Upload a floor plan and the AI extracts your entire building — zones, square footage, and ASHRAE-compliant setpoints — in seconds. Connect your sensor hardware via REST API, CLI, or Docker and get continuous monitoring, threshold alerts, and daily health reports without writing a single line of integration code.

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
| **Sensor Integration** | Generic REST API + Metasys / BACnet / Modbus compatible |
| **Automations** | Base44 CRON — ASHRAE checks every 10 min, daily reports at 7 AM ET |
| **Email** | Gmail OAuth — alert notifications + lead nurture sequences |
| **Auth** | Base44 — built-in user management and row-level security |
| **Containerization** | Docker + Docker Compose — local dev and self-hosted deployments |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (optional, for containerized setup)
- A [Base44](https://app.base44.com) account
- An OpenAI API key (for AI features)

### Option A — Local Dev (Node)

```bash
git clone https://github.com/collins73/HVAC-climate-bms.git
cd HVAC-climate-bms
npm install
cp .env.example .env.local
npm run dev
# App available at http://localhost:5173
Option B — Docker Compose
git clone https://github.com/collins73/HVAC-climate-bms.git
cd HVAC-climate-bms
cp .env.example .env.local
docker compose up --build
# App available at http://localhost:5173
Configure Environment
Edit .env.local:

VITE_BASE44_APP_ID=69f679c9c1acbda8bad7f375
VITE_BASE44_APP_BASE_URL=https://untitled-app-b4dd68a2.base44.app
OPENAI_API_KEY is stored securely in Base44's backend — never in the frontend.

Deploy to Production
git add .
git commit -m "your changes"
git push origin main
Then open [app.base44.com](https://app.base44.com) and click Publish.

🐳 Docker
Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
docker-compose.yml
version: "3.9"
services:
  omniclimate-bms:
    build: .
    ports:
      - "5173:5173"
    env_file:
      - .env.local
    restart: unless-stopped
    volumes:
      - .:/app
      - /app/node_modules
Useful Docker Commands
# Build the image
docker build -t omniclimate-bms .

# Run the container
docker run -p 5173:5173 --env-file .env.local omniclimate-bms

# Run with Compose (detached)
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
🔌 Building System Integrations
OmniClimate BMS supports ingestion from any BMS hardware via its open REST API. Tested integrations:

System	Protocol	Notes
Johnson Controls Metasys	REST / JSON	Native polling support built-in
Siemens Desigo CC	REST / OPC-UA	Use the REST adapter
Honeywell Niagara (Tridium)	REST / BACnet	Requires Niagara REST module
Schneider EcoStruxure	REST / MQTT	Use MQTT-to-HTTP bridge
Generic BACnet Devices	BACnet/IP → REST	Use bacnet-to-http gateway
Modbus Sensors	Modbus TCP → REST	Use node-red or modbus-proxy
**Custom
