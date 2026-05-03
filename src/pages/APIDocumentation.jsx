import { useState } from 'react';
import { Copy, CheckCircle2, Code2, Lock, Zap, Building2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';

export default function APIDocumentation() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, language = 'bash', id }) => (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <pre className="p-4 overflow-x-auto text-sm text-slate-100 font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        title="Copy to clipboard"
      >
        {copied === id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="API Documentation"
        subtitle="Securely connect external facilities and integrate with third-party systems"
      />

      {/* Architecture Overview */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">API Architecture</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          The API backbone consists of three secure backend functions that work together to provide authenticated access to your facility data:
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <p className="font-semibold text-sm text-foreground">generateAPIKey</p>
            </div>
            <p className="text-xs text-muted-foreground">Creates secure API credentials with scoped permissions and optional expiration dates.</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="font-semibold text-sm text-foreground">verifyAPIKey</p>
            </div>
            <p className="text-xs text-muted-foreground">Validates API keys before processing requests and updates usage metrics.</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <p className="font-semibold text-sm text-foreground">facilitiesAPI</p>
            </div>
            <p className="text-xs text-muted-foreground">REST API router handling all data queries with organization-level isolation.</p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Quick Start</h2>
        </div>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">1</span>
            <div>
              <p className="font-semibold text-foreground">Generate an API Key</p>
              <p className="text-muted-foreground text-xs mt-0.5">Go to the API Management page in your dashboard to create a new key with specific scopes.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">2</span>
            <div>
              <p className="font-semibold text-foreground">Find Your Function URL</p>
              <p className="text-muted-foreground text-xs mt-0.5">Navigate to Code → Functions → facilitiesAPI to copy your unique endpoint URL.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">3</span>
            <div>
              <p className="font-semibold text-foreground">Make Your First Request</p>
              <p className="text-muted-foreground text-xs mt-0.5">Use the endpoint URL with your API key to start querying facility data.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* API Endpoints */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">API Endpoints</h2>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="list" className="text-xs">List Facilities</TabsTrigger>
            <TabsTrigger value="detail" className="text-xs">Get Facility</TabsTrigger>
            <TabsTrigger value="readings" className="text-xs">Get Readings</TabsTrigger>
            <TabsTrigger value="health" className="text-xs">Health Check</TabsTrigger>
          </TabsList>

          {/* List Facilities */}
          <TabsContent value="list" className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">List All Facilities</p>
              <p className="text-xs text-muted-foreground">Retrieve all buildings accessible to your API key.</p>
            </div>
            <CodeBlock
              code={`GET /api/v1/facilities?api_key=YOUR_KEY`}
              id="list-endpoint"
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Response Example:</p>
              <CodeBlock
                code={`{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "6abc123def456",
      "name": "Main Office",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "floors": 3,
      "total_sqft": 50000,
      "status": "Active"
    },
    {
      "id": "7def456ghi789",
      "name": "Secondary Building",
      "address": "456 Oak Ave",
      "city": "Boston",
      "state": "MA",
      "floors": 2,
      "total_sqft": 30000,
      "status": "Active"
    }
  ]
}`}
                language="json"
                id="list-response"
              />
            </div>
          </TabsContent>

          {/* Get Facility */}
          <TabsContent value="detail" className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Get Facility Details</p>
              <p className="text-xs text-muted-foreground">Retrieve a specific facility with all its zones.</p>
            </div>
            <CodeBlock
              code={`GET /api/v1/facilities/{facility_id}?api_key=YOUR_KEY`}
              id="detail-endpoint"
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Response Example:</p>
              <CodeBlock
                code={`{
  "status": "success",
  "facility": {
    "id": "6abc123def456",
    "name": "Main Office",
    "address": "123 Main St",
    "city": "New York",
    "floors": 3,
    "total_sqft": 50000,
    "status": "Active"
  },
  "zones": [
    {
      "id": "a1b2c3d4",
      "name": "Main Floor Lobby",
      "building_id": "6abc123def456",
      "floor": 1,
      "zone_type": "Lobby",
      "sqft": 2000,
      "status": "Active",
      "occupancy_status": "Occupied"
    },
    {
      "id": "e5f6g7h8",
      "name": "Executive Offices",
      "building_id": "6abc123def456",
      "floor": 2,
      "zone_type": "Office",
      "sqft": 3500,
      "status": "Active",
      "occupancy_status": "Occupied"
    }
  ]
}`}
                language="json"
                id="detail-response"
              />
            </div>
          </TabsContent>

          {/* Get Readings */}
          <TabsContent value="readings" className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Get Zone Readings</p>
              <p className="text-xs text-muted-foreground">Fetch environmental sensor data for a specific zone.</p>
            </div>
            <CodeBlock
              code={`GET /api/v1/zones/{zone_id}/readings?api_key=YOUR_KEY&limit=100`}
              id="readings-endpoint"
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Response Example:</p>
              <CodeBlock
                code={`{
  "status": "success",
  "zone_id": "a1b2c3d4",
  "count": 3,
  "data": [
    {
      "id": "reading_001",
      "zone_id": "a1b2c3d4",
      "building_id": "6abc123def456",
      "temperature": 72.5,
      "humidity": 45.2,
      "co2_ppm": 620,
      "air_quality_index": 45,
      "pressure": 29.92,
      "timestamp": "2026-05-03T18:45:00Z",
      "source": "Sensor"
    },
    {
      "id": "reading_002",
      "zone_id": "a1b2c3d4",
      "building_id": "6abc123def456",
      "temperature": 72.3,
      "humidity": 45.1,
      "co2_ppm": 615,
      "air_quality_index": 44,
      "pressure": 29.91,
      "timestamp": "2026-05-03T18:40:00Z",
      "source": "Sensor"
    }
  ]
}`}
                language="json"
                id="readings-response"
              />
            </div>
          </TabsContent>

          {/* Health Check */}
          <TabsContent value="health" className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Health Check</p>
              <p className="text-xs text-muted-foreground">Verify API connectivity and authentication.</p>
            </div>
            <CodeBlock
              code={`GET /api/v1/health?api_key=YOUR_KEY`}
              id="health-endpoint"
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Response Example:</p>
              <CodeBlock
                code={`{
  "status": "ok",
  "timestamp": "2026-05-03T18:45:00Z"
}`}
                language="json"
                id="health-response"
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Testing & Sample Commands */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Testing Your Connection</h2>
        <p className="text-sm text-muted-foreground">
          Use these sample commands to test your API setup. Replace placeholders with your actual endpoint and API key.
        </p>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">1. Test API Health</p>
            <CodeBlock
              code={`# Verify your API is responding
curl "https://[your-function-url]/api/v1/health?api_key=YOUR_KEY"`}
              id="test-health"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">2. List Your Facilities</p>
            <CodeBlock
              code={`# Get all facilities you have access to
curl "https://[your-function-url]/api/v1/facilities?api_key=YOUR_KEY"

# Store the facility ID from the response for next steps`}
              id="test-list"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">3. Get Facility Details</p>
            <CodeBlock
              code={`# Get a specific facility and its zones
# Replace FACILITY_ID with actual ID from previous command
curl "https://[your-function-url]/api/v1/facilities/FACILITY_ID?api_key=YOUR_KEY"`}
              id="test-detail"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">4. Fetch Zone Sensor Readings</p>
            <CodeBlock
              code={`# Get environmental data for a zone
# Replace ZONE_ID with actual ID from facility details
curl "https://[your-function-url]/api/v1/zones/ZONE_ID/readings?api_key=YOUR_KEY&limit=20"`}
              id="test-readings"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">5. Using the CLI Tool</p>
            <CodeBlock
              code={`# Configure CLI with your endpoint and key
hvac config --url "https://[your-function-url]" --key "YOUR_KEY"

# Test the connection
hvac health

# List facilities
hvac list

# Get facility details
hvac get [FACILITY_ID]

# Get zone readings
hvac readings [ZONE_ID] --limit 50`}
              id="test-cli"
            />
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-sm">
          <p className="font-semibold text-emerald-400 mb-2">✓ Connection Successful</p>
          <p className="text-muted-foreground text-xs">If all commands return data, your local facilities are successfully connected to the platform. You can now:</p>
          <ul className="text-muted-foreground text-xs mt-2 space-y-1 ml-4">
            <li>• Monitor real-time sensor data</li>
            <li>• Integrate with external systems</li>
            <li>• Build custom dashboards</li>
            <li>• Automate facility operations</li>
          </ul>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Integration Examples</h2>

        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
            <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
            <TabsTrigger value="node" className="text-xs">Node.js</TabsTrigger>
            <TabsTrigger value="cli" className="text-xs">CLI</TabsTrigger>
          </TabsList>

          <TabsContent value="curl" className="space-y-3">
            <CodeBlock
              code={`# List all facilities
curl -X GET "https://[your-function-url]/api/v1/facilities?api_key=YOUR_KEY"

# Get specific facility with zones
curl -X GET "https://[your-function-url]/api/v1/facilities/6abc123def456?api_key=YOUR_KEY"

# Get zone readings
curl -X GET "https://[your-function-url]/api/v1/zones/a1b2c3d4/readings?api_key=YOUR_KEY&limit=50"`}
              id="curl-example"
            />
          </TabsContent>

          <TabsContent value="python" className="space-y-3">
            <CodeBlock
              code={`import requests

API_URL = "https://[your-function-url]"
API_KEY = "YOUR_KEY"

# List facilities
response = requests.get(
    f"{API_URL}/api/v1/facilities",
    params={"api_key": API_KEY}
)
facilities = response.json()["data"]

# Get facility details
facility_id = facilities[0]["id"]
response = requests.get(
    f"{API_URL}/api/v1/facilities/{facility_id}",
    params={"api_key": API_KEY}
)
facility = response.json()["facility"]
zones = response.json()["zones"]

# Get zone readings
zone_id = zones[0]["id"]
response = requests.get(
    f"{API_URL}/api/v1/zones/{zone_id}/readings",
    params={"api_key": API_KEY, "limit": 100}
)
readings = response.json()["data"]

for reading in readings:
    print(f"Temp: {reading['temperature']}°F, CO2: {reading['co2_ppm']} ppm")`}
              id="python-example"
            />
          </TabsContent>

          <TabsContent value="node" className="space-y-3">
            <CodeBlock
              code={`const axios = require('axios');

const API_URL = "https://[your-function-url]";
const API_KEY = "YOUR_KEY";

// List facilities
async function listFacilities() {
  const response = await axios.get(\`\${API_URL}/api/v1/facilities\`, {
    params: { api_key: API_KEY }
  });
  return response.data.data;
}

// Get facility details
async function getFacility(facilityId) {
  const response = await axios.get(\`\${API_URL}/api/v1/facilities/\${facilityId}\`, {
    params: { api_key: API_KEY }
  });
  return response.data;
}

// Get zone readings
async function getReadings(zoneId, limit = 50) {
  const response = await axios.get(\`\${API_URL}/api/v1/zones/\${zoneId}/readings\`, {
    params: { api_key: API_KEY, limit }
  });
  return response.data.data;
}

// Usage
(async () => {
  const facilities = await listFacilities();
  console.log(\`Found \${facilities.length} facilities\`);
})();`}
              id="node-example"
            />
          </TabsContent>

          <TabsContent value="cli" className="space-y-3">
            <CodeBlock
              code={`# Install CLI
npm install -g @ems-ai/hvac-cli

# Configure connection
hvac config --url https://[your-function-url] --key YOUR_KEY

# List all facilities
hvac list

# Get facility details
hvac get 6abc123def456

# Get zone readings (last 50)
hvac readings a1b2c3d4 --limit 50

# Check API health
hvac health`}
              id="cli-example"
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* Authentication & Security */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Authentication & Security</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground mb-2">API Key Security</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Keys are hashed using SHA-256 before storage</li>
              <li>• Each key can be scoped to specific resources (buildings, zones, readings)</li>
              <li>• Optional expiration dates enforce key rotation</li>
              <li>• Last-used timestamps track key activity</li>
            </ul>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground mb-2">Organization Isolation</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• All API requests are scoped to your organization</li>
              <li>• Facilities can be restricted per key (empty = all facilities)</li>
              <li>• Cross-organization data access is impossible</li>
              <li>• All requests are logged with timestamps</li>
            </ul>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground mb-2">Best Practices</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>✓ Store keys securely (environment variables, secrets manager)</li>
              <li>✓ Use HTTPS for all API requests</li>
              <li>✓ Rotate keys regularly and set expiration dates</li>
              <li>✓ Create separate keys for different integrations</li>
              <li>✓ Monitor key usage in the API Management dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Error Handling</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Common HTTP status codes and error responses:</p>
          <CodeBlock
            code={`200 OK - Request successful
{
  "status": "success",
  "data": [...]
}

400 Bad Request - Invalid parameters
{
  "status": "error",
  "error": "Invalid facility ID"
}

401 Unauthorized - Invalid or missing API key
{
  "status": "error",
  "error": "Invalid API key"
}

403 Forbidden - Key expired or insufficient scopes
{
  "status": "error",
  "error": "Key has expired"
}

404 Not Found - Resource not found
{
  "status": "error",
  "error": "Facility not found"
}

500 Internal Server Error - Server-side issue
{
  "status": "error",
  "error": "Internal server error"
}`}
            language="json"
            id="errors"
          />
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Ready to Connect?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Start building integrations with the HVAC API. Visit the API Management page to generate your first key and find your function endpoint.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.href = '/api'} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Lock className="w-4 h-4" /> Go to API Management
          </Button>
          <Button variant="outline" onClick={() => window.open('https://github.com', '_blank')} className="border-border text-muted-foreground hover:text-foreground gap-2">
            <ExternalLink className="w-4 h-4" /> View CLI Source
          </Button>
        </div>
      </section>
    </div>
  );
}