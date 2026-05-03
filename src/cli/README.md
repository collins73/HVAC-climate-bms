# HVAC CLI Tool

Command-line interface for managing EMS AI HVAC facilities and sensor data.

## Installation

```bash
npm install -g @ems-ai/hvac-cli
```

Or run directly:
```bash
node bin/index.js
```

## Configuration

First, configure your API endpoint and key:

```bash
hvac config --url https://[your-function-url] --key YOUR_API_KEY
```

View current config:
```bash
hvac config
```

## Commands

### List Facilities
List all accessible facilities (buildings):

```bash
hvac list
```

Output:
```
┌────────────────────┬──────────────────────┬────────────────────────────────┬────────────────────┬──────────────┐
│ ID                 │ Name                 │ Address                        │ City               │ Status       │
├────────────────────┼──────────────────────┼────────────────────────────────┼────────────────────┼──────────────┤
│ 6abc123def456      │ Main Office          │ 123 Main St                    │ New York           │ Active       │
│ 7def456ghi789      │ Secondary Building   │ 456 Oak Ave                    │ Boston             │ Active       │
└────────────────────┴──────────────────────┴────────────────────────────────┴────────────────────┴──────────────┘
Total: 2 facilities
```

### Get Facility Details
Get details and zones for a specific facility:

```bash
hvac get <facility-id>
```

Example:
```bash
hvac get 6abc123def456
```

Output:
```
📍 Main Office
   Address: 123 Main St New York NY
   Status: Active
   Floors: 3
   Sq Ft: 50000

📊 Zones (5):
┌──────────┬────────────────────┬─────────────┬──────────┬──────────┬──────────┐
│ ID       │ Name               │ Type        │ Sq Ft    │ Floor    │ Status   │
├──────────┼────────────────────┼─────────────┼──────────┼──────────┼──────────┤
│ a1b2c3d4 │ Main Floor Lobby   │ Lobby       │ 2000     │ Floor 1  │ Active   │
│ e5f6g7h8 │ Executive Offices  │ Office      │ 3500     │ Floor 2  │ Active   │
└──────────┴────────────────────┴─────────────┴──────────┴──────────┴──────────┘
```

### Get Zone Readings
Fetch environmental sensor readings for a zone:

```bash
hvac readings <zone-id> [--limit N]
```

Example:
```bash
hvac readings a1b2c3d4 --limit 20
```

Output:
```
Latest 10 Readings
┌──────────────────────┬──────────────┬─────────────┬──────────────┬──────────┐
│ Timestamp            │ Temp         │ Humidity    │ CO2          │ Source   │
├──────────────────────┼──────────────┼─────────────┼──────────────┼──────────┤
│ 5/3/2026, 2:45:00 PM │ 72.5°F       │ 45.2%       │ 620 ppm      │ Sensor   │
│ 5/3/2026, 2:40:00 PM │ 72.3°F       │ 45.1%       │ 615 ppm      │ Sensor   │
│ 5/3/2026, 2:35:00 PM │ 72.1°F       │ 44.9%       │ 610 ppm      │ Sensor   │
└──────────────────────┴──────────────┴─────────────┴──────────────┴──────────┘
```

### Health Check
Check API status:

```bash
hvac health
```

## Config File

Configuration is stored in: `~/.hvac/config.json`

```json
{
  "apiUrl": "https://your-function-url",
  "apiKey": "your_api_key_here"
}
```

## Troubleshooting

**"Not configured" error**
- Run `hvac config --url <URL> --key <KEY>` with your function endpoint and API key

**"Invalid API key" error**
- Check your API key is correct in `hvac config`
- Verify the key hasn't expired in your app dashboard

**"Facility not found"**
- Check the facility ID exists with `hvac list`
- Verify your API key has access to that facility

## Development

```bash
cd cli
npm install
node bin/index.js --help
``